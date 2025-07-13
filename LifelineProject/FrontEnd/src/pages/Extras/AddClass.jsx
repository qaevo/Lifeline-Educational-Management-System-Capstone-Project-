import React, { useState } from "react";
import NavBar from "../../components/NavBar";
import Jumbotron from "../../components/Jumbotron";
import useAxios from "../../utils/useAxios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Modal} from "react-bootstrap";

const AddClass = () => {
  const axios = useAxios();
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    linkUrl: "",
    linkUrl2: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Post the course data to the backend
  const postCourse = async () => {
    try {
      const response = await axios.post(`/course/`, {
        name: formData.title,
        description: formData.subtitle,
        facultyLink: formData.linkUrl,
        studentLink: formData.linkUrl2,
      });

      if (response.status === 201) {
        setModalMessage("Course added successfully!");
        setShowModal(true);
      } else {
        alert("Something went wrong. " + response.status);
      }
    } catch (error) {
      console.error("Error adding course:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    postCourse();
    window.history.back(); // Return to the previous page
  };

  // Navigation items for NavBar
  const navItems = [
    { type: "link", url: "/CreateAn", text: "Create Announcement" },
    { type: "link", url: "/addClass", text: "Add Class" },
    { type: "link", url: "/Faculty", text: "Faculty" },
    { type: "link", url: "/logout", text: "Logout" },
  ];

  return (
    <div
      className="add-class-page"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={navItems} />

      <div
        className="main-content"
        style={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Jumbotron>
          <div
            className="form-container shadow-sm"
            style={{
              padding: "2rem",
              backgroundColor: "#fff",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "100%",
            }}
          >
            <h1 className="text-center mb-4">Add Google Classroom Class</h1>
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <div className="form-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Class Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Class Subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Faculty Link (Classroom)"
                  name="linkUrl"
                  value={formData.linkUrl}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group mb-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Student Link"
                  name="linkUrl2"
                  value={formData.linkUrl2}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "0.6rem 1.2rem", // Reduced padding for smaller buttons
                  fontSize: "0.9rem", // Adjusted font size
                  backgroundColor: "#009688",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease, transform 0.3s ease", // Smooth transition
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#00796b"; // Darker green on hover
                  e.target.style.transform = "scale(1.05)"; // Slightly larger on hover
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#009688"; // Revert to original color
                  e.target.style.transform = "scale(1)"; // Reset scale
                }}
              >
                Submit
              </button>
            </form>
          </div>
        </Jumbotron>
      </div>

      <Footer brandName="Lifeline International Health Institute" />


      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <button  type="submit"
                className="submit"
                style={{
                  padding: "0.6rem 1.2rem", // Reduced padding for smaller buttons
                  fontSize: "0.9rem", // Adjusted font size
                  backgroundColor: "#009688",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease, transform 0.3s ease", // Smooth transition
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#00796b"; // Darker green on hover
                  e.target.style.transform = "scale(1.05)"; // Slightly larger on hover
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#009688"; // Revert to original color
                  e.target.style.transform = "scale(1)"; // Reset scale
                }} onClick={() => setShowModal(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddClass;
