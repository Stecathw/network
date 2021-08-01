# NETWORK

Design a Twitter-like social network website for making posts and following users.

### Link to youtube video :
https://www.youtube.com/watch?v=up0ZFr7erMM

### Link to specification page : 
https://cs50.harvard.edu/web/2020/projects/4/network/

## PERSONAL NOTES

### HYBRID APP DJANGO+REACT

I've build an hybrid app using both Django and React.

Django is handling all of the backend and little parts of the front-end. React was used to build components such as posts to be reusable in every page, I've used react hooks and AJAX calls. I've also used ESlint to help me out and of course installed node.js.
Django code is therefore mostly a REST API without using DRF (django rest framework) nor built-in serializer. 

The main trouble was to make both frameworks to work with each others, I've followed this well explained ressources to make it happens: 
https://www.saaspegasus.com/guides/modern-javascript-for-django-developers/integrating-javascript-pipeline/

### IMPROVEMENTS

- Handling more errors that can happen.
- Writting some tests
- Adding profile pictures/locations/birthdays etc... to DB model.
- General styling (CSS animations / twitter design)
- Writting the navbar with react
- Components in different files
- Only one fetching post function taking actual arguments + all posts or profile posts or following posts and then give it back to component.
