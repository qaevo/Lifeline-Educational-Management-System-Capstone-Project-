import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import NavBar from "../../components/NavBar";
import useAxios from "../../utils/useAxios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Modal, Spinner, Button, Row, Col } from "react-bootstrap"; // Import Spinner and Button components
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  BarElement
} from "chart.js";
import "chartjs-adapter-date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, BarElement);

const Insights = () => {
  const [loading, setLoading] = useState(true); // Loading state
  const [enrollmentStats, setEnrollmentStats] = useState({
    daily_enrollment: [],
    daily_finish: []
  });
  const [programStats, setProgramStats] = useState({
    daily_enrollment: [],
    daily_enrollment_per_branch: [],
    total_enrollments: []
  });
  const [moduleStats, setModuleStats] = useState({
    module_stats: [],
  });
  const axios = useAxios(); // Axios instance
  const [selectedInsight, setSelectedInsight] = useState(1); // Selected insight state
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState(["All"]);
  const [timeFilter, setTimeFilter] = useState(["day", "Daily"]);



  const items = [
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
  ];

  const getBranches = async () => {
    try {
      const response = await axios.get(`/getbranches/`);

      if (response.status === 200) {
        setBranches(response.data.map((branch) => branch.name));
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
    }
    catch (error) {
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

  const getEnrollmentStats = async () => {
    try {
      const response = await axios.get(`/enrollmentstats/`);

      if (response.status === 200) {
        const data = response.data;
        setEnrollmentStats(data);
        setLoading(false);
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
    }
    catch (error) {
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

  const getProgramStats = async () => {
    try {
      const response = await axios.get(`/programstats/`);

      if (response.status === 200) {
        const data = response.data;
        setProgramStats(data);
        setLoading(false);
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
    }
    catch (error) {
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

  const getModuleStats = async () => {
    try {
      const response = await axios.get(`/modulestats/`);

      if (response.status === 200) {
        console.log("moduleStats", response.data);
        setModuleStats(response.data);
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
    }
    catch (error) {
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
    getBranches();
    getEnrollmentStats();
    getProgramStats();
    getModuleStats();
  }, []);

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

  const processData = (data, filterBranch = true) => {
    const grouped = {};
    const allDates = new Set();

    const filteredData = filterBranch ? data.filter(({ branch }) =>
      filteredBranches.includes("All") || filteredBranches.includes(branch)
    ) : data;

    const getPeriodKey = (dateStr) => {
      const date = new Date(dateStr);
      switch (timeFilter[0]) {
        case "week":
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay()); // Start of the week (Sunday)
          return startOfWeek.toISOString().split('T')[0];
        case "month":
          return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        case "year":
          return `${date.getFullYear()}`;
        case "day":
        default:
          return dateStr;
      }
    };

    const today = new Date();
    let startDate = new Date(Math.min(...data.map(({ date }) => new Date(date))));
    let endDate = today;

    switch (timeFilter[0]) {
      case "week":
        if ((endDate - startDate) / (1000 * 60 * 60 * 24) < 14) {
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 14);
        }
        break;
      case "month":
        if ((endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) < 2) {
          startDate = new Date(endDate);
          startDate.setMonth(endDate.getMonth() - 2);
        }
        break;
      case "year":
        if (endDate.getFullYear() - startDate.getFullYear() < 2) {
          startDate = new Date(endDate);
          startDate.setFullYear(endDate.getFullYear() - 2);
        }
        break;
      case "day":
      default:
        if ((endDate - startDate) / (1000 * 60 * 60 * 24) < 2) {
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 2);
        }
        break;
    }

    filteredData.forEach(({ date, enrollment_count }) => {
      const periodKey = getPeriodKey(date);
      if (!grouped[periodKey]) grouped[periodKey] = 0;
      grouped[periodKey] += enrollment_count;
      allDates.add(periodKey);
    });

    const dateList = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const formattedDate = getPeriodKey(currentDate.toISOString().split("T")[0]);
      if (!dateList.some(item => item.date === formattedDate)) {
        dateList.push({
          date: formattedDate,
          enrollment_count: grouped[formattedDate] || 0,
        });
      }

      switch (timeFilter[0]) {
        case "week":
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case "month":
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case "year":
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        case "day":
        default:
          currentDate.setDate(currentDate.getDate() + 1);
          break;
      }
    }

    return dateList;
  };

  const processModuleData = (data, filterBranch = true) => {
    const filteredData = filterBranch ? data.filter(({ branch }) =>
      filteredBranches.includes("All") || filteredBranches.includes(branch)
    ) : data;

    console.log("filteredData", filteredData);
    return filteredData;
  };

  const formatChartData = (data, label, color) => {
    return {
      labels: data.map((entry) => entry.date),
      datasets: [
        {
          label: label,
          data: data.map((entry) => entry.enrollment_count),
          borderColor: color,
          backgroundColor: color,
          tension: 0.3, // Smooth curve
          pointRadius: 1, // Circle markers
          pointBackgroundColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    };
  };

  const handleInsightClick = (insightId) => {
    setSelectedInsight(insightId);
  };

  const insights = [
    { id: 1, name: "Enrollments" },
    { id: 2, name: "Programs" },
    { id: 3, name: "Modules" }
  ]

  const insightsData = {
    1: (
      <>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Enrollment & Completion Statistics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Enrollment Chart */}
            <div className="bg-gray-100 p-4 rounded-lg" style={{ width: "100%", height: "250px" }}>
              <h3 className="text-lg font-semibold mb-2">{timeFilter[1]} Enrollments {filteredBranches.includes("All") ? "" : "for " + filteredBranches.join(", ")}</h3>
              <Line
                data={formatChartData(processData(enrollmentStats.daily_enrollment), "Enrollments", "rgba(75, 192, 192, 1)")}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: { legend: { display: true } },
                  scales: {
                    x: {
                      type: "time",
                      time: { unit: timeFilter[0], tooltipFormat: "yyyy-MM-dd" },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1, // Ensure only whole numbers
                        precision: 0 // Force integers
                      }
                    }
                  }
                }}
              />
            </div>

            {/* Completion Chart */}
            <div className="bg-gray-100 p-4 rounded-lg" style={{ width: "100%", height: "250px" }}>
              <h3 className="text-lg font-semibold mb-2">{timeFilter[1]} Completions {filteredBranches.includes("All") ? "" : "for " + filteredBranches.join(", ")}</h3>
              <Line
                data={formatChartData(processData(enrollmentStats.daily_finish), "Completions", "rgba(255, 99, 132, 1)")}
                options={{
                  maintainAspectRatio: false, // Ensures the height is controlled by the div
                  responsive: true,
                  plugins: { legend: { display: true } },
                  scales: {
                    x: {
                      type: "time",
                      time: { unit: timeFilter[0], tooltipFormat: "yyyy-MM-dd" }, // Show each day
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1, // Ensure only whole numbers
                        precision: 0 // Force integers
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </>
    ),
    2: (
      <>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-4">Total Enrollments by Program</h2>

          {/* Total Enrollments Graph */}
          <div className="row">
            <div className="col-12">
              <div className="bg-gray-100 p-4 rounded-lg mb-4" style={{ height: "250px" }}>
                <h3 className="text-lg font-semibold mb-2">
                  Total Enrollments {filteredBranches.includes("All") ? "" : "for " + filteredBranches.join(", ")}
                </h3>
                {programStats && programStats.daily_enrollment ? (
                  <Line
                    data={formatChartData(
                      processData(programStats.daily_enrollment).map(({ date, enrollment_count }) => ({
                        date,
                        enrollment_count
                      })),
                      "Total Enrollments",
                      "rgba(255, 165, 0, 1)"
                    )}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: { legend: { display: true } },
                      scales: {
                        x: {
                          type: "time",
                          time: { unit: timeFilter[0], tooltipFormat: "yyyy-MM-dd" }
                        },
                        y: {
                          beginAtZero: true,
                          ticks: { stepSize: 1, precision: 0 }
                        }
                      }
                    }}
                  />
                ) : (
                  <Spinner animation="border" variant="primary" />
                )}
              </div>
            </div>
          </div>

          {/* Branch-wise Graphs */}
          <div className="row justify-content-center">
            {programStats &&
              programStats.daily_enrollment_per_branch &&
              Object.entries(programStats.daily_enrollment_per_branch).map(([branch, data]) => (
                <div key={branch} className="col-12 col-md-6 col-lg-3 mb-4">
                  <div className="bg-gray-100 p-4 rounded-lg" style={{ height: "250px" }}>
                    <h3 className="text-lg font-semibold mb-2">{branch} Enrollments</h3>
                    <Line
                      data={formatChartData(
                        processData(data, false).map(({ date, enrollment_count }) => ({ date, enrollment_count })),
                        `${branch} Enrollments`,
                        "rgba(75, 192, 192, 1)"
                      )}
                      options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: { legend: { display: true } },
                        scales: {
                          x: {
                            type: "time",
                            time: { unit: timeFilter[0], tooltipFormat: "yyyy-MM-dd" }
                          },
                          y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, precision: 0 }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </>
    ),
    3: (
      <>
        <div className="row justify-content-center">
          {Object.values(
            processModuleData(moduleStats.module_stats).reduce((acc, module) => {
              if (!acc[module.name]) {
                acc[module.name] = {
                  name: module.name,
                  gradesystem: module.gradesystem,
                  students: [],
                };
              }
              acc[module.name].students.push(module);
              return acc;
            }, {})
          ).map((moduleGroup, index) => {
            const { name, gradesystem, students } = moduleGroup;
            let allGrades = moduleStats.grades[gradesystem] || [];

            if (gradesystem !== "Pass/Fail") {
              allGrades = allGrades.map((grade) => parseFloat(grade).toFixed(1));
            }

            // Initialize gradeCounts with default 0
            const gradeCounts = Object.fromEntries(allGrades.map((grade) => [grade, 0]));

            // Populate student counts from all students in the same module
            students.forEach(({ grade, student_count }) => {
              gradeCounts[grade] = (gradeCounts[grade] || 0) + student_count;
            });

            return (
              <div key={index} className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="bg-gray-100 p-4 rounded-lg" style={{ height: "250px" }}>
                  <h4 className="text-md font-semibold mb-2">{name}</h4>
                  <Bar
                    data={{
                      labels: allGrades,
                      datasets: [
                        {
                          label: "Student Count",
                          data: allGrades.map((grade) => gradeCounts[grade] || 0),
                          backgroundColor: "rgba(75, 192, 192, 0.6)",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: true } },
                      scales: {
                        x: {
                          title: { display: true, text: "Grade" },
                        },
                        y: {
                          title: { display: true, text: "Student Count" },
                          beginAtZero: true,
                          ticks: { stepSize: 1 },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />
      <main
        style={{ marginTop: "5rem", flex: 1, padding: "2rem", backgroundColor: "#f8f9fa" }}
      >
        <div className="container-fluid">
          <Row className="mb-3">
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "80vh" }}
              >
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              insights.map((insight) => (
                <Col
                  key={insight.id}
                  xs={12}
                  md={4}
                  lg={3}
                  className="mb-2"
                  style={{ padding: "0 5px" }}
                >
                  <Button
                    variant={insight.id == selectedInsight ? "outline-dark" : "dark"}
                    onClick={() => handleInsightClick(insight.id)}
                    style={{ width: "100%" }}
                  >
                    {insight.name}
                  </Button>
                </Col>
              ))
            )}
          </Row>

          <Row className="mb-3 align-items-center">
            <Col md="6">
              <strong className="me-2">Branches:</strong>
              <Button
                variant={filteredBranches.includes("All") ? "primary" : "outline-primary"}
                onClick={() => setFilteredBranches(["All"])}
                className="me-2"
              >
                All Branches
              </Button>
              {branches.map((branch) => (
                <Button
                  key={branch}
                  variant={filteredBranches.includes(branch) ? "primary" : "outline-primary"}
                  onClick={() => toggleBranchFilter(branch)}
                  className="me-2"
                >
                  {branch}
                </Button>
              ))}
            </Col>

            <Col md="6">
              <strong className="me-2">Time Period:</strong>
              <Button
                key="day"
                variant={timeFilter[0] === "day" ? "primary" : "outline-primary"}
                onClick={() => setTimeFilter(["day", "Daily"])}
                className="me-2"
              >Daily</Button>
              <Button
                key="week"
                variant={timeFilter[0] === "week" ? "primary" : "outline-primary"}
                onClick={() => setTimeFilter(["week", "Weekly"])}
                className="me-2"
              >Weekly</Button>
              <Button
                key="month"
                variant={timeFilter[0] === "month" ? "primary" : "outline-primary"}
                onClick={() => setTimeFilter(["month", "Monthly"])}
                className="me-2"
              >Monthly</Button>
              <Button
                key="year"
                variant={timeFilter[0] === "year" ? "primary" : "outline-primary"}
                onClick={() => setTimeFilter(["year", "Yearly"])}
                className="me-2"
              >Yearly</Button>
            </Col>
          </Row>

          <Row>
            <Col>
              {insightsData[selectedInsight]}
            </Col>
          </Row>
        </div>
      </main>
      <Footer brandName="Lifeline International Health Institute" />
    </div>
  );

};

export default Insights;
