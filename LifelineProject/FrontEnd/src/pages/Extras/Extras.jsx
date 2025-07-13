
//OLD BRANCH MANAGER--------------------------------------------------------------- 
/* Unused code
  const [preStudents, setPreStudents] = useState([]);
  const navigate = useNavigate();
  const fetchPreStudents = async () => {
    try {
      const branch = jwtDecode(localStorage.getItem("authTokens")).branch;
      const response = await axios.get(`/prestudentlist/${branch}/`);

      if (response.status === 200) {
        setPreStudents(response.data);
      } else {
        alert("Something went wrong. " + response.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Something went wrong. Please try again later.");
    }
  };*/
   // Define headers for EnhancedTable
  /*const preStudentHeaders = [
    { id: "name", numeric: false, disablePadding: true, label: "Name" },
    { id: "email", numeric: false, disablePadding: false, label: "Email" },
    { id: "status", numeric: false, disablePadding: false, label: "Status" },
    {
      id: "paymentDetails",
      numeric: false,
      disablePadding: false,
      label: "Payment Details",
    },
    { id: "action", numeric: false, disablePadding: false, label: "Action" },
  ];

  // Transform preStudents data to fit EnhancedTable format
  const preStudentRows = preStudents.map((student) => ({
    id: student.user_id,
    name: [
      student.firstName,
      student.middleName,
      student.lastName,
      student.extensions,
    ]
      .filter(Boolean)
      .join(" "),
    email: student.email,
    status: student.details.info_complete,
    paymentDetails: student.details.is_paid ? "Paid" : "Pending Payment",
    action: (
      <button
        onClick={() => ViewStudentDetails(student)}
        className="btn btn-info"
      >
        View Details
      </button>
    ),
  }));

  const ViewStudentDetails = (studentData) => {
    navigate("/ViewDetails", { state: { studentData } });
  };
    /*const fetchData = async () => {
      setLoading(true);
      //await fetchPreStudents();
      fetchStudents();
      //setLoading(false); // Set loading to false after all data is fetched
    };
    */










//OLD CREATE CLASS---------------------------------------------------------------            
  /*

  const handleCreateCourse = async () => {
    try {
      const csrfToken = Cookies.get("csrftoken");
      const response = await fetch(
        "https://localhost:8000/api/create_classroom_course/",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
        }
      );
      if (response.redirected) {
        handleLogin();
        window.location.href = response.url;
      } else {
        const data = await response.json();
        console.log("Classroom created:", data);
      }
    } catch (error) {
      console.error("Error creating classroom:", error);
    }
  };

  */
 // This is the ID you have
      //   console.log("selectedModuleId ", selectedModuleId);
      //   console.log("modules array ", modules);
      //   console.log("Type of selectedModuleId:", typeof selectedModuleId);
      //console.log("Type of first module id:", typeof modules[0].id);
       //    console.log("selectedModuleObject ", selectedModuleObject);
      // Check if the module was found
        //  window.location.href = `https://localhost:8000/api/login/?${queryParams}`;

        /*
    const handleInvite = async (courseID, teacherEmail) => {
    try {
      

      const inviteData = {
        courseId: courseID,
        teacherEmail: teacherEmail,
      };

      console.log("inside  Handle Invite invite data is", inviteData);
      
      const response = await axios.post("send-classroom-invite/", inviteData);
        if (response.status === 201) {
        } else {

        }
    } catch (error) {
      console.error("Error during send invite:", error);
      setError("Error during send invite");
    }
  };
  */


//OLD CREATE PROGRAM----------------------------------------------------------------------
 /*
        const programModulesEntries = selectedModuleIds.map((moduleId) => ({
          module_id: moduleId,
          program_id: newProgramID, // Use the newly created program ID
        }));

        console.log("New Program Modules Entry:", programModulesEntries);

        const programModulesResponse = await axios.post(
          "/createprogrammodules/",
          programModulesEntries
        );

        if (programModulesResponse.status === 201) {
          // Successfully created programmodules entries
          console.log("Program modules created successfully.");
        } else {
          alert(
            "Failed to create program modules: " + programModulesResponse.status
          );
        }

        */







