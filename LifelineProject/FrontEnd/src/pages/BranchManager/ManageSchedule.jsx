import React, { useEffect, useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.css";
import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EnhancedTable from "../../components/Table"; // Import EnhancedTable
import { Modal, Button, Spinner, Form } from "react-bootstrap"; // Import necessary components
import "./Create.css"; // Import custom styles for animation
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAxios from "../../utils/useAxios";
import { FaQuestionCircle } from "react-icons/fa";

const ManageSchedule = () => {
  const axios = useAxios();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    days: [],
    start_time: "",
    end_time: "",
  });

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

  // Define columns for the EnhancedTable
  const headers = useMemo(
    () => [
      { id: "scheduleId", label: "Schedule ID" },
      { id: "days", label: "Days" },
      { id: "start_time", label: "Start Time" },
      { id: "end_time", label: "End Time" },
    ],
    []
  );

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(`/getschedules/`);
        if (response.status === 200) {
          const fetchedSchedules = response.data.map((schedule) => ({
            scheduleId: schedule.id,
            days: schedule.days.join(", "),
            start_time: schedule.start_time,
            end_time: schedule.end_time,
          }));
          setSchedules(fetchedSchedules);
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
        console.error("Error fetching schedules:", error);
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

    fetchSchedules();
    setLoading(false);
  }, []);

  const addSchedule = async () => {
    console.log("the new schedule data being sent is", newSchedule);
    try {
      const response = await axios.post(`/createschedule/`, newSchedule);
      if (response.status === 201) {
        toast.success("Schedule added successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        window.location.reload();
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
      console.error("Error adding schedule:", error);
      toast.error(`Error: ${error.message}`, {
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

  const handleDayChange = (day) => {
    setNewSchedule((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule({ ...newSchedule, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addSchedule();
    setNewSchedule({ days: [], start_time: "", end_time: "" });
    setShowForm(false);
  };

  const showHelp = () => {
    toast.info(
      <div style={{ fontSize: "16px", padding: "10px" }}>
        <p><strong>What is a Schedule?</strong> A schedule defines the days and times when a class is offered. For example:</p>
        <ul style={{ paddingLeft: "20px", marginBottom: "5px" }}>
          <li><strong>Programming 101:</strong> Monday and Wednesday, 9:00 AM - 11:00 AM</li>
          <li><strong>Elderly Care:</strong> Tuesday and Friday, 1:00 PM - 3:00 PM</li>
        </ul>
        <p><strong>How to Add a Schedule?</strong> Click "Add Schedule," select the days, set the start and end times, then submit.</p>
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
      <ToastContainer />
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
    {showForm ? "Cancel" : "Add Schedule"}
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
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day) => (
                  <Form.Check
                    key={day}
                    label={day}
                    name={day}
                    checked={newSchedule.days.includes(day)}
                    onChange={() => handleDayChange(day)}
                  />
                ))}
                <Form.Group controlId="start_time">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="start_time" // Updated to match the Django model field
                    value={newSchedule.start_time} // Updated to match React state
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="end_time">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="end_time"
                    value={newSchedule.end_time}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <button
                  style={{
                    marginTop: "10px",
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
                  type="submit"
                >
                  Add Schedule
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
                  title="Schedules"
                  headers={headers}
                  rows={schedules}
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
    </div>
  );
};

export default ManageSchedule;
