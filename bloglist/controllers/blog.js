const blogRouter = require('express').Router()
const Blog = require('../models/blog')
// eslint-disable-next-line no-unused-vars
const User = require('../models/users')

// Ruta para obtener todos los blogs
blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

// Ruta para obtener un blog específico por su ID
blogRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 })
    if (blog) {
      response.json(blog)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

// Ruta para crear un nuevo blog
blogRouter.post('/', async (request, response, next) => {
  const body = request.body

  // Verificar si hay un usuario autenticado (extraído por el middleware userExtractor)
  if (!request.user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  // Crear un nuevo blog con el usuario autenticado como creador
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: request.user._id  // Asignar al usuario autenticado como creador del blog
  })

  try {
    const savedBlog = await blog.save()
    request.user.blogs = request.user.blogs.concat(savedBlog._id)
    await request.user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

// Ruta para eliminar un blog
blogRouter.delete('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)

    if (!blog) {
      return response.status(404).json({ error: 'blog not found' })
    }

    // Verificar si el usuario autenticado es el creador del blog
    if (blog.user.toString() !== request.user._id.toString()) {
      return response.status(401).json({ error: 'only the creator can delete this blog' })
    }

    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

// Ruta para actualizar un blog
blogRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogRouter
