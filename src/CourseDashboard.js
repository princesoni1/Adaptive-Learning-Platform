import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseDashboard.css';

const CourseDashboard = () => {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch(`https://storage.googleapis.com/storage/v1/b/als-courses/o?prefix=Segmented-Course-Folder/`);
                const data = await response.json();
                const folders = data.items
                    .filter(item => item.name.endsWith('/') && item.name.includes('Course_'))
                    .map(folder => ({
                        name: folder.name.replace('Segmented-Course-Folder/', '').replace('/', ''),
                        folderPath: folder.name,
                        thumbnail: `https://storage.googleapis.com/als-courses/course-thumbnails/${folder.name.replace('Segmented-Course-Folder/', '').replace('/', '')}.jpg`
                    }));

                console.log(folders);
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

    const handleProfileClick = () => {
        navigate('/UserDetails');
    };

    return (
        <div className="course-dashboard">
            <header className="course-dashboard__header">
                <img 
                    src="/logo5.png" 
                    alt="Logo" 
                    className="course-dashboard__logo" 
                />
                <img 
                    src="dashboard_profile.png" 
                    alt="Profile Icon" 
                    className="course-dashboard__profile-icon" 
                    onClick={handleProfileClick} 
                />
                <div className="course-dashboard__profile-container">
                    <p className="course-dashboard__profile-text">My Profile</p>
                </div>
            </header>
            <main className="course-dashboard__content">
                <h1 className="course-dashboard__title">Course Dashboard</h1>
                <div className="course-dashboard__cards">
                    {courses.map(course => (
                        <div key={course.name} className="course-card" onClick={() => handleCourseClick(course)}>
                            <img src={course.thumbnail} alt={course.name} className="course-card__thumbnail" />
                            <h2 className="course-card__title">{course.name}</h2>
                        </div>
                    ))}
                </div>
            </main>
            <footer className="course-dashboard__footer">
                <div className="course-dashboard__footer-content">
                    <p>&copy; 2024 Adaptive Learning</p>
                </div>
            </footer>
        </div>
    );
};

export default CourseDashboard;