import React from 'react';
import './UserDetails.css';

const UserDetails = () => {
    return (
        <div className="container">
            <div className="sidebar">
                <div className="user-profile">
                    <svg className="profile-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray" width="80px" height="80px">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <h2>User Name</h2>
                </div>
                <button className="sidebar-button">Edit Details</button>
                <button className="sidebar-button">Change Password</button>
                <button className="sidebar-button">Contact Support</button>
                <button className="sidebar-button logout">Logout</button>
            </div>
            <div className="main-content">
                <h1>Edit Details:</h1>
                <form className="details-form">
                    <label>Name:</label>
                    <input type="text" placeholder="Display current name" />
                    
                    <label>Email:</label>
                    <input type="email" placeholder="Display current E-mail" required />
                    
                    <label>Contact Number:</label>
                    <input type="text" placeholder="Display current Contact Number" />
                    
                    <label>Language Preference:</label>
                    <select>
                        <option>Display current Language Preference</option>
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Telugu</option>
                    </select>

                    <label>Learner Type:</label>
                    <select>
                        <option>Display current Learner type</option>
                        <option>Beginner</option>
                        <option>Average</option>
                        <option>Advanced</option>
                    </select>

                    <div className="form-buttons">
                        <button type="submit">Proceed</button>
                        <button type="button">Go Back</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserDetails;
