const express = require('express');
const multer = require('multer');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;
const dbName = 'Data';
const collectionName = 'Docs';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uri = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.6';
const client = new MongoClient(uri);

app.get('/', async (req, res) => {
    try {
        // Connect to the MongoDB server
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Retrieve all student data from the collection
        const data = await collection.find({}).toArray();

        // Render the homepage with the student data
        res.render('all.ejs', { data: data });
    } catch (error) {
        // If an error occurs, render an error page
        res.send('No page found')
    } finally {
        // Close the MongoDB client connection
        await client.close();
    }
});

app.get('/new', async (req, res) => {
    res.render('new.ejs')
});

app.post('/submit', upload.single('image'), async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const image = req.file ? req.file.buffer : null;

        const dataToInsert = {
            id: generateRandomNumericId(20),
            image: image,
        };

        await collection.insertOne(dataToInsert);
        console.log('inserted')
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        client.close();
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

function generateRandomNumericId(length) {
    const charset = '0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        id += charset[randomIndex];
    }
    return id;
}