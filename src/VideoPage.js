import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { marked } from 'marked';
import removeMarkdown from 'remove-markdown';
import { db, auth } from './firebaseConfig';
import { doc, getDoc} from "firebase/firestore";
import './VideoPage.css'; // Assuming this CSS file contains styles for both the video page and chatbot

const VideoPage = () => {
    const location = useLocation();
    const { courseFolder } = location.state;
    const [videoUrls, setVideoUrls] = useState([]);
    const [currentVideo, setCurrentVideo] = useState('');
    const [currentVideoName, setCurrentVideoName] = useState('');
    const [transcript, setTranscript] = useState('');
    const [notes, setNotes] = useState('');
    const [questions, setQuestions] = useState(''); // Added questions state
    const [contentData, setContentData] = useState({});
    const [activeTab, setActiveTab] = useState('transcript');
    const [isChatOpen, setIsChatOpen] = useState(false); // State for chat visibility
    const [chatMessages, setChatMessages] = useState([]); // To store chat messages
    const [chatInput, setChatInput] = useState('');
    const messagesEndRef = useRef(null);
    const [learnerType, setLearnerType] = useState('');

    const extractFileName = (fullPath) => fullPath.split('/').pop();

    useEffect(() => {
        const fetchVideosAndSections = async () => {
            try {
                console.log('Video And Section Fetch')
                const user = auth.currentUser;
                console.log(user)
                if (user) {
                    const userId = user.uid;
                    const docRef = doc(db, "users", userId);
                    try {
                        const docSnap = await getDoc(docRef);
                        console.log(docSnap)
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            console.log(data)
                            setLearnerType(data.learnerType.toLowerCase());
                            console.log(learnerType)
                        }
                    } catch (error) {
                    }
                }
                

                const response = await fetch(`https://storage.googleapis.com/storage/v1/b/als-courses/o?prefix=${courseFolder}`);
                const data = await response.json();
                const videos = data.items
                    .filter(item => item.name.endsWith('.mp4'))
                    .map(video => ({
                        name: video.name.replace(`${courseFolder}`, '').replace('.mp4', ''),
                        fullName: video.name,
                        url: `https://storage.googleapis.com/als-courses/${video.name}`
                    }));

                if (videos.length > 0) {
                    setVideoUrls(videos);
                    setCurrentVideo(videos[0].url);
                    const videoFileName = extractFileName(videos[0].fullName);
                    setCurrentVideoName(videoFileName);
                }

                const contentResponse = await fetch(`https://storage.googleapis.com/als-courses/${courseFolder}content.json?timestamp=${new Date().getTime()}`);
                const contentData = await contentResponse.json();
                setContentData(contentData);

                if (videos.length > 0 && learnerType) {
                    const videoFileName = extractFileName(videos[0].fullName);
                    const learnerDefKey = `${learnerType}_def`;
                    const learnerQuestionsKey = `${learnerType}_questions`;

                    if (contentData[videoFileName]) {
                        setTranscript(contentData[videoFileName].transcript || 'No transcript available.');
                        setNotes(contentData[videoFileName][learnerDefKey] || 'No notes available.');
                        setQuestions(contentData[videoFileName][learnerQuestionsKey] || 'No questions available.');
                    }
                }
            } catch (error) {
                console.error('Error fetching videos or sections:', error);
            }
        };

        fetchVideosAndSections();
    }, [courseFolder,learnerType]);

    const handleVideoSelect = (video) => {
        setCurrentVideo(video.url);
        const videoFileName = extractFileName(video.fullName);
        setCurrentVideoName(videoFileName);
        if (contentData[videoFileName]) {
            setTranscript(contentData[videoFileName].transcript || 'No transcript available.');
            const learnerDefKey = `${learnerType}_def`;
            const learnerQuestionsKey = `${learnerType}_questions`;
            setNotes(contentData[videoFileName][learnerDefKey] || 'No notes available.');
            setQuestions(contentData[videoFileName][learnerQuestionsKey] || 'No questions available.');
        } else {
            setTranscript('No transcript available.');
            setNotes('No notes available.');
            setQuestions('No questions available.');
        }
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            window.scrollTo(0, window.scrollY - 50); // Adjust the scroll position slightly above the last message
        }
    };

    const handleSendChat = async (event) => {
        if (event.key === 'Enter') {
            if (chatInput.trim() === '') return;

            setChatMessages(prevMessages => [
                ...prevMessages,
                { type: 'user', text: `${chatInput}` }
            ]);

            const currentInput = chatInput;
            setChatInput('');

            try {
                const response = await fetch('http://localhost:8080/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: currentInput })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch chatbot reply');
                }

                const data = await response.json();
                const plainTextReply = removeMarkdown(data.reply);

                setChatMessages(prevMessages => [
                    ...prevMessages,
                    { type: 'bot', text: `${plainTextReply}` }
                ]);

                // Scroll to the bottom after messages are updated
                setTimeout(scrollToBottom, 100); // Add a slight delay to ensure DOM updates

            } catch (error) {
                console.error('Error sending message:', error);
                setChatMessages(prevMessages => [
                    ...prevMessages,
                    { type: 'bot', text: 'Chatbot not available at the moment.' }
                ]);

                // Scroll to the bottom after an error
                setTimeout(scrollToBottom, 100);
            }
        }
    };

    // Scroll to bottom effect
    useEffect(() => {
        scrollToBottom(); // Auto-scroll whenever messages change
    }, [chatMessages]);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    return (
        <div className="video-page">
            {/* Header */}
            <header className="header">
                <div className="logo-container">
                    <img src="logo5.png" alt="Logo" className="logo" />
                </div>
            </header>

            {/* Video and Sections */}
            <div className="video-sections-container">
                <div className="video-container">
                    <video controls src={currentVideo} className="video-player" />
                    <h3 className="video-title">{currentVideoName.replace('.mp4', '')}</h3>
                </div>

                <div className="sections-container">
                    <h2>Sections</h2>
                    <ul className="sections-list">
                        {videoUrls.map(video => (
                            <li key={video.name} onClick={() => handleVideoSelect(video)}>
                                {video.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Menu Bar */}
            <div className="menu-bar">
                <button className={activeTab === 'transcript' ? 'active-tab' : ''} onClick={() => setActiveTab('transcript')}>
                    Transcript
                </button>
                <button className={activeTab === 'notes' ? 'active-tab' : ''} onClick={() => setActiveTab('notes')}>
                    Notes
                </button>
                <button className={activeTab === 'questions' ? 'active-tab' : ''} onClick={() => setActiveTab('questions')}>
                    Questions
                </button>
            </div>

            {/* Content Display */}
            <div className="content-display">
                {activeTab === 'transcript' && <p>{transcript}</p>}
                {activeTab === 'notes' && (
                    <div
                        className="markdown-content"
                        dangerouslySetInnerHTML={{ __html: marked(notes) }}
                    />
                )}
                {activeTab === 'questions' && (
                    <div
                        className="markdown-content"
                        dangerouslySetInnerHTML={{ __html: marked(questions) }}
                    />
                )}
            </div>

            {/* Chatbot Toggle Button */}
            <button className="chat-toggle-btn" onClick={toggleChat}>
                💬
            </button>

            {/* Chat Popup */}
            {isChatOpen && (
                <div className="chat-popup">
                    <div className="chat-header">
                        <h3> Doubtbox</h3>
                        <span className="close" onClick={toggleChat}>&times;</span>
                    </div>
                    <div className="chat-body">
                        {chatMessages.length === 0 ? (
                            <p>No messages yet.</p>
                        ) : (
                            chatMessages.map((msg, index) => (
                                <div key={index} className={msg.type}>
                                    {msg.type === 'user' ? 'You: ' : 'Chatbot: '}
                                    {msg.text}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyPress={handleSendChat}
                            placeholder="Type a message..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPage;
