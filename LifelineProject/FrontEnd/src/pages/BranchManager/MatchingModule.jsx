import React, { useState, useMemo, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import EnhancedTable from "../../components/Table"; // Import EnhancedTable
import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Multiselect from "multiselect-react-dropdown"; // Import Multiselect
import jsPDF from "jspdf"; // Import jsPDF
import "./Create.css"; // Custom styles for the form and layout
import { jwtDecode } from "jwt-decode";
import useAxios from "../../utils/useAxios";
import { ToastContainer, toast } from "react-toastify";
import { FaQuestionCircle } from "react-icons/fa";

const StudentRecords = () => {
  const axios = useAxios();
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    program: [],
    modules: [],
    graduate: "all",
    graduation_date: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [selection, setSelection] = useState([]);
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [students, setStudents] = useState([]); 
  const [modalMessage, setModalMessage] = useState(""); // Modal message
  const [programs, setPrograms] = useState([]); // State to hold all existing programs
  const [modules, setModules] = useState([]); // State to hold all available modules

  // Determine if the form is expanded (i.e., "Graduation Date" is visible)
  const isFormExpanded = filters.graduate === "graduate";

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

  const getModules = async () => {
    try {
      const response = await axios.get(`getmoduleswithgradesystem/`);
      if (response.status === 200) {
        const fetchedModules = response.data.map((module) => ({
          id: module.id,
          name: module.name,
          module_gradetype_id: module.module_gradetype.description,
        }));
        console.log("fetched modules hehe:", fetchedModules);
        setModules(fetchedModules); // Set the modules state
      } else {
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const getPrograms = async () => {
    try {
      const branch = jwtDecode(localStorage.getItem("authTokens")).branch;
      const response = await axios.get(`getprogram/${branch}`); // Ensure this endpoint returns the necessary data

      if (response.status === 200) {
        console.log("Programs Response:", response.data);

        // Transform the response data directly
        const transformedPrograms = response.data.map((program) => {
          const moduleNames = program.modules.map(module => module.name).join(", ") || "N/A";

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
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Update filter count when filters change
  useEffect(() => {
    fetchStudents();
    getPrograms();
    getModules();
    const count = filters.program.length + filters.modules.length;
    setFilterCount(count);
  }, [filters.program, filters.modules]);

  // Handle filter changes
  const handleFilterChange = (filterType, selectedList) => {
    let value;
    if (Array.isArray(selectedList)) {
      // For Multiselect (Program and Modules filters)
      value = selectedList.map((item) => item.name);
    } else {
      // For radio buttons (Graduate Status filter)
      value = selectedList;
    }

    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }));
  };

  const filteredStudents = useMemo(() => {
    console.log("Filters Modules:", filters.modules); // Log the selected modules in the filters
    console.log("Students:", students); // Log the full list of students

    return students.filter((student) => {
      console.log("Student Program Modules:", student.program_modules); // Log the modules for each student

      // Determine if the student is a graduate based on the new status field
      const isGraduate =
        student.status === "COMPLETED" || student.status === "COMPLETE";

      // Check if the student matches the selected program
      const matchesProgram =
        filters.program.length === 0 ||
        filters.program.includes(student.program_name);

      // Check if the student has completed the selected modules
      const matchesModules =
        filters.modules.length === 0 ||
        filters.modules.every((module) =>
          student.program_modules.some(
            (programModule) =>
              programModule.module === module &&
              programModule.grade && // Ensure the grade exists
              programModule.grade !== "In Progress" // Ensure the grade is not "In Progress"
          )
        );

      // Check if the student matches the selected graduate status
      const matchesGraduateStatus =
        filters.graduate === "all" ||
        (filters.graduate === "graduate" && isGraduate) ||
        (filters.graduate === "non-graduate" && !isGraduate);

      // Check if the student matches the selected graduation date
      const matchesGraduationDate =
        filters.graduation_date === null ||
        (isGraduate &&
          new Date(student.graduation_date) <= new Date(filters.graduation_date));

      // Log the filtering results for each student
      console.log(`Student: ${student.name}`);
      console.log("Matches Program:", matchesProgram);
      console.log("Matches Modules:", matchesModules);
      console.log("Matches Graduate Status:", matchesGraduateStatus);
      console.log("Matches Graduation Date:", matchesGraduationDate);

      // Return true if all conditions are met
      return (
        matchesProgram &&
        matchesModules &&
        matchesGraduateStatus &&
        matchesGraduationDate
      );
    });
  }, [filters, students]);

  // Define columns for the students table
  const studentHeaders = useMemo(
    () => [
      { id: "name", label: "Name of Student" },
      { id: "program", label: "Program" },
      { id: "modulesCompleted", label: "Modules Completed" },
      { id: "graduate", label: "Graduate" },
      { id: "graduation_date", label: "Graduation Date" },
    ],
    []
  );

  // Transform filtered students for the table
  const rows = filteredStudents.map((student) => {
    // Extract program name
    const program = student.program_name || "N/A";

    // Get completed modules as an array
    const completedModules = student.program_modules
      .filter((module) => module.grade && !isNaN(module.grade)) // Check if grade is a number
      .map((module) => module.module); // Extract module names

    // Convert graduate status to "Yes" or "No"
    const graduate =
      student.status === "COMPLETED" || student.status === "COMPLETE"
        ? "Yes"
        : "No";

    // Return the transformed row
    return {
      id: student.user_id, // Use user_id as the unique identifier
      name: student.name,
      program: program, // Use program_name from the API response
      modulesCompleted: completedModules, // Return as an array
      graduate: graduate,
      graduation_date: student.graduation_date || "N/A", // Placeholder for graduation date
    };
  });

  // Handle row selection
  const handleRowSelect = (id) => {
    setSelection((prevSelection) => {
      if (prevSelection.includes(id)) {
        // Remove the ID if already selected
        return prevSelection.filter((selectedId) => selectedId !== id);
      } else {
        // Add the ID if not selected
        return [...prevSelection, id];
      }
    });
    console.log("Selected IDs:", selection); // Debugging
  };

  // Handle "Select All"
  const handleSelectAll = (selectedIds) => {
    console.log("handleSelectAll called with:", selectedIds); // Debugging log
    setSelection(selectedIds); // Update the selection state with all selected IDs
  };

  // Export selected data to PDF
  const exportToPDF = (data) => {
    const doc = new jsPDF();

    // Get user details from JWT token
    let generatedBy = "Unknown User";
    const authToken = localStorage.getItem("authTokens");
    if (authToken) {
      try {
        const decoded = jwtDecode(authToken);
        generatedBy = `${decoded.firstName} ${decoded.lastName}`;
      } catch (error) {
        console.error("Error decoding JWT:", error);
      }
    }

    // Get current date and time
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const formattedTime = now
      .toLocaleTimeString("en-US", { hour12: false })
      .replace(/:/g, "-"); // HH-MM-SS
    const generatedDateTime = `Generated on: ${formattedDate} ${formattedTime}`;
    const generatedByText = `Generated by: ${generatedBy}`;

    // Set document title and header
    const title = "Student Records Report";
    doc.setFontSize(16);
    doc.text(title, 10, 10);
    doc.setFontSize(10);
    doc.text(generatedDateTime, 130, 10); // Right-aligned date with time
    doc.text(generatedByText, 130, 15); // Below the date

    // Define table headers
    const headers = [
      "No.", "Name", "Program", "Modules Completed", "Graduate", "Graduation Date"
    ];

    // Prepare data for the table
    const tableData = data.map((student, index) => [
      index + 1,
      student.name || "N/A",
      student.program || "N/A",
      doc.splitTextToSize(student.modulesCompleted.join(", ") || "N/A", 50), // Wrap text for better fit
      student.graduate || "N/A",
      student.graduation_date || "N/A"
    ]);

    // Use autoTable to properly format the table
    doc.autoTable({
      startY: 25, // Adjusted to fit "Generated by"
      head: [headers],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 50 }, // Wider column for modules
        4: { cellWidth: 20 },
        5: { cellWidth: 30 }
      },
      margin: { top: 35 } // Increased margin to prevent overlap
    });

    // Add page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${totalPages}`, 90, 285);
    }

    // Generate professional file name
    const fileName = `Student_Records_Report_${formattedDate}_${formattedTime}.pdf`;

    // Save the PDF
    doc.save(fileName);
  };

  // Handle manual export
  const handleExport = async () => {
    // Filter the rows to get the selected rows
    const selectedData = rows.filter((row) => selection.includes(row.id));

    // Log the selected data for debugging
    console.log("Selected Data:", selectedData);

    // Export the selected data to PDF
    exportToPDF(selectedData);

    try {
      const response = await axios.post("log-matching/", {
        student_ids: selection, // Send the selected student IDs
      });
  
      if (response.status === 201) {
        toast.success("Matching log saved successfully!");
      } else {
        toast.error("Failed to save matching log.");
      }
    } catch (error) {
      console.error("Error saving matching log:", error);
      toast.error("An error occurred while saving the matching log.");
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

  const showHelp = () => {
    toast.info(
      <div style={{ fontSize: "16px", padding: "10px" }}>
        <p><strong>What is the Matching Module?</strong> The matching module allows you to filter and match students based on specific criteria provided by a client. For example:</p>
        <ul style={{ paddingLeft: "20px", marginBottom: "5px" }}>
          <li><strong>Client Request:</strong> Find students who completed "Programming 101" and "Data Structures."</li>
          <li><strong>Client Request:</strong> Match students who is enrolled in the following program"</li>
        </ul>
        <p><strong>How to Use the Matching Module?</strong> Click "Show Filters," select the program, modules, graduate status, and graduation date, then apply the filters to generate the matching results.</p>
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
          <div className="mb-3">
            <div className="mb-3 d-flex justify-content-between">
              <div>
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
                  onClick={() => setShowFilters(!showFilters)}
                  className="mb-2"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>

                <button
                  style={{
                    marginLeft: "10px",
                    padding: "0.6rem 1.2rem",
                    fontSize: "0.9rem",
                    backgroundColor: "#b0b0b0",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition:
                      "background-color 0.3s ease, transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#808080";
                    e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#b0b0b0";
                    e.target.style.transform = "scale(1)";
                  }}
                  onClick={() =>
                    setFilters({
                      program: [],
                      modules: [],
                      graduate: "all",
                      graduation_date: null,
                    })
                  }
                >
                  Clear Filters
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

              <div>
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
                  onClick={handleExport}
                >
                  Export Selected to PDF
                </button>
              </div>
            </div>

            <div style={{ display: "flex", position: "relative" }}>
              <div
                className={`mtop-offcanvas-form ${showFilters ? "show" : ""} ${
                  isFormExpanded ? "expanded" : ""
                } ${filterCount === 1 ? "one-filter" : ""} ${
                  filterCount >= 2 ? "two-filters" : ""
                }`}
              >
                {/* Program Filter (Multiselect Dropdown) */}
                <Form.Group
                  controlId="formProgramFilter"
                  style={{ marginBottom: "10px" }}
                >
                  <Form.Label>Program</Form.Label>
                  <Multiselect
                    options={programs}
                    selectedValues={filters.program.map((program) => ({
                      name: program,
                    }))}
                    onSelect={(selectedList) =>
                      handleFilterChange("program", selectedList)
                    }
                    onRemove={(selectedList) =>
                      handleFilterChange("program", selectedList)
                    }
                    displayValue="name"
                    placeholder="Select Program"
                    className="custom-multiselect" // Add a custom class
                    style={{
                      chips: { background: "#009688" },
                      searchBox: {
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                      },
                      optionContainer: {
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                      },
                      option: {
                        backgroundColor: "white",
                        color: "#333",
                        padding: "8px",
                        cursor: "pointer",
                      },
                    }}
                  />
                </Form.Group>

                {/* Modules Filter (Multiselect Dropdown) */}
                <Form.Group
                  controlId="formModuleFilter"
                  style={{ marginBottom: "10px" }}
                >
                  <Form.Label>Modules</Form.Label>
                  <Multiselect
                    options={modules}
                    selectedValues={filters.modules.map((module) => ({
                      name: module,
                    }))}
                    onSelect={(selectedList) =>
                      handleFilterChange("modules", selectedList)
                    }
                    onRemove={(selectedList) =>
                      handleFilterChange("modules", selectedList)
                    }
                    displayValue="name"
                    placeholder="Select Modules"
                    className="custom-multiselect" // Add a custom class
                    style={{
                      chips: { background: "#009688" },
                      searchBox: {
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                      },
                      optionContainer: {
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                      },
                      option: {
                        backgroundColor: "white",
                        color: "#333",
                        padding: "8px",
                        cursor: "pointer",
                      },
                    }}
                  />
                </Form.Group>

                {/* Graduate Status Filter (Radio Buttons) */}
                <div className="custom-radio">
                  <Form.Group controlId="formGraduateFilter">
                    <Form.Label>Graduate Status</Form.Label>
                    <Form.Check
                      type="radio"
                      label="All"
                      name="graduate"
                      value="all"
                      checked={filters.graduate === "all"}
                      onChange={(e) =>
                        handleFilterChange("graduate", e.target.value)
                      }
                    />
                    <Form.Check
                      type="radio"
                      label="Graduate"
                      name="graduate"
                      value="graduate"
                      checked={filters.graduate === "graduate"}
                      onChange={(e) =>
                        handleFilterChange("graduate", e.target.value)
                      }
                    />
                    <Form.Check
                      type="radio"
                      label="Non-Graduate"
                      name="graduate"
                      value="non-graduate"
                      checked={filters.graduate === "non-graduate"}
                      onChange={(e) =>
                        handleFilterChange("graduate", e.target.value)
                      }
                    />
                  </Form.Group>
                </div>
                {/* Graduation Date Filter (Conditional) */}
                {filters.graduate === "graduate" && (
                  <Form.Group controlId="formGraduationDateFilter">
                    <Form.Label>Graduation Date Before</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.graduation_date || ""}
                      onChange={(e) =>
                        handleFilterChange("graduation_date", e.target.value)
                      }
                    />
                  </Form.Group>
                )}
              </div>
            </div>
          </div>

          <div
            className={`mtop-table-container ${showFilters ? "shifted" : ""} ${
              isFormExpanded ? "expanded" : ""
            } ${filterCount === 1 ? "one-filter" : ""} ${
              filterCount >= 2 ? "two-filters" : ""
            }`}
          >
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "80vh" }}
              >
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <EnhancedTable
                title="Student Records"
                headers={studentHeaders}
                rows={rows}
                showSubmitButton={false}
                maxRows={10}
                onRowSelect={handleRowSelect}
                onSelectAll={handleSelectAll} // Pass the handleSelectAll function
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
    </div>
  );
};

export default StudentRecords;