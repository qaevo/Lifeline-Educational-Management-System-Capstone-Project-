import React, { useEffect, useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.css";
import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EnhancedTable from "../../components/Table"; // Import EnhancedTable
import { Modal, Spinner, Form, Button } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAxios from "../../utils/useAxios";
import "./Create.css"; // Custom styles for the form and layout
import { jwtDecode } from "jwt-decode";
import { FaQuestionCircle } from "react-icons/fa";

const CreateProgram = () => {
  const axios = useAxios();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState([]);
  const [newProgram, setNewProgram] = useState({
    programName: "",
  });
  const branchID = jwtDecode(localStorage.getItem("authTokens")).branch;

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
  
  // Get modules API Call
  const getModules = async () => {
    try {
      const response = await axios.get(`getmoduleswithgradesystem/`);
      if (response.status === 200) {
        const fetchedModules = response.data.map((module) => ({
          id: module.id,
          moduleName: module.name,
          module_gradetype_id: module.module_gradetype.description,
        }));
        console.log("fetched modules hehe:", fetchedModules);
        setModules(fetchedModules);
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
      console.error("Error fetching modules:", error);
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

  // Get Programs API Call
  const getPrograms = async () => {
    try {
      const branch = jwtDecode(localStorage.getItem("authTokens")).branch;
      const response = await axios.get(`getprogram/${branch}`);

      if (response.status === 200) {
        console.log("Programs Response:", response.data);

        const transformedPrograms = response.data.map((program) => {
          const moduleNames =
            program.modules.map((module) => module.name).join(", ") || "N/A";

          return {
            id: program.id,
            name: program.name,
            branch: program.branch,
            modules: moduleNames,
          };
        });

        console.log("Transformed Programs:", transformedPrograms);
        setPrograms(transformedPrograms);
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
      toast.error("Something went wrong while fetching grade programs.", {
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
    console.log("Modules Array AFTER GETMODULES:", modules);
  }, [modules]);

  useEffect(() => {
    getModules();
    getPrograms();
    setLoading(false);
  }, []);

  const moduleHeaders = useMemo(
    () => [{ id: "moduleName", label: "Module Name" }],
    []
  );

  const programHeaders = useMemo(
    () => [
      { id: "name", label: "Program Name" },
      { id: "modules", label: "Modules Included" },
    ],
    []
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProgram({ ...newProgram, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("hewo selected is equal to", selected);
    const selectedModuleIds = selected;

    console.log("hewo selectedModuleIDs is equal to", selectedModuleIds);

    const newProgramEntry = {
      name: newProgram.programName,
      branch: branchID,
    };

    console.log("New Program Entry:", newProgramEntry);

    try {
      const response = await axios.post("/createprogram/", newProgramEntry);

      if (response.status === 201) {
        const newProgramID = response.data.id;
        console.log("data id is:", newProgramID);
        console.log("YEHEY THE PROGRAM WAS CREATED.. NOW CREATING PROGRAMMODULES");
        console.log("Selected Modules Before Creating Entries:", selectedModuleIds);
        toast.success("Program Successfully Created!", {position: "top-right",})

        for (const moduleId of selectedModuleIds) {
          const programModuleEntry = [
            {
              module: moduleId,
              program: newProgramID,
            },
          ];

          console.log("The program entry being entered for program modules is", programModuleEntry);

          const programModulesResponse = await axios.post("/createprogrammodules/", programModuleEntry);

          if (programModulesResponse.status !== 201) {
            toast.error(`Failed to create program module: ${programModulesResponse.status}`, {
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

        getPrograms();
        setNewProgram({ programName: "" });
        setSelected([]);
        setShowForm(false);
      } else {
        toast.error(`Failed to create program: ${response.status}`, {
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
      console.error("Error creating program:", error);
      toast.error("Something went wrong while creating the program.", {
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

  const handleModuleSelect = (moduleId) => {
    console.log("PUMAPASOK NG HANDLEMODULESELECT HEHEHEHEHE");
    console.log("Module selected:", moduleId);
    setSelected((prevSelected) => {
      if (prevSelected.includes(moduleId)) {
        return prevSelected.filter((id) => id !== moduleId);
      } else {
        return [...prevSelected, moduleId];
      }
    });
  };

  const handleSelectAll = (selectedIds) => {
    setSelected(selectedIds); // Update the selected state with all selected IDs
  };

  const [showForm1, setShowForm1] = useState(false);

  const showHelp = () => {
    toast.info(
      <div style={{ fontSize: "16px", padding: "10px" }}>
        <p><strong>What is a Program?</strong> A program is a structured set of modules representing a course or field of study.</p>
        <p><strong>Here are some examples:</strong></p>
        <ul style={{ paddingLeft: "20px", marginBottom: "5px" }}>
          <li><strong>Degree Programs:</strong> BSIT, Engineering</li>
          <li><strong>Short Courses:</strong> Caregiving, Housekeeping, Guitar Lessons, Business Cooking</li>
        </ul>
        <p><strong>How to Create a Program?</strong> Click "Create Program," enter a name, select modules, and submit.</p>
      </div>,
      {
        position: "top-center",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "custom-toast",
        style: { width: "700px" },
      }
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />
      <main style={{ marginTop: "5rem", flex: 1, padding: "2rem", backgroundColor: "#f8f9fa" }}>
        <div className="container-fluid">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
            <Button
              onClick={() => setShowForm1(!showForm1)}
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
              {showForm1 ? "Cancel" : "Create Program"}
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
            <div className={`top-offcanvas-form ${showForm1 ? "show" : "hidden"}`} style={{ borderRadius: "10px" }}>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formProgramName">
                  <Form.Label>Program Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter program name"
                    name="programName"
                    value={newProgram.programName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <br />

                <EnhancedTable
                  title="Select Modules"
                  headers={moduleHeaders}
                  rows={modules}
                  showSubmitButton={false}
                  maxRows={7}
                  onRowSelect={handleModuleSelect}
                  onSelectAll={handleSelectAll} // Pass the handleSelectAll function
                />

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
                  Create Program
                </Button>
              </Form>
            </div>

            <div className={`top-table-container ${showForm1 ? "shifted" : ""}`}>
              {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <EnhancedTable
                  title="Existing Programs"
                  headers={programHeaders}
                  rows={programs}
                  showSubmitButton={false}
                  showSelectColumn={false}
                  maxRows={7}
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
        style={{ width: "600px", fontSize: "16px" }}
      />
    </div>
  );
};

export default CreateProgram;