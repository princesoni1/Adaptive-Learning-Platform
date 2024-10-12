import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, deleteUser, getAuth, signOut } from "firebase/auth";
import { collection, getDocs, doc, setDoc } from "firebase/firestore"; 
import styled from "styled-components";
import { db } from './firebaseConfig'; // Import Firestore config as db


const AdminDashboard = () => {
  const [activePanel, setActivePanel] = useState("courses");
  const [courses, setCourses] = useState([]); // Initialize as an empty array
  const [file, setFile] = useState(null);
  const [newUserName, setNewUserName] = useState(""); // New user name
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserMobile, setNewUserMobile] = useState(""); // New user mobile
  const [newUserLearnerType, setNewUserLearnerType] = useState("slow"); // New user learner type
  const [newUserLanguagePreference, setNewUserLanguagePreference] = useState("english"); // New user language preference
  const [users, setUsers] = useState([]);
  const [numUsers, setNumUsers] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://storage.googleapis.com/storage/v1/b/als-courses/o?prefix=Main-Course-Folder/`);
      const data = await response.json();

      const courseList = data.items
        .filter(item => item.name.endsWith('.mp4') && item.name.includes('Course_'))
        .map(course => ({
          name: course.name.replace('Main-Course-Folder/', '').replace('.mp4', ''),
          filePath: course.name,
          thumbnail: `https://storage.googleapis.com/als-courses/course-thumbnails/${course.name.replace('Main-Course-Folder/', '').replace('.mp4', '')}.jpg`
        }));

      setCourses(courseList); // Set the array of course objects
    } catch (error) {
      console.error('Error fetching course files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(), // Ensure data fields like name, email, etc., are retrieved
      }));
      console.log(userList); // For debugging, check if userList contains correct data
      setUsers(userList); // Set the user list to the state
      setNumUsers(userList.length); // Set number of users
    } catch (error) {
      console.error("Error fetching users: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/generate-signed-url?fileName=${file.name}`);
      const { url } = await response.json();

      if (!url) {
        throw new Error("Failed to retrieve signed URL");
      }

      const uploadResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: file,
      });
      if (uploadResponse.ok) {
        alert("File uploaded successfully!");
        fetchCourses(); // Refresh the course list
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    }
  };

  const handleAddUser = async () => {
    // Admin check (if current user is authenticated and admin)
    const currentUser = getAuth().currentUser;
    console.log('New User0:', getAuth().currentUser)
    if (!currentUser || currentUser.email !== "r@gmail.com") {
        alert("Only the admin can add new users.");
        return;
    }

    // Check if email and password are provided
    if (!newUserEmail || !newUserPassword) {
        alert("Email and password are required.");
        return;
    }

    try {
        const authInstance = getAuth();
        // Create new user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(authInstance, newUserEmail, newUserPassword);
        const newUser = userCredential.user; // Get the new user's information (uid, email, etc.)

        // Prepare user data to be saved in Firestore
        const userData = {
            uid: newUser.uid,  // The user's unique ID
            name: newUserName,
            email: newUserEmail,
            mobile: newUserMobile,
            learnerType: newUserLearnerType,
            languagePreference: newUserLanguagePreference,
        };
        console.log('New User1:', getAuth().currentUser)
        // Save the new user's data to Firestore under /users/{uid}
        await setDoc(doc(db, "users", newUser.uid), userData);
        console.log('New User2:', getAuth().currentUser)
        alert("User added successfully!");
        console.log('New User3:', getAuth().currentUser)
        // Reset input fields after successful addition
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPassword("");
        setNewUserMobile("");
        setNewUserLearnerType("Slow"); // Reset learner type to default
        setNewUserLanguagePreference("English"); // Reset language preference to default
        fetchUsers(); // Optionally refresh the users list or perform other actions
    } catch (error) {
        console.error("Error adding user:", error.message);
        alert(`Failed to add user: ${error.message}`);
    }
};


  const handleDeleteUser = async (uid) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const authInstance = getAuth();
      const user = await authInstance.getUser(uid);
      await deleteUser(user);
      alert("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  const handleLogout = async () => {
    try {
      const authInstance = getAuth();
      await signOut(authInstance);
      localStorage.clear(); // Clear localStorage
      sessionStorage.clear(); // Clear sessionStorage (if you're using it)
      window.location.href = "/login"; // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out: ", error);
      alert("Failed to logout.");
    }
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <AdminProfile>
          <AdminIcon>👤</AdminIcon>
          <AdminName>Admin Name</AdminName>
        </AdminProfile>

        <SidebarButton onClick={() => setActivePanel("courses")}>Add New Courses</SidebarButton>
        <SidebarButton onClick={() => setActivePanel("users")}>Manage Users</SidebarButton>
        <SidebarButton onClick={() => setActivePanel("analytics")}>User Analytics</SidebarButton>
        <SidebarButton onClick={() => setActivePanel("learnerQuery")}>Learner Query</SidebarButton>
        <SidebarButton onClick={handleLogout}>Logout</SidebarButton>
      </Sidebar>

      <ContentContainer>
        {loading ? (
          <LoadingMessage>Loading...</LoadingMessage>
        ) : activePanel === "courses" ? (
          <>
            <Section style={styles.section}>
              <SectionTitle style={styles.sectionTitle}>Upload New Course</SectionTitle>
              <div style={styles.uploadContainer}>
                <input
                  type="file"
                  style={styles.input}
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <button style={styles.uploadButton} onClick={handleUpload}>
                  Upload Course
                </button>
              </div>
            </Section>

            <Section>
              <SectionTitle>Uploaded Courses</SectionTitle>
              <CourseList>
                {courses.map((course, index) => (
                  <CourseCard key={index}>
                    <Thumbnail src={course.thumbnail} alt={`${course.name} thumbnail`} />
                    <CourseTitle>{course.name}</CourseTitle>
                    <CourseLink href={`https://storage.googleapis.com/als-courses/${course.filePath}`} target="_blank" rel="noopener noreferrer">
                      View Course
                    </CourseLink>
                  </CourseCard>
                ))}
              </CourseList>
            </Section>
          </>
        ) : activePanel === "users" ? (
          <>
            <Section>
            <SectionTitle>Add New User</SectionTitle>
            <AddUserBox>
              <AddUserContainer>
                <InputWrapper>
                  <Label>Name:</Label>
                  <Input
                    type="text"
                    placeholder="New user name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label>Email:</Label>
                  <Input
                    type="email"
                    placeholder="New user email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label>Password:</Label>
                  <Input
                    type="password"
                    placeholder="New user password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label>Mobile:</Label>
                  <Input
                    type="text"
                    placeholder="New user mobile"
                    value={newUserMobile}
                    onChange={(e) => setNewUserMobile(e.target.value)}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label>Learner Type:</Label>
                  <Select
                    value={newUserLearnerType}
                    onChange={(e) => setNewUserLearnerType(e.target.value)}
                  >
                    <option value="Slow">Slow</option>
                    <option value="Average">Average</option>
                    <option value="Fast">Fast</option>
                  </Select>
                </InputWrapper>
                <InputWrapper>
                  <Label>Language Preference:</Label>
                  <Select
                    value={newUserLanguagePreference}
                    onChange={(e) => setNewUserLanguagePreference(e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </Select>
                </InputWrapper>
                <AddUserButton onClick={handleAddUser}>Submit</AddUserButton>
              </AddUserContainer>
            </AddUserBox>
            </Section>


            <Section>
              <SectionTitle>User List</SectionTitle>
              <UserTable>
                <thead>
                  <tr>
                    <TableHeader>First Name</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Mobile</TableHeader>
                    <TableHeader>Language</TableHeader>
                    <TableHeader>Learner Type</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.uid}>
                        <TableData>{user.name}</TableData>
                        <TableData>{user.email}</TableData>
                        <TableData>{user.mobile}</TableData>
                        <TableData>{user.languagePreference}</TableData>
                        <TableData>{user.learnerType}</TableData>
                        <TableData>
                          <DeleteButton onClick={() => handleDeleteUser(user.uid)}>Delete</DeleteButton>
                        </TableData>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <TableData colSpan="6">No users found.</TableData>
                    </tr>
                  )}
                </tbody>
              </UserTable>
            </Section>
          </>
        ) : (
          <Section>
            <SectionTitle>Analytics Section</SectionTitle>
            <AnalyticsContainer>
              <AnalyticsMessage>Total Users: {numUsers}</AnalyticsMessage>
              <AnalyticsMessage>Total Courses: {courses.length}</AnalyticsMessage>
            </AnalyticsContainer>
          </Section>
        )}
      </ContentContainer>
    </DashboardContainer>
  );
};

