import React, { useState, useEffect } from 'react';
import './UserDetails.css';
import { db, auth } from './firebaseConfig'; 
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; 
import { signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const UserDetails = () => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        mobile: '',
        languagePreference: '',
        learnerType: ''
    });

    const [oldPassword, setOldPassword] = useState(''); 
    const [newPassword, setNewPassword] = useState(''); 
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [successMessage, setSuccessMessage] = useState('');
    const [showChangePassword, setShowChangePassword] = useState(false); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser; 
            if (user) {
                const userId = user.uid;
                const docRef = doc(db, "users", userId);
                try {
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserData({
                            name: data.name || '',
                            email: user.email, 
                            mobile: data.mobile || '',
                            languagePreference: data.languagePreference || '',
                            learnerType: data.learnerType || ''
                        });
                    } else {
                        setUserData((prevData) => ({
                            ...prevData,
                            email: user.email, 
                        }));
                    }
                } catch (error) {
                    setError("Failed to fetch user data.");
                } finally {
                    setLoading(false); 
                }
            } else {
                setLoading(false); 
            }
        };
        fetchUserData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            const docRef = doc(db, "users", userId);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    await updateDoc(docRef, userData); 
                    setSuccessMessage("User details updated successfully!");
                    window.alert("User details updated successfully!");
                } else {
                    await setDoc(docRef, userData);
                    setSuccessMessage("User details created successfully!");
                    window.alert("User details created successfully!");
                }
            } catch (error) {
                setError("Failed to save user data.");
            }
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
    
        if (!oldPassword || !newPassword || !confirmPassword) {
            window.alert("Please fill all password fields.");
            return;
        }
    
        if (newPassword !== confirmPassword) {
            window.alert("New passwords do not match.");
            return;
        }
    
        if (user) {
            const userId = user.uid;
            const docRef = doc(db, "users", userId);
    
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const storedPassword = docSnap.data().password; // Get stored password from Firestore
                    
                    if (oldPassword !== storedPassword) {
                        window.alert("Old password does not match.");
                        return; // Stop further execution if passwords don't match
                    }

                    const credential = EmailAuthProvider.credential(user.email, oldPassword);
                    await reauthenticateWithCredential(user, credential);
    
                    // Update the password in Firebase Authentication
                    await updatePassword(user, newPassword);
    
                    // Update the password in Firestore
                    await updateDoc(docRef, {
                        password: newPassword
                    });
    
                    window.alert("Password updated successfully!");
    
                    // Clear password fields
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setError(null); 
                } else {
                    setError("User document does not exist.");
                }
            } catch (error) {
                setError("Failed to change password.");
                console.error("Error changing password: ", error);
            }
        }
    };
    
    const handleLogout = async () => {
        try {
            await signOut(auth); 
            localStorage.clear();
            sessionStorage.clear();
            navigate('/login');   
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const showEditDetails = () => {
        setShowChangePassword(false);
        setError(null);
        setSuccessMessage('');
    };

    const showChangePasswordView = () => {
        setShowChangePassword(true);
        setError(null);
        setSuccessMessage('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    if (loading) {
        return <p>Loading...</p>; 
    }

    return (
        <div className="user-details__container">
            <div className="user-details__sidebar">
                <div className="user-details__logo-container">
                    <img src="user-details-logo.png" alt="Logo" className="user-details__logo" />
                </div>
                <div className="user-details__profile">
                    <img src="user-details-profile-logo.png" alt="Profile" className="user-details__profile-icon" />
                    <h2 className="user-details__profile-name">{userData.name || 'User Name'}</h2>
                </div>
                <button className="user-details__sidebar-button" onClick={showEditDetails}>Edit Details</button>
                <button className="user-details__sidebar-button" onClick={showChangePasswordView}>Change Password</button>
                <button className="user-details__sidebar-button">Contact Support</button>
                <button className="user-details__sidebar-button user-details__sidebar-button--logout" onClick={handleLogout}>Logout</button>
            </div>

            <div className="user-details__main-content">
                {!showChangePassword ? (
                    <div>
                        <h1 className="user-details__title">Edit Details:</h1>
                        {error && <p className="user-details__error">{error}</p>} 
                        {successMessage && <p className="user-details__success">{successMessage}</p>} 
                        <form className="user-details__form" onSubmit={handleSubmit}>
                            <label className="user-details__form-label">Name:</label>
                            <input 
                                className="user-details__form-input" 
                                type="text" 
                                value={userData.name} 
                                onChange={(e) => setUserData({...userData, name: e.target.value})} 
                                placeholder="Enter your name" 
                            />
                            
                            <label className="user-details__form-label">Email:</label>
                            <input 
                                className="user-details__form-input" 
                                type="email" 
                                value={userData.email} 
                                readOnly 
                            />
                            
                            <label className="user-details__form-label">Contact Number:</label>
                            <input 
                                className="user-details__form-input" 
                                type="text" 
                                value={userData.mobile} 
                                onChange={(e) => setUserData({...userData, mobile: e.target.value})} 
                                placeholder="Enter your contact number" 
                            />
                            
                            <label className="user-details__form-label">Language Preference:</label>
                            <select 
                                className="user-details__form-select"
                                value={userData.languagePreference || ''} 
                                onChange={(e) => setUserData({...userData, languagePreference: e.target.value})}>
                                <option value="">Select Language</option>
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Telugu">Telugu</option>
                            </select>

                            <label className="user-details__form-label">Learner Type:</label>
                            <select 
                                className="user-details__form-select"
                                value={userData.learnerType || ''} 
                                onChange={(e) => setUserData({...userData, learnerType: e.target.value})}>
                                <option value="">Select Learner Type</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Average">Average</option>
                                <option value="Advanced">Advanced</option>
                            </select>

                            <div className="user-details__form-buttons">
                                <button type="submit" className="user-details__form-button user-details__form-button--primary">Save Details</button>
                                <button type="button" className="user-details__form-button user-details__form-button--secondary" onClick={handleLogout}>Logout</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div>
                        <h1 className="user-details__title">Change Password:</h1>
                        <form className="user-details__form" onSubmit={handleChangePassword}>
                            <label className="user-details__form-label">Old Password:</label>
                            <input 
                                className="user-details__form-input" 
                                type="password" 
                                value={oldPassword} 
                                onChange={(e) => setOldPassword(e.target.value)} 
                                placeholder="Enter your old password" 
                            />
                            
                            <label className="user-details__form-label">New Password:</label>
                            <input 
                                className="user-details__form-input" 
                                type="password" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                placeholder="Enter your new password" 
                            />
                            
                            <label className="user-details__form-label">Confirm New Password:</label>
                            <input 
                                className="user-details__form-input" 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                placeholder="Confirm your new password" 
                            />

                            <div className="user-details__form-buttons">
                                <button type="submit" className="user-details__form-button user-details__form-button--primary">Change Password</button>
                                <button type="button" className="user-details__form-button user-details__form-button--secondary" onClick={showEditDetails}>Back to Edit Details</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDetails;