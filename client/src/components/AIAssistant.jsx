import { useState, useRef, useEffect } from 'react';
import { FiMic, FiMicOff, FiMessageCircle, FiX, FiSend, FiMusic } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { searchMusic, queryAIAssistant } from '../services/api';

const AIAssistant = () => {
    const { showAIAssistant: isOpen, setShowAIAssistant: setIsOpen, playVideo } = useMusic();
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hey there! 🎵 I'm MelodyBot, powered by Gemini AI! Ask me to play any song, recommend music, or help you navigate MelodyVerse!", timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
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
        setIsThinking(true);
        try {
            const res = await queryAIAssistant(text);
            const { success, response } = res.data;
            
            if (success && response) {
                const { speakResponse, action, query } = response;
                
                addAIMessage(speakResponse);
                speak(speakResponse);

                // Execute Actions Contextually
                if (action === 'PLAY_SONG' && query) {
                    try {
                        const searchRes = await searchMusic(query);
                        const videos = searchRes.data.videos || [];
                        if (videos.length > 0) {
                            playVideo(videos[0], videos);
                        }
                    } catch (err) {
                        console.error('Failed to auto-play after AI command:', err);
                    }
                } else if (action === 'NAVIGATE' && query) {
                    navigate(query.startsWith('/') ? query : `/${query}`);
                }

            } else {
                throw new Error("Invalid response from internal AI logic");
            }
        } catch (error) {
            console.error(error);
            const fallbackMsg = "Sorry, I'm having trouble connecting to my Gemini brain right now. Please try again later. 🔌";
            addAIMessage(fallbackMsg);
            speak(fallbackMsg);
        } finally {
            setIsThinking(false);
        }
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
                        
                        {isThinking && (
                            <div className="ai-message ai">
                                <div className="ai-msg-avatar">🤖</div>
                                <div className="ai-msg-bubble ai-thinking" style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '12px 20px' }}>
                                    <div className="thinking-dot"></div>
                                    <div className="thinking-dot"></div>
                                    <div className="thinking-dot"></div>
                                </div>
                            </div>
                        )}
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
