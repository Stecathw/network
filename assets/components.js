import React, { useState, useEffect } from 'react'
import ReactPaginate from 'react-paginate'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import PropTypes from 'prop-types'

export function HeartButton (props) {
  const { post } = props
  const [likes, SetLikes] = useState(post.likes)

  function HandleClick (event) {
    event.preventDefault()
    fetch('http://127.0.0.1:8000/api/like_post', {
      method: 'POST',
      body: JSON.stringify({
        id: post.id
      })
    })
      .then((response) => response.json())
      .then((data) => SetLikes(data.likes))
      .catch(error => console.error('Error', error))
  }

  if (likes === 0) {
    return (
        <div>
            <button className="like_button" onClick={HandleClick}>
            <i className="far fa-heart fa-lg" style={{ color: '#33c3f0' }}></i>
            </button>
        </div>
    )
  }
  if (likes === 1) {
    return (
        <div>
            <button className="like_button" onClick={HandleClick}>
            <i className="fas fa-heart fa-lg" style={{ color: 'red' }}></i>
            </button>
        </div>
    )
  }
  if (likes > 1) {
    return (
        <div>
            <button className="like_button" onClick={HandleClick}>
            <i className="fas fa-heart fa-lg" style={{ color: 'red' }}></i>{' '}
            {likes}
            </button>
        </div>
    )
  }
}

export function Post (props) {
  const { post, loggedUser } = props
  Post.propTypes = {
    post: PropTypes.object,
    loggedUser: PropTypes.string
  }
  const postClass = 'col border rounded py-3 mb-4 bg-white text-dark post'
  const TimeStampClass = 'text-muted'

  const profileURL = 'profile_page/' + post.user

  return (
        <div className={postClass}>
            <h5><a href={profileURL} id={'profile-link'}>@{post.user}</a><span className={TimeStampClass}> - {post.timestamp}</span></h5>
            <Edit post={post} loggedUser={loggedUser} />
            <p id={'post-content-' + post.id}>{post.content}</p>
            <HeartButton post={post} />
        </div>
  )
}

export function Edit (props) {
  const { post, loggedUser } = props

  Edit.propTypes = {
    post: PropTypes.object,
    loggedUser: PropTypes.string
  }

  const [content, setContent] = useState(post.content)
  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const HandleSubmit = (e) => {
    fetch('http://127.0.0.1:8000/api/edit_post', {
      method: 'POST',
      body: JSON.stringify({
        id: post.id,
        content: content
      })
        .catch(error => console.error('Error', error))
    })
    // Avoid an entire reload
    // Using JS DOM manipulation to update frontend locally
    e.preventDefault()
    document.querySelector('#post-content-' + post.id).innerHTML = content
  }

  const HandleChange = (e) => {
    setContent(e.target.value)
    e.preventDefault()
  }

  if (loggedUser === post.user) {
    return (
            <div>
                <button onClick={handleShow} className="btn btn-link btn-sm edit">Edit</button>

                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Modify your post :</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={HandleSubmit}>
                        <Modal.Body>
                                <Form.Control as="textarea" maxLength="240" autoComplete="off" name="edited-content" className="form-control" onChange={HandleChange} value={content}>
                                </Form.Control>
                                <Form.Text muted>
                                    Click save and close when done.
                                </Form.Text>
                        </Modal.Body>
                        <Modal.Footer>
                            <button onClick={handleClose} className="btn btn-secondary">Close</button>
                            <button type="submit" className="btn btn-primary">Save</button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </div>
    )
  }
  return (
        <></>
  )
}

