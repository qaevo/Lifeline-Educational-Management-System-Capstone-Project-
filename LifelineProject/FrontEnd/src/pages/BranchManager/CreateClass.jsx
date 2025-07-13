import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EnhancedTable from "../../components/Table"; // Import EnhancedTable
import { Spinner, Form, Button, Row, Col, Modal } from "react-bootstrap";
import "./Create.css"; // Custom styles for the form and layout
import useAxios from "../../utils/useAxios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaQuestionCircle } from "react-icons/fa";

const CreateClass = () => {
  const axios = useAxios();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]); // State to hold all available modules
  const [classes, setClasses] = useState([]); // State to hold all existing classes
  const [showForm, setShowForm] = useState(false); // State to toggle the form visibility
  const [selectedModule, setSelectedModule] = useState(""); // Selected module for the class
  const [selectedSchedule, setSelectedSchedule] = useState(""); // Selected module for the class
  const [teachers, setTeachers] = useState([]); // State to hold available teachers
  const [newClass, setNewClass] = useState({
    section: "",
    startEnroll: "",
    startCourse: "",
    endCourse: "",
    capacity: "",
    courseLink: "N/A",
    teacherId: "", // Teacher ID to be selected from dropdown
    minCapacity: "",
    schedule: {},
  });

  const [error, setError] = useState(null);
  const branchID = jwtDecode(localStorage.getItem("authTokens")).branch;
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDissolveModal, setShowDissolveModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [schedules, setSchedules] = useState([]);

  const [filterPastClasses, setFilterPastClasses] = useState(false);

  const openAssignModal = (classItem) => {
    setSelectedClass(classItem);
    setSelectedTeacher(classItem.teacher_id || "");
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
  };

  // Handle teacher selection
  const handleTeacherSelect = (e) => {
    setSelectedTeacher(e.target.value); // Store the selected value as a string
  };

  const openDissolveModal = (classItem) => {
    setSelectedClass(classItem);
    setShowDissolveModal(true);
  };

  const closeDissolveModal = () => {
    setSelectedClass(null);
    setShowDissolveModal(false);
  };

  const handleDropClass = async () => {
    if (!selectedClass) return;

    const classId = selectedClass.id;
    const response = await axios.patch(`dissolvecourse/${classId}/`);

    if (response.status === 200) {
      toast.success("Class dissolved successfully", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      fetchCourses(); // Re-fetch the courses to update the teacher info
      setShowDissolveModal(false);
    } else {
      toast.error("Failed to dissolve class.", {
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

  // Handle teacher assignment
  const handleAssignTeacher = async () => {
    if (!selectedTeacher) return;

    // Split selectedTeacher into id and email
    const [id, email] = selectedTeacher.split(",");

    /* Log for debugging
    console.log("Selected teacher id is", id);
    console.log("Selected class id is", selectedClass.id);
    console.log("Email is", email);
    console.log("Google Course ID is", selectedClass.googleCourseID);*/

    try {
      const response = await axios.post("assign_teacher_to_class/", {
        classId: selectedClass.id,
        teacherId: id, // Use parsed id
      });

      if (response.status === 200) {
        toast.success("Teacher assigned successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        handleInvite(selectedClass.googleCourseID, email); // Use parsed email
        setShowAssignModal(false);
        fetchCourses(); // Re-fetch the courses to update the teacher info
      } else {
        toast.error("Failed to assign Teacher.", {
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
      //console.error("Error assigning teacher:", error);
      toast.error("Something went wrong while assigning the teacher.", {
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

  const handleInvite = async (courseId, teacherEmail) => {
    try {
      const response = await axios.post("send-classroom-invite/", {
        courseId,
        teacherEmail,
      });
      //console.log("Invite sent:", response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        window.location.href = `https://localhost:8000/api/oauth2-login2?courseId=${courseId}&teacherEmail=${teacherEmail}`;
      } else {
        //console.error("Error sending invite:", error);
      }
    }
  };

  const fetchCourses = async () => {
    try {
      const branch = jwtDecode(localStorage.getItem("authTokens")).branch;
      const response = await axios.get(`getcourses/${branch}/`);

      if (response.status === 200) {
        setClasses(response.data);
        //console.log("respponse data is", response.data);
        //console.log("classes are", classes);
      } else {
        //console.log(response);
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
      //console.error("Error fetching data:", error);
      toast.error("Something went wrong while fetching courses.", {
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

  // Define columns for the classes table
  const classHeaders = [
    { id: "module_name", label: "Module Name" },
    { id: "name", label: "Section" },
    { id: "schedule", label: "Schedule" },
    { id: "start_enroll", label: "Start Enroll" },
    { id: "start_course", label: "Start Course" },
    { id: "end_course", label: "End Course" },
    { id: "capacity", label: "Capacity" },
    { id: "min_capacity", label: "Minimum Capacity" },
    { id: "curr_enrolled", label: "Currently Enrolled" }, 
    { id: "courseLink", label: "Course Link" },
    { id: "teacher_name", label: "Instructor" },
    { id: "drop", label: "Dissolve" },
  ];

  const filterClasses = (classes) => {
    if (!filterPastClasses) return classes;

    const currentDate = new Date();
    return classes.filter(
      (classItem) => new Date(classItem.end_course) >= currentDate
    );
  };

  const classRows = filterClasses(classes).map((classItem) => ({
    id: classItem.id,
    module_name: classItem.module_name,
    name: classItem.name,
    schedule: classItem.schedule.name,
    start_enroll: new Date(classItem.start_enroll).toLocaleDateString(),
    start_course: new Date(classItem.start_course).toLocaleDateString(),
    end_course: new Date(classItem.end_course).toLocaleDateString(),
    capacity: Number(classItem.capacity), // Convert to number
    min_capacity: Number(classItem.min_capacity), // Convert to number
    curr_enrolled: Number(classItem.curr_enrolled), // Convert to number
    courseLink: classItem.courseLink,
    teacher_name: (
      <div className="d-flex align-items-center">
        <Button
          variant={classItem.teacher_name ? "warning" : "success"}
          onClick={() => openAssignModal(classItem)}
          className="ms-2"
        >
          {classItem.teacher_name ? "Reassign" : "Assign"}
        </Button>
        <span style={{ marginLeft: "10px" }}>
          {classItem.teacher_name || "No teacher assigned"}
        </span>
      </div>
    ),
    drop: (
      <Button
        variant="danger"
        onClick={() => openDissolveModal(classItem)}
        className="ms-2"
      >
        Dissolve
      </Button>
    ),
  }));
  
  //console.log("Class Rows:", classRows); // Debugging

  const getTeachers = async () => {
    try {
      const response = await axios.get(`getteachers/${branchID}/`);
      if (response.status === 200) {
        //console.log("fetched teachers hehe:", response.data);

        const fetchedTeachers = response.data.map((teacher) => ({
          id: teacher.user_id,
          branch: teacher.branch,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
        }));

        //console.log("fetched teachers after conversion:", fetchedTeachers);

        setTeachers(fetchedTeachers); // Set the teachers state with the fetched data
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
      //console.error("Error fetching teachers:", error);
      toast.error("Something went wrong while fetching grade Teachers.", {
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

  const getModules = async () => {
    try {
      const response = await axios.get(`getmoduleswithgradesystem/`);
      if (response.status === 200) {
        const fetchedModules = response.data.map((module) => ({
          id: module.id,
          moduleName: module.name,
          module_gradetype_id: module.module_gradetype.description,
        }));
        //console.log("fetched modules hehe:", fetchedModules);
        setModules(fetchedModules); // Set the modules state
      } else {
        toast.error(`Failed to fetch modules: ${response.status}`, {
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
      //console.error("Error fetching modules:", error);
      toast.error("Something went wrong while fetching modules.", {
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

  const getSchedule = async () => {
    try {
      const response = await axios.get(`getschedule/`);
      if (response.status === 200) {
        const fetchedSchedules = response.data.map((schedule) => ({
          id: schedule.id,
          scheduleDays: schedule.days,
          schedStart: schedule.start_time,
          schedEnd: schedule.end_time,
          name: schedule.name,
        }));
        //console.log("fetched schedules hehe:", fetchedSchedules);
        setSchedules(fetchedSchedules); // Set the modules state
      } else {
        toast.error(`Failed to fetch schedules: ${response.status}`, {
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
      //console.error("Error fetching schedules:", error);
      toast.error("Something went wrong while fetching grade schedules.", {
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

  // Fetch hardcoded modules (replace with API call if needed)
  useEffect(() => {
    getModules();

    // Hardcoded teachers (replace with API call if needed)
    getTeachers();

    getSchedule();

    fetchCourses();

    setLoading(false); // Set loading to false after data is set
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass({ ...newClass, [name]: value });
  };

  // Handle dropdown change for modules
  const handleModuleChange = (e) => {
    setSelectedModule(e.target.value);
  };

  const handleScheduleChange = (e) => {
    setSelectedSchedule(e.target.value);
  };

  // Handle form submit (creating a new class)
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Create a new class entry with the selected module and other details
    const newClassEntry = {
      module: parseInt(selectedModule, 10), // Convert to integer
      branch: branchID, // Assuming branch is already an integer
      name: newClass.section,
      start_enroll: newClass.startEnroll,
      start_course: newClass.startCourse,
      end_course: newClass.endCourse,
      capacity: parseInt(newClass.capacity, 10), // Convert to integer
      min_capacity: parseInt(newClass.minCapacity, 10),
      courseLink: newClass.courseLink,
      teacher: parseInt(newClass.teacherId, 10),
      schedule: parseInt(selectedSchedule, 10),
    };
    //console.log("payload is:", newClassEntry);
    try {
      const response = await axios.post("createcourse/", newClassEntry);
      if (response.status === 201) {
        //console.log("responsde tata is :", response.data.id);
        handleLogin(response.data.id);
        setNewClass({
          section: "",
          startEnroll: "",
          startCourse: "",
          endCourse: "",
          capacity: "",
          minCapacity: "",
          courseLink: "",
          teacherId: "",
        });
        setSelectedModule(""); // Clear selected module
        setShowForm(false); // Close the form
        window.location.reload();
      } else {
        toast.error(`Failed to create class: ${response.status}`, {
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
      //console.error("Error creating class:", error);

      toast.error(error.response?.data?.message || "An error occurred.", {
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

  const handleLogin = async (courseID) => {
    try {
      const selectedModuleId = selectedModule;
      const selectedModuleObject = modules.find(
        (module) => module.id === Number(selectedModuleId)
      );
      // Check if the module was found
      const moduleName = selectedModuleObject
        ? selectedModuleObject.moduleName
        : "Default Module Name";
      //console.log("moduleName ", moduleName);
      const courseData = {
        name: moduleName, // Update with actual dynamic values
        section: newClass.section,
        descriptionHeading: "Welcome to New Course",
        description: "Course description goes here.",
        courseState: "PROVISIONED",
        courseID: courseID,
      };
      //console.log("COURSEDATA INN FRONTEND ", courseData);
      const queryParams = new URLSearchParams(courseData).toString();

      const url = `https://localhost:8000/api/login/?${queryParams}`;
      window.open(url, "_blank");
    } catch (error) {
      //console.error("Error during login:", error);
      setError("Error during login");
    }
  };

  const showHelp = () => {
    toast.info(
      <div style={{ fontSize: "16px", padding: "10px" }}>
        <p>
          <strong>What is a Class?</strong> A class is an offering of a{" "}
          <strong>Module</strong> on a specific schedule. For example:
        </p>
        <ul style={{ paddingLeft: "20px", marginBottom: "5px" }}>
          <li>
            <strong>Programming 101:</strong> Offered on Monday and Friday
          </li>
          <li>
            <strong>Elderly Care:</strong> Offered on Tuesdays and Fridays
          </li>
        </ul>
        <p>
          <strong>How to Create a Class?</strong> Click "Create Class," select a
          module, enter the section, capacity, schedule, and dates, then submit.
        </p>
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
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />
      <main
        style={{
          marginTop: "5rem",
          flex: 1,
          padding: "2rem",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div className="container-fluid">
          {/* Create Class Button and Help Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "1rem",
            }}
          >
            <Button
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
              {showForm ? "Cancel" : "Create Class"}
            </Button>
            <FaQuestionCircle
              style={{
                cursor: "pointer",
                color: "#0066cc",
                fontSize: "1.5rem",
                transition: "color 0.3s ease",
              }}
              onClick={showHelp}
              onMouseEnter={(e) => (e.target.style.color = "#004499")}
              onMouseLeave={(e) => (e.target.style.color = "#0066cc")}
            />
          </div>

          <div style={{ display: "flex", position: "relative" }}>
            {/* Off-canvas form for creating classes */}
            <div
              className={`top2-offcanvas-form ${showForm ? "show" : "hidden"}`}
              style={{ borderRadius: "10px" }}
            >
              <Form onSubmit={handleSubmit}>
                {/* Row with first two inputs */}
                <Row>
                  <Col md={3}>
                    <Form.Group controlId="formModule">
                      <Form.Label>Select Module</Form.Label>
                      <Form.Control
                        as="select"
                        value={selectedModule}
                        onChange={handleModuleChange}
                        required
                      >
                        <option value="">Select a module</option>
                        {modules.map((module) => (
                          <option key={module.id} value={module.id}>
                            {module.moduleName}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="formSection">
                      <Form.Label>Section</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter section"
                        name="section"
                        value={newClass.section}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="formCapacity">
                      <Form.Label>Capacity</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter capacity"
                        name="capacity"
                        value={newClass.capacity}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="formMinCapacity">
                      <Form.Label>Minimum Capacity</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter minimum capacity"
                        name="minCapacity"
                        value={newClass.minCapacity}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                </Row>

                {/* Row with next three inputs */}
                <Row style={{ marginTop: "10px" }}>
                <Col md={3}>
                    <Form.Group controlId="formSchedule">
                      <Form.Label>Select Schedule</Form.Label>
                      <Form.Control
                        as="select"
                        value={selectedSchedule}
                        onChange={handleScheduleChange}
                        required
                      >
                        <option value="">Select a Schedule</option>
                        {schedules.map((schedule) => (
                          <option key={schedule.id} value={schedule.id}>
                            {schedule.name}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="formStartEnroll">
                      <Form.Label>Start Enroll</Form.Label>
                      <Form.Control
                        type="date"
                        name="startEnroll"
                        value={newClass.startEnroll}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="formStartCourse">
                      <Form.Label>Start Course</Form.Label>
                      <Form.Control
                        type="date"
                        name="startCourse"
                        value={newClass.startCourse}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="formEndCourse">
                      <Form.Label>End Course</Form.Label>
                      <Form.Control
                        type="date"
                        name="endCourse"
                        value={newClass.endCourse}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Row with last three inputs */}
                <Row style={{ marginTop: "10px" }}>
                  <Col md={4}>
                    <Form.Group
                      controlId="formCourseLink"
                      style={{ display: "none" }}
                    >
                      <Form.Label>Course Link</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter course link"
                        name="courseLink"
                        value={newClass.courseLink}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  style={{
                    marginTop: "15px",
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
                >
                  Create Class
                </Button>
              </Form>
            </div>
          </div>

          {/* EnhancedTable to display classes */}

          <div className={`top2-table-container ${showForm ? "shifted" : ""}`}>
            <Button
              onClick={() => setFilterPastClasses(!filterPastClasses)}
              className="mb-3"
              style={{
                padding: "0.6rem 1.2rem",
                fontSize: "0.9rem",
                backgroundColor: filterPastClasses ? "#00796b" : "#009688",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.3s ease, transform 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = filterPastClasses
                  ? "#005f56"
                  : "#00796b";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = filterPastClasses
                  ? "#00796b"
                  : "#009688";
                e.target.style.transform = "scale(1)";
              }}
            >
              {filterPastClasses ? "Show All Classes" : "Hide Past Classes"}
            </Button>

            {loading ? (
              <Spinner animation="border" variant="primary" />
            ) : (
              <EnhancedTable
                title="Existing Classes"
                headers={classHeaders}
                rows={classRows}
                showSubmitButton={false}
                showSelectColumn={false}
                maxRows={15}
              />
            )}
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

      <Modal show={showAssignModal} onHide={closeAssignModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedClass?.teacher_name
              ? "Reassign Teacher"
              : "Assign Teacher"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="teacherSelect">
            <Form.Label>Select Teacher</Form.Label>
            <Form.Control
              as="select"
              value={selectedTeacher}
              onChange={handleTeacherSelect}
              required
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option
                  key={`${teacher.id},${teacher.email}`}
                  value={`${teacher.id},${teacher.email}`}
                >
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeAssignModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAssignTeacher}>
            {selectedClass?.teacher_name ? "Reassign" : "Assign"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDissolveModal} onHide={closeDissolveModal}>
        <Modal.Header closeButton>
          <Modal.Title>Dissolve Class?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to dissolve this class?</p>
          {selectedClass?.module_name} - {selectedClass?.name}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDissolveModal}>
            Close
          </Button>
          <Button variant="danger" onClick={handleDropClass}>
            Dissolve
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateClass;