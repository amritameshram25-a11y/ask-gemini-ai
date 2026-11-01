const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = 5000;

if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing in .env");
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});


app.post("/ask", async (req, res) => {
    try {
        const question = req.body.question;

        if (!question || question.trim() === "") {
            return res.status(400).json({
                answer: "Please enter a question."
            });
        }

        console.log("Question:", question);

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: question
        });

        const answer = response.text;

        console.log("Gemini Answer:", answer);

        res.json({
            answer: answer
        });

    } catch (error) {

        console.error("Gemini Error:", error.message);

        res.status(500).json({
            answer: "Something went wrong while contacting Gemini."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
