const _ = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  const favorite = blogs.reduce((prev, current) => {
    return (prev.likes > current.likes) ? prev : current
  })

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const authors = _.countBy(blogs, 'author')
  const maxBlogsAuthor = _.maxBy(_.keys(authors), (author) => authors[author])

  return {
    author: maxBlogsAuthor,
    blogs: authors[maxBlogsAuthor]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const grouped = _.groupBy(blogs, 'author')
  const authorLikes = _.map(grouped, (authorBlogs, author) => ({
    author,
    likes: _.sumBy(authorBlogs, 'likes')
  }))
  const maxLikesAuthor = _.maxBy(authorLikes, 'likes')

  return maxLikesAuthor
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
