import React, { useEffect, useState } from "react";
import Jumbotron from "../../components/Jumbotron";
import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import useAxios from "../../utils/useAxios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Corrected import statement
import { Modal, Button, Spinner } from "react-bootstrap"; // Import Spinner component
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Faculty = () => {
  const axios = useAxios();

  // Define navigation items for the NavBar
  const navItems = [
    //{ type: "link", url: "/AddClass", text: "Add Class" },
    { type: "link", url: "/Faculty", text: "Faculty" },
    { type: "link", url: "/logout", text: "Logout" },
  ];

  const [cardItems, setCardItems] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch student enrollment details
  const fetchStudentEnrollment = async () => {
    try {
      const teacherid = jwtDecode(localStorage.getItem("authTokens")).user_id;
      const response = await axios.get(`/getcoursesfaculty`, {
        params: { teacherid: teacherid },
      });

      if (response.status === 200) {
        const courses = response.data.map((course) => {
          return {
            moduleId: course.id,
            title: course?.module.name || "Module",
            subtitle: course?.name || "No description available",
            link: course?.courseLink || "#",
            linkname: "Go to Class",
            link2: `/viewStudents/${course.id}/${course.module.name} ${course.name}`,
            linkname2: "View Students",
          };
        });
        console.log(response.data);

        setCardItems(courses);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Something went wrong. Please try again later.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false); // Stop the loading indicator
    }
  };

  // Use effects to fetch data when the page loads
  useEffect(() => {
    fetchStudentEnrollment();
  }, []);

  return (
    <div
      className="faculty-page"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={navItems} />

      {/* Main content section */}
      <div
        className="content-container"
        style={{ flexGrow: 1, padding: "2rem", backgroundColor: "#FAF9F6" }}
      >
        <Jumbotron>
          {/* Display a loading spinner while the data is being fetched */}
          {loading ? (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div>
              <h2 className="text-center">Your Classes</h2>
              <Card items={cardItems} />
            </div>
          )}
        </Jumbotron>
      </div>
      <Footer brandName="Lifeline International Health Institute" />
    </div>
  );
};

export default Faculty;