//OLD REPORTS------------------------------------------------------------------------
// const generateCourseList = () => {
  //   const getCurrentDateTime = () => {
  //     const today = new Date();
  //     const date = today.toLocaleDateString();
  //     const time = today.toLocaleTimeString();
  //     return `${date} ${time}`;
  //   };

  //   const doc = new jsPDF();
  //   const schoolName = "Lifeline International Health Institute";
  //   const dateTime = getCurrentDateTime();
  //   const logoUrl = "https://via.placeholder.com/150"; // Placeholder logo URL

  //   doc.addImage(logoUrl, "JPEG", 10, 10, 30, 30);
  //   doc.setFontSize(18);
  //   doc.text(schoolName, 50, 20);
  //   doc.setFontSize(10);
  //   doc.text(dateTime, 180, 10, { align: "right" });

  //   const studentDetailsYStart = 35;
  //   doc.setFontSize(14);
  //   doc.text("Student List", 20, studentDetailsYStart);

  //   const columns = [["Student ID", "Name", "Branch"]];
  //   const rows = DBstudents.map((student) => {
  //     return [
  //       student.studentid,
  //       [
  //         student.firstName,
  //         student.middleName,
  //         student.lastName,
  //         student.extensions,
  //       ]
  //         .filter(Boolean)
  //         .join(" "),
  //       student.branch_name,
  //     ];
  //   });

  //   doc.autoTable({
  //     head: columns,
  //     body: rows,
  //     startY: studentDetailsYStart + 10,
  //     theme: "grid",
  //     styles: { lineColor: [0, 0, 0], lineWidth: 0.5 },
  //   });

  //   doc.text("End of Report", 105, doc.autoTable.previous.finalY + 10, {
  //     align: "center",
  //   });

  //   const fileName = `studentlist.pdf`;
  //   doc.save(fileName);
  // };




  //OLD STUDENT ENROLL-------------------------------------------------------------------
  
  // const enrollmentData = {
  //   student: id, // Assuming selectedStudent has an id property
  //   course: selectedCourseIDs, // Assuming selectedModules is an array of module IDs
  // };

  // console.log("Enrollment Data is ", enrollmentData);

  // try {
  //   const response = await axios.post('createenrollment/', enrollmentData); // Adjust the endpoint as necessary
  //   if (response.status === 201) {
  //     alert("Successfully enrolled in the selected modules!");
  //     // Optionally, you can refresh the data or update the state here
  //   } else {
  //     alert("Enrollment failed: " + response.data.message);
  //   }
  // } catch (error) {
  //   console.error("Error enrolling student:", error);
  //   alert("An error occurred while enrolling the student. Please try again.");
  // }
  // };



  /* For Reports

  const generateSummaryList = async () => {
    const getCurrentDateTime = () => new Date().toLocaleString();
    const doc = new jsPDF();
    const schoolName = "Lifeline International Health Institute";
    const dateTime = getCurrentDateTime();
    const logoUrl = "https://via.placeholder.com/150";

    // Fetch generated by user
    const authTokens = localStorage.getItem("authTokens");
    let generatedBy = "Unknown User";

    if (authTokens) {
        try {
            const decoded = jwtDecode(authTokens);
            generatedBy = `${decoded.firstName} ${decoded.lastName}`;
        } catch (error) {
            console.error("Error decoding auth tokens:", error);
        }
    }

    // Fetch and convert logo to Base64
    const fetchLogo = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error loading logo:", error);
            return null;
        }
    };

    const logoBase64 = await fetchLogo(logoUrl);

    const addHeader = () => {
        if (logoBase64) {
            doc.addImage(logoBase64, "PNG", 15, 10, 25, 25);
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0); // Set color for school name
        doc.text(schoolName, 105, 20, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0); // Consistent color for "Generated by" text
        doc.text(`Generated on: ${dateTime} | By: ${generatedBy}`, 105, 30, {
            align: "center",
        });
        doc.line(10, 35, 200, 35);
    };

    let yPosition = 45;
    addHeader();

    const addSectionTitle = (title) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 150, 136); // Set consistent color for section titles
        doc.text(title, 15, yPosition);
        yPosition += 8;
    };

    const addTable = (columns, rows) => {
        if (!rows || rows.length === 0) {
            console.warn(`Skipping empty table for ${columns.join(", ")}`);
            return;
        }
        doc.autoTable({
            head: [
                columns.map((col) => ({
                    content: col,
                    styles: {
                        fontStyle: "bold",
                        halign: "center",
                        textColor: [255, 255, 255],
                    },
                })),
            ],
            body: rows,
            startY: yPosition,
            theme: "grid",
            styles: { fontSize: 10, cellPadding: 4, halign: "center" },
            headStyles: { fillColor: [0, 150, 136] }, // Consistent header color
            alternateRowStyles: { fillColor: [240, 240, 240] },
        });
        yPosition = doc.autoTable.previous.finalY + 10;
    };

    const addChartToPDF = (chartId) => {
        const chartCanvas = document.getElementById(chartId);
        if (!chartCanvas) {
            console.warn(`Chart with ID ${chartId} not found.`);
            return;
        }

        try {
            const imgData = chartCanvas.toDataURL("image/png", 1.0);
            if (imgData.includes("data:image/png;base64,")) {
                const imgWidth = 100;
                const imgHeight = 100;
                const pageWidth = doc.internal.pageSize.width;
                const xPosition = (pageWidth - imgWidth) / 2;

                doc.addImage(
                    imgData,
                    "PNG",
                    xPosition,
                    yPosition,
                    imgWidth,
                    imgHeight
                );
                yPosition += imgHeight + 10;
            } else {
                console.warn(`Invalid image data for chart: ${chartId}`);
            }
        } catch (error) {
            console.error(`Error adding chart ${chartId} to PDF:`, error);
        }
    };

    let isFirstSection = true; // Track whether it's the first section

    const addSectionWithPageBreak = (
        title,
        tableHeaders,
        tableData,
        chartId
    ) => {
        if (!isFirstSection) {
            doc.addPage(); // Add a new page for each section except the first one
        }
        isFirstSection = false; // After the first section, ensure the page break applies to subsequent sections

        yPosition = 45;
        addHeader(); // Re-add the header on each page
        addSectionTitle(title);

        // Add the table
        addTable(tableHeaders, tableData);

        // Add a page break if the table has 5 or more rows
        if (tableData.length >= 5) {
            doc.addPage();
            yPosition = 45; // Reset Y position for the new page
            addHeader(); // Add header to the new page
        }

        // Add the chart
        addChartToPDF(chartId);
    };

    // Ensure variables exist before using them
    if (typeof programs !== "undefined" && Array.isArray(programs)) {
        addSectionWithPageBreak(
            "Summary of Student Data",
            ["Program Name", "Students Enrolled"],
            programs.map((p) => [p.name, p.enrolled]),
            "enrolled-chart"
        );
    }

    if (typeof genderCounts !== "undefined") {
        addSectionWithPageBreak(
            "Gender Distribution",
            ["Gender", "Number of Students"],
            [
                ["Male", genderCounts.male || 0],
                ["Female", genderCounts.female || 0],
            ],
            "gender-chart"
        );
    }

    if (typeof nationalityCounts !== "undefined") {
        addSectionWithPageBreak(
            "Nationality Distribution",
            ["Nationality", "Number of Students"],
            [
                ["Filipino", nationalityCounts.filipino || 0],
                ["Non-Filipino", nationalityCounts.nonFilipino || 0],
            ],
            "nationality-chart"
        );
    }

    if (typeof learningModeCounts !== "undefined") {
        addSectionWithPageBreak(
            "Learning Mode Distribution",
            ["Learning Mode", "Number of Students"],
            [
                ["Online", learningModeCounts.online || 0],
                ["Onsite", learningModeCounts.onsite || 0],
            ],
            "learning-mode-chart"
        );
    }

    if (typeof scheduleCounts !== "undefined") {
        addSectionWithPageBreak(
            "Schedule Distribution",
            ["Preferred Schedule", "Number of Students"],
            [
                [
                    "Weekdays | Mon-Fri | 8:00AM - 2:00 PM",
                    scheduleCounts.weekdaysMorning || 0,
                ],
                [
                    "Weekdays | Mon-Fri | 2:00 PM - 8:00 PM",
                    scheduleCounts.weekdaysAfternoon || 0,
                ],
                [
                    "Weekends | Sat & Sun | 8:00 AM - 6:00 PM",
                    scheduleCounts.weekends || 0,
                ],
                [
                    "Night Class | Weekdays & Sat (Iloilo & Silay)",
                    scheduleCounts.nightClass || 0,
                ],
            ],
            "schedule-chart"
        );
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(0, 150, 136); // Consistent footer color
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    }

    doc.save(
        `Student_Summary_Report_${new Date().toISOString().split("T")[0]}.pdf`
    );
    logReportExport("student_summary_report");
};
   */



