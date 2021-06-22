from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
from django.core.paginator import Paginator
from django.contrib import messages

from .models import User, Post, Profile

from .forms import PostForm

POSTS_PER_PAGE = 10

def index(request):
    return render(request, "network/index.html")


def current_user(request):
    """
    API endpoint to get logged user consumed by react.js
    Communicate to react which user is logged in.
    """
    if request.method == "GET":
        if request.user.is_authenticated:
            user = request.user            
            return JsonResponse(user.serialize(), safe=False)
        return JsonResponse({}, safe=False)
    

@csrf_exempt
@login_required(login_url='login')
def create_post(request):
    user = request.user
    if request.method == "POST":
        form = PostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.user = user
            post.save()        
            return HttpResponseRedirect(reverse("index"))
        # Post wont be published if it is too long 
        if form.errors:
            return JsonResponse({"message": "error 404"}, status=404)
    return render(request, "network/create_post.html", {
        "form": PostForm()
    })
    
@csrf_exempt
@login_required(login_url='login')
def edit_post(request):
    if request.method == "POST":       
        data = json.loads(request.body)
        new_content = data.get("content")
        post_id = data.get("id")
        Post.objects.filter(id=post_id).update(content=new_content)   
        return JsonResponse({"message":"updated"}, status=200)
    return JsonResponse({"message": "error 404"}, status=404)

@csrf_exempt
@login_required
def like_post(request):
    """
    Like and Unlike a post
    """
    if request.method == "POST":        
    
        data = json.loads(request.body)
        post_id = data.get("id")
        user = request.user
        post = Post.objects.filter(id=post_id) 
        post = post.first()   
        if user in post.likes.all():
            post.likes.remove(user)
        else:
            post.likes.add(user)
        post.save()
        return JsonResponse(post.serialize(), safe=False, status=200)       
    return JsonResponse({"message": "error 404"}, status=404)    

def posts(request, page):
    """
    REST API
    Consumed by JS 
    Returns datas in Json format
    """    
    if request.method == "GET":
        # All posts selection
        posts = Post.objects.all()
        # Return posts in reverse chronological order
        posts = posts.order_by("-timestamp").all()
        paginator = Paginator(posts, POSTS_PER_PAGE)  
        page_posts = paginator.page(page)
        context = {
            "data" : [post.serialize() for post in page_posts],
            "page_count" : paginator.num_pages,
        }
        return JsonResponse(context, safe=False, status=200)
    return JsonResponse({"message": "error 404"}, status=404)


def profile_page(request, user):
    return render(request, "network/profile.html", {
        "user" : user,
    })

def profile_posts(request, user, page):
    """
    REST API
    Consumed by JS 
    Returns datas in Json format
    """  
    if request.method == "GET": 
        user = User.objects.get(username=user)
        user_posts = Post.objects.filter(user=user.id).all()
        user_posts = user_posts.order_by("-timestamp")
        paginator = Paginator(user_posts, 5)  
        page_posts = paginator.page(page) 
        context = {
            "data" : [post.serialize() for post in page_posts],
            "page_count" : paginator.num_pages,
        }
        return JsonResponse(context, safe=False, status=200)
    return JsonResponse({"message": "error 404"}, status=404)


def profile(request, user):  
    """
    REST API
    Consumed by JS 
    Returns datas in Json format
    """
    if request.method == "GET":
        user = User.objects.get(username=user)
        profile = Profile.objects.get(user=user)
        return JsonResponse(profile.serialize(), safe=False, status=200)
    return JsonResponse({"message": "error 404"}, status=404)
    

@csrf_exempt
@login_required
def follow(request):
    """
    REST API
    Consumed by JS 
    Returns datas in Json format
    """    
    data = json.loads(request.body)
    profile_id = data.get("id")
    current_user = request.user 
            
    current_user_profile = Profile.objects.filter(id=current_user.id)
    current_user_profile=current_user_profile.first()

    profile_qs = Profile.objects.filter(id=profile_id)
    profile = profile_qs.first()

    if request.method == "POST":                         
        if current_user_profile == profile:
            return JsonResponse(profile.serialize(), status=400)
        
        followers = []
        for f in list(profile_qs.values_list("followers", flat=True)):
            followers.append(f)
            
        if current_user.id in followers:
            profile.followers.remove(current_user)
            current_user_profile.following.remove(profile.user)

        else :
            profile.followers.add(current_user)
            current_user_profile.following.add(profile.user)

        profile.save()    
        current_user_profile.save()    
        return JsonResponse(profile.serialize(), safe=False, status=200)   
    return JsonResponse({"message": "error 404"}, status=404)


@login_required
def following_page(request):
    return render(request, "network/following.html")


@csrf_exempt
@login_required
def followed_posts(request, page):
    if request.method == "GET":
        # Profile(s) followed
        profile_qs = Profile.objects.filter(id=request.user.id)
        following_id = []
        for f in list(profile_qs.values_list("following", flat=True)):
            following_id.append(f)    
        followed_posts = Post.objects.filter(user__in = following_id)   
        paginator = Paginator(followed_posts, POSTS_PER_PAGE)  
        page_posts = paginator.page(page) 
        context = {
            "data" : [post.serialize() for post in page_posts],
            "page_count" : paginator.num_pages,
        }
        return JsonResponse(context, safe=False, status=200)
    return JsonResponse({"message": "error 404"}, status=404)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            # Create a profile :
            profile = Profile.objects.create(user = user)
            profile.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
