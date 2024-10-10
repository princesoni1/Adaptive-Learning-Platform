const express = require('express');
const { Storage } = require('@google-cloud/storage');
const cors = require('cors');
require('dotenv').config(); // For loading environment variables

const app = express();
app.use(cors()); // Allow CORS for cross-origin requests from the frontend

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME; // Load bucket name from .env

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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
