import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { marked } from 'marked';

import removeMarkdown from 'remove-markdown';
import './VideoPage.css'; // Assuming this CSS file contains styles for both the video page and chatbot

const VideoPage = () => {
    const location = useLocation();
    const { courseFolder } = location.state;
    const [videoUrls, setVideoUrls] = useState([]);
    const [currentVideo, setCurrentVideo] = useState('');
    const [currentVideoName, setCurrentVideoName] = useState('');
    const [transcript, setTranscript] = useState('');
    const [notes, setNotes] = useState('');
    const [contentData, setContentData] = useState({});
    const [activeTab, setActiveTab] = useState('transcript');
    const [isChatOpen, setIsChatOpen] = useState(false); // State for chat visibility
    const [chatMessages, setChatMessages] = useState([]); // To store chat messages
    const [chatInput, setChatInput] = useState('');
    const messagesEndRef = useRef(null); // Ref to scroll to bottom of chat

    const extractFileName = (fullPath) => fullPath.split('/').pop();

    useEffect(() => {
        const fetchVideosAndSections = async () => {
            try {
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

                const contentResponse = await fetch(`https://storage.googleapis.com/als-courses/${courseFolder}content.json`);
                const contentData = await contentResponse.json();
                setContentData(contentData);

                if (videos.length > 0) {
                    const videoFileName = extractFileName(videos[0].fullName);
                    if (contentData[videoFileName]) {
                        setTranscript(contentData[videoFileName].transcript || 'No transcript available.');
                        setNotes(contentData[videoFileName].quesdef || 'No notes available.');
                    }
                }

            } catch (error) {
                console.error('Error fetching videos or sections:', error);
            }
        };

        fetchVideosAndSections();
    }, [courseFolder]);

    const handleVideoSelect = (video) => {
        setCurrentVideo(video.url);
        const videoFileName = extractFileName(video.fullName);
        setCurrentVideoName(videoFileName);
        if (contentData[videoFileName]) {
            setTranscript(contentData[videoFileName].transcript || 'No transcript available.');
            setNotes(contentData[videoFileName].quesdef || 'No notes available.');
        } else {
            setTranscript('No transcript available.');
            setNotes('No notes available.');
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
                {activeTab === 'questions' && <p>No questions available yet.</p>}
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
                                <div key={index} className={`chat-message ${msg.type}`}>
                                    {msg.text}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} /> {/* Scroll target */}
                    </div>

                    <div className="chat-input-area">
                        <input
                            className="chat-input"
                            type="text"
                            placeholder="Type a message..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={handleSendChat} // Send message on Enter key
                        />
                        <button
                            className={`chat-send-btn ${chatInput.trim() === '' ? 'disabled' : ''}`}
                            onClick={handleSendChat}
                            disabled={chatInput.trim() === ''}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPage;