export function PostsList () {
  const [posts, setPosts] = useState([])
  const [offset, setOffset] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [user, SetLoggedUser] = useState()

  const handleFetchLoggedUser = () => {
    fetch('http://127.0.0.1:8000/api/logged_user')
      .then((response) => response.json())
      .then((data) => {
        SetLoggedUser(data)
      })
      .catch(error => console.error('Error', error))
  }

  const handleFetchPosts = () => {
    fetch(`http://127.0.0.1:8000/api/posts/page/${offset}`)
      .then((response) => response.json())
      .then((context) => {
        const postsData = context.data.map((item, _index) => {
          return <Post post={item} key={item.id.toString()} loggedUser={ user } />
        })
        setPosts(postsData)
        setPageCount(context.page_count)
        setIsLoaded(true)
      })
      .catch(error => console.error('Error', error))
  }

  const handlePageChange = (e) => {
    setOffset(e.selected + 1)
  }

  useEffect(() => {
    handleFetchLoggedUser()
    handleFetchPosts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, offset])

  if (isLoaded && posts.length >= 1) {
    return (
            <div>
                {
                    posts
                }
                <ReactPaginate
                    pageCount={pageCount}
                    marginPagesDisplayed={1}
                    pageRangeDisplayed={3}
                    previousLabel={'prev'}
                    nextLabel={'next'}
                    breakLabel={'...'}
                    onPageChange={handlePageChange}
                    // Styling with css
                    containerClassName={'container-pages'}
                    previousLinkClassName={'page'}
                    breakClassName={'page'}
                    nextLinkClassName={'page'}
                    pageClassName={'page'}
                    disabledClassName={'disabled'}
                    activeClassName={'active'}
                />
            </div>
    )
  }
  return (
        <div>No posts...</div>
  )
}

export function FollowedPostsList () {
  const [posts, SetPosts] = useState([])
  const [loggedUser, SetLoggedUser] = useState()
  const [offset, setOffset] = useState(1)
  const [pageCount, setPageCount] = useState(0)

  const handleFetchLoggedUser = () => {
    fetch('http://127.0.0.1:8000/api/logged_user')
      .then((response) => response.json())
      .then((data) => SetLoggedUser(data))
      .catch(error => console.error('Error', error))
  }

  const handleFetchFollowedPosts = () => {
    fetch('http://127.0.0.1:8000/api/followed_posts/page/' + offset)
      .then((response) => response.json())
      .then((context) => {
        SetPosts(context.data)
        setPageCount(context.page_count)
      })
      .catch(error => console.error('Error', error))
  }

  useEffect(() => {
    handleFetchLoggedUser()
  }, [loggedUser])

  const handlePageChange = (e) => {
    setOffset(e.selected + 1)
  }

  useEffect(() => {
    handleFetchFollowedPosts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  return (
        <div>
            {posts.map((item, _index) => {
              return <Post post={item} key={item.id.toString()} loggedUser={loggedUser}/>
            })
            }
            <ReactPaginate
              pageCount={pageCount}
              marginPagesDisplayed={1}
              pageRangeDisplayed={3}
              previousLabel={'prev'}
              nextLabel={'next'}
              breakLabel={'...'}
              onPageChange={handlePageChange}
              // Styling with css
              containerClassName={'container-pages'}
              previousLinkClassName={'page'}
              breakClassName={'page'}
              nextLinkClassName={'page'}
              pageClassName={'page'}
              disabledClassName={'disabled'}
              activeClassName={'active'}
            />
        </div>
  )
}

export function ProfilePostsList (props) {
  const { user } = props

  ProfilePostsList.propTypes = {
    user: PropTypes.string
  }
  const [posts, SetPosts] = useState([])
  const [loggedUser, SetLoggedUser] = useState()
  const [offset, setOffset] = useState(1)
  const [pageCount, setPageCount] = useState(0)

  const handleFetchLoggedUser = () => {
    fetch('http://127.0.0.1:8000/api/logged_user')
      .then((response) => response.json())
      .then((data) => SetLoggedUser(data))
      .catch(error => console.error('Error', error))
  }

  const handlePageChange = (e) => {
    setOffset(e.selected + 1)
  }

  useEffect(() => {
    handleFetchLoggedUser()
  }, [loggedUser])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/profile_posts/' + user + '/page/' + offset)
      .then((response) => response.json())
      .then((context) => {
        SetPosts(context.data)
        setPageCount(context.page_count)
      })
      .catch(error => console.error('Error', error))
  }, [user, offset])

  // Need protection to not send a new href to profile page
  const profileLinks = document.querySelectorAll('#profile-link')
  profileLinks.forEach((link) => {
    link.setAttribute('href', '#')
    link.style.cursor = 'default'
  })

  return (
        <div>
            {posts.map((item, _index) => {
              return <Post post={item} key={item.id.toString()} loggedUser={loggedUser}/>
            })
            }
            <ReactPaginate
              pageCount={pageCount}
              marginPagesDisplayed={1}
              pageRangeDisplayed={3}
              previousLabel={'prev'}
              nextLabel={'next'}
              breakLabel={'...'}
              onPageChange={handlePageChange}
              // Styling with css
              containerClassName={'container-pages'}
              previousLinkClassName={'page'}
              breakClassName={'page'}
              nextLinkClassName={'page'}
              pageClassName={'page'}
              disabledClassName={'disabled'}
              activeClassName={'active'}
            />
        </div>
  )
}

