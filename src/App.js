// App.js

import React from 'react';
import LoginPage from "./LoginPage";
import AdminDashboard from './AdminDashboard';  // Import your AdminDashboard component
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CourseDashboard from './CourseDashboard';
import VideoPage from './VideoPage'; // Assuming you have a VideoPage component

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/admindashboard" element={<AdminDashboard />} />
                <Route path="/coursedashboard" element={<CourseDashboard />} />
                <Route path="/videopage" element={<VideoPage />} />
            </Routes>
        </Router>
    );
};

export default App;
