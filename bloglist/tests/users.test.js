/* eslint-disable no-undef */
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/users')
const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
})

describe('when there is initially one user at db', () => {
  test('creation succeeds with a fresh username', async () => {
    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'secret',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await User.find({})
    expect(usersAtEnd).toHaveLength(1)
    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username is already taken', async () => {
    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'secret',
    }

    await api.post('/api/users').send(newUser)

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')
  })

  test('creation fails with proper statuscode and message if username or password is shorter than 3 characters', async () => {
    const newUser = {
      username: 'ro',
      name: 'Superuser',
      password: 'se',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username and password must be at least 3 characters long')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
