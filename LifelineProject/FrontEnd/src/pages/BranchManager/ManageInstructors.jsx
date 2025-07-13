import React, { useContext, useEffect, useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.css";
import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EnhancedTable from "../../components/Table";
import { Modal, Button, Spinner, Form } from "react-bootstrap";
import "./Create.css";
import useAxios from "../../utils/useAxios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthContext from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { FaQuestionCircle } from "react-icons/fa";

const ManageInstructors = () => {
  const axios = useAxios();
  const [loading, setLoading] = useState(true);
  const [instructors, setInstructors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newInstructor, setNewInstructor] = useState({
    firstName: "",
    lastName: "",
    dateHired: "",
    password: "",
    email: "",
    contactNumber: "",
  });

  const branchID = jwtDecode(localStorage.getItem("authTokens")).branch;
  const { registerUser } = useContext(AuthContext);

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

  const headers = useMemo(
    () => [
      { id: "fullName", label: "Name" },
      { id: "contactNumber", label: "Contact Number" },
      { id: "email", label: "Email" },
    ],
    []
  );

  useEffect(() => {
    getTeachers();
    setLoading(false);
  }, []);

  const addInstructor = async () => {
    const userprofile = {
      firstName: newInstructor.firstName,
      middleName: newInstructor.middleName,
      lastName: newInstructor.lastName,
      status: "EMPLOYED",
      role: "FACULTY",
      branch: branchID,
      details: {
        birthdate: null,
        phoneNumber: newInstructor.contactNumber,
        sex: null,
        nationality: null,
        learningMode: null,
        schedule: null,
      },
    };
  
    await registerUser(
      newInstructor.email,
      newInstructor.password,
      userprofile,
      "manageinstructors",
      (successMessage) => {
        console.log("Success callback triggered:", successMessage); // Debugging
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      },
      (errorMessage) => {
        console.log("Error callback triggered:", errorMessage); // Debugging
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    );
  };

  const getTeachers = async () => {
    try {
      const response = await axios.get(`getteachersemail/${branchID}/`);
      console.log("Fetched teachers email list:", response.data);
      if (response.status === 200) {
        const fetchedTeachers = response.data.map((teacher) => ({
          id: teacher.user_id,
          branch: teacher.branch,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          contactNumber: teacher.details.phoneNumber,
          email: teacher.email,
        }));

        const formattedInstructors = fetchedTeachers.map((inst) => ({
          ...inst,
          fullName: `${inst.firstName} ${inst.lastName}`,
        }));

        setInstructors(formattedInstructors);
      } else {
        toast.error(`Failed to fetch teachers: ${response.status}`, {
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
      console.error("Error fetching teachers:", error);
      toast.error("Something went wrong while fetching teachers.", {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInstructor({ ...newInstructor, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addInstructor();
    setNewInstructor({
      firstName: "",
      lastName: "",
      dateHired: "",
      email: "",
      contactNumber: "",
    });
    setShowForm(false);
    window.location.reload();
  };

  const showHelp = () => {
    toast.info(
      <div style={{ fontSize: "16px", padding: "10px" }}>
        <p><strong>What is an Instructor?</strong> An instructor is a faculty member responsible for teaching classes. For example:</p>
        <ul style={{ paddingLeft: "20px", marginBottom: "5px" }}>
          <li><strong>Programming Instructor:</strong> Teaches Programming 101 and Advanced Programming</li>
          <li><strong>Caregiving Instructor:</strong> Teaches Elderly Care and Child Care</li>
        </ul>
        <p><strong>How to Add an Instructor?</strong> Click "Add Instructor," enter their first name, last name, email, password, and contact number, then submit.</p>
      </div>,
      {
        position: "top-center", // Center the toast
        autoClose: 10000, // 10 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "custom-toast", // Add a custom class for styling
        style: { width: "700px" }, // Make the toast wider
      }
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />
      <main style={{ marginTop: "5rem", flex: 1, padding: "2rem", backgroundColor: "#f8f9fa" }}>
        <div className="container-fluid">
          {/* Add Instructor Button and Help Icon */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
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
              {showForm ? "Cancel" : "Add Instructor"}
            </button>
            <FaQuestionCircle 
              style={{ 
                cursor: "pointer", 
                color: "#0066cc", 
                fontSize: "1.5rem",
                transition: "color 0.3s ease"
              }} 
              onClick={showHelp}
              onMouseEnter={(e) => e.target.style.color = "#004499"}
              onMouseLeave={(e) => e.target.style.color = "#0066cc"}
            />
          </div>

          <div style={{ display: "flex", position: "relative" }}>
            <div
              className={`offcanvas-form-two ${showForm ? "show" : "hidden"}`}
              style={{ borderRadius: "10px" }}
            >
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formFirstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter first name"
                    name="firstName"
                    value={newInstructor.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formlastName">
                  <Form.Label style={{ marginTop: "10px" }}>
                    Last Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter last name"
                    name="lastName"
                    value={newInstructor.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formPassword">
                  <Form.Label style={{ marginTop: "10px" }}>
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    name="password"
                    value={newInstructor.password}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formEmail">
                  <Form.Label style={{ marginTop: "10px" }}>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    name="email"
                    value={newInstructor.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formContactNumber">
                  <Form.Label style={{ marginTop: "10px" }}>
                    Contact Number
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter contact number"
                    name="contactNumber"
                    value={newInstructor.contactNumber}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <button
                  type="submit"
                  style={{
                    marginTop: "10px",
                    padding: "0.6rem 1.2rem",
                    fontSize: "0.9rem",
                    backgroundColor: "#009688",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Add Instructor
                </button>
              </Form>
            </div>
            <div className={`table-container ${showForm ? "shifted" : ""}`}>
              {loading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "80vh" }}
                >
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <EnhancedTable
                  title="Instructors"
                  headers={headers}
                  rows={instructors}
                  showSubmitButton={false}
                  showSelectColumn={false}
                  maxRows={20}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer brandName="Lifeline International Health Institute" />
      <ToastContainer
        position="top-center"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ width: "700px", fontSize: "16px" }} // Make the toast wider and increase font size
      />
    </div>
  );
};

export default ManageInstructors;
