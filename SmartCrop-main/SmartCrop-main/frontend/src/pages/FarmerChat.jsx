import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import { 
  Mic, MicOff, Send, Bot, User, Loader2, Volume2, Sprout, 
  Plus, MessageSquare, Trash2, Clock, PanelLeftClose, PanelLeftOpen, Sparkles 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_GREETING = {
  role: 'assistant',
  isGreeting: true,
  text: 'Namaste! 🙏 Welcome to **Krushi Sahayak (କୃଷି ସହାୟକ)**, your official agricultural advisor.\n\n🌾 **Topics You Can Ask Me About**:\n• 💰 **Highest Net Profit Analysis**: *"Which crop gives the highest profit in my district?"*\n• 💧 **Irrigation Advisory & Water Demand**: *"What is the irrigation advice for Groundnut in Ganjam?"*\n• 📈 **Mandi Prices & Market Rates**: *"What are the current mandi prices for Rice and Ragi?"*\n• 🏛️ **Government Farmer Schemes**: *"What benefits can I get under KALIA and PM-KISAN?"*\n• 🧪 **Soil & Fertilizer Guidance**: *"What is the NPK fertilizer ratio and liming recommendation?"*\n• 🛡️ **Pest & Disease Control**: *"How to treat yellow leaf spots in pulses organically?"*\n\nHow can I assist your farm today?'
};

const FarmerChat = ({ isEmbedded = false }) => {
  const { t, lang } = useLanguage();
  
  // LocalStorage Key for Chat Sessions
  const STORAGE_KEY = 'smartCrop_chat_sessions_v1';
  const ACTIVE_KEY = 'smartCrop_active_session_id';

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([DEFAULT_GREETING]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Format Date & Time for Chat History Items
  const formatDateTime = (timestamp = Date.now()) => {
    const d = new Date(timestamp);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const time = d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day} ${month}, ${time}`;
  };

  // Initialize Chat Sessions from LocalStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEY);
    let parsedSessions = [];

    if (savedSessions) {
      try {
        parsedSessions = JSON.parse(savedSessions);
      } catch (err) {
        console.error("Error loading chat history:", err);
      }
    }

    if (parsedSessions.length === 0) {
      const initSession = {
        id: 'sess_' + Date.now(),
        title: 'New Advisory Session',
        dateStr: formatDateTime(),
        timestamp: Date.now(),
        messages: [DEFAULT_GREETING]
      };
      parsedSessions = [initSession];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedSessions));
      localStorage.setItem(ACTIVE_KEY, initSession.id);
    }

    const savedActiveId = localStorage.getItem(ACTIVE_KEY) || parsedSessions[0].id;
    const activeSess = parsedSessions.find(s => s.id === savedActiveId) || parsedSessions[0];

    setSessions(parsedSessions);
    setCurrentSessionId(activeSess.id);
    setMessages(activeSess.messages || [DEFAULT_GREETING]);
  }, []);

  // Sync Messages to LocalStorage whenever messages or session changes
  const saveCurrentSessionMessages = (updatedMessages, updatedTitle = null) => {
    if (!currentSessionId) return;

    setSessions(prevSessions => {
      const newSessions = prevSessions.map(sess => {
        if (sess.id === currentSessionId) {
          const firstUserMsg = updatedMessages.find(m => m.role === 'user');
          let newTitle = sess.title;
          if (updatedTitle) {
            newTitle = updatedTitle;
          } else if (firstUserMsg && sess.title === 'New Advisory Session') {
            newTitle = firstUserMsg.text.slice(0, 28) + (firstUserMsg.text.length > 28 ? '...' : '');
          }

          return {
            ...sess,
            title: newTitle,
            messages: updatedMessages,
            timestamp: Date.now()
          };
        }
        return sess;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
      return newSessions;
    });
  };

  // Start a Brand New Chat Session
  const createNewChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setPlayingId(null);

    const newId = 'sess_' + Date.now();
    const newSession = {
      id: newId,
      title: 'New Advisory Session',
      dateStr: formatDateTime(),
      timestamp: Date.now(),
      messages: [DEFAULT_GREETING]
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setCurrentSessionId(newId);
    setMessages([DEFAULT_GREETING]);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    localStorage.setItem(ACTIVE_KEY, newId);
  };

  // Switch Active Session
  const selectSession = (id) => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setPlayingId(null);

    const target = sessions.find(s => s.id === id);
    if (target) {
      setCurrentSessionId(id);
      setMessages(target.messages || [DEFAULT_GREETING]);
      localStorage.setItem(ACTIVE_KEY, id);
    }
  };

  // Delete a Chat Session
  const deleteSession = (id, e) => {
    e.stopPropagation();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setPlayingId(null);

    const updated = sessions.filter(s => s.id !== id);
    
    if (updated.length === 0) {
      const newSession = {
        id: 'sess_' + Date.now(),
        title: 'New Advisory Session',
        dateStr: formatDateTime(),
        timestamp: Date.now(),
        messages: [DEFAULT_GREETING]
      };
      setSessions([newSession]);
      setCurrentSessionId(newSession.id);
      setMessages([DEFAULT_GREETING]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newSession]));
      localStorage.setItem(ACTIVE_KEY, newSession.id);
    } else {
      setSessions(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (currentSessionId === id) {
        setCurrentSessionId(updated[0].id);
        setMessages(updated[0].messages || [DEFAULT_GREETING]);
        localStorage.setItem(ACTIVE_KEY, updated[0].id);
      }
    }
  };

  // Setup Web Speech API Cleanup
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleReadAloud = (text, idx) => {
    if (!('speechSynthesis' in window)) {
      alert("Sorry, your browser doesn't support text to speech!");
      return;
    }

    if (playingId === idx) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/•/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (lang === 'hi') utterance.lang = 'hi-IN';
    else if (lang === 'or') utterance.lang = 'or-IN';
    else utterance.lang = 'en-IN';

    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    setPlayingId(idx);
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      if (lang === 'hi') recognitionRef.current.lang = 'hi-IN';
      else if (lang === 'or') recognitionRef.current.lang = 'or-IN';
      else recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
    }

    const userMessage = inputText.trim();
    const updatedUserMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(updatedUserMessages);
    saveCurrentSessionMessages(updatedUserMessages);
    setInputText('');
    setLoading(true);

    const district = localStorage.getItem('smartCropLocation') || 'Cuttack';
    const landArea = parseFloat(localStorage.getItem('smartCropLandArea')) || 2.5;

    try {
      const response = await apiClient.post('/chat', { 
        message: userMessage,
        context: {
          district: district,
          season: 'Kharif',
          area_ha: landArea,
          language: lang
        },
        history: updatedUserMessages
          .filter(m => !m.isGreeting)
          .slice(-10)
          .map(m => ({ role: m.role, text: m.text }))
      });

      const newMsg = { role: 'assistant', text: response.data.reply };
      const updatedBotMessages = [...updatedUserMessages, newMsg];
      setMessages(updatedBotMessages);
      saveCurrentSessionMessages(updatedBotMessages);

    } catch (error) {
      const errorMsg = { role: 'assistant', text: "Sorry, I'm having trouble connecting to the agricultural advisory server right now. Please try again." };
      const updatedErrMessages = [...updatedUserMessages, errorMsg];
      setMessages(updatedErrMessages);
      saveCurrentSessionMessages(updatedErrMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex bg-gray-50 font-sans transition-colors overflow-hidden ${isEmbedded ? 'w-full h-full' : 'max-w-5xl mx-auto h-[calc(100dvh-3.5rem)] sm:h-[calc(100vh-4rem)] rounded-2xl shadow-xl border border-gray-200'}`}>
      
      {/* LIGHT MODE LEFT SIDEBAR (History & New Chat) */}
      <aside 
        className={`bg-slate-50 text-slate-800 flex flex-col transition-all duration-300 border-r border-slate-200 shrink-0 z-20 ${
          isSidebarOpen ? 'w-64 sm:w-72' : 'w-0 hidden'
        }`}
      >
        {/* New Chat Button */}
        <div className="p-3 border-b border-slate-200/80 bg-white/50 flex items-center justify-between">
          <button
            onClick={createNewChat}
            className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Sessions History List Header */}
        <div className="px-4 py-2.5 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center space-x-1.5 border-b border-slate-200/50">
          <Clock className="h-3.5 w-3.5 text-emerald-600" />
          <span>Recent Advisory Chats</span>
        </div>

        {/* History Items Scroll Container */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5 custom-scrollbar">
          {sessions.map((sess) => {
            const isActive = sess.id === currentSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => selectSession(sess.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all text-xs ${
                  isActive
                    ? 'bg-white text-emerald-900 border border-emerald-300 shadow-2xs font-semibold'
                    : 'text-slate-700 hover:bg-white/80 hover:text-emerald-800'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-1">
                  <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div className="truncate min-w-0 flex-1">
                    <p className="truncate text-xs font-medium leading-snug">{sess.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{sess.dateStr || formatDateTime(sess.timestamp)}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => deleteSession(sess.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 rounded-md transition-opacity"
                  title="Delete chat thread"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 h-full">
        
        {/* Top Chat Bar */}
        <header className="bg-white px-4 py-3 flex items-center justify-between shrink-0 border-b border-gray-200 shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              title={isSidebarOpen ? "Collapse History" : "Open History"}
            >
              {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="bg-emerald-100 p-2 rounded-full hidden sm:block">
                <Sprout className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">
                  Krushi Sahayak (କୃଷି ସହାୟକ)
                </h1>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Official Agricultural Advisory Assistant
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={createNewChat}
            className="sm:hidden flex items-center space-x-1 bg-emerald-600 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New</span>
          </button>
        </header>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isReadingThis = playingId === index;

            return (
              <div
                key={index}
                className={`flex items-start space-x-2 sm:space-x-3 ${
                  isUser ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-green-600 text-white shadow-xs'
                      : 'bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-sm sm:text-base leading-relaxed shadow-2xs whitespace-pre-line ${
                      isUser
                        ? 'bg-green-600 text-white font-medium rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {!isUser && (
                    <button
                      onClick={() => handleReadAloud(msg.text, index)}
                      className={`mt-1.5 flex items-center text-xs px-2.5 py-1 rounded-full border transition-all ${
                        isReadingThis
                          ? 'bg-green-100 border-green-300 text-green-700 animate-pulse font-semibold'
                          : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                      }`}
                    >
                      <Volume2 className="h-3.5 w-3.5 mr-1" />
                      {isReadingThis ? 'Reading...' : 'Read aloud'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-xs flex items-center space-x-3">
                <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
                <span className="text-sm text-gray-500 font-medium">Fetching agricultural advisory...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-gray-200 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 sm:p-3 rounded-full transition-all shrink-0 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
              title={isListening ? "Stop listening" : "Speak message"}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Listening..." : "Type your message or tap the mic..."}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="bg-green-600 text-white p-2.5 sm:p-3 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 shadow-xs"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default FarmerChat;
