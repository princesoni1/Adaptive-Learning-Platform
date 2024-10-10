const express = require('express');
const { Storage } = require('@google-cloud/storage');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // For loading environment variables

const app = express();
app.use(cors()); // Allow CORS for cross-origin requests from the frontend
app.use(express.json()); // Parse incoming JSON requests

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME; // Load bucket name from .env

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Use the appropriate model version

// Generate Signed URL for file upload in 'Main-Course-Folder/'
app.get('/generate-signed-url', async (req, res) => {
    const { fileName } = req.query;

    if (!fileName) {
        return res.status(400).send('Missing fileName query parameter');
    }

    const filePath = `Main-Course-Folder/${fileName}`;  // Ensure the file is stored in 'Main-Course-Folder/'

    const options = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes expiration
        contentType: 'application/octet-stream',
    };

    try {
        // Get a signed URL for the specified file path (including the folder)
        const [url] = await storage.bucket(bucketName).file(filePath).getSignedUrl(options);
        res.json({ url });
    } catch (error) {
        console.error('Error generating signed URL:', error);
        res.status(500).send('Failed to generate signed URL');
    }
});

// Route to handle chatbot interaction
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        // Generate content using Google Gemini
        const result = await model.generateContent(userMessage);
        const botReply = result.response.text(); // Get the generated text from the result
        res.json({ reply: botReply }); // Send the reply back to the frontend
    } catch (error) {
        console.error('Error with Google Gemini API:', error);
        res.status(500).json({ reply: 'Sorry, something went wrong with the chatbot.' });
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
