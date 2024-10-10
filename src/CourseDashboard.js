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

    return (
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
    );
};

export default CourseDashboard;
