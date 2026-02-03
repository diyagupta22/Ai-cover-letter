// Load environment variables
require("dotenv").config({ path: "./.env" });

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// File upload setup (PDF parsing disabled for stability)
const upload = multer({ dest: "uploads/" });

// Debug: Check API key
console.log("API KEY Loaded:", process.env.GEMINI_KEY);

// Main API Route
app.post("/generate", upload.single("resume"), async (req, res) => {

  try {

    const { name, role, company, jobDesc } = req.body;

    // Temporary resume text
    const resumeText = "Resume uploaded by candidate.";

    // Prompt for AI
    const prompt = `
Write a professional cover letter.

Candidate: ${name}
Role: ${role}
Company: ${company}

Job Description:
${jobDesc}

Resume:
${resumeText}

Make it well formatted with proper paragraphs.
`;

    console.log("Sending request to Gemini...");

    // Gemini API call
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",

      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_KEY
        },
        timeout: 20000
      }
    );

    // Debug raw response
    console.log("Gemini Raw Response:", JSON.stringify(response.data, null, 2));

    // Extract AI text (supports multiple formats)
    let result = "";

    // Format 1 (Most common)
    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      result = response.data.candidates[0].content.parts[0].text;
    }

    // Format 2 (Alternate)
    else if (response.data?.candidates?.[0]?.output) {
      result = response.data.candidates[0].output;
    }

    // Format 3 (Fallback)
    else if (response.data?.text) {
      result = response.data.text;
    }

    // Unknown format
    else {
      console.log("Unknown Gemini format:", response.data);
      result = "AI response received but could not be read. Please try again.";
    }

    // Send response to frontend
    res.json({ letter: result });

  } catch (err) {

    console.error("Server Error:", err.response?.data || err.message);

    res.status(500).json({
      error: "Internal Server Error",
      details: err.message
    });
  }

});

// Start server
app.listen(3000, () => {
  console.log("🔥 Server running at http://localhost:3000");
});
