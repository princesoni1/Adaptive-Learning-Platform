import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './VideoPage.css';

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
    const [chatMessages, setChatMessages] = useState([]); // To store chat messages
    const [chatInput, setChatInput] = useState('');

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

    // Handle chat message input
    const handleSendMessage = async () => {
        if (chatInput.trim() === '') return;

        setChatMessages([...chatMessages, { type: 'user', text: chatInput }]);

        try {
            const response = await fetch('http://localhost:8080/chat', { // Replace with your backend URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: chatInput })
            });


            if (!response.ok) {
                throw new Error('Failed to fetch chatbot reply');
            }

            const data = await response.json();
            setChatMessages([...chatMessages, { type: 'user', text: chatInput }, { type: 'bot', text: data.reply }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setChatMessages([...chatMessages, { type: 'user', text: chatInput }, { type: 'bot', text: 'Chatbot not available at the moment.' }]);
        }

        setChatInput('');
    };

    return (
        <div className="video-page">
            {/* Video and Sections */}
            <div className="video-sections-container">
                <div className="video-container">
                    <video controls src={currentVideo} className="video-player" />
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
            </div>

            {/* Content Display */}
            <div className="content-display">
                {activeTab === 'transcript' && <p>{transcript}</p>}
                {activeTab === 'notes' && <p>{notes}</p>}
            </div>

            {/* Chatbot Integration */}
            <div className="chatbot-container">
                <div className="chatbot-button" onClick={() => document.getElementById("chatPopup").style.display = "block"}>💬</div>
                <div className="chat-popup" id="chatPopup">
                    <div className="chat-header">
                        <h3>Gemini Chatbot</h3>
                        <span className="close" onClick={() => document.getElementById("chatPopup").style.display = "none"}>&times;</span>
                    </div>
                    <div className="chat-body">
                        {chatMessages.map((msg, index) => (
                            <div key={index} className={msg.type === 'user' ? 'user-message' : 'bot-message'}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="chat-footer">
                        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPage;
