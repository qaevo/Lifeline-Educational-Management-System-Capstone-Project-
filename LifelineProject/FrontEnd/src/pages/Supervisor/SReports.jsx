import React, { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import {
  Button,
  Container,
  Row,
  Col,
  Table,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useAxios from "../../utils/useAxios";
import { jwtDecode } from "jwt-decode";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EnhancedTable from "../../components/Table";
import ChartDataLabels from "chartjs-plugin-datalabels";
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const SReports = () => {
  const axios = useAxios();

  const [loading, setLoading] = useState(true);
  const [DBstudents, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courseAudit, setCourseAudit] = useState([]);
  const [activeCourses, setActiveCourses] = useState([]);
  const [genderCounts, setGenderCounts] = useState({ male: 0, female: 0 });
  const [nationalityCounts, setNationalityCounts] = useState({
    filipino: 0,
    nonFilipino: 0,
  });
  const [learningModeCounts, setLearningModeCounts] = useState({
    online: 0,
    onsite: 0,
  });
  const [scheduleCounts, setScheduleCounts] = useState({
    weekdaysMorning: 0,
    weekdaysAfternoon: 0,
    weekends: 0,
    nightClass: 0,
  });
  const [startDate, setStartDate] = useState("2024-10-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [programsLoaded, setProgramsLoaded] = useState(false);
  const [activeCoursesLoaded, setActiveCoursesLoaded] = useState(false);

  // Branch Filtering State
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState(["All"]);

  const toggleBranchFilter = (branch) => {
    setFilteredBranches((prev) => {
      if (prev.includes("All")) return [branch];
      if (prev.includes(branch)) {
        const updated = prev.filter((b) => b !== branch);
        return updated.length ? updated : ["All"];
      }
      return [...prev, branch];
    });
  };

  // Fetch Programs Report
  const getProgramsReport4 = async () => {
    try {
      const response = await axios.get(`/getprogramsreport4/999/`, {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      if (response.status === 200) {
        setPrograms(response.data);
        setProgramsLoaded(true);
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

  // Fetch Students
  const fetchStudents = async (branch = "All") => {
    try {
      const branchToFetch =
        branch === "All"
          ? jwtDecode(localStorage.getItem("authTokens")).branch
          : branch;
      const response = await axios.get(
        `/studentenrollmentlist/${branchToFetch}/`,
        {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        }
      );

      if (response.status === 200) {
        setStudents(response.data);
        const branchNames = [
          ...new Set(response.data.map((student) => student.branch_name)),
        ];
        setBranches(branchNames);
        countStudentsByGender(response.data);
        countStudentsByNationality(response.data);
        countStudentsByLearningMode(response.data);
        countStudentsBySchedule(response.data);
        setStudentsLoaded(true);
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

  // Count Students by Gender
  const countStudentsByGender = (students) => {
    const counts = {
      male: { total: 0, branches: {} },
      female: { total: 0, branches: {} },
    };

    students.forEach((student) => {
      if (student.details && student.details.sex && student.branch_name) {
        const genderKey = student.details.sex === "M" ? "male" : "female";
        const branch = student.branch_name;

        // Increment overall gender count
        counts[genderKey].total += 1;

        // Initialize branch count if it doesn't exist
        if (!counts[genderKey].branches[branch]) {
          counts[genderKey].branches[branch] = 0;
        }

        // Increment branch count
        counts[genderKey].branches[branch] += 1;
      }
    });
    setGenderCounts(counts);
  };

  // Count Students by Nationality
  const countStudentsByNationality = (students) => {
    const counts = {
      filipino: { total: 0, branches: {} },
      nonFilipino: { total: 0, branches: {} },
    };
    students.forEach((student) => {
      if (student.details && student.details.nationality) {
        const nationalityKey =
          student.details.nationality === "Filipino"
            ? "filipino"
            : "nonFilipino";
        const branch = student.branch_name;

        // Increment overall nationality count
        counts[nationalityKey].total += 1;

        // Initialize branch count if it doesn't exist
        if (!counts[nationalityKey].branches[branch]) {
          counts[nationalityKey].branches[branch] = 0;
        }

        // Increment branch count
        counts[nationalityKey].branches[branch] += 1;
      }
    });
    setNationalityCounts(counts);
  };

  // Count Students by Learning Mode
  const countStudentsByLearningMode = (students) => {
    const counts = {
      online: { total: 0, branches: {} },
      onsite: { total: 0, branches: {} },
    };
    students.forEach((student) => {
      if (student.details && student.details.learningMode) {
        const learningModeKey =
          student.details.learningMode === "online" ? "online" : "onsite";
        const branch = student.branch_name;

        // Increment overall learningMode count
        counts[learningModeKey].total += 1;

        // Initialize branch count if it doesn't exist
        if (!counts[learningModeKey].branches[branch]) {
          counts[learningModeKey].branches[branch] = 0;
        }

        // Increment branch count
        counts[learningModeKey].branches[branch] += 1;
      }
    });
    setLearningModeCounts(counts);
  };

  const countStudentsBySchedule = (students) => {
    const counts = {
      weekdaysMorning: { total: 0, branches: {} },
      weekdaysAfternoon: { total: 0, branches: {} },
      weekends: { total: 0, branches: {} },
      nightClass: { total: 0, branches: {} },
    };
    students.forEach((student) => {
      if (student.details && student.details.schedule) {
        var scheduleKey = "";
        switch (student.details.schedule) {
          case "wdMF8am2pm":
            scheduleKey = "weekdaysMorning";
            break;
          case "wdMF2pm8pm":
            scheduleKey = "weekdaysAfternoon";
            break;
          case "weSS8am6pm":
            scheduleKey = "weekends";
            break;
          case "wd5pm9pmS8am6pm":
            scheduleKey = "nightClass";
            break;
          default:
            scheduleKey = "weekdaysMorning";
            break;
        }
        const branch = student.branch_name;

        // Increment overall learningMode count
        counts[scheduleKey].total += 1;

        // Initialize branch count if it doesn't exist
        if (!counts[scheduleKey].branches[branch]) {
          counts[scheduleKey].branches[branch] = 0;
        }

        // Increment branch count
        counts[scheduleKey].branches[branch] += 1;
      }
    });
    setScheduleCounts(counts);
  };

  const filteredCourses = filteredBranches.includes("All")
    ? activeCourses
    : activeCourses.filter((course) =>
        filteredBranches.includes(course.branch_name)
      );

  const getActiveCourses = async () => {
    try {
      const branch = jwtDecode(localStorage.getItem("authTokens")).branch;
      const response = await axios.get(`/getactivecourses/${branch}`, {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      if (response.status === 200) {
        setActiveCourses(response.data);
        setActiveCoursesLoaded(true);
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

  const courseHeaders = [
    { id: "module_name", label: "Module Name" },
    { id: "course_name", label: "Class" },
    { id: "start_enroll", label: "Start of Enrollment" },
    { id: "start_course", label: "Start of Class" },
    { id: "end_course", label: "End of Class" },
    { id: "students", label: "Students" },
  ];

  const courseRows = filteredCourses.map((course) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const startEnroll = new Date(course.start_enroll);
    const startCourse = new Date(course.start_course);
    const endCourse = new Date(course.end_course);

    return {
      id: course.id,
      module_name: course.module_name,
      course_name: course.name,
      start_enroll: formatter.format(startEnroll),
      start_course: formatter.format(startCourse),
      end_course: formatter.format(endCourse),
      students: course.students.map((student) => {
        return student.name;
      }),
    };
  });

  // Filter Students and Programs by Branch
  const filteredStudents = filteredBranches.includes("All")
    ? DBstudents
    : DBstudents.filter((student) =>
        filteredBranches.includes(student.branch_name)
      );

  const filteredPrograms = filteredBranches.includes("All")
    ? programs
    : programs.filter((program) => filteredBranches.includes(program.branch_name));

  // Charts Data
  const labelsEnrolled = filteredPrograms.map((program) => program.name);
  const dataValuesEnrolled = filteredPrograms.map(
    (program) => program.enrolled_students
  );

  const dataEnrolled = {
    labels: labelsEnrolled,
    datasets: [
      {
        label: "Students Enrolled",
        data: dataValuesEnrolled,
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
          "rgba(201, 203, 207, 0.5)",
          "rgba(255, 99, 71, 0.5)",
          "rgba(144, 238, 144, 0.5)",
          "rgba(173, 216, 230, 0.5)",
          "rgba(238, 130, 238, 0.5)",
          "rgba(255, 215, 0, 0.5)",
          "rgba(0, 255, 127, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(201, 203, 207, 1)",
          "rgba(255, 99, 71, 1)",
          "rgba(144, 238, 144, 1)",
          "rgba(173, 216, 230, 1)",
          "rgba(238, 130, 238, 1)",
          "rgba(255, 215, 0, 1)",
          "rgba(0, 255, 127, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const optionsEnrolled = {
    events: ["mousemove", "mouseout", "touchstart", "touchmove"],
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            let value = context.raw || 0;
            let total = context.dataset.data.reduce(
              (acc, curr) => acc + curr,
              0
            );
            let percentage = ((value / total) * 100).toFixed(2) + "%";
            return `${value} students (${percentage})`;
          },
        },
      },
    },
  };

  // Gender Chart
  const labelsGender = ["Male", "Female"];
  const dataValuesGender = filteredBranches.includes("All")
    ? [genderCounts.male.total, genderCounts.female.total]
    : [
        filteredBranches.reduce(
          (sum, branch) => sum + (genderCounts.male.branches[branch] || 0),
          0
        ),
        filteredBranches.reduce(
          (sum, branch) => sum + (genderCounts.female.branches[branch] || 0),
          0
        ),
      ];

  const dataGender = {
    labels: labelsGender,
    datasets: [
      {
        label: "Gender",
        data: dataValuesGender,
        backgroundColor: ["rgba(54, 162, 235, 0.5)", "rgba(255, 99, 132, 0.5)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const optionsGender = {
    events: ["mousemove", "mouseout", "touchstart", "touchmove"],
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            let value = context.raw || 0;
            let total = context.dataset.data.reduce(
              (acc, curr) => acc + curr,
              0
            );
            let percentage = ((value / total) * 100).toFixed(2) + "%";
            return `${value} students (${percentage})`;
          },
        },
      },
    },
  };

  // Nationality Chart
  const labelsNationality = ["Filipino", "Non-Filipino"];
  const dataValuesNationality = filteredBranches.includes("All")
    ? [nationalityCounts.filipino.total, nationalityCounts.nonFilipino.total]
    : [
        filteredBranches.reduce(
          (sum, branch) =>
            sum + (nationalityCounts.filipino.branches[branch] || 0),
          0
        ),
        filteredBranches.reduce(
          (sum, branch) =>
            sum + (nationalityCounts.nonFilipino.branches[branch] || 0),
          0
        ),
      ];

  const dataNationality = {
    labels: labelsNationality,
    datasets: [
      {
        label: "Nationality",
        data: dataValuesNationality,
        backgroundColor: [
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const optionsNationality = {
    events: ["mousemove", "mouseout", "touchstart", "touchmove"],
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            let value = context.raw || 0;
            let total = context.dataset.data.reduce(
              (acc, curr) => acc + curr,
              0
            );
            let percentage = ((value / total) * 100).toFixed(2) + "%";
            return `${value} students (${percentage})`;
          },
        },
      },
    },
  };

  // Learning Mode Chart
  const labelsLearningMode = ["Online", "Onsite"];
  const dataValuesLearningMode = filteredBranches.includes("All")
    ? [learningModeCounts.online.total, learningModeCounts.onsite.total]
    : [
        filteredBranches.reduce(
          (sum, branch) =>
            sum + (learningModeCounts.online.branches[branch] || 0),
          0
        ),
        filteredBranches.reduce(
          (sum, branch) =>
            sum + (learningModeCounts.onsite.branches[branch] || 0),
          0
        ),
      ];

  const dataLearningMode = {
    labels: labelsLearningMode,
    datasets: [
      {
        label: "Learning Mode",
        data: dataValuesLearningMode,
        backgroundColor: ["rgba(255, 99, 132, 0.5)", "rgba(54, 162, 235, 0.5)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const optionsLearningMode = {
    events: ["mousemove", "mouseout", "touchstart", "touchmove"],
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            let value = context.raw || 0;
            let total = context.dataset.data.reduce(
              (acc, curr) => acc + curr,
              0
            );
            let percentage = ((value / total) * 100).toFixed(2) + "%";
            return `${value} students (${percentage})`;
          },
        },
      },
    },
  };

  // Schedule Chart
  const labelsSchedule = [
    "Weekdays | Monday to Friday | 8:00AM - 2:00 PM",
    "Weekdays | Monday to Friday | 2:00 PM - 8:00 PM",
    "Weekends | Saturday & Sunday | 8:00 AM to 6:00 PM",
    "Night Class | Weekdays 5:00 PM - 9:00 PM & Saturdays 8:00 AM - 6:00 PM",
  ];

  const dataValuesSchedule = filteredBranches.includes("All")
    ? [
        scheduleCounts.weekdaysMorning.total,
        scheduleCounts.weekdaysAfternoon.total,
        scheduleCounts.weekends.total,
        scheduleCounts.nightClass.total,
      ]
    : [
        filteredBranches.reduce(
          (sum, branch) =>
            sum + (scheduleCounts.weekdaysMorning.branches[branch] || 0),
          0
        ),
        filteredBranches.reduce(
          (sum, branch) =>
            sum + (scheduleCounts.weekdaysAfternoon.branches[branch] || 0),
          0
        ),
        filteredBranches.reduce(
          (sum, branch) =>
            sum + (scheduleCounts.weekends.branches[branch] || 0),
          0
        ),
        filteredBranches.reduce(
          (sum, branch) =>
            sum + (scheduleCounts.nightClass.branches[branch] || 0),
          0
        ),
      ];

  const dataSchedule = {
    labels: labelsSchedule,
    datasets: [
      {
        label: "Schedule",
        data: dataValuesSchedule,
        backgroundColor: [
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
        ],
        borderColor: [
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const optionsSchedule = {
    events: ["mousemove", "mouseout", "touchstart", "touchmove"],
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            let value = context.raw || 0;
            let total = context.dataset.data.reduce(
              (acc, curr) => acc + curr,
              0
            );
            let percentage = ((value / total) * 100).toFixed(2) + "%";
            return `${value} students (${percentage})`;
          },
        },
      },
    },
  };

  // Fetch Data on Component Mount
  useEffect(() => {
    fetchStudents();
    getProgramsReport4();
    getActiveCourses();
    fetchMatchingLogs();
  }, []);

  useEffect(() => {
    
    
    if (studentsLoaded && programsLoaded && activeCoursesLoaded) {
      setLoading(false);
    }
  }, [studentsLoaded, programsLoaded, activeCoursesLoaded]);

  const applyFilter = () => {
    getActiveCourses();
    fetchStudents();
    getProgramsReport4();
    fetchMatchingLogs();
  };

      const [modalMessage, setModalMessage] = useState(""); // Modal message
      const [matchingLogs, setMatchingLogs] = useState([]); // State for matching logs
      
  
  
      const fetchMatchingLogs = async () => {
          try {
            const response = await axios.get("getmatching-logs/"); // Endpoint to fetch matching logs
            if (response.status === 200) {
              setMatchingLogs(response.data);
              console.log("lelellel", response.data);
            } else {
              setModalMessage(`Something went wrong. Status code: ${response.status}`);
              setShowModal(true);
            }
          } catch (error) {
            console.error("Error fetching matching logs:", error);
            setModalMessage("Something went wrong. Please try again later.");
            setShowModal(true);
          }
        };
    
      const countTimesMatched = (studentId) => {
          return matchingLogs.filter((log) => log.student === studentId).length;
        };
      
        console.log("Matching Logs:", matchingLogs);
        console.log("Student ID:", DBstudents);
  
    const studentHeaders = [
      { id: "name", numeric: false, disablePadding: true, label: "Name" },
      { id: "email", numeric: false, disablePadding: true, label: "Email" },
      { id: "ProgramName", numeric: false, disablePadding: true, label: "Program Name" },
      {
        id: "timesMatched",
        numeric: false,
        disablePadding: false,
        label: "Times Matched",
      },
    ];
  
    // Transform students data to fit EnhancedTable format
    const studentRows = filteredStudents.map((student) => ({
      id: student.user_id,
      name: student.name,
      email: student.email,
      ProgramName: student.program_name,
      timesMatched: countTimesMatched(student.user_id), 
    }));
  

  // Reports Data
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const reports = [
    { id: 1, name: "View Student Details" },
    { id: 2, name: "Active Courses" },
    { id: 3, name: "List of Programs" },
    { id: 4, name: "Summary of Student Data" },
    { id: 5, name: "Students Matched" },
  ];

  const sampleData = {
    1: (
      <>
        <h3>View Student</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Branch</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {selectedStudent != null ? (
              <tr>
                <td>{selectedStudent.studentid || "N/A"}</td>
                <td>{selectedStudent.name}</td>
                <td>{selectedStudent.branch_name}</td>
                <td>{selectedStudent.email}</td>
              </tr>
            ) : (
              <tr>
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
              </tr>
            )}
          </tbody>
        </Table>
      </>
    ),
    2: (
      <>
        <h3>Active Courses</h3>
        <EnhancedTable
          headers={courseHeaders}
          rows={courseRows}
          showSubmitButton={false}
          showSelectColumn={false}
        />
      </>
    ),
    3: (
      <>
        <h3>List of Programs</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Program Name</th>
              <th>Branch</th>
              <th>Price</th>
              <th>Modules Included</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.map((program) => (
              <tr key={program.id}>
                <td>{program.name}</td>
                <td>{program.branch_name}</td>
                <td>{program.price}</td>
                <td>
                  {program.modules.map((program) => program.name).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    ),
    4: (
      <>
        <div className="student-data-summary">
        <h2 style={{ textAlign: "center" }}>Summary of Student Data</h2>

          <section className="data-section">
          <h3 className="section-title">Programs and Students Enrolled</h3>
            <div className="chart-container">
              <Bar
                id="enrolled-chart"
                data={dataEnrolled}
                options={{
                  ...optionsEnrolled, // Spread existing options
                  plugins: {
                    legend: {
                      display: false, // Hide the legend
                    },
                  },
                }}
                height="700px"
                width="600px"
              />
            </div>
            <Table striped bordered hover className="data-table">
              <thead>
                <tr>
                  <th>Program Name</th>
                  <th>Students Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((program) => (
                  <tr key={program.id}>
                    <td>{program.name}</td>
                    <td>{program.enrolled_students}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </section>

          <section className="data-section">
            <h3 className="section-title">Gender Distribution</h3>
            <div className="chart-container">
              <Pie
                id="gender-chart"
                data={dataGender}
                options={{
                  ...optionsGender,
                  plugins: {
                    datalabels: {
                      formatter: (value, context) => {
                        const total =
                          context.chart.data.datasets[0].data.reduce(
                            (a, b) => a + b,
                            0
                          );
                        const percentage =
                          ((value / total) * 100).toFixed(2) + "%";
                        return value > 0 ? percentage : "";
                      },
                      color: "#666666",
                      font: {
                        size: 20,
                      },
                    },
                  },
                }}
              />
            </div>
            <Table striped bordered hover className="data-table">
              <thead>
                <tr>
                  <th>Gender</th>
                  <th>Number of Students</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Male</td>
                  <td>
                    {filteredBranches.includes("All")
                      ? genderCounts.male.total
                      : filteredBranches.reduce(
                          (sum, branch) =>
                            sum + (genderCounts.male.branches[branch] || 0),
                          0
                        )}
                  </td>
                </tr>
                <tr>
                  <td>Female</td>
                  <td>
                    {filteredBranches.includes("All")
                      ? genderCounts.female.total
                      : filteredBranches.reduce(
                          (sum, branch) =>
                            sum + (genderCounts.female.branches[branch] || 0),
                          0
                        )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </section>

          <section className="data-section">
            <h3 className="section-title">Nationality Distribution</h3>
            <div className="chart-container">
              <Pie
                id="nationality-chart"
                data={dataNationality}
                options={{
                  ...optionsNationality,
                  plugins: {
                    datalabels: {
                      formatter: (value, context) => {
                        const total =
                          context.chart.data.datasets[0].data.reduce(
                            (a, b) => a + b,
                            0
                          );
                        const percentage =
                          ((value / total) * 100).toFixed(2) + "%";
                        return percentage;
                      },
                      color: "#666666",
                      font: {
                        size: 20,
                      },
                    },
                  },
                }}
              />
            </div>
            <Table striped bordered hover className="data-table">
              <thead>
                <tr>
                  <th>Nationality</th>
                  <th>Number of Students</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Filipino</td>
                  <td>
                    {filteredBranches.includes("All")
                      ? nationalityCounts.filipino.total
                      : filteredBranches.reduce(
                          (sum, branch) =>
                            sum +
                            (nationalityCounts.filipino.branches[branch] || 0),
                          0
                        )}
                  </td>
                </tr>
                <tr>
                  <td>Non-Filipino</td>
                  <td>
                    {filteredBranches.includes("All")
                      ? nationalityCounts.nonFilipino.total
                      : filteredBranches.reduce(
                          (sum, branch) =>
                            sum +
                            (nationalityCounts.nonFilipino.branches[branch] ||
                              0),
                          0
                        )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </section>

          <section className="data-section">
            <h3 className="section-title">Learning Mode Distribution</h3>
            <div className="chart-container">
              <Pie
                id="learning-mode-chart"
                data={dataLearningMode}
                options={{
                  ...optionsLearningMode,
                  plugins: {
                    datalabels: {
                      formatter: (value, context) => {
                        const total =
                          context.chart.data.datasets[0].data.reduce(
                            (a, b) => a + b,
                            0
                          );
                        const percentage =
                          ((value / total) * 100).toFixed(2) + "%";
                        return value > 0 ? percentage : "";
                      },
                      color: "#666666",
                      font: {
                        size: 20,
                      },
                    },
                  },
                }}
              />
            </div>
            <Table striped bordered hover className="data-table">
              <thead>
                <tr>
                  <th>Learning Mode</th>
                  <th>Number of Students</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Online</td>
                  <td>
                    {filteredBranches.includes("All")
                      ? learningModeCounts.online.total
                      : filteredBranches.reduce(
                          (sum, branch) =>
                            sum +
                            (learningModeCounts.online.branches[branch] || 0),
                          0
                        )}
                  </td>
                </tr>
                <tr>
                  <td>Onsite</td>
                  <td>
                    {filteredBranches.includes("All")
                      ? learningModeCounts.onsite.total
                      : filteredBranches.reduce(
                          (sum, branch) =>
                            sum +
                            (learningModeCounts.onsite.branches[branch] || 0),
                          0
                        )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </section>

          <section className="data-section">
            <h3 className="section-title">Preferred Schedule Distribution</h3>
            <div className="chart-container">
              <Pie
                id="schedule-chart"
                data={dataSchedule}
                options={{
                  ...optionsSchedule,
                  plugins: {
                    datalabels: {
                      formatter: (value, context) => {
                        const total =
                          context.chart.data.datasets[0].data.reduce(
                            (a, b) => a + b,
                            0
                          );
                        const percentage =
                          ((value / total) * 100).toFixed(2) + "%";
                        return value > 0 ? percentage : "";
                      },
                      color: "#666666",
                      font: {
                        size: 20,
                      },
                    },
                  },
                }}
              />
            </div>
            <Table striped bordered hover className="data-table">
              <thead>
                <tr>
                  <th>Schedule</th>
                  <th>Number of Students</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Weekdays | Monday to Friday | 8:00 AM - 2:00 PM</td>
                  <td>
                    {filteredBranches.includes("All")
                      ? scheduleCounts.weekdaysMorning.total
                      : filteredBranches.reduce(
                          (sum, branch) =>
                            sum +
                            (scheduleCounts.weekdaysMorning.branches[branch] ||
                              0),
                          0
                        )}
                  </td>
                </tr>
                <tr>
                  <td>Weekdays | Monday to Friday | 2:00 PM - 8:00 PM</td>
                  <td>
                    {filteredBranches.includes("All")
                      ? scheduleCounts.weekdaysAfternoon.total
                      : filteredBranches.reduce(
                          (sum, branch) =>
                            sum +
                            (scheduleCounts.weekdaysAfternoon.branches[
                              branch
                            ] || 0),
                          0
                        )}
                  </td>
                </tr>
                <tr>
                  <td>Weekends | Saturday & Sunday | 8:00 AM to 6:00 PM</td>
                  <td>
                    {filteredBranches.includes("All")
                      ? scheduleCounts.weekends.total
                      : filteredBranches.reduce(
                          (sum, branch) =>
                            sum +
                            (scheduleCounts.weekends.branches[branch] || 0),
                          0
                        )}
                  </td>
                </tr>
                <tr>
                  <td>
                    Night Class | Weekdays 5:00 PM - 9:00 PM & Saturdays 8:00 AM
                    - 6:00 PM (Iloilo & Silay Only)
                  </td>
                  <td>
                    {filteredBranches.includes("All")
                      ? scheduleCounts.nightClass.total
                      : filteredBranches.reduce(
                          (sum, branch) =>
                            sum +
                            (scheduleCounts.nightClass.branches[branch] || 0),
                          0
                        )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </section>
        </div>
      </>
    ),
    5: (
      <>
 <EnhancedTable
              title="Students"
              headers={studentHeaders}
              rows={studentRows}
              showSubmitButton={false}
              showSelectColumn={false}
            />
      </>
    ),
  };

  // Handle Report Click
  const handleReportClick = (reportId) => {
    if (reportId === 1) {
      setShowModal(true);
    } else {
      setSelectedReport(reportId);
    }
  };

  // Handle Student Select
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setShowModal(false);
    setSelectedReport(1);
    fetchCourseAudit(student.user_id);
  };

  // Fetch Course Audit
  const fetchCourseAudit = async (student) => {
    try {
      const response = await axios.get(`/getcourseaudit/`, {
        params: { student },
      });

      if (response.status === 200) {
        setCourseAudit(response.data);
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

  // Log Report Export
  const logReportExport = async (reportType) => {
    const authTokens = localStorage.getItem("authTokens");
    let userId = null;

    if (authTokens) {
      try {
        const decoded = jwtDecode(authTokens);
        userId = decoded.user_id;
      } catch (error) {
        console.error("Error decoding auth tokens:", error);
      }
    }

    if (!userId) {
      console.error("User ID not found. Cannot log report.");
      return;
    }

    try {
      const response = await axios.post("reports/", {
        generated_by: userId,
        report_type: reportType,
      });

      if (response.status === 201) {
        console.log("Report logged successfully.");
      } else {
        console.error("Failed to log report:", response.data);
      }
    } catch (error) {
      console.error(
        "Error logging report:",
        error.response?.data || error.message
      );
    }
  };

  // Generate Student Details PDF
  const generateStudentDetails = async () => {
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
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 10, 10, 30, 30);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(schoolName, 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${dateTime} | By: ${generatedBy}`, 105, 27, {
      align: "center",
    });
    doc.line(10, 35, 200, 35);
    let yPosition = 40;

    // Student Basic Details
    if (selectedStudent) {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Student Information", 20, yPosition + 4);
      yPosition += 12;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Student Name: ${selectedStudent.name}`, 20, yPosition);
      doc.text(`Student ID: ${selectedStudent.studentid}`, 20, yPosition + 5);
      doc.text(`Branch: ${selectedStudent.branch_name}`, 20, yPosition + 10);
      yPosition += 15;

      // Student Additional Details
      const birthdate = new Date(selectedStudent.details.birthdate);
      const studentInfoRows = [
        ["Email", selectedStudent.email],
        ["Contact No.", selectedStudent.details.phoneNumber],
        ["Nationality", selectedStudent.details.nationality],
        ["Sex", selectedStudent.details.sex === "M" ? "Male" : "Female"],
        [
          "Birthdate",
          birthdate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        ],
        [
          "Preferred Schedule",
          selectedStudent.details.schedule === "wdMF8am2pm"
            ? "Weekdays | Monday to Friday | 8:00AM - 2:00 PM"
            : selectedStudent.details.schedule === "wdMF2pm8pm"
            ? "Weekdays | Monday to Friday | 2:00 PM - 8:00 PM"
            : selectedStudent.details.schedule === "weSS8am6pm"
            ? "Weekends | Saturday & Sunday | 8:00 AM - 6:00 PM"
            : "Night Class | Weekdays 5:00 PM - 9:00 PM & Saturdays 8:00 AM - 6:00 PM",
        ],
        [
          "Preferred Mode of Learning",
          selectedStudent.details.learningMode.charAt(0).toUpperCase() +
            selectedStudent.details.learningMode.slice(1),
        ],
      ];

      doc.autoTable({
        head: [["Field", "Value"]],
        body: studentInfoRows,
        startY: yPosition,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, halign: "center" },
        headStyles: { fillColor: [0, 150, 136] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: "auto" },
        },
        tableWidth: "auto",
        margin: { left: 20, right: 20 },
      });

      yPosition = doc.autoTable.previous.finalY + 15;

      // Curriculum Audit Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Curriculum Audit", 20, yPosition);
      yPosition += 5;

      const currAudit = courseAudit.map((course) => [
        course.name,
        course.grade,
        course.status,
      ]);

      doc.autoTable({
        head: [["Module/Course", "Grade", "Status"]],
        body: currAudit,
        startY: yPosition,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, halign: "center" },
        headStyles: { fillColor: [0, 150, 136] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: "auto" },
          2: { cellWidth: "auto" },
        },
        tableWidth: "auto",
        margin: { left: 20, right: 20 },
      });

      yPosition = doc.autoTable.previous.finalY + 15;
    }

    // End of Report
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("End of Report", 105, yPosition, { align: "center" });

    // Footer with Page Number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    }

    // Save the PDF
    const formattedDate = new Date().toISOString().split("T")[0];
    doc.save(
      `Student_Report_${selectedStudent.studentid}_${formattedDate}.pdf`
    );
    logReportExport("student_details");
  };

  // Generate Course List PDF
  const generateCourseList = async () => {
    // Fetch Logo as Base64
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

    const getCurrentDateTime = () => {
      const today = new Date();
      return today.toLocaleString(); // Combined date and time
    };

    const doc = new jsPDF();
    const schoolName = "Lifeline International Health Institute";
    const dateTime = getCurrentDateTime();
    const logoUrl = "https://via.placeholder.com/150"; // Placeholder for logo, replace with valid URL

    // Fetch the logo as Base64
    const logoBase64 = await fetchLogo(logoUrl);

    // Fetch generated by user
    const authTokens = localStorage.getItem("authTokens");
    let generatedBy = "Unknown User"; // Default if decoding fails

    if (authTokens) {
      try {
        const decoded = jwtDecode(authTokens);
        generatedBy = `${decoded.firstName} ${decoded.lastName}`;
      } catch (error) {
        console.error("Error decoding auth tokens:", error);
      }
    }

    // Function to add header to each page
    const addHeader = () => {
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 10, 10, 30, 30); // Use the fetched Base64 logo
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(schoolName, 105, 20, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${dateTime} | By: ${generatedBy}`, 105, 27, {
        align: "center",
      });
      doc.line(10, 35, 200, 35);
    };

    // Add header to the first page
    addHeader();
    let yPosition = 40; // Initial Y position for content

    // Section Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Course List", 20, yPosition + 4);
    yPosition += 16;

    const formatter = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    filteredCourses.forEach((course, index) => {
      const startEnroll = new Date(course.start_enroll);
      const startCourse = new Date(course.start_course);
      const endCourse = new Date(course.end_course);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Module Name: ${course.module_name}`, 24, yPosition + 5);
      doc.text(`Class: ${course.name}`, 24, yPosition + 10);
      doc.text(
        `Start of Enrollment: ${formatter.format(startEnroll)}`,
        24,
        yPosition + 15
      );
      doc.text(
        `Start of Class: ${formatter.format(startCourse)}`,
        24,
        yPosition + 20
      );
      doc.text(
        `End of Class: ${formatter.format(endCourse)}`,
        24,
        yPosition + 25
      );

      yPosition += 30;

      // Table Headers and Data
      const columns = ["Student Name", "Grade", "Finish Date"];
      const rows = course.students.map((student) => [
        student.name,
        student.grade ? student.grade : "N/A",
        student.finishDatetime
          ? formatter.format(new Date(student.finishDatetime))
          : "Ongoing",
      ]);

      // Improved Table Formatting with Full Width
      if (rows.length > 0) {
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
          theme: "grid", // Apply grid theme for clean borders
          styles: {
            fontSize: 10,
            cellPadding: 4,
            halign: "center", // Center-align text in cells
          },
          headStyles: {
            fillColor: [0, 150, 136], // Consistent header color
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240], // Light gray for alternating rows
          },
          columnStyles: {
            0: { cellWidth: "auto" },
            1: { cellWidth: "auto" },
            2: { cellWidth: "auto" },
          },
          tableWidth: "auto", // Ensure the table uses full width
          margin: { left: 20, right: 20 }, // Add margins for a more centered look
        });

        yPosition = doc.autoTable.previous.finalY + 10;
      } else {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text("No students yet enrolled in this class.", 24, yPosition + 5);
        yPosition += 20;
      }

      // Add a page break after each course except the last one
      if (index < filteredCourses.length - 1) {
        doc.addPage();
        addHeader(); // Add header to the new page
        yPosition = 40; // Reset Y position for the new page
      }
    });

    // End of Report
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("End of Report", 105, yPosition, { align: "center" });

    // Footer with Page Number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    }

    // Save the PDF with a professional file name
    const formattedDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    doc.save(`Course_List_Report_${formattedDate}.pdf`);
    logReportExport("Course_List_Report");
  };

  // Generate Program List PDF
  const generateProgramList = async () => {
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

    filteredPrograms.forEach((program, index) => {
      if (index > 0) doc.addPage(); // Add a new page for each program

      // Header
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 10, 10, 30, 30);
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(schoolName, 105, 20, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${dateTime} | By: ${generatedBy}`, 105, 27, {
        align: "center",
      });
      doc.line(10, 35, 200, 35);
      let yPosition = 40;

      // Program Title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(program.name, 105, yPosition + 4, { align: "center" });
      yPosition += 10;

      // Program Details
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Branch: ${program.branch_name}`, 20, yPosition);
      doc.text(`Price: ${program.price}`, 150, yPosition);
      yPosition += 8;

      // Section Title for Modules Table
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Modules & Average Grades", 20, yPosition);
      yPosition += 6;

      // Table Headers and Data
      const columns = ["Module Name", "Average Grade"];
      const rows = program.modules.map((module) => [
        module.name,
        program.average_grades[module.name] ?? "N/A",
      ]);

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
        columnStyles: {
          0: { cellWidth: "auto", halign: "left" },
          1: { cellWidth: "auto", halign: "right" },
        },
        tableWidth: "auto",
        margin: { left: 20, right: 20 },
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.text(`Page ${pageCount}`, 105, 290, { align: "center" });
    });

    // Save the PDF
    const formattedDate = new Date().toISOString().split("T")[0];
    doc.save(`Program_List_Report_${formattedDate}.pdf`);
    logReportExport("Program_List_Report");
  };

  const generateStudentMatchReport = async () => {
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
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 10, 10, 30, 30);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(schoolName, 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${dateTime} | By: ${generatedBy}`, 105, 27, {
      align: "center",
    });
    doc.line(10, 35, 200, 35);
    let yPosition = 40;

    // Report Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Student Match Report", 105, yPosition + 4, { align: "center" });
    yPosition += 10;

    // Table Headers and Data
    const columns = studentHeaders.map((header) => header.label);
    const rows = studentRows.map((student) => [
      student.name,
      student.email,
      student.ProgramName,
      student.timesMatched,
    ]);

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
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" },
        1: { cellWidth: "auto", halign: "left" },
        2: { cellWidth: "auto", halign: "left" },
        3: { cellWidth: "auto", halign: "right" },
      },
      tableWidth: "auto",
      margin: { left: 20, right: 20 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(10);
    doc.text(`Page ${pageCount}`, 105, 290, { align: "center" });

    // Save the PDF
    const formattedDate = new Date().toISOString().split("T")[0];
    doc.save(`Student_Match_Report_${formattedDate}.pdf`);
    logReportExport("Student_Match_Report");
  };


  // Generate Summary List PDF {OLD VERSION IS IN EXTRAS.JSX UNDER EXTRAS FOLDER}
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
        filteredPrograms.map((p) => [p.name, p.enrolled_students]),
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F8F9FA",
        minHeight: "100vh",
      }}
    >
      <Header brandName="Lifeline International Health Institute" />
      <NavBar
        items={[
          {
            type: "dropdown",
            text: "Admin",
            items: [
              { text: "Insights", url: "/insights" },
              { text: "Reports", url: "/sreports" },
            ],
          },
          { type: "link", url: "/Supervisor", text: "Dashboard" },
          { type: "link", url: "/logout", text: "Logout" },
        ]}
      />
      <div style={{ flex: 1, padding: "2rem 2rem", marginTop: "4rem" }}>
        <Container>
          <div className="mb-3">
            <Button
              variant={
                filteredBranches.includes("All") ? "primary" : "outline-primary"
              }
              onClick={() => setFilteredBranches(["All"])}
              className="me-2"
            >
              All Branches
            </Button>
            {branches.map((branch) => (
              <Button
                key={branch}
                variant={
                  filteredBranches.includes(branch)
                    ? "primary"
                    : "outline-primary"
                }
                onClick={() => toggleBranchFilter(branch)}
                className="me-2"
              >
                {branch}
              </Button>
            ))}
          </div>
          <div className="row justify-content-center">
            {loading ? (
              <Spinner animation="border" variant="primary" />
            ) : (
              <div className="col-lg-12">
                <div className="shadow p-4 bg-white rounded">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <h2 style={{ color: "#131827", margin: 0 }}>Reports</h2>
                    {selectedReport && (
                      <Button
                        variant="success"
                        onClick={() => {
                          switch (selectedReport) {
                            case 1:
                              generateStudentDetails();
                              break;
                            case 2:
                              generateCourseList();
                              break;
                            case 3:
                              generateProgramList();
                              break;
                            case 4:
                              generateSummaryList();
                              break;
                            case 5:
                              generateStudentMatchReport();
                              break;
                            default:
                              break;
                          }
                        }}
                      >
                        Generate PDF
                      </Button>
                    )}
                  </div>
                  {/* Date Filter Inputs */}
                  <div style={{ marginBottom: "1rem" }}>
                    <Row className="align-items-center justify-content-end">
                      <Col xs="auto">
                        <Form.Label>Start Date:</Form.Label>
                      </Col>
                      <Col xs="auto">
                        <Form.Control
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          style={{ maxWidth: "200px" }}
                        />
                      </Col>
                      <Col xs="auto">
                        <Form.Label>End Date:</Form.Label>
                      </Col>
                      <Col xs="auto">
                        <Form.Control
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          style={{ maxWidth: "200px" }}
                        />
                      </Col>
                      <Col xs="auto">
                        <Button variant="primary" onClick={applyFilter}>
                          Apply Filter
                        </Button>
                      </Col>
                    </Row>
                  </div>
                  <p>Select a report to generate:</p>
                  <Row className="mb-3 justify-content-between">
                    {reports.map((report) => (
                      <Col
                        key={report.id}
                        xs="auto" // Let the content determine the width
                        className="flex-grow-1" // Allow columns to grow and fill the space
                        style={{ padding: "0 5px", maxWidth: "20%" }} // Ensure equal spacing
                      >
                        <Button
                          variant="dark"
                          onClick={() => handleReportClick(report.id)}
                          style={{ width: "100%" }}
                        >
                          {report.name}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                  <Row>
                    <Col>
                      {selectedReport ? (
                        <>{sampleData[selectedReport]}</>
                      ) : null}
                    </Col>
                  </Row>
                </div>
              </div>
            )}
          </div>
        </Container>

        {/* Modal for selecting a student */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Select a Student</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Form.Control
              type="text"
              placeholder="Search for a student"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: "1rem" }}
            />
            {/* Responsive table inside the modal */}
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Branch</th>
                    <th>Email</th>
                    <th>Select</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents
                    .filter((student) =>
                      student.studentid !== null
                        ? student.name.toLowerCase().includes(searchTerm) ||
                          student.email.toLowerCase().includes(searchTerm) ||
                          student.studentid.includes(searchTerm)
                        : student.name.toLowerCase().includes(searchTerm) ||
                          student.email.toLowerCase().includes(searchTerm)
                    )
                    .map((student) => (
                      <tr key={student.id}>
                        <td>{student.studentid || "N/A"}</td>
                        <td>{student.name}</td>
                        <td>{student.branch_name}</td>
                        <td>{student.email}</td>
                        <td>
                          <Button
                            variant="primary"
                            onClick={() => handleStudentSelect(student)}
                          >
                            Select
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          </Modal.Body>
        </Modal>
      </div>
      <Footer brandName="Lifeline International Health Institute" />
    </div>
  );
};

export default SReports;
