import React, { useEffect, useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.css";
import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EnhancedTable from "../../components/Table";
import { Modal, Button, Spinner, Form } from "react-bootstrap";
import "./Create.css";
import useAxios from "../../utils/useAxios";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaQuestionCircle } from "react-icons/fa"; // Import the question mark icon

const CreateModule = () => {
  const axios = useAxios();
  const [loading, setLoading] = useState(true);
  const [gradeSystems, setGradeSystems] = useState([]);
  const [modules, setModules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newModule, setNewModule] = useState({
    moduleName: "",
    gradeSystem: 1,
    moduleDescription: "",
    price: 0,
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
      { id: "moduleName", label: "Module Name" },
      { id: "moduleDesc", label: "Description" },
      { id: "module_gradetype_id", label: "Grade System" },
      { id: "module_price", label: "Price" },
    ],
    []
  );

  // Fetch modules and grade systems
  useEffect(() => {
    const getModules = async () => {
      try {
        const response = await axios.get(`getmoduleswithgradesystem/`);
        if (response.status === 200) {
          const fetchedModules = response.data.map((module) => ({
            id: module.id,
            moduleName: module.name,
            moduleDesc: module.description,
            module_gradetype_id: module.module_gradetype.description,
            module_price: module.price,
          }));
          setModules(fetchedModules);
        } else {
          toast.error(`Failed to fetch modules: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
        toast.error("Something went wrong while fetching modules.");
      }
    };

    const fetchGradeSystems = async () => {
      try {
        const response = await axios.get(`getgradesystems/`);
        if (response.status === 200) {
          setGradeSystems(response.data);
        } else {
          toast.error(`Failed to fetch grade systems: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching grade systems:", error);
        toast.error("Something went wrong while fetching grade systems.");
      }
    };

    getModules();
    fetchGradeSystems();
    setLoading(false);
  }, []);

  // Add a new module
  const addModule = async () => {
    try {
      const response = await axios.post(`/createmodule/`, {
        name: newModule.moduleName,
        module_gradetype: newModule.gradeSystem,
        description: newModule.moduleDescription,
        price: newModule.price,
      });

      if (response.status === 201) {
        toast.success("Module added successfully!");
        window.location.reload();
      } else {
        toast.error(`Something went wrong. ${response.status}`);
      }
    } catch (error) {
      console.error("Error adding module:", error);
      toast.error("Something went wrong while adding the module.");
    }
  };

  // Handle form input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "modulePrice" && value < 0) return; // Ignore negative values
    setNewModule((prevModule) => ({
      ...prevModule,
      [name]: name === "modulePrice" ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    await addModule();
    setNewModule({
      moduleName: "",
      moduleDescription: "",
      gradeSystem: 0,
      price: 0,
    });
    setShowForm(false);
  };

  // Show help toast
  const showHelp = () => {
    toast.info(
      <div style={{ fontSize: "16px", padding: "10px" }}>
        <p><strong>What is a Module?</strong> A module is a component of a program, representing a specific topic or skill. For example:</p>
        <ul style={{ paddingLeft: "20px", marginBottom: "5px" }}>
          <li><strong>BSIT Program:</strong> Programming, Networking</li>
          <li><strong>Guitar Lessons:</strong> Strumming 101, Reading Notes 101</li>
          <li><strong>Caregiving:</strong> Elderly Care, Child Care</li>
        </ul>
        <p><strong>How to Create a Module?</strong> Click "Create Module," enter the module name, description, select a grade system, set the price, and submit.</p>
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
          {/* Create Module Button and Help Icon */}
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
              {showForm ? "Cancel" : "Create Module"}
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

          {/* Off-canvas form for creating modules */}
          <div style={{ display: "flex", position: "relative" }}>
            <div className={`offcanvas-form ${showForm ? "show" : "hidden"}`} style={{ borderRadius: "10px" }}>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formModuleName">
                  <Form.Label>Module Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter module name"
                    name="moduleName"
                    value={newModule.moduleName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formDescription">
                  <Form.Label style={{ marginTop: "10px" }}>Module Description</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter module description"
                    name="moduleDescription"
                    value={newModule.moduleDescription}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formGradeSystem">
                  <Form.Label style={{ marginTop: "10px" }}>Grade System</Form.Label>
                  <Form.Control
                    as="select"
                    name="gradeSystem"
                    value={newModule.gradeSystem}
                    onChange={handleInputChange}
                    required
                  >
                    {gradeSystems.map((gs) => (
                      <option key={gs.id} value={gs.id}>{gs.description}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="formPrice">
                  <Form.Label style={{ marginTop: "10px" }}>Module Price (in Pesos)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={newModule.price}
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
                  type="submit"
                >
                  Add Module
                </button>
              </Form>
            </div>

            {/* Module table */}
            <div className={`table-container ${showForm ? "shifted" : ""}`}>
              {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <EnhancedTable
                  title="Existing Modules"
                  headers={headers}
                  rows={modules}
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

export default CreateModule;