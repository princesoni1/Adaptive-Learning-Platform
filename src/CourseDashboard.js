import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseDashboard.css';

const CourseDashboard = () => {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Fetch the list of files from the GCS bucket using the REST API
                const response = await fetch(`https://storage.googleapis.com/storage/v1/b/als-courses/o?prefix=Segmented-Course-Folder/`);
                const data = await response.json();

                // Filter to only get top-level course folders like "Course_1/", "Course_2/"
                const folders = data.items
                    .filter(item => item.name.endsWith('/') && item.name.includes('Course_')) // Check for valid course folders
                    .map(folder => ({
                        name: folder.name.replace('Segmented-Course-Folder/', '').replace('/', ''), // Remove the path and trailing slash
                        folderPath: folder.name,
                        thumbnail: `https://storage.googleapis.com/als-courses/course-thumbnails/${folder.name.replace('Segmented-Course-Folder/', '').replace('/', '')}.jpg`
                    }));

                console.log(folders); // Check if folder data is correct
                setCourses(folders);
            } catch (error) {
                console.error('Error fetching course folders:', error);
            }
        };

        fetchCourses();
    }, []);

    const handleCourseClick = (course) => {
        navigate('/videopage', { state: { courseFolder: course.folderPath } });
    };

    // New function to handle profile icon click
    const handleProfileClick = () => {
        navigate('/UserDetails'); // Navigate to UserDetails page
    };

    return (
        <div>
            <header className="header">
                <div className="logo-container">
                    <img src="logo5.png.png" alt="Logo" className="logo" />
                </div>
                <div className="profile-container" onClick={handleProfileClick}> {/* Make the profile container clickable */}
                    <svg className="profile-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="40px" height="40px">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                </div>
            </header>
            <div className="course-dashboard">
                <h1>Course Dashboard</h1>
                <div className="course-cards">
                    {courses.map(course => (
                        <div key={course.name} className="course-card" onClick={() => handleCourseClick(course)}>
                            <img src={course.thumbnail} alt={course.name} />
                            <h2>{course.name}</h2>
                        </div>
                    ))}
                </div>
            </div>
            <footer className="footer">
                <div className="footer-content">
                    <p>&copy; 2024 Adaptive Learning</p>
                </div>
            </footer>
        </div>
    );
};

export default CourseDashboard;
