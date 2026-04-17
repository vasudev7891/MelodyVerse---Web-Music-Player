const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });

const SYSTEM_INSTRUCTION = `You are MelodyBot, an expert AI music assistant for the MelodyVerse app.
Your job is to understand the user's request and trigger the correct app action.
You MUST respond IN STRICT JSON FORMAT matching the structure below. NO markdown, NO code blocks, ONLY raw JSON.

{
  "speakResponse": "What you should say to the user conversationally",
  "action": "PLAY_SONG" | "NAVIGATE" | "RECOMMEND" | "ANSWER" | "ERROR",
  "query": "The exact song or artist to play, or the route to navigate to (e.g. '/', '/favorites', '/playlists', '/artists', '/category/Bollywood'), or empty string"
}

Examples:
- User: "Play shape of you" -> {"speakResponse": "Playing Shape of You by Ed Sheeran", "action": "PLAY_SONG", "query": "Shape of You Ed Sheeran"}
- User: "Take me to my favorite tracks" -> {"speakResponse": "Taking you to your favorites!", "action": "NAVIGATE", "query": "/favorites"}
- User: "Who is Arijit Singh?" -> {"speakResponse": "Arijit Singh is a legendary Bollywood playback singer. Would you like me to play one of his hits?", "action": "ANSWER", "query": ""}
- User: "Play some rock music" -> {"speakResponse": "Let's rock! Taking you to the rock category.", "action": "NAVIGATE", "query": "/category/Rock"}
- User: "Recommend me some chill songs" -> {"speakResponse": "I recommend checking out Lo-Fi or Café music. I'll search for a great chill playlist for you.", "action": "PLAY_SONG", "query": "Chill lofi beats relaxing playlist"}
`;

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return res.json({
                success: true,
                response: {
                    speakResponse: "I cannot connect to my AI brain right now. Please set the Gemini API Key in the server configuration.",
                    action: "ERROR",
                    query: ""
                }
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                 systemInstruction: SYSTEM_INSTRUCTION,
                 responseMimeType: "application/json",
            }
        });

        const jsonText = response.text;
        const parsedData = JSON.parse(jsonText);

        res.json({ success: true, response: parsedData });

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ 
            success: false, 
            response: {
                speakResponse: "Sorry, I'm having trouble thinking right now. Please try again later.",
                action: "ERROR",
                query: ""
            }
        });
    }
});

module.exports = router;
