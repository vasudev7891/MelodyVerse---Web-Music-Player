import { useState, useRef, useEffect } from 'react';
import { FiMic, FiMicOff, FiMessageCircle, FiX, FiSend, FiMusic } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { searchMusic } from '../services/api';

const AI_RESPONSES = {
    greetings: [
        "Hey there! 🎵 I'm MelodyBot, your music assistant! Ask me to play any song, recommend music, or help you navigate MelodyVerse!",
        "Welcome to MelodyVerse! 🎧 I can help you find songs, discover artists, or play music. What are you in the mood for?",
        "Hi! 🎶 I'm your AI music buddy! Tell me what you want to listen to and I'll find it for you!"
    ],
    play: "🎵 Searching for that song now! Give me a moment...",
    recommend_bollywood: "🎬 Here are some Bollywood gems I'd recommend:\n• Tum Hi Ho - Arijit Singh\n• Lag Ja Gale - Lata Mangeshkar\n• Kal Ho Na Ho - Sonu Nigam\n• Chaiyya Chaiyya - Sukhwinder Singh\nWould you like me to play any of these?",
    recommend_english: "🎤 Here are some English classics:\n• Bohemian Rhapsody - Queen\n• Thriller - Michael Jackson\n• Shape of You - Ed Sheeran\n• Blinding Lights - The Weeknd\nShall I play one?",
    recommend_classical: "🎵 For Indian Classical, try:\n• Raag Yaman by Pandit Ravi Shankar\n• Raag Bhairavi by Ustad Bismillah Khan\n• Classical vocal by Lata Mangeshkar\nWant me to search for these?",
    help: "I can help you with:\n🎵 **Play a song** - Say 'play [song name]'\n🔍 **Search** - Say 'search [anything]'\n⭐ **Artists** - Say 'show artists' or 'who is [artist]'\n🎬 **Genres** - Say 'play bollywood' or 'play rock'\n❤️ **Favorites** - Say 'my favorites'\n📋 **Playlists** - Say 'my playlists'\nJust type or speak your request!",
    unknown: "I'm not sure I understood that. Try saying 'play [song]', 'recommend bollywood', or 'help' to see what I can do! 🎵",
};

