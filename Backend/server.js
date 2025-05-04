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
app.use(cors()); // Enable CORS for all requests

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
    console.log(`Retrieved ${findResult.length} passwords`);
    res.json(findResult);
  } catch (err) {
    console.error('Error fetching passwords:', err);
    res.status(500).send('Error fetching passwords');
  }
});

// Save a password
app.post('/', async (req, res) => {
  try {
    const password = req.body; // Client will send site, username, password
    console.log('Saving new password:', password);
    
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const insertResult = await collection.insertOne(password);
    
    console.log('Password saved with ID:', insertResult.insertedId);
    res.status(201).json({ 
      success: true, 
      result: insertResult,
      message: 'Password saved successfully'
    });
  } catch (err) {
    console.error('Error saving password:', err);
    res.status(500).send('Error saving password');
  }
});

// Delete a password by ID
app.delete('/', async (req, res) => {
  try {
    const { _id } = req.body; // Get the MongoDB _id from request
    console.log('Deleting password with ID:', _id);
    
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    
    // Convert string ID to ObjectId if needed
    const objectId = typeof _id === 'string' ? new ObjectId(_id) : _id;
    
    const deleteResult = await collection.deleteOne({ _id: objectId });
    console.log('Delete result:', deleteResult);
    
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Password not found' });
    }
    
    res.json({
      success: true, 
      result: deleteResult,
      message: 'Password deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting password:', err);
    res.status(500).send('Error deleting password');
  }
});

// Update a password by ID
app.put('/', async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    console.log('Updating password with ID:', id);
    console.log('Update data:', updateData);
    
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    
    // Convert string ID to ObjectId
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const updateResult = await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    console.log('Update result:', updateResult);
    
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Password not found' });
    }
    
    res.json({
      success: true, 
      result: updateResult,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).send('Error updating password');
  }
});

// Test route
app.get('/hello', (req, res) => {
  res.send('Hello from PassOP');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection');
  await client.close();
  process.exit(0);
});