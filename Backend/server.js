const express = require('express');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');
const bodyparser = require('body-parser');
const cors = require('cors');

dotenv.config();

// Connection URL from .env
const url = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'passOp';
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyparser.json()); // Middleware to parse JSON request body
app.use(cors());

// Connect to MongoDB
client.connect()
  .then(() => console.log('Connected successfully to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Get all passwords
app.get('/', async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const findResult = await collection.find({}).toArray();
    res.json(findResult);
  } catch (err) {
    res.status(500).send('Error fetching passwords');
  }
});

// Save a password
app.post('/', async (req, res) => {
  try {
    const password = { ...req.body, _id: new ObjectId() }; // Assign an ObjectId
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const findResult = await collection.insertOne(password);
    res.send({ success: true, result: findResult });
  } catch (err) {
    res.status(500).send('Error saving password');
  }
});


// Delete a password by id
app.delete('/', async (req, res) => {
  try {
    const password = req.body
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const deleteResult = await collection.deleteOne(password);
    res.send({success: true, result: deleteResult});
  } catch (err) {
    res.status(500).send('Error deleting password');
  }
});

// Update a password by id
app.put('/', async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    console.log('Updating password with ID:', id);  // Log ID
    console.log('Update data:', updateData);        // Log update data

    const db = client.db(dbName);
    const collection = db.collection('passwords');

    // Convert the `id` string to an `ObjectId`
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(id) },  // Ensure ID is in ObjectId format
      { $set: updateData }        // Set the updated data
    );

    console.log('Update result:', updateResult);  // Log update result

    if (updateResult.matchedCount === 0) {
      return res.status(404).send('Password not found');
    }

    res.send({ success: true, result: updateResult });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).send('Error updating password');
  }
});


// Root route
app.get('/hello', (req, res) => {
  res.send('Hello from PassOP');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
