/* eslint-disable @stylistic/js/semi */
/* eslint-disable @stylistic/js/indent */
/* eslint-disable @stylistic/js/quotes */
const mongoose = require('mongoose');

const url = `mongodb+srv://sergiomapa046:OFg4tVGidtVsPJIq@clusterperson.ld3ek5b.mongodb.net/blog?retryWrites=true&w=majority&appName=ClusterPerson`;

mongoose.set('strictQuery', false);
mongoose.connect(url).then(() => {
    const blogSchema = new mongoose.Schema({
        title: String,
        author: String,
        url: String,
        likes: Number
    });

    const Blog = mongoose.model('Blog', blogSchema);

    if (process.argv.length === 2) {
        // No hay argumentos adicionales, listamos los blogs existentes
        Blog.find({}).then(result => {
            result.forEach(blog => {
                console.log(blog);
            });
            mongoose.connection.close();
        });
    } else if (process.argv.length >= 5) {
        // Hay suficientes argumentos para crear un nuevo blog
        const title = process.argv[2];
        const author = process.argv[3];
        const url = process.argv[4];
        const likes = process.argv[5] ? parseInt(process.argv[5]) : 0;

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
        console.log('Usage: node mongo.js [title] [author] [url] [likes]');
        mongoose.connection.close();
    }
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
});
