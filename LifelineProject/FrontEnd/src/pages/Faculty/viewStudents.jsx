import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css"; // Import Bootstrap CSS here
import { Spinner, Modal, Button, Form } from "react-bootstrap"; // Import Spinner component
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import useAxios from "../../utils/useAxios";
import EnhancedTable from "../../components/Table"; // Import EnhancedTable component
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewStudents = () => {
  const axios = useAxios();
  const { courseID, courseName } = useParams();

  // const [courseName, setCourse] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [selectedStudent, setSelectedStudent] = useState(null); // Selected student for grade input
  const [showDropModal, setShowDropModal] = useState(false);
  const [studentToDrop, setStudentToDrop] = useState(null);
  const [grade, setGrade] = useState(""); // Grade input state
  const [gradeChoices, setGradeChoices] = useState([]);

  const fetchGrades = async (gs) => {
    try {
      const response = await axios.get(`/getgradesofgradesystem/${gs}`);
      if (response.status === 200) {
        setGradeChoices(response.data);
      } else {
        toast.error(`Something went wrong. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  const fetchStudentEnrollment = async () => {
    try {
      const response = await axios.get(`/getstudentsbycourse/${courseID}`);
      if (response.status === 200) {
        console.log(response.data);
        setEnrollments(response.data);
        if (response.data.length > 0) {
          // setCourse(
          //   response.data[0].module_name + " " + response.data[0].course.name
          // );
          fetchGrades(response.data[0].course.module);
        }
      } else {
        toast.error(`Something went wrong. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false); // Set loading to false after all API calls
    }
  };

  useEffect(() => {
    fetchStudentEnrollment();
  }, []);

  // Function to handle dropping the student
  const handleDropStudent = async (student) => {
    try {
      const response = await axios.put(`/dropenrollment/`, {
        student: student,
        course: courseID,
      });

      if (response.status === 200) {
        toast.success("Student dropped successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  // Function to toggle the Drop Student modal
  const confirmDropStudent = (userId) => {
    setStudentToDrop(userId);
    setShowDropModal(true);
  };

  // NavBar Items
  const items = [
    //{ type: "link", url: "/AddClass", text: "Add Class" },
    { type: "link", url: "/Faculty", text: "Faculty" },
    { type: "link", url: "/logout", text: "Logout" },
  ];

  const putStudentFinish = async (userId) => {
    try {
      const response = await axios.put(`/updatefinishenrollment/`, {
        course: courseID,
        student: userId,
        grade: grade,
      });
      if (response.status === 200) {
        toast.success("Student marked as finished");
        window.location.reload();
      } else {
        toast.error("Something went wrong. " + response.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  // Function to handle assigning next module
  const handleNextModule = (userId) => {
    setShowModal(true);
    setSelectedStudent(userId);
  };
  const handleModalSubmit = () => {
    if (!grade) {
      toast.error("Please enter a grade.");
      return;
    }
    putStudentFinish(selectedStudent, grade);
  };
  // UseNavigate hook for navigation
  const navigate = useNavigate();

  const headers = [
    { id: "name", numeric: false, disablePadding: true, label: "Name" },
    { id: "email", numeric: false, disablePadding: false, label: "Email" },
    { id: "grade", numeric: false, disablePadding: false, label: "Grade" },
    { id: "action", numeric: false, disablePadding: false, label: "Action" },
  ];

  const rows = enrollments.map((course) => ({
    id: course.student.user_id,
    name: course.student.name,
    email: course.student.email,
    grade: course.grade || "N/A",
    action: (
      <div className="d-flex">
        <button
          onClick={() => handleNextModule(course.student.user_id)}
          className="btn btn-primary me-2"
        >
          Module Completed
        </button>
        <button
          onClick={() => confirmDropStudent(course.student.user_id)}
          className="btn btn-danger"
        >
          Drop Student
        </button>
      </div>
    ),
  }));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#F5F5F5",
      }}
    >
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />
      <ToastContainer />
      <main style={{ flex: "1", padding: "4rem 3rem", textAlign: "center" }}>
        <div
          className="container"
          style={{ maxWidth: "90%", marginTop: "6.5rem" }}
        >
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div style={{ textAlign: "left", marginBottom: "10px" }}>
                <button
                  style={{
                    padding: "0.6rem 1.2rem",
                    fontSize: "0.9rem",
                    backgroundColor: "#009688",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition:
                      "background-color 0.3s ease, transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#00796b";
                    e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#009688";
                    e.target.style.transform = "scale(1)";
                  }}
                  onClick={() => navigate("/Faculty")}
                >
                  Back
                </button>
              </div>

              <div className="shadow p-3 mb-5 bg-white rounded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h1>Students of {courseName || "Module"}</h1>
                </div>
                {loading ? (
                  <div className="d-flex justify-content-center">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <EnhancedTable
                    headers={headers}
                    rows={rows}
                    showSubmitButton={false}
                    submitButtonText="Submit"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer brandName="Lifeline International Health Institute" />

      {/* Modal for submitting grades */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Submit Final Grade</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formGrade">
              <Form.Label>Grade</Form.Label>
              <Form.Control
                as="select"
                name="grade"
                placeholder="Enter grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option key="">Select Grade</option>
                {gradeChoices.map((gradechoice) => (
                  <option key={gradechoice.value} value={gradechoice.value}>
                    {gradechoice.value} - {gradechoice.description}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleModalSubmit}>
            Submit Grade
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Dropping Student */}
      <Modal show={showDropModal} onHide={() => setShowDropModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Drop</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to drop this student from the course?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDropModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleDropStudent(studentToDrop);
              setShowDropModal(false);
            }}
          >
            Drop Student
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ViewStudents;
