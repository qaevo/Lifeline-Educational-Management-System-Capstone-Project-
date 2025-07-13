import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import NavBar from "../../components/NavBar";
import { jwtDecode } from "jwt-decode";
import useAxios from "../../utils/useAxios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EnhancedTable from "../../components/Table"; // Import EnhancedTable
import { Spinner, Modal, Button } from "react-bootstrap"; // Import necessary Bootstrap components

const BranchManager = () => {
  const axios = useAxios();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [modalMessage, setModalMessage] = useState(""); // Modal message

  const fetchStudents = async () => {
    try {
      const branch = jwtDecode(localStorage.getItem("authTokens")).branch;
      const response = await axios.get(`/studentenrollmentlist/${branch}/`);

      if (response.status === 200) {
        setStudents(response.data);
        console.log(response.data);
      } else {
        setModalMessage(`Something went wrong. Status code: ${response.status}`);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setModalMessage("Something went wrong. Please try again later.");
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStudents();
  }, []);

  // NavBar Items
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

  // Define headers for EnhancedTable
  const studentHeaders = [
    { id: "name", numeric: false, disablePadding: true, label: "Name" },
    { id: "email", numeric: false, disablePadding: true, label: "Email" },
    { id: "ProgramName", numeric: false, disablePadding: true, label: "Program Name" },
    {
      id: "currentModule",
      numeric: false,
      disablePadding: false,
      label: "Current Modules",
    },
    {
      id: "completionStatus",
      numeric: false,
      disablePadding: false,
      label: "Completion Status",
    },
  ];

  // Transform students data to fit EnhancedTable format
  const studentRows = students.map((student) => ({
    id: student.user_id,
    name: student.name,
    email: student.email,
    ProgramName: student.program_name,
    currentModule: student.current_modules.join(", "),
    completionStatus: `${student.program_modules.filter(
      (item) => item.hasOwnProperty("grade") && item.grade !== "In Progress"
    ).length}/${student.program_modules.length}`,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />
      <main style={{ marginTop: "5rem", flex: 1, padding: "2rem", backgroundColor: "#f8f9fa" }}>
        <div className="container-fluid">
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "80vh" }}
            >
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <EnhancedTable
              title="Students"
              headers={studentHeaders}
              rows={studentRows}
              showSubmitButton={false}
              showSelectColumn={false}
            />
          )}
        </div>
      </main>
      <Footer brandName="Lifeline International Health Institute" />

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BranchManager;
