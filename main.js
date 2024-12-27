const OpenAI = require('openai');
const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const app = express();

// Load environment variables from .env file
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use API key from .env file
});

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files like CSS
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TL;DR AI</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <div class="logo">TL;<span>DR</span></div>
      <form action="/summarize" method="POST" enctype="multipart/form-data">
        <div class="textarea-container">
          <textarea name="text" placeholder="Paste your text here..."></textarea>
        </div>
        <div class="upload-container">
          <label class="upload-icon" for="file-input">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 16.5l4-4h-3V3h-2v9.5H8l4 4zM5 20h14c.55 0 1-.45 1-1v-3h-2v2H6v-2H4v3c0 .55.45 1 1 1z"></path></svg>
          </label>
          <input id="file-input" class="file-input" type="file" name="file" accept="image/*" onchange="updateFileName(this.files[0])">
          <div class="file-name" id="file-name-display">No file chosen</div>
        </div>
        <button type="submit" class="submit-button">Summarize!</button>
      </form>
      <script>
        function updateFileName(file) {
          if (file) {
            const name = file.name;
            const truncatedName = name.length > 20 ? name.substring(0, 10) + '...' + name.substring(name.length - 10) : name;
            document.getElementById('file-name-display').textContent = truncatedName;
          } else {
            document.getElementById('file-name-display').textContent = 'No file chosen';
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.post('/summarize', upload.single('file'), async (req, res) => {
  const userText = req.body.text || '';
  const uploadedFile = req.file;

  try {
    let extractedText = userText;

    if (uploadedFile) {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(uploadedFile.path));

      const ocrResponse = await axios.post(process.env.OCR_SVC_URL, formData, {
        headers: formData.getHeaders(),
      });

      extractedText += `\n${ocrResponse.data.text}`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: 'system',
          content: `You are a snarky TL;DR bot. Take the following text and summarize it in 20 words or less. Then, give it a DGAF rating out of 10 with a short, Gen Z-style explanation. Keep it funny but accurate.`,
        },
        {
          role: 'user',
          content: extractedText,
        },
      ],
    });

    const aiResponse = response.choices[0].message.content;
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TL;DR AI - Results</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <div class="results">
          <h1>TL;DR Results</h1>
          <p><strong>TL;DR Original:</strong></p>
          <p>${extractedText}</p>
          <p><strong>TL;DR Response:</strong></p>
          <p>${aiResponse}</p>
          <div class="share-container">
            <button class="share-icon" onclick="window.open('https://twitter.com/intent/tweet?text=${encodeURIComponent(aiResponse)}', '_blank')">
              <img src="../img/x-logo.svg" alt="X Icon"> Share on X
            </button>
            <button class="share-icon" onclick="window.open('https://www.instagram.com/', '_blank')">
              <img src="../img/instagram-logo.svg" alt="Instagram Icon"> Share on Instagram
            </button>
          </div>
          <div class="back-container">
            <button class="back-button" onclick="window.history.back()">Go Back</button>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong! Please try again.');
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});