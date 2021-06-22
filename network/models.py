from django.contrib.auth.models import AbstractUser
from django.db import models

from django.core.exceptions import ValidationError


class User(AbstractUser):
    pass

    def serialize(self):
        return self.username
        


class Post(models.Model):
    content = models.TextField(blank=True, null=True, max_length=240)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    likes = models.ManyToManyField(User, blank=True, related_name='user_likes', through="Like")
    
    def serialize(self):
        return {
            "id": self.id,
            "content": self.content,
            "user": self.user.username,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes.count()
        }

    def __str__(self):
        return self.content
    
    
class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)   
     
     
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    followers = models.ManyToManyField(User, blank=True, related_name="is_followed")
    following = models.ManyToManyField(User, blank=True, related_name="is_following")
    
    def __str__(self):
        return self.user.username
    
    def serialize(self):
        return {
            "id": self.id,
            "username": self.user.username,
            "number_of_followers": self.followers.count(),
            "number_of_following": self.following.count(), 
            "followers": [follower.username for follower in self.followers.all()],          
            "following": [following.username for following in self.following.all()],
            "is_followed": self.is_followed(),           
        }
        
    def is_followed(self):
        if self.followers.count() >= 1:
            return True
        return False   
  

    
    