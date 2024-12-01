const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;
const articlesPath = path.join(__dirname, 'articles.json');
const uploadPath = path.join(__dirname, 'uploads'); // Directory for uploaded images

// Ensure the uploads directory exists
fs.mkdirSync(uploadPath, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the file name
    }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(uploadPath)); // Serve the uploads directory

// Load existing articles from a JSON file
let articles = [];
fs.readFile(articlesPath, (err, data) => {
    if (err && err.code !== 'ENOENT') {
        console.error('Error reading articles.json:', err);
        return;
    }
    articles = data ? JSON.parse(data) : [];
});

// Function to save articles
function saveArticle(article) {
    return new Promise((resolve, reject) => {
        console.log('Saving article:', article); // Log the article being saved
        articles.push(article); // Add new article to the array
        fs.writeFile(articlesPath, JSON.stringify(articles, null, 2), (err) => {
            if (err) {
                console.error('File write error:', err); // Log the file write error
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Endpoint to get all image filenames from the uploads directory
app.get('/uploads', (req, res) => {
    fs.readdir(uploadPath, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading uploads directory');
        }
        // Filter for image files (you can adjust the extensions as needed)
        const images = files.filter(file => /\.(jpg|jpeg|png|gif)$/.test(file));
        res.json(images);
    });
});

// Endpoint to get all articles
app.get('/articles', (req, res) => {
    fs.readFile(articlesPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading articles');
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint to add a new article
app.post('/articles', upload.array('images', 10), (req, res) => {
        console.log('Adding new article');
        console.log('Request body:', req.body); // Log the request body
        console.log('Uploaded files:', req.files); // Log uploaded files
        
        const { title, author, date, content, preview, coverImage } = req.body;
        const images = req.files ? req.files.map(file => file.filename) : []; // Get filenames of uploaded images

        // Create a new article object
        const newArticle = {
            title,
            author,
            date,
            content,
            preview,
            coverImage: req.files.find(file => file.originalname === coverImage).filename, // Use the uploaded cover image
            images: req.files.map(file => file.filename)
        };

        // Save the article to the database
        saveArticle(newArticle)
            .then(() => res.status(201).send('Article added successfully!'))
            .catch(err => {
                console.error('Error saving article:', err);
                res.status(500).send('Failed to add article.');
            });
    }
);

app.get('/articles/:id', (req, res) => {
    const articleId = req.params.id;
    fs.readFile(articlesPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading articles');
        }
        const articles = JSON.parse(data);
        const article = articles[articleId];
        if (article) {
            res.json(article);
        } else {
            res.status(404).send('Article not found');
        }
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


//function deleteArticleByTitle(title) {
   // articles = articles.filter(article => article.title !== title); 
    //fs.writeFile(articlesPath, JSON.stringify(articles), (err) => {
      //  if (err) throw err;
        //console.log(`Article titled "${title}" has been deleted.`);
    // });
// }
// deleteArticleByTitle("");