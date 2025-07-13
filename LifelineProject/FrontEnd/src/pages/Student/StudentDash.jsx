import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import Card from "../../components/Card";
import useAxios from "../../utils/useAxios";
import { jwtDecode } from "jwt-decode"; // Corrected import statement
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Spinner, Modal, Button, Table } from "react-bootstrap"; // Import Spinner component
import "./StudentDash.css"; // Assuming there's a CSS file for styling
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Template } from "@pdfme/common";
import { generate } from "@pdfme/generator";
import { createPdf } from "@pdfme/common";

import template from "../../components/assets/template.json";

const StudentDash = () => {
  const axios = useAxios();
  const [moduleItems, setModuleItems] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [noModules, setNoModules] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileLoading, setFileLoading] = useState(false);
  const [birthCertFile, setBirthCertFile] = useState();
  const [proofOfPaymentFile, setProofOfPaymentFile] = useState(null);
  const [popfiles, setPopfiles] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [files, setFiles] = useState({});
  const [modules, setModules] = useState([]);
  const [courseAudit, setCourseAudit] = useState([]);
  const [isProgramFinished, setProgramFinished] = useState(false);

  const [matchingLogs, setMatchingLogs] = useState([]); // State for matching logs

const fetchMatchingLogs = async () => {
  try {
    const studentId = jwtDecode(localStorage.getItem("authTokens")).user_id;
    const response = await axios.get(`matching-logs/`, {
      params: { student_id: studentId }, // Fetch logs for the current student
    });

    if (response.status === 200) {
      setMatchingLogs(response.data);
    } else {
      toast.error(`Something went wrong. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching matching logs:", error);
    toast.error("Something went wrong. Please try again later.");
  }
};

const countTimesMatched = () => {
  const studentId = jwtDecode(localStorage.getItem("authTokens")).user_id
  return matchingLogs.filter((log) => log.student === studentId).length;; // The number of logs is the number of matches
};

  // Modal State
  const handleBirthCertFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setBirthCertFile(file);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        files.birthCert = reader.result;
        files.birthCertName = file.name;
      };
    } else {
      setBirthCertFile(null);
    }
  };

  const createCert = async () => {
    const firstname = jwtDecode(localStorage.getItem("authTokens")).firstName;
    const lastname = jwtDecode(localStorage.getItem("authTokens")).lastName;
    const fullname = `${firstname} ${lastname}`;
    const programName = jwtDecode(localStorage.getItem("authTokens")).programName;

    const latestDateTime = new Date(
      Math.max(...courseAudit.map((audit) => new Date(audit.finishDatetime)))
    );

    const formattedDate = latestDateTime.toISOString().split("T")[0]; // YYYY-MM-DD format

    try {
      const inputs = [
        {
          field1: fullname, // Dynamic value for field1
          field2: programName, // Dynamic value for field2
          Date: formattedDate,
        },
      ];

      const pdf = await generate({ template, inputs });
      const blob = new Blob([pdf.buffer], { type: "application/pdf" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Certificate.pdf";
      link.click();
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate. Please try again.", {
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

  const handleProofOfPaymentFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProofOfPaymentFile(file);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        files.proof_of_payment = reader.result;
        files.proof_of_paymentName = file.name;
      };
    } else {
      setProofOfPaymentFile(null);
    }
  };

  const getAnnouncements = async () => {
    try {
      const branch = jwtDecode(localStorage.getItem("authTokens")).branch;
      const response = await axios.get(`getpartialannouncements/${branch}`);
      if (response.status === 200) {
        setAnnouncements(response.data);
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

  // Fetch course audit data
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

  const getModulesOfStudent = async () => {
    try {
      const studentid = jwtDecode(localStorage.getItem("authTokens")).user_id;
      const programid = jwtDecode(localStorage.getItem("authTokens")).program;
      console.log("program id is ", programid);
      const response = await axios.get(`getenrollments`, {
        params: { student: studentid },
      });
      if (response.status === 200) {
        if (response.data.length === 0) {
          setNoModules(true);
        } else {
          console.log(response.data);
          setModuleItems(
            response.data.map((mod) => ({
              type: "link",
              text: `${mod.module_name} ${mod.course.name}`,
              url: mod.course.courseLink,
            }))
          );
        }
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

  const getModulesofProgram = async () => {
    const programid = jwtDecode(localStorage.getItem("authTokens")).program;
    try {
      const studentid = jwtDecode(localStorage.getItem("authTokens")).user_id;

      console.log("program id is ", programid);
      const response = await axios.get(`getmodulesofprogram/`, {
        params: { student: studentid, program_id: programid }, // Pass programId as a parameter
      });
      if (response.status === 200) {
        setModules(response.data);
        console.log("success", response.data);
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

  const fetchPopfiles = async () => {
    try {
      const studentid = jwtDecode(localStorage.getItem("authTokens")).user_id;
      const response = await axios.get(`file/${studentid}/proof_of_payment/`);
      if (response.status === 200) {
        setPopfiles(response.data);
        console.log("success", response.data);
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

  const fetchFile = async (userid, fileName, fileID = null) => {
    try {
      const response = fileID
        ? await axios.get(`file/${userid}/${fileName}/`, {
          params: { id: fileID },
        })
        : await axios.get(`file/${userid}/${fileName}/`);
      console.log(response);

      if (response.status === 200 && response.data.length > 0) {
        const base64String = response.data[0].file_data.split(",")[1];
        const filename = response.data[0].file_name;

        const binaryString = atob(base64String);

        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: "application/octet-stream" });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;

        a.click();

        a.remove();

        URL.revokeObjectURL(url);
      } else {
        if (response.data.length == 0) {
          toast.error("File not found.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
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
    getModulesOfStudent();
    getModulesofProgram();
    fetchCourseAudit();
    fetchMatchingLogs();
  }, []);

  useEffect(() => {
    getAnnouncements();
    fetchPopfiles();
  }, []);

  const handleFileUpload = async () => {
    // Check if at least one file is uploaded
    if (!files.birthCert && !files.proof_of_payment) {
      toast.error(
        "Please upload at least one file (Birth Certificate or Proof of Payment).",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
      return; // Exit the function early if no files are uploaded
    }

    // Handle birth certificate upload
    if (files.birthCert && files.birthCertName) {
      setFileLoading(true);
      try {
        const studentid = jwtDecode(
          localStorage.getItem("authTokens")
        ).user_id;
        const response = await axios.post(`/uploadfile/`, {
          user: studentid,
          type: "birthCert",
          file_name: files.birthCertName,
          file_data: files.birthCert,
        });

        if (response.status === 200) {
          toast.success("Birth Certificate updated!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else if (response.status === 201) {
          toast.success("Birth Certificate uploaded!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
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
        setFileLoading(false);
        setProofOfPaymentFile(null);
        setBirthCertFile(null);
      } catch (error) {
        console.error("Error uploading Birth Certificate:", error);
        toast.error("Something went wrong. Please try again later.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setFileLoading(false);
        setProofOfPaymentFile(null);
        setBirthCertFile(null);
      }
    }

    // Handle proof of payment upload
    if (files.proof_of_payment && files.proof_of_paymentName) {
      try {
        const studentid = jwtDecode(
          localStorage.getItem("authTokens")
        ).user_id;
        const response = await axios.post(`/uploadfile/`, {
          user: studentid,
          type: "proof_of_payment",
          file_name: files.proof_of_paymentName,
          file_data: files.proof_of_payment,
        });

        if (response.status === 200) {
          toast.success("Proof of Payment updated!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else if (response.status === 201) {
          toast.success("Proof of Payment uploaded!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
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
        console.error("Error uploading Proof of Payment:", error);
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
    }

    // Close the modal only if at least one file was uploaded
    if (files.birthCert || files.proof_of_payment) {
      setShowModal(false);
    }
  };

  const navItems =
    jwtDecode(localStorage.getItem("authTokens")).status == "NEW" ||
      jwtDecode(localStorage.getItem("authTokens")).status == "ON_HOLD"
      ? [
        { type: "dropdown", text: "Modules", items: moduleItems },
        { type: "link", url: "/Student", text: "Dashboard" },
        { type: "link", url: "/logout", text: "Logout" },
      ]
      : [
        { type: "link", url: "/StudentEnroll", text: "Enroll" },
        { type: "dropdown", text: "Modules", items: moduleItems },
        { type: "link", url: "/Student", text: "Dashboard" },
        { type: "link", url: "/logout", text: "Logout" },
      ];

  const totalAmount = Array.isArray(modules)
    ? modules.reduce((total, module) => total + module.price, 0)
    : 0;

  return (
    <div className="student-dashboard">
    <ToastContainer />
    <Header brandName="Lifeline International Health Institute" />
    <NavBar items={navItems} />
    <div className="dashboard-content">
      <div style={{ marginTop: "4rem" }} className="content-area">
        <div className="announcement-section">
          {loading ? (
            <div className="spinner-container">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : noModules ? (
            <div>
              {!isProgramFinished && (
                <div className="no-modules-message">
                  <p>You're currently not enrolled in any modules.</p>
                  <Button variant="primary" onClick={() => setShowModal(true)}>
                    Upload Missing Documents
                  </Button>
                </div>
              )}
              {isProgramFinished && (
                <div className="program-finished-message" style={{
                  backgroundColor: "white",
                  padding: "30px",
                  borderRadius: "15px",
                  textAlign: "center",
                  color: "#009688",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  maxWidth: "500px",
                  margin: "0 auto",
                  fontFamily: "Arial, sans-serif"
                }}>
                  <p style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginBottom: "20px"
                  }}>
                    Congratulations! You have completed your program.
                  </p>
                  <Button 
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
                    onClick={createCert}
                  >
                    Download Certificate
                  </Button>
                </div>
              )}
              {countTimesMatched() > 0 && (
                <div className="matched-clients-message" style={{
                  backgroundColor: "#e3f2fd",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  textAlign: "center",
                  border: "1px solid #90caf9",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}>
                  <p style={{ margin: 0, fontSize: "1rem", color: "#1976d2" }}>
                    You have been matched with <strong>{countTimesMatched()}</strong> potential clients. Please contact your Branch Manager for further details.
                  </p>
                </div>
              )}
              <h1 className="section-title" style={{ marginTop: "10px" }}>
                Announcements
              </h1>
              <Card items={announcements} />
            </div>
          ) : (
            <>
              <h1 className="section-title">Announcements</h1>
              <Card items={announcements} />
            </>
          )}
        </div>
      </div>
    </div>
    <Footer brandName="Lifeline International Health Institute" />
  </div>
  );
};

export default StudentDash;