export function Profile () {
  // Not robust and that safe i guess but works, i didnt find a way to pass props through <a> tag
  // (maybe via react.router)

  const user = document.querySelector('#user_profile').innerHTML
  const [profile, SetProfile] = useState([])
  const [loggedUser, SetLoggedUser] = useState()

  const handleFetchLoggedUser = () => {
    fetch('http://127.0.0.1:8000/api/logged_user')
      .then((response) => response.json())
      .then((data) => SetLoggedUser(data))
      .catch(error => console.error('Error', error))
  }

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/user_profile/' + user)
      .then((response) => response.json())
      .then((data) => {
        SetProfile(data)
      })
      .then(handleFetchLoggedUser())
      .catch(error => console.error('Error', error))
  }, [user])

  return (
        <div className="col">
            <FollowButton profile={profile} user={user} loggedUser={loggedUser} />
            <div>
                <ProfilePostsList user={user}/>
            </div>
        </div>
  )
}

export function FollowButton (props) {
  const { profile, user, loggedUser } = props
  const [followers, SetFollowers] = useState([])
  const [followersList, SetListFollowers] = useState([])

  const isUserFollowingProfile = (list, loggedUser) => {
    function SearchUser (value, _index, _array) {
      return loggedUser === value
    }
    if (list.length > 0) {
      const result = list.find(SearchUser)
      if (result === loggedUser) { return true } else { return false }
    } else { return false }
  }

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/user_profile/' + user, {
    })
      .then((response) => response.json())
      .then((data) => {
        // eslint-disable-next-line no-unused-expressions
        SetFollowers(data.number_of_followers)
        SetListFollowers(data.followers)
      })
      .catch(error => console.error('Error', error))
  }, [user])

  const HandleClick = (e) => {
    e.preventDefault()
    fetch('http://127.0.0.1:8000/api/follow', {
      method: 'POST',
      body: JSON.stringify({
        id: profile.id
      })
    })
      .then((response) => response.json())
      .then((data) => {
        SetFollowers(data.number_of_followers)
        SetListFollowers(data.followers)
      })
      .catch(error => console.error('Error', error))
  }

  if (user === loggedUser) {
    return (
            <div>
                <div className="row justify-content-around mb-4">
                    <div className="col col-lg-2">
                        Follower(s): {profile.number_of_followers}
                    </div>
                    <div className="col col-lg-2">
                        Following: {profile.number_of_following}
                    </div>
                </div>
            </div>
    )
  } else if (isUserFollowingProfile(followersList, loggedUser)) {
    return (
            <div>
                <div className="row justify-content-around mb-4">
                    <div className="col col-lg-2">
                        Follower(s): {followers}
                    </div>
                    <div className="col col-lg-2">
                        Following: {profile.number_of_following}
                    </div>
                </div>
                <div className="row justify-content-center mb-4">
                    <div className="col col-lg-2">
                        <button onClick={HandleClick} className="unfollow-button">Following</button>
                    </div>
                </div>
            </div>
    )
  } else if (!isUserFollowingProfile(followersList, loggedUser)) {
    return (
            <div>
                <div className="row justify-content-around mb-4">
                    <div className="col col-lg-2">
                        Follower(s): {followers}
                    </div>
                    <div className="col col-lg-2">
                        Following: {profile.number_of_following}
                    </div>
                </div>
                <div className="row justify-content-center mb-4">
                    <div className="col col-lg-2">
                        <button onClick={HandleClick} className="follow-button">+ Follow</button>
                    </div>
                </div>
            </div>
    )
  } else {
    return (
      <></>
    )
  }
}
