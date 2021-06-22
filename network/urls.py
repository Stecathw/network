from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),    
    path("create_post", views.create_post, name="create_post"),    
    path("profile_page/<str:user>", views.profile_page, name="profile_page"),
    path("following_page", views.following_page, name="following_page"),   
    
    # API routes
    path("api/logged_user", views.current_user, name="current_user"),
    path("api/posts/page/<int:page>", views.posts, name="posts"),
    path("api/profile_posts/<str:user>/page/<int:page>", views.profile_posts, name="profile_posts"),
    path("api/like_post", views.like_post, name="like_post"),
    path("api/user_profile/<str:user>", views.profile, name="profile"),
    path("api/follow", views.follow, name="follow"),
    path("api/followed_posts/page/<int:page>", views.followed_posts, name="followed_posts"),
    path("api/edit_post", views.edit_post, name="edit_post"),
]