export default AdminDashboard;

// Styled components (same as before)


// Styled components
const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
`;

const Sidebar = styled.div`
  width: 210px;
  background-color: #181c6c;
  padding: 20px;
  color: white;
  height: calc(100vh - 60px); // Full height minus the headbar height
  position: fixed; // Keep sidebar fixed
  top: 0px; // Position below the headbar
  left: 0;
  display: flex; // Use flexbox for layout
  flex-direction: column; // Stack items vertically
`;

const AdminProfile = styled.div`
  display: flex;
  flex-direction: column; /* Stack icon and name vertically */
  align-items: center; /* Center icon and name horizontally */
  margin-bottom: 30px;
`;


const AdminIcon = styled.div`
  font-size: 60px; /* Increase the icon size */
  margin-bottom: 10px; /* Add spacing between icon and name */
`;

const AdminName = styled.div`
  font-size: 20px;
  text-align: center; /* Center the admin name text */
`;

const SidebarButton = styled.button`
  background-color: white; /* Change background to white */
  color: #181c6c; /* Text color to match theme */
  border: none;
  font-size: 18px;
  padding: 15px 20px; /* Adjust padding for a larger box */
  margin-bottom: 15px; /* Add spacing between buttons */
  border-radius: 5px; /* Add rounded corners */
  cursor: pointer;
  text-align: left;
  width: 100%; /* Make the button take full width */
  
  &:hover {
    background-color: #34495e; /* Optional hover effect */
    color: white; /* Change text color on hover */
  }

  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Add box shadow */
`;


const ContentContainer = styled.div`
  flex: 1;
  margin-left: 250px; // Leave space for sidebar
  margin-top: 60px; // Leave space for headbar
  padding: 20px;
  overflow-y: auto; // Allow scrolling
`;


const LoadingMessage = styled.p`
  font-size: 18px;
`;


const CourseList = styled.ul`
  list-style-type: none;
  padding: 0;
`;


const CourseCard = styled.div`
  width: 250px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  text-align: center;
  padding: 20px;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  margin-bottom: 15px;
`;

const CourseTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 10px;
`;

const CourseLink = styled.a`
  color: #2980b9;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  background-color: #34495e;
  color: white;
  padding: 10px;
`;

const TableData = styled.td`
  border: 1px solid #ddd;
  padding: 10px;
`;

const DeleteButton = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 5px;
  cursor: pointer;

  &:hover {
    background-color: #c0392b;
  }
`;

const AnalyticsContainer = styled.div`
  padding: 20px;
  background-color: #ecf0f1;
  border-radius: 5px;
`;

const AnalyticsMessage = styled.p`
  font-size: 18px;
  text-align: center;
`;

const AddUserBox = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
`;

const AddUserContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputWrapper = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 5px;
  display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  font-size: 16px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  font-size: 16px;
`;

const AddUserButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background-color: #45a049;
  }
`;

const Section = styled.section`
  margin: 20px;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
`;

const styles = {
  section: {
    border: "2px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "500px",
    margin: "20px auto",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: "1.8em",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
  },
  uploadContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    marginBottom: "15px",
    width: "100%",
    fontSize: "1em",
  },
  uploadButton: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1em",
    transition: "background-color 0.3s",
  },
};

styles.uploadButton[':hover'] = {
  backgroundColor: "#0056b3",
};
