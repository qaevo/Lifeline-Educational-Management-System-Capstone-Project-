import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import Jumbotron from "../../components/Jumbotron";
import RichTextEditor from "../../components/RichTextEditor";
import useAxios from "../../utils/useAxios";
import { jwtDecode } from "jwt-decode";
import "bootstrap/dist/css/bootstrap.css";
import { Modal, Button } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AnnounceCreator = () => {
  const axios = useAxios();
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    linkName: "",
    linkUrl: "",
    imgLink: "",
    global: false,
  });

  const addAnnouncement = async () => {
    try {
      const branch = formData.global ? 999 : jwtDecode(localStorage.getItem("authTokens")).branch;
      const userid = jwtDecode(localStorage.getItem("authTokens")).user_id;
      const response = await axios.post(`/addannouncement/`, {
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
        link: formData.linkUrl,
        linkname: formData.linkName,
        imglink: formData.imgLink,
        postedBy: userid,
        branch: branch,
      });

      if (response.status === 201) {
        toast.success("Announcement Added!", {
          position: "top-right",
          autoClose: 3000,
        });

        setTimeout(() => {
          window.location.href = "/BranchManager"; // Redirect after 2 seconds
        }, 2000);
      } else {
        toast.error(`Something went wrong. ${response.status}`);
      }
    } catch (error) {
      toast.error("An error occurred while adding the announcement.");
    }
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleContentChange = (content) => {
    setFormData((prevData) => ({
      ...prevData,
      content: content,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.content) {
      addAnnouncement();
    } else {
      toast.error("Title and Content Required!", {
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

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />
      <ToastContainer />
      <div style={{ flex: 1, marginTop: "6rem", padding: "2% 4%" }}>
        <Jumbotron>
          <div
            className="row justify-content-center shadow-lg"
            style={{
              padding: "2rem",
              margin: "auto",
              width: "100%",
              borderRadius: "10px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2
              style={{
                marginBottom: "1.5rem",
                textAlign: "center",
                color: "#333",
              }}
            >
              Create New Announcement
            </h2>
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
                <RichTextEditor value={formData.content} onChange={handleContentChange} />
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
                  onChange={(e) => handleChange({ target: { name: "global", value: e.target.checked } })}
                />
                <label className="form-check-label" htmlFor="globalAnnouncement">
                  This is a global announcement
                </label>
              </div>

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
                Submit
              </button>
            </form>
          </div>
        </Jumbotron>
      </div>

      <Footer brandName="Lifeline International Health Institute" />
    </div>
  );
};

export default AnnounceCreator;
