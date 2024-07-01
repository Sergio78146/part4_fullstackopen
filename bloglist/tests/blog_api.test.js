/* eslint-disable no-undef */
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/users')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })

  const token = loginResponse.body.token

  const blogObjects = helper.initialBlogs.map(blog => {
    return new Blog({
      ...blog,
      user: user._id,
    })
  })

  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)

  return token
})

describe('when there is initially some blogs saved', () => {
  let token

  beforeEach(async () => {
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })

    token = loginResponse.body.token
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'John Doe',
      url: 'http://example.com',
      likes: 5,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).toContain('async/await simplifies making async calls')
  })

  test('blog without likes defaults to 0', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'John Doe',
      url: 'http://example.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const addedBlog = blogsAtEnd.find(b => b.title === newBlog.title)
    expect(addedBlog.likes).toBe(0)
  })

  test('blog without title and url is not added', async () => {
    const newBlog = {
      author: 'John Doe',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('fails with status code 401 Unauthorized if token is not provided', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'John Doe',
      url: 'http://example.com',
      likes: 5,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
