/* eslint-disable @stylistic/js/semi */
/* eslint-disable @stylistic/js/indent */
/* eslint-disable @stylistic/js/quotes */
const mongoose = require('mongoose');

// Obtiene la URL de conexión de los argumentos de línea de comandos
const url = process.argv[2];

if (!url) {
    console.error('Missing MongoDB connection URL');
    process.exit(1);
}

mongoose.set('strictQuery', false);
mongoose.connect(url).then(() => {
    const blogSchema = new mongoose.Schema({
        title: String,
        author: String,
        url: String,
        likes: Number
    });

    const Blog = mongoose.model('Blog', blogSchema);

    if (process.argv.length === 3) {
        // No hay argumentos adicionales, listamos los blogs existentes
        Blog.find({}).then(result => {
            result.forEach(blog => {
                console.log(blog);
            });
            mongoose.connection.close();
        });
    } else if (process.argv.length >= 6) {
        // Hay suficientes argumentos para crear un nuevo blog
        const title = process.argv[3];
        const author = process.argv[4];
        const url = process.argv[5];
        const likes = process.argv[6] ? parseInt(process.argv[6]) : 0;

        const blog = new Blog({
            title,
            author,
            url,
            likes
        });

        blog.save().then(() => {
            console.log(`Added blog: ${title} by ${author}`);
            mongoose.connection.close();
        });
    } else {
        console.log('Usage: node mongo.js [mongoDB URL] [title] [author] [url] [likes]');
        mongoose.connection.close();
    }
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
});
