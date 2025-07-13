import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EnhancedTable from "../../components/Table";
import { Card, Button, Modal } from "react-bootstrap";
import "./StudentEnroll.css"; // Import custom CSS
import useAxios from "../../utils/useAxios";
import { jwtDecode } from "jwt-decode";
import { generate } from "@pdfme/generator";
import template from "../../components/assets/template.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentEnroll = () => {
  const axios = useAxios();
  const [enrolledModules, setEnrolledModules] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [courseAudit, setCourseAudit] = useState([]);
  const [moduleItems, setModuleItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isProgramFinished, setProgramFinished] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);



  const handleShowModal = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
    setShowModal(false);
  };

  const confirmDropCourse = () => {
    if (selectedCourse) {
      handleDropCourse(selectedCourse); // Function to handle the course drop logic
    }
    handleCloseModal();
  };

  const fetchAvailableCourses = async () => {
    const program = jwtDecode(localStorage.getItem("authTokens")).program;

    try {
      const response = await axios.get(`/getcoursesinprogram/`, {
        params: {
          program: program,
          state: "open",
        },
      });

      if (response.status === 200) {
        const moduleIDs = courseAudit.filter((course) => course.grade != "N/A" || course.status != "Not yet taken").map((course) => course.module);
        setAvailableCourses(response.data.filter((course) => !moduleIDs.includes(course.module) && course.curr_enrolled < course.capacity));
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
    }
  };

  const fetchCourseAudit = async () => {
    const student = jwtDecode(localStorage.getItem("authTokens")).user_id;

    try {
      const response = await axios.get(`/getcourseaudit/`, {
        params: {
          student: student,
        },
      });

      if (response.status === 200) {
        setCourseAudit(response.data);

        const allPassed = response.data.every(
          (course) => course.status === "Passed"
        );

        setProgramFinished(allPassed);
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
    }
  };

  const fetchEnrolledModules = async () => {
    const student = jwtDecode(localStorage.getItem("authTokens")).user_id;

    try {
      const response = await axios.get(`/getenrollments/`, {
        params: {
          student: student,
        },
      });

      if (response.status === 200) {
        setEnrolledModules(response.data);
        setModuleItems(
          response.data.map((mod) => ({
            type: "link",
            text: `${mod.module_name} ${mod.course.name}`,
            url: mod.course.courseLink,
          }))
        );
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
    }
  };

  const handleCourseSelect = (courseID) => {
    setSelected((prevSelected) => {
      if (prevSelected.includes(courseID)) {
        return prevSelected.filter((id) => id !== courseID);
      } else {
        return [...prevSelected, courseID];
      }
    });
  };

  const handleDropCourse = async (course) => {
    try {
      const response = await axios.put(`/dropenrollment/`, {
        student: jwtDecode(localStorage.getItem("authTokens")).user_id,
        course: course.course.id,
      });

      if (response.status === 200) {
        toast.success("Course dropped!", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
        window.location.reload();
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
    }
  };

  useEffect(() => {
    fetchCourseAudit();
    fetchEnrolledModules();
  }, []);

  useEffect(() => {
    fetchAvailableCourses();
  }, [courseAudit]);

  // Hard coded data for now
  // const enrolledModules = [
  //   { name: "Module 4", section: "S12" },
  //   { name: "Module 5", section: "X11" },
  // ];

  const navItems = [
    { type: "link", url: "/StudentEnroll", text: "Enroll" },
    { type: "dropdown", text: "Modules", items: moduleItems }, // To be changed when backend is fully functional
    { type: "link", url: "/Student", text: "Dashboard" },
    { type: "link", url: "/logout", text: "Logout" },
  ];

  const createCert = async () => {
    const firstname = jwtDecode(localStorage.getItem("authTokens")).firstName;
    const lastname = jwtDecode(localStorage.getItem("authTokens")).lastName;
    const fullname = `${firstname} ${lastname}`;
    const programName = jwtDecode(
      localStorage.getItem("authTokens")
    ).programName;

    const latestDateTime = new Date(
      Math.max(...courseAudit.map(audit => new Date(audit.finishDatetime)))
    );

    const formattedDate = latestDateTime.toISOString().split('T')[0]; // YYYY-MM-DD format

    try {
      const inputs = [
        {
          field1: fullname, // Dynamic value for field1
          field2: programName, // Dynamic value for field2
          Date: formattedDate,
        },
      ];

      const pdf = await generate({ template, inputs });
      // Create PDF using the loaded template and dynamic content
      //   const pdf = await createPdf(template, content);

      // Convert the generated PDF to a Blob for downloading
      const blob = new Blob([pdf.buffer], { type: "application/pdf" });

      // Create a download link for the PDF
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Certificate.pdf";
      link.click();

    } catch (error) {
      console.error("Error generating certificate:", error);
    }
  };

  // State for tracking selected modules
  const [selectedModules, setSelectedModules] = useState([]);

  // Handle enrollment logic (you can replace this with an API call or further logic)
  const handleEnroll = async () => {
    const selectedCourseIDs = selected;
    if (!selectedCourseIDs.length) {
      toast.error("Please select a student and at least one module to enroll", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
      return;
    }
    const id = jwtDecode(localStorage.getItem("authTokens")).user_id;

    for (const courseID of selectedCourseIDs) {
      const CourseEntry = {
        student: id, // Assuming selectedStudent has an id property
        course: courseID, // Assuming selectedModules is an array of module IDs
      };

      try {
        const response = await axios.post("createenrollment/", CourseEntry);
        if (response.status === 201) {
          toast.success("Successfully enrolled in the selected modules!", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
          window.location.reload();
          // Optionally, you can refresh the data or update the state here
        } else {
          toast.error(`Enrollment failed: ${response.data.message}`, {
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
        toast.error(`Something went wrong. ${error.response.data.message}}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
      }
    }
  };

  return (
    <div className="student-enroll-wrapper">
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={navItems} />

      {/* Main Content Area */}
      <div className="main-content">
        <div className="left-column">
          {/* Current Enrolled Courses Table */}
          <Card className="course-card">
            <Card.Body>
              <Card.Title>Current Enrolled Courses</Card.Title>
              {enrolledModules.length > 0 ? (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Section</th>
                      <th>Course Code</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledModules.map((course, index) => (
                      <tr key={index}>
                        <td>
                          <a
                            href={course.course.courseLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {course.module_name}
                          </a>
                        </td>
                        <td>{course.course.name}</td>
                        <td>{course.course.googleCourseCode}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleShowModal(course)}
                          >
                            Drop
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No courses enrolled yet.</p>
              )}
              <div className="mt-3">
                <a
                  href="/guide.pdf" // Replace with the actual path to your PDF
                  download

                >
                  Download Guide
                </a>
              </div>
            </Card.Body>

            {/* Modal for dropping course */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
              <Modal.Header closeButton>
                <Modal.Title>Confirm Drop Course</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {selectedCourse ? (
                  <p>
                    Are you sure you want to drop the course:{" "}
                    <strong>{selectedCourse.module_name}</strong>?
                  </p>
                ) : (
                  <p>Invalid course selected.</p>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={confirmDropCourse}>
                  Confirm Drop
                </Button>
              </Modal.Footer>
            </Modal>
          </Card>

          {/* Course Audit Table */}
          <Card className="course-card" style={{ marginTop: "20px" }}>
            <Card.Body>
              <Card.Title>Course Audit</Card.Title>
              {courseAudit.length > 0 ? (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Grade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseAudit.map((course, index) => (
                      <tr key={index}>
                        <td>{course.name}</td>
                        <td>{course.grade ? course.grade : "N/A"}</td>
                        <td>{course.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No courses taken yet.</p>
              )}
              {isProgramFinished && (
                <div>
                  <p>Congratulations! You have completed your program.</p>
                  <Button variant="primary" onClick={createCert}>
                    {" "}
                    Download Certificate here
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        <div className="right-column">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Available Courses for Enrollment</Card.Title>
              <EnhancedTable
                headers={[
                  { id: "name", label: "Course Name", numeric: false },
                  { id: "section", label: "Section", numeric: false },
                  { id: "schedule", label: "Schedule", numeric: false },
                  { id: "startDate", label: "Start Date", numeric: false },
                  { id: "teacher", label: "Instructor", numeric: false },
                ]}
                rows={availableCourses.map((course) => ({
                  id: course.id,
                  name: course.module_name,
                  section: course.name,
                  schedule: course.schedule.name,
                  startDate: course.start_course,
                  teacher: course.teacher_name,
                }))}
                showSubmitButton={true}
                submitButtonText="Enroll Selected"
                onRowSelect={handleCourseSelect}
                onSubmit={handleEnroll} // Pass the handleEnroll function to EnhancedTable
              />
            </Card.Body>
          </Card>
        </div>
      </div>
      <Footer brandName="Lifeline International Health Institute" />
    </div>
  );
};

export default StudentEnroll;
