from django import forms

from .models import Post

MAX_LENGTH = 240
class PostForm(forms.ModelForm):
    class Meta:
        # Create a new Post object
        model = Post
        fields = ['content']
        
    def clean_content(self):
        content = self.cleaned_data.get("content")
        if len(content) > MAX_LENGTH:
            raise forms.ValidationError()
        return content