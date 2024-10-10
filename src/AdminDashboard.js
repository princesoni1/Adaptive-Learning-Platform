import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, deleteUser, getAuth, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore"; 
import styled from "styled-components";


const db = getFirestore();

const AdminDashboard = () => {
  const [activePanel, setActivePanel] = useState("courses"); // Track the active panel
  const [courses, setCourses] = useState([]);
  const [file, setFile] = useState(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [numCourses, setNumCourses] = useState(0);
  const [numUsers, setNumUsers] = useState(0);


  // Fetch courses from Google Cloud Storage
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`https://storage.googleapis.com/storage/v1/b/als-courses/o?prefix=Main-Course-Folder/`);
        const data = await response.json();
        
        const courses = data.items
          .filter(item => item.name.endsWith('.mp4') && item.name.includes('Course_'))
          .map(course => ({
            name: course.name.replace('Main-Course-Folder/', '').replace('.mp4', ''), // Remove the '.mp4' extension
            filePath: course.name,
            thumbnail: `https://storage.googleapis.com/als-courses/course-thumbnails/${course.name.replace('Main-Course-Folder/', '').replace('.mp4', '')}.jpg`
          }));
        
        console.log(courses); // Check if course data is correct
        setCourses(courses);
        setNumCourses(courses.length); // Set the number of courses
      } catch (error) {
        console.error('Error fetching course files:', error);
      }
    };

    fetchCourses();
  }, []);


 // Fetch users from Firebase Authentication
const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, "users"); // Change 'users' to your collection name
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({
        uid: doc.id, // Make sure to include 'uid' for deletion
        ...doc.data() // Assuming each document has fields: email, language, and name
      }));
      console.log(userList)
      setUsers(userList); // Update the state with fetched users
      setNumUsers(userList.length); // Set the number of users
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };
  
  

  useEffect(() => {
    fetchUsers(); // Call the fetchUsers function only once when the component mounts
  }, []); // Empty dependency array
  
  // Upload new course to Google Cloud
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }

    try {
      // Step 1: Request a signed URL from your backend, providing the file name
      const response = await fetch(`http://localhost:8080/generate-signed-url?fileName=${file.name}`);
      const { url } = await response.json();

      if (!url) {
        throw new Error("Failed to retrieve signed URL");
      }

      // Step 2: Upload the file to the signed URL
      const uploadResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: file,
      });
      if (uploadResponse.ok) {
        alert("File uploaded successfully!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    }
  };

  // Add a new user
  const handleAddUser = async () => {
    try {
      const authInstance = getAuth();
      await createUserWithEmailAndPassword(authInstance, newUserEmail, newUserPassword);
      alert("User added successfully!");
      setNewUserEmail("");
      setNewUserPassword("");
      fetchUsers(); // Refresh user list after adding a user
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user.");
    }
  };

  // Delete a user
  const handleDeleteUser = async (uid) => {
    try {
      const authInstance = getAuth();
      const user = await authInstance.getUser(uid);
      await deleteUser(user);
      alert("User deleted successfully!");
      fetchUsers(); // Refresh user list after deletion
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };
  const handleLogout = async () => {
    try {
      const authInstance = getAuth();
      await signOut(authInstance);
      // Redirect to the login page after successful logout
      window.location.href = "/login"; // Make sure your login route is correct
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

        <SidebarButton onClick={() => setActivePanel("courses")}>Courses</SidebarButton>
        <SidebarButton onClick={() => setActivePanel("users")}>Users</SidebarButton>
        <SidebarButton onClick={() => setActivePanel("analytics")}>Analytics</SidebarButton>
      </Sidebar>

      <Headbar>
        <HeadbarTitle>Admin Dashboard</HeadbarTitle>
        <HeadbarActions>
          <NotificationIcon />
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </HeadbarActions>
      </Headbar>

      <ContentContainer>
        <DashboardTitle>Admin Dashboard</DashboardTitle>

        {activePanel === "courses" ? (
          <>
            {/* Upload New Course Section */}
            <Section>
              <SectionTitle>Upload New Course</SectionTitle>
              <UploadContainer>
                <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <UploadButton onClick={handleUpload}>Upload Course</UploadButton>
              </UploadContainer>
            </Section>

            {/* List Uploaded Courses Section */}
            <Section>
              <SectionTitle>Uploaded Courses</SectionTitle>
              <CourseList>
                {courses.map((course, index) => (
                  <CourseItem key={index}>
                    <CourseLink href={course.filePath} target="_blank" rel="noopener noreferrer">
                      {course.name}
                    </CourseLink>
                  </CourseItem>
                ))}
              </CourseList>
            </Section>
          </>
        ) : activePanel === "users" ? (
          <>
            {/* Manage Users Section */}
            <Section>
              <SectionTitle>Add New User</SectionTitle>
              <AddUserContainer>
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
                <AddUserButton onClick={handleAddUser}>Submit</AddUserButton>
              </AddUserContainer>
            </Section>

            {/* List of Users Section */}
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
          <>
            {/* Analytics Section */}
            <Section>
              <SectionTitle>Analytics</SectionTitle>
              <AnalyticsContainer>
                <AnalyticsCard>
                  <CardTitle>Number of Courses</CardTitle>
                  <CardValue>{numCourses}</CardValue>
                </AnalyticsCard>
                <AnalyticsCard>
                  <CardTitle>Number of Users</CardTitle>
                  <CardValue>{numUsers}</CardValue>
                </AnalyticsCard>
              </AnalyticsContainer>
            </Section>
          </>
        )}
      </ContentContainer>
    </DashboardContainer>
  );

};

export default AdminDashboard;

// Styled Components
const DashboardContainer = styled.div`
  display: flex; /* Use flexbox for layout */
  max-width: 1200px;
  margin: 0 auto;
  padding: 0; /* Remove padding for full width */
  height: 100vh; /* Full height for the dashboard */
  overflow-y:hidden;
`;

const Headbar = styled.div`
  height: 60px;
  margin-left:45px;
  background-color: #003366;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 200px; /* Starts next to the sidebar */
  right: 0; /* Full width */
  z-index: -1; /* Ensure it appears above the content */
`;

const HeadbarTitle = styled.h2`
  margin: 0;
  margin-left: 30px;
  font-size: 20px;
`;

const HeadbarActions = styled.div`
  display: flex;
  align-items: center;
`;

const NotificationIcon = styled.div`
  width: 24px;
  height: 24px;
  margin-right: 20px;
  background: url('/path/to/notification/icon.png') no-repeat center center;
  background-size: contain;
  cursor: pointer;
`;

const LogoutButton = styled.button`
  padding: 8px 15px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const Sidebar = styled.div`
  width: 200px; /* Fixed width for the sidebar */
  height: 100vh; /* Full height for the sidebar */
  background: #f4f4f4;
  padding: 20px;
  border-radius: 0 8px 8px 0; /* Rounded corners on the right */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: fixed; /* Fix the sidebar to the left */
  top: 0; /* Align to the top */
  left: 0; /* Align to the left */
`;
const AdminProfile = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const AdminIcon = styled.div`
  width: 40px;
  height: 40px;
  background-color: #003366;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 18px;
  margin-right: 10px;
`;

const AdminName = styled.span`
  font-size: 16px;
  font-weight: bold;
  color: #003366;
`;

const SidebarButton = styled.button`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #003366;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const ContentContainer = styled.div`
  flex: 1;
  margin-left: 200px; /* Reserve space for the sidebar */
  margin-top: 60px; /* Reserve space for the headbar */
  padding: 20px;
  height: calc(100vh - 60px); /* Full height minus the height of the headbar */
  overflow-y: auto; /* Enable scrolling if content exceeds the available height */
`;


const DashboardTitle = styled.h1`
  text-align: center;
  margin-bottom: 40px;
  color: #003366;
`;

const Section = styled.div`
  margin-bottom: 40px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  margin-bottom: 20px;
  color: #003366;
`;

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column; /* Align elements in a column */
`;

const CourseList = styled.ul`
  list-style: none;
  padding: 0; /* Remove default padding */
`;

const CourseItem = styled.li`
  margin: 10px 0;
`;

const CourseLink = styled.a`
  text-decoration: none;
  color: #003366; /* Link color */
  font-weight: bold; /* Bold text */
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 20px; /* Space between inputs */
`;

const UploadButton = styled.button`
  background-color: #28a745; /* Green button */
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
`;

const AddUserContainer = styled.div`
  display: flex;
  flex-direction: column; /* Align elements in a column */
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column; /* Align elements in a column */
`;

const Label = styled.label`
  margin-bottom: 5px;
`;

const AddUserButton = styled.button`
  background-color: #28a745; /* Green button */
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
`;

// const UserList = styled.ul`
//   list-style: none;
//   padding: 0; /* Remove default padding */
// `;

// const UserItem = styled.li`
//   display: flex;
//   justify-content: space-between; /* Space out email and delete button */
//   margin: 10px 0;
//   padding: 10px; /* Add some padding */
//   background: #f9f9f9; /* Light background for users */
//   border-radius: 5px; /* Rounded corners */
// `;

const DeleteButton = styled.button`
  background-color: #dc3545; /* Red button */
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
`;

const UserTable = styled.table`
  width: 100%;
  table-layout: auto; /* Allow table to adjust based on content */
  border-collapse: collapse;
`;


const TableHeader = styled.th`
  background-color: #003366; /* Header background color */
  color: white; /* Header text color */
  padding: 10px; /* Padding for header cells */
  text-align: left; /* Align text to the left */
  white-space: nowrap; /* Prevent text from wrapping */
`;

const TableData = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AnalyticsContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const AnalyticsCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  flex: 1; /* Allow cards to grow equally */
`;

const CardTitle = styled.h3`
  color: #003366;
  margin-bottom: 10px;
`;

const CardValue = styled.p`
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
`;
