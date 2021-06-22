from django.contrib import admin

from .models import Post, User, Like, Profile


class LikeAdmin(admin.TabularInline):
    model = Like
    
class PostAdmin(admin.ModelAdmin):
    inlines = [LikeAdmin]
    list_display = ['__str__', 'user']
    search_fields = ['content', 'user__username', 'user__email']
    
    class Meta:
        model = Post
       
admin.site.register(Post, PostAdmin)
admin.site.register(User)
admin.site.register(Like)
admin.site.register(Profile)