/* For SReports
const generateSummaryList = async () => {
    const doc = new jsPDF();
    const schoolName = "Lifeline International Health Institute";
    const dateTime = new Date().toLocaleString();
    const logoUrl = "https://via.placeholder.com/150";

    // Fetch generated by user
    const authTokens = localStorage.getItem("authTokens");
    let generatedBy = "Unknown User";

    if (authTokens) {
        try {
            const decoded = jwtDecode(authTokens);
            generatedBy = `${decoded.firstName} ${decoded.lastName}`;
        } catch (error) {
            console.error("Error decoding auth tokens:", error);
        }
    }

    // Fetch and convert logo to Base64
    const fetchLogo = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error loading logo:", error);
            return null;
        }
    };

    const logoBase64 = await fetchLogo(logoUrl);

    // Header
    const addHeader = () => {
        if (logoBase64) {
            doc.addImage(logoBase64, "PNG", 15, 10, 25, 25);
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text(schoolName, 105, 20, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on: ${dateTime} | By: ${generatedBy}`, 105, 30, {
            align: "center",
        });
        doc.line(10, 35, 200, 35);
    };

    let yPosition = 45;

    // Section Titles and Tables
    const addSectionTitle = (title) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 150, 136);
        doc.text(title, 15, yPosition);
        yPosition += 8;
    };

    const addTable = (columns, rows) => {
        if (!rows || rows.length === 0) {
            console.warn(`Skipping empty table for ${columns.join(", ")}`);
            return;
        }

        doc.autoTable({
            head: [
                columns.map((col) => ({
                    content: col,
                    styles: {
                        fontStyle: "bold",
                        halign: "center",
                        textColor: [255, 255, 255],
                    },
                })),
            ],
            body: rows,
            startY: yPosition,
            theme: "grid",
            styles: { fontSize: 10, cellPadding: 4, halign: "center" },
            headStyles: { fillColor: [0, 150, 136] },
            alternateRowStyles: { fillColor: [240, 240, 240] },
        });

        yPosition = doc.autoTable.previous.finalY + 10;
    };

    const addChartToPDF = (chartId) => {
        const chartCanvas = document.getElementById(chartId);
        if (!chartCanvas) {
            console.warn(`Chart with ID ${chartId} not found.`);
            return;
        }

        try {
            const imgData = chartCanvas.toDataURL("image/png", 1.0);
            if (imgData.includes("data:image/png;base64,")) {
                const imgWidth = 100;
                const imgHeight = 100;
                const pageWidth = doc.internal.pageSize.width;
                const xPosition = (pageWidth - imgWidth) / 2;

                doc.addImage(
                    imgData,
                    "PNG",
                    xPosition,
                    yPosition,
                    imgWidth,
                    imgHeight
                );
                yPosition += imgHeight + 10;
            } else {
                console.warn(`Invalid image data for chart: ${chartId}`);
            }
        } catch (error) {
            console.error(`Error adding chart ${chartId} to PDF:`, error);
        }
    };

    const addSectionWithPageBreak = (
        title,
        tableHeaders,
        tableData,
        chartId
    ) => {
        addHeader();
        addSectionTitle(title);
        addTable(tableHeaders, tableData);

        // Check if the number of rows is between 6 and 20
        if (tableData.length >= 6 && tableData.length <= 20) {
            // Add a page break before adding the chart
            doc.addPage();
            yPosition = 45; // Reset Y position for the new page
        }

        // Add the chart
        addChartToPDF(chartId);

        // Always add a page break after the chart
        doc.addPage();
        yPosition = 45; // Reset Y position for the new page
    };

    // Ensure variables exist before using them
    if (typeof programs !== "undefined" && Array.isArray(programs)) {
        addSectionWithPageBreak(
            "Summary of Student Data",
            ["Program Name", "Students Enrolled"],
            filteredPrograms.map((p) => [p.name, p.enrolled]),
            "enrolled-chart"
        );
    }

    if (typeof genderCounts !== "undefined") {
        addSectionWithPageBreak(
            "Gender Distribution",
            ["Gender", "Number of Students"],
            [
                [
                    "Male",
                    filteredBranches.includes("All")
                        ? genderCounts.male.total
                        : filteredBranches.reduce(
                            (sum, branch) =>
                                sum + (genderCounts.male.branches[branch] || 0),
                            0
                        ),
                ],
                [
                    "Female",
                    filteredBranches.includes("All")
                        ? genderCounts.female.total
                        : filteredBranches.reduce(
                            (sum, branch) =>
                                sum + (genderCounts.female.branches[branch] || 0),
                            0
                        ),
                ],
            ],
            "gender-chart"
        );
    }

    if (typeof nationalityCounts !== "undefined") {
        addSectionWithPageBreak(
            "Nationality Distribution",
            ["Nationality", "Number of Students"],
            [
                [
                    "Filipino",
                    filteredBranches.includes("All")
                        ? nationalityCounts.filipino.total
                        : filteredBranches.reduce(
                            (sum, branch) =>
                                sum + (nationalityCounts.filipino.branches[branch] || 0),
                            0
                        ),
                ],
                [
                    "Non-Filipino",
                    filteredBranches.includes("All")
                        ? nationalityCounts.nonFilipino.total
                        : filteredBranches.reduce(
                            (sum, branch) =>
                                sum + (nationalityCounts.nonFilipino.branches[branch] || 0),
                            0
                        ),
                ],
            ],
            "nationality-chart"
        );
    }

    if (typeof learningModeCounts !== "undefined") {
        addSectionWithPageBreak(
            "Learning Mode Distribution",
            ["Learning Mode", "Number of Students"],
            [
                [
                    "Online",
                    filteredBranches.includes("All")
                        ? learningModeCounts.online.total
                        : filteredBranches.reduce(
                            (sum, branch) =>
                                sum + (learningModeCounts.online.branches[branch] || 0),
                            0
                        ),
                ],
                [
                    "Onsite",
                    filteredBranches.includes("All")
                        ? learningModeCounts.onsite.total
                        : filteredBranches.reduce(
                            (sum, branch) =>
                                sum + (learningModeCounts.onsite.branches[branch] || 0),
                            0
                        ),
                ],
            ],
            "learning-mode-chart"
        );
    }

    if (typeof scheduleCounts !== "undefined") {
        addSectionWithPageBreak(
            "Schedule Distribution",
            ["Preferred Schedule", "Number of Students"],
            [
                [
                    "Weekdays | Mon-Fri | 8:00AM - 2:00 PM",
                    filteredBranches.includes("All")
                        ? scheduleCounts.weekdaysMorning.total
                        : filteredBranches.reduce(
                            (sum, branch) =>
                                sum +
                                (scheduleCounts.weekdaysMorning.branches[branch] || 0),
                            0
                        ),
                ],
                [
                    "Weekdays | Mon-Fri | 2:00 PM - 8:00 PM",
                    filteredBranches.includes("All")
                        ? scheduleCounts.weekdaysAfternoon.total
                        : filteredBranches.reduce(
                            (sum, branch) =>
                                sum +
                                (scheduleCounts.weekdaysAfternoon.branches[branch] || 0),
                            0
                        ),
                ],
                [
                    "Weekends | Sat & Sun | 8:00 AM - 6:00 PM",
                    filteredBranches.includes("All")
                        ? scheduleCounts.weekends.total
                        : filteredBranches.reduce(
                            (sum, branch) =>
                                sum + (scheduleCounts.weekends.branches[branch] || 0),
                            0
                        ),
                ],
                [
                    "Night Class | Weekdays & Sat (Iloilo & Silay)",
                    filteredBranches.includes("All")
                        ? scheduleCounts.nightClass.total
                        : filteredBranches.reduce(
                            (sum, branch) =>
                                sum + (scheduleCounts.nightClass.branches[branch] || 0),
                            0
                        ),
                ],
            ],
            "schedule-chart"
        );
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(0, 150, 136);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    }

    // Save the PDF
    doc.save(
        `Student_Summary_Report_${new Date().toISOString().split("T")[0]}.pdf`
    );
    logReportExport("student_summary_report");
};



*/