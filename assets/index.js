import React from 'react'
import ReactDOM from 'react-dom'

// Import and export written components from assest/components.js
import { HeartButton, Post, PostsList, ProfilePostsList, Profile, FollowedPostsList, Edit } from './components'

export {
  HeartButton,
  Post,
  PostsList,
  ProfilePostsList,
  Profile,
  FollowedPostsList,
  Edit
}

// All posts rendering in index page into :
const allPostsEl = document.getElementById('all_posts')

// Post followed by user loged in
const followedPostsEl = document.getElementById('followed_posts')

// User profile rendering in profile page into :
const profileEl = document.getElementById('profile')

if (allPostsEl) {
  ReactDOM.render(<PostsList />, allPostsEl)
}
if (profileEl) {
  ReactDOM.render(<Profile />, profileEl)
}
if (followedPostsEl) {
  ReactDOM.render(<FollowedPostsList />, followedPostsEl)
}
