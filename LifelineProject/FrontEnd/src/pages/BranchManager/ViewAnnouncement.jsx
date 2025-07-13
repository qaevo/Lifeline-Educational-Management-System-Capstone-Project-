import React, { useEffect, useState } from "react";
import Jumbotron from "../../components/Jumbotron";
import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import useAxios from "../../utils/useAxios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Corrected import statement
import { Modal, Button, Spinner } from "react-bootstrap"; // Import Spinner component
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RichTextEditor from "../../components/RichTextEditor";

const ViewAnnouncement = () => {
  const axios = useAxios();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // State for Edit Modal
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    linkName: "",
    linkUrl: "",
    imgLink: "",
    global: false,
  });
  const navigate = useNavigate();

  // Define navigation items for the NavBar
  const items = [
    {
      type: "dropdown",
      text: "Branch Manager",
      items: [
        { text: "Create Announcement", url: "/CreateAn" },
        { text: "View Announcement", url: "/ViewAn" },
        { text: "Matching", url: "/Matching" },
        { text: "Manage Programs", url: "/createProgram" },
        { text: "Manage Modules", url: "/createModule" },
        { text: "Manage Classes", url: "/createClass" },
        { text: "Manage Instructors", url: "/manageInstructors" },
        { text: "Manage Schedule", url: "/manageSchedule" },
        { text: "Reports", url: "/reports" },
      ],
    },
    { type: "link", url: "/BranchManager", text: "Dashboard" },
    { type: "link", url: "/logout", text: "Logout" },
  ];

  // Fetch announcements from the API
  const getAnnouncements = async () => {
    try {
      const branch = jwtDecode(localStorage.getItem("authTokens")).branch;
      const response = await axios.get(`getannouncements/${branch}`);
      if (response.status === 200) {
        setAnnouncements(response.data);
        setLoading(false); // Stop loading once data is fetched
      } else {
        toast.error(`Something went wrong. ${response.status}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setLoading(false); // Ensure loading stops even on error
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
      setLoading(false); // Ensure loading stops even on error
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    try {
      const response = await axios.patch(
        `archiveannouncement/${selectedAnnouncement.id}/`,
        {
          status: "ARCHIVED",
        }
      );

      if (response.status === 200) {
        toast.success("Announcement archived successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setShowDeleteModal(false);
        getAnnouncements();
      } else {
        toast.error(`Something went wrong. ${response.status}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error("Error archiving announcement:", error);
      toast.error("Something went wrong. Please try again later.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  // Handle edit button click
  const handleEditClick = (announcement) => {
    console.log("Selected Announcement:", announcement); // Debugging
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      subtitle: announcement.subtitle,
      content: announcement.content, // Ensure this is the correct field for the body
      linkName: announcement.linkName,
      linkUrl: announcement.linkUrl,
      imgLink: announcement.imgLink,
      global: announcement.global,
    });
    setShowEditModal(true); // Open the Edit Modal
  };
  useEffect(() => {
    console.log("Form Data Updated:", formData); // Debugging
  }, [formData]);


  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle RichTextEditor content change
  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(
        `updateannouncement/${selectedAnnouncement.id}/`,
        {
          title: formData.title,
          subtitle: formData.subtitle,
          content: formData.content,
          link: formData.linkUrl,  // Map linkUrl to link
          linkname: formData.linkName,  // Map linkName to linkname
          imglink: formData.imgLink,
          global: formData.global,
        }
      );
      if (response.status === 200) {
        toast.success("Announcement updated successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setShowEditModal(false);
        getAnnouncements(); // Refresh the announcements list
      } else {
        toast.error(`Something went wrong. ${response.status}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast.error("Something went wrong. Please try again later.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  // Use effects to fetch data when the page loads
  useEffect(() => {
    getAnnouncements();
  }, []);

  return (
    <div
      className="faculty-page"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />

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
              <h1 className="section-title text-center">Announcements</h1>
              {/* Render announcements with Edit and Delete buttons */}
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  style={{
                    marginBottom: "1rem",
                    padding: "1rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    position: "relative",
                  }}
                >
                  <h3>{announcement.title}</h3>
                  <p>{announcement.description}</p>
                  <p>
                    <strong>Status:</strong> {announcement.status}
                  </p>
                  <p>
                    <strong>Posted By:</strong> {announcement.poster_name}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                    }}
                  >
                    <Button
                      variant="primary"
                      onClick={() => handleEditClick(announcement)}
                      style={{ width: "80px" }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setSelectedAnnouncement(announcement);
                        setShowDeleteModal(true);
                      }}
                      style={{ width: "80px" }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Jumbotron>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Announcement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this announcement?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Announcement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <div className="mb-4">
              <input
                type="text"
                className="form-control"
                placeholder="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                style={{
                  fontSize: "1.1rem",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  borderColor: "#ced4da",
                }}
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                className="form-control"
                placeholder="Subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                style={{
                  fontSize: "1.1rem",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  borderColor: "#ced4da",
                }}
              />
            </div>
            <div className="mb-4">
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                className="form-control"
                placeholder="Link Name"
                name="linkName"
                value={formData.linkName}
                onChange={handleChange}
                style={{
                  fontSize: "1.1rem",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  borderColor: "#ced4da",
                }}
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                className="form-control"
                placeholder="Link URL"
                name="linkUrl"
                value={formData.linkUrl}
                onChange={handleChange}
                style={{
                  fontSize: "1.1rem",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  borderColor: "#ced4da",
                }}
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                className="form-control"
                placeholder="Image Link"
                name="imgLink"
                value={formData.imgLink}
                onChange={handleChange}
                style={{
                  fontSize: "1.1rem",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  borderColor: "#ced4da",
                }}
              />
            </div>
            {/* Global Announcement Checkbox */}
            <div className="mb-4 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="globalAnnouncement"
                name="global"
                checked={formData.global}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="globalAnnouncement">
                This is a global announcement
              </label>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "0.6rem 1.2rem",
                fontSize: "0.9rem",
                backgroundColor: "#009688",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.3s ease, transform 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#00796b";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#009688";
                e.target.style.transform = "scale(1)";
              }}
            >
              Update
            </button>
          </form>
        </Modal.Body>
      </Modal>

      <Footer brandName="Lifeline International Health Institute" />
      <ToastContainer />
    </div>
  );
};

export default ViewAnnouncement;