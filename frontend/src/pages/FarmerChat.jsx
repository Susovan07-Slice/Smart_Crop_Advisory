import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import { Mic, MicOff, Send, Bot, User, Loader2, Volume2, Sprout, MoreVertical } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const FarmerChat = ({ isEmbedded = false }) => {
 const { t, lang } = useLanguage();
 const [messages, setMessages] = useState([
 { role: 'assistant', isGreeting: true, text: 'Namaste! I am your SmartCrop Assistant. How can I help you today? You can press the microphone button to talk to me.' }
 ]);
 const [inputText, setInputText] = useState('');
 const [isListening, setIsListening] = useState(false);
 const [loading, setLoading] = useState(false);
 const [playingId, setPlayingId] = useState(null);
 
 const messagesEndRef = useRef(null);
 const recognitionRef = useRef(null);

 // Setup Web Speech API for Text-to-Speech (Cleanup)
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

 // If currently speaking, stop it.
 if (window.speechSynthesis.speaking) {
 window.speechSynthesis.cancel();
 // If clicking the same message, just stop it and exit
 if (playingId === idx) {
 setPlayingId(null);
 return;
 }
 }
 
 const utterance = new SpeechSynthesisUtterance(text);
 
 // Safely attempt to find an Indian accent voice without causing a silent crash
 const voices = window.speechSynthesis.getVoices();
 // Determine correct voice language code
 let voiceLangCode = 'en-IN';
 if (lang === 'hi') voiceLangCode = 'hi-IN';
 if (lang === 'or') voiceLangCode = 'or-IN';
 
 // Look for appropriate voice matching the selected language
 const indianVoice = voices.find(v => 
 v.lang.includes(voiceLangCode) || 
 (lang === 'hi' && v.name.toLowerCase().includes('hindi')) ||
 (lang === 'en' && v.name.includes('India')) ||
 (lang === 'en' && v.lang.includes('-IN'))
 );
 
 if (indianVoice) {
 utterance.voice = indianVoice;
 }

 // Fix for a known Chrome bug where speech stops halfway because it gets garbage collected
 window.utteranceStore = window.utteranceStore || [];
 window.utteranceStore.push(utterance);
 
 utterance.onstart = () => setPlayingId(idx);
 utterance.onend = () => {
 setPlayingId(null);
 window.utteranceStore = window.utteranceStore.filter(u => u !== utterance);
 };
 utterance.onerror = (e) => {
 console.error("Speech error:", e);
 setPlayingId(null);
 };
 
 window.speechSynthesis.speak(utterance);
 };

 // Setup Web Speech API for Speech-to-Text
 useEffect(() => {
 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
 if (SpeechRecognition) {
 const recognition = new SpeechRecognition();
 recognition.continuous = false;
 recognition.interimResults = true;

 recognition.onresult = (event) => {
 let currentTranscript = '';
 for (let i = event.resultIndex; i < event.results.length; i++) {
 currentTranscript += event.results[i][0].transcript;
 }
 setInputText(currentTranscript);
 };

 recognition.onend = () => {
 setIsListening(false);
 };

 recognition.onerror = (event) => {
 console.error("Speech recognition error", event.error);
 setIsListening(false);
 };

 recognitionRef.current = recognition;
 }
 }, []);

 const toggleListen = () => {
 if (isListening) {
 recognitionRef.current?.stop();
 setIsListening(false);
 } else {
 if (!recognitionRef.current) {
 alert("Your browser does not support voice typing. Please use Chrome or Edge.");
 return;
 }
 setInputText(''); // Clear input before listening
 
 // Update voice recognition language right before starting
 let recLang = 'en-IN';
 if (lang === 'hi') recLang = 'hi-IN';
 if (lang === 'or') recLang = 'or-IN';
 recognitionRef.current.lang = recLang;
 
 recognitionRef.current.start();
 setIsListening(true);
 }
 };

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
 };

 useEffect(() => {
 scrollToBottom();
 }, [messages, loading]);

 const handleSendMessage = async (e) => {
 e?.preventDefault();
 if (!inputText.trim()) return;

 if (isListening) {
 recognitionRef.current?.stop();
 setIsListening(false);
 }

 // Stop any ongoing speech if user sends a new message
 if (window.speechSynthesis.speaking) {
 window.speechSynthesis.cancel();
 setPlayingId(null);
 }

 const userMessage = inputText.trim();
 setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
 setInputText('');
 setLoading(true);

 try {
 const response = await apiClient.post('/chat', { 
 message: userMessage,
 language: lang,
 history: [...messages, { role: 'user', text: userMessage }]
 .filter(m => !m.isGreeting)
 .slice(-10)
 .map(m => ({ role: m.role, text: m.text }))
 });
 const newMsg = { role: 'assistant', text: response.data.reply };
 setMessages(prev => [...prev, newMsg]);
 
 // Optional: Auto-read the response when it arrives
 // setTimeout(() => handleReadAloud(response.data.reply, messages.length + 1), 100);
 
 } catch (error) {
 setMessages(prev => [...prev, { role: 'assistant', text:"Sorry, I'm having trouble connecting right now. Please try again." }]);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className={`flex flex-col bg-gray-50 font-sans transition-colors ${isEmbedded ? 'w-full h-full' : 'max-w-3xl mx-auto h-[calc(100dvh-3.5rem)] sm:h-[calc(100vh-4rem)]'}`}>
 <header className="bg-white shadow-xs px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between z-10 shrink-0 border-b border-gray-200 transition-colors">
 <div className="flex items-center space-x-3">
 <div className="bg-green-100 p-2 rounded-full hidden sm:block">
 <Sprout className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
 </div>
 <div>
 <h1 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
 {t('chat_title')}
 </h1>
 <p className="text-xs text-green-600 font-medium">
 {t('chat_subtitle')}
 </p>
 </div>
 </div>
 <button className="text-gray-400 hover:text-gray-600 p-1 sm:p-2">
 <MoreVertical className="h-5 w-5" />
 </button>
 </header>

 <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
 {messages.map((msg, idx) => (
 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
 <div className={`flex max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
 <div className={`flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-green-100 ml-2 sm:ml-3' : 'bg-blue-100 mr-2 sm:mr-3'}`}>
 {msg.role === 'user' ? <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-700" /> : <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" />}
 </div>
 <div className={`p-3 sm:p-4 rounded-2xl shadow-xs ${msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 '}`}>
 <p className="text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-wrap">{msg.isGreeting ? t('chat_greeting') : msg.text}</p>
 
 {msg.role === 'assistant' && (
 <div className="mt-2.5 sm:mt-3 flex justify-end">
 <button
 onClick={() => handleReadAloud(msg.isGreeting ? t('chat_greeting') : msg.text, idx)}
 className={`flex items-center text-xs sm:text-sm font-medium transition-colors px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border active:scale-95 ${
 playingId === idx 
 ? 'text-green-700 bg-green-50 border-green-200 shadow-inner' 
 : 'text-gray-500 hover:text-green-600 hover:bg-green-50 border-transparent'
 }`}
 title={t('read_aloud')}
 >
 <Volume2 className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 ${playingId === idx ? 'animate-pulse text-green-600' : ''}`} />
 <span>{playingId === idx ? t('stop_reading') : t('read_aloud')}</span>
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 ))}
 {loading && (
 <div className="flex justify-start">
 <div className="flex bg-white p-3 sm:p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-xs ml-10 sm:ml-13 items-center">
 <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 animate-spin mr-2" />
 <span className="text-gray-500 text-xs sm:text-sm">{t('thinking')}</span>
 </div>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 <div className="bg-white border-t border-gray-200 p-3 sm:p-4 shrink-0 transition-colors">
 <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end space-x-2 sm:space-x-3">
 <button
 type="button"
 onClick={toggleListen}
 className={`p-3 sm:p-3.5 rounded-full flex-shrink-0 transition-all shadow-xs ${
 isListening 
 ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-red-200 ' 
 : 'bg-green-100 text-green-600 hover:bg-green-200 '
 }`}
 title={isListening ?"Stop listening" :"Tap to speak"}
 >
 {isListening ? <MicOff className="h-5 w-5 sm:h-6 sm:w-6" /> : <Mic className="h-5 w-5 sm:h-6 sm:w-6" />}
 </button>

 <div className="flex-1 relative">
 <textarea
 value={inputText}
 onChange={(e) => setInputText(e.target.value)}
 placeholder={t('chat_placeholder')}
 rows={1}
 className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 focus:ring-green-500 focus:border-green-500 resize-none h-11 sm:h-13 text-sm sm:text-base leading-snug transition-colors"
 onKeyDown={(e) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault();
 handleSendMessage();
 }
 }}
 />
 </div>

 <button
 type="submit"
 disabled={!inputText.trim() || loading}
 aria-label="Send message"
 className="flex-shrink-0 p-2.5 sm:p-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-50 transition-all active:scale-95 shadow-sm"
 >
 <Send className="h-5 w-5 sm:h-6 sm:w-6" />
 </button>
 </form>
 {isListening && (
 <p className="text-center text-red-500 text-xs sm:text-sm font-medium mt-1.5 animate-pulse">
 {t('listening_text')}
 </p>
 )}
 </div>
 </div>
 );
};

export default FarmerChat;
