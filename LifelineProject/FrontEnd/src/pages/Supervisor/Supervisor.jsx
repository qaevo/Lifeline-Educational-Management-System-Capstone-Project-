import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import NavBar from "../../components/NavBar";
//import { jwtDecode } from "jwt-decode";
import useAxios from "../../utils/useAxios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EnhancedTable from "../../components/Table"; // Import EnhancedTable
import { Modal, Spinner, Button } from "react-bootstrap"; // Import Spinner and Button components
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Supervisor = () => {
  const axios = useAxios();
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]); // List of all branches
  const [filteredBranch, setFilteredBranch] = useState("All"); // Track selected branch filter
  const [loading, setLoading] = useState(true); // Loading state

  const fetchStudents = async () => {
    try {
      // const branch = jwtDecode(localStorage.getItem("authTokens")).branch;
      const response = await axios.get(`/studentenrollmentlist/999`);

      if (response.status === 200) {
        setStudents(response.data);
        const branchNames = [
          ...new Set(response.data.map((student) => student.branch_name)),
        ];
        setBranches(branchNames); // Extract unique branch names
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
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStudents();
  }, []);

  // Filter students by branch
  const filteredStudents =
    filteredBranch === "All"
      ? students
      : students.filter((student) => student.branch_name === filteredBranch);

  // Define headers for EnhancedTable
  const studentHeaders = [
    { id: "name", numeric: false, disablePadding: true, label: "Name" },
    { id: "email", numeric: false, disablePadding: true, label: "Email" },
    {
      id: "ProgramName",
      numeric: false,
      disablePadding: true,
      label: "Program Name",
    },
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
  const studentRows = filteredStudents.map((student) => ({
    id: student.user_id,
    name: student.name,
    email: student.email,
    ProgramName: student.program_name,
    currentModule: student.current_modules.join(", "),
    completionStatus: `${
      student.program_modules.filter(
        (item) => item.hasOwnProperty("grade") && item.grade !== "In Progress"
      ).length
    }/${student.program_modules.length}`,
  }));

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header brandName="Lifeline International Health Institute" />
      <NavBar
        items={[
          {
            type: "dropdown",
            text: "Admin",
            items: [
              { text: "Insights", url: "/insights" },
              { text: "Reports", url: "/SReports" },
            ],
          },
          { type: "link", url: "/Supervisor", text: "Dashboard" },
          { type: "link", url: "/logout", text: "Logout" },
        ]}
      />
      <main
        style={{
          marginTop: "5rem",
          flex: 1,
          padding: "2rem",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div className="container-fluid">
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "80vh" }}
            >
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <>
              <div className="mb-3">
                <Button
                  variant={
                    filteredBranch === "All" ? "primary" : "outline-primary"
                  }
                  onClick={() => setFilteredBranch("All")}
                  className="me-2"
                >
                  All Branches
                </Button>
                {branches.map((branch) => (
                  <Button
                    key={branch}
                    variant={
                      filteredBranch === branch ? "primary" : "outline-primary"
                    }
                    onClick={() => setFilteredBranch(branch)}
                    className="me-2"
                  >
                    {branch}
                  </Button>
                ))}
              </div>
              <EnhancedTable
                title="Students"
                headers={studentHeaders}
                rows={studentRows}
                showSubmitButton={false}
              />
            </>
          )}
        </div>
      </main>
      <Footer brandName="Lifeline International Health Institute" />
    </div>
  );
};

export default Supervisor;