const AIAssistant = () => {
    const { showAIAssistant: isOpen, setShowAIAssistant: setIsOpen, playVideo } = useMusic();
    const [messages, setMessages] = useState([
        { role: 'ai', text: AI_RESPONSES.greetings[0], timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSend(transcript);
                setIsListening(false);
            };

            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
        }
    }, []);

    const speak = (text) => {
        const cleanText = text.replace(/[🎵🎶🎤🎧🎬⭐❤️📋🔍•\*#]/g, '').replace(/\n/g, '. ');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        const voices = speechSynthesis.getVoices();
        const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices.find(v => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) { }
        }
    };

    const processMessage = async (text) => {
        const lower = text.toLowerCase().trim();

        // Play song
        if (lower.startsWith('play ') || lower.startsWith('search ')) {
            const query = text.replace(/^(play|search)\s+/i, '').trim();
            addAIMessage(`🎵 Searching for "${query}"...`);
            try {
                const res = await searchMusic(query);
                const videos = res.data.videos || [];
                if (videos.length > 0) {
                    playVideo(videos[0], videos);
                    const reply = `🎵 Now playing: **${videos[0].title}**\nI found ${videos.length} results. Enjoy the music!`;
                    addAIMessage(reply);
                    speak(`Now playing ${videos[0].title}`);
                } else {
                    addAIMessage("Couldn't find that song. Try a different search term.");
                }
            } catch (e) {
                addAIMessage("Sorry, I couldn't search right now. Please try again.");
            }
            return;
        }

        // Recommendations
        if (lower.includes('recommend') || lower.includes('suggest')) {
            if (lower.includes('bollywood') || lower.includes('hindi') || lower.includes('indian')) {
                addAIMessage(AI_RESPONSES.recommend_bollywood);
                speak("Here are some Bollywood gems I'd recommend");
            } else if (lower.includes('english') || lower.includes('pop') || lower.includes('western')) {
                addAIMessage(AI_RESPONSES.recommend_english);
                speak("Here are some English classics");
            } else if (lower.includes('classical')) {
                addAIMessage(AI_RESPONSES.recommend_classical);
                speak("For Indian Classical, here are my recommendations");
            } else {
                addAIMessage("What type of music? Try 'recommend bollywood', 'recommend english', or 'recommend classical'!");
                speak("What type of music would you like me to recommend?");
            }
            return;
        }

        // Navigation
        if (lower.includes('home')) { navigate('/'); addAIMessage("Taking you home! 🏠"); return; }
        if (lower.includes('artist')) { navigate('/artists'); addAIMessage("Here are all the legendary artists! ⭐"); return; }
        if (lower.includes('favorite')) { navigate('/favorites'); addAIMessage("Here are your favorites! ❤️"); return; }
        if (lower.includes('playlist')) { navigate('/playlists'); addAIMessage("Here are your playlists! 📋"); return; }

        // Genre navigation
        const genres = ['bollywood', 'rock', 'pop', 'hip hop', 'classical', 'sufi', 'edm', 'lo-fi', 'jazz', 'country'];
        for (const genre of genres) {
            if (lower.includes(genre)) {
                navigate(`/category/${encodeURIComponent(genre.charAt(0).toUpperCase() + genre.slice(1))}`);
                addAIMessage(`🎵 Showing ${genre} music for you!`);
                speak(`Showing ${genre} music for you`);
                return;
            }
        }

        // Greetings
        if (['hi', 'hello', 'hey', 'help', 'what can you do'].some(g => lower.includes(g))) {
            const response = lower.includes('help') || lower.includes('what') ? AI_RESPONSES.help : AI_RESPONSES.greetings[Math.floor(Math.random() * AI_RESPONSES.greetings.length)];
            addAIMessage(response);
            speak(lower.includes('help') ? "I can help you play songs, search music, browse artists and genres, and manage your favorites and playlists!" : "Hi there! I'm your music assistant. How can I help?");
            return;
        }

        // Who is
        if (lower.startsWith('who is') || lower.startsWith('tell me about')) {
            const name = text.replace(/^(who is|tell me about)\s+/i, '').trim();
            addAIMessage(`Let me search for ${name}...`);
            try {
                const res = await searchMusic(`${name} songs music`);
                const videos = res.data.videos || [];
                if (videos.length > 0) {
                    addAIMessage(`🎤 **${name}** is a legendary artist! I found ${videos.length} songs. Would you like me to play "${videos[0].title}"?`);
                    speak(`${name} is a legendary artist. I found several songs. Would you like me to play one?`);
                }
            } catch (e) {
                addAIMessage(`Sorry, I couldn't find info about ${name}.`);
            }
            return;
        }

        // Default
        addAIMessage(AI_RESPONSES.unknown);
        speak("I'm not sure about that. Try saying play followed by a song name, or ask for recommendations!");
    };

    const addAIMessage = (text) => {
        setMessages(prev => [...prev, { role: 'ai', text, timestamp: new Date() }]);
    };

    const handleSend = async (textOverride) => {
        const text = textOverride || input;
        if (!text.trim()) return;

        setMessages(prev => [...prev, { role: 'user', text, timestamp: new Date() }]);
        setInput('');
        await processMessage(text);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div className="ai-chat-window">
                    <div className="ai-chat-header">
                        <div className="ai-chat-avatar">
                            <FiMusic />
                            <div className={`ai-status ${isSpeaking ? 'speaking' : ''}`}></div>
                        </div>
                        <div>
                            <h3>MelodyBot AI</h3>
                            <span className="ai-status-text">{isSpeaking ? '🔊 Speaking...' : isListening ? '🎙️ Listening...' : '🟢 Online'}</span>
                        </div>
                        <button className="ai-chat-close" onClick={() => setIsOpen(false)}><FiX /></button>
                    </div>

                    <div className="ai-chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`ai-message ${msg.role}`}>
                                {msg.role === 'ai' && <div className="ai-msg-avatar">🤖</div>}
                                <div className="ai-msg-bubble">
                                    <div className="ai-msg-text" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                                    <span className="ai-msg-time">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="ai-chat-input">
                        <button className={`ai-mic-btn ${isListening ? 'listening' : ''}`} onClick={toggleListening} title="Voice input">
                            {isListening ? <FiMicOff /> : <FiMic />}
                        </button>
                        <input
                            type="text"
                            placeholder={isListening ? 'Listening...' : 'Ask me anything about music...'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="ai-send-btn" onClick={() => handleSend()} disabled={!input.trim()}>
                            <FiSend />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIAssistant;
