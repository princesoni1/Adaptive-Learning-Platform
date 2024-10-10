import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './VideoPage.css';

const VideoPage = () => {
    const location = useLocation();
    const { courseFolder } = location.state; // Getting the selected course folder
    const [videoUrls, setVideoUrls] = useState([]);
    const [currentVideo, setCurrentVideo] = useState('');
    const [currentVideoName, setCurrentVideoName] = useState(''); // Track the current video name
    const [transcript, setTranscript] = useState('');
    const [notes, setNotes] = useState('');
    const [contentData, setContentData] = useState({}); // Store entire content.json
    const [activeTab, setActiveTab] = useState('transcript'); // Default tab

    // Helper function to extract filename from full path
    const extractFileName = (fullPath) => {
        return fullPath.split('/').pop(); // Extract the last part (filename) from the path
    };

    useEffect(() => {
        const fetchVideosAndSections = async () => {
            try {
                // Fetch video URLs from the selected course folder
                const response = await fetch(`https://storage.googleapis.com/storage/v1/b/als-courses/o?prefix=${courseFolder}`);
                const data = await response.json();

                // Filter video files and set the first video
                const videos = data.items
                    .filter(item => item.name.endsWith('.mp4'))
                    .map(video => ({
                        name: video.name.replace(`${courseFolder}`, '').replace('.mp4', ''), // Get video name without folder
                        fullName: video.name, // Full name for matching with content.json
                        url: `https://storage.googleapis.com/als-courses/${video.name}`
                    }));

                if (videos.length > 0) {
                    setVideoUrls(videos);
                    setCurrentVideo(videos[0].url); // Set the first video as the current video
                    const videoFileName = extractFileName(videos[0].fullName); // Extract filename from full path
                    setCurrentVideoName(videoFileName); // Set the video name

                    console.log('First video filename:', videoFileName); // Log the first video filename
                }

                // Fetch content.json for transcript and notes (quesdef)
                console.log('courseFolder',courseFolder)
                const contentResponse = await fetch(`https://storage.googleapis.com/als-courses/${courseFolder}content.json`);
                const contentData = await contentResponse.json();
                setContentData(contentData); // Store the entire content.json data

                console.log('Content data:', contentData); // Log the fetched content data

                // Set the transcript and notes for the first video
                if (videos.length > 0) {
                    const videoFileName = extractFileName(videos[0].fullName);
                    if (contentData[videoFileName]) {
                        console.log('Content for first video:', contentData[videoFileName]); // Log the content for the first video
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
        const videoFileName = extractFileName(video.fullName); // Extract filename from full path
        setCurrentVideoName(videoFileName);

        // Set the transcript and notes for the selected video
        if (contentData[videoFileName]) {
            console.log('Content for selected video:', contentData[videoFileName]); // Log the content for the selected video
            setTranscript(contentData[videoFileName].transcript || 'No transcript available.');
            setNotes(contentData[videoFileName].quesdef || 'No notes available.');
        } else {
            setTranscript('No transcript available.');
            setNotes('No notes available.');
        }
    };

    return (
        <div className="video-page">
            {/* Video and Sections Container */}
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
                <button
                    className={activeTab === 'transcript' ? 'active-tab' : ''}
                    onClick={() => setActiveTab('transcript')}
                >
                    Transcript
                </button>
                <button
                    className={activeTab === 'notes' ? 'active-tab' : ''}
                    onClick={() => setActiveTab('notes')}
                >
                    Notes
                </button>
            </div>

            {/* Content Display */}
            <div className="content-display">
                {activeTab === 'transcript' && <p>{transcript}</p>}
                {activeTab === 'notes' && <p>{notes}</p>}
            </div>
        </div>
    );
};

export default VideoPage;
