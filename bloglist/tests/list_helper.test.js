const Blog = require('../models/blog')
const User = require('../models/users')

const initialBlogs = [
  {
    title: 'First blog',
    author: 'Author One',
    url: 'http://example1.com',
    likes: 1,
  },
  {
    title: 'Second blog',
    author: 'Author Two',
    url: 'http://example2.com',
    likes: 2,
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', author: 'test', url: 'http://test.com', likes: 0 })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
}
