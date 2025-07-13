import React, { useContext, useEffect, useState } from "react";
import "./Register.css";
import Page1 from "./Page1";
import Page2 from "./Page2";
import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { Modal, Button } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthday, setBirthday] = useState("");
  const [sex, setSex] = useState("");
  const [nationality, setNationality] = useState("");
  const [learningMode, setLearningMode] = useState("onsite");
  const [branch, setBranch] = useState("1");
  const [schedule, setSchedule] = useState("wdMF8am2pm");
  const [allprograms, setAllPrograms] = useState({});
  const [programs, setPrograms] = useState({});
  const [program, setProgram] = useState(1);
  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const getPrograms = async () => {
    try {
      await fetch(`https://localhost:8000/api/getprogram/999/`, {
        method: "GET",
      })
        .then((res) => res.json())
        .then((json) => {
          setAllPrograms(json);
          setPrograms(json);
        });
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
    getPrograms();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    const userprofile = {
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      role: "STUDENT",
      status: "NEW",
      branch: branch,
      program: program,
      details: {
        birthdate: birthday,
        phoneNumber: phoneNumber,
        sex: sex,
        nationality: nationality,
        learningMode: learningMode,
        schedule: schedule,
      },
    };

    await registerUser(email, password, userprofile, "Register");
    navigate("/login"); // Redirect to login after registration
  };

  const handleNext = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleBack = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const items = [
    { type: "link", url: "/aboutus", text: "About Us" },
    { type: "link", url: "/register", text: "Register" },
    { type: "link", url: "/Login", text: "Login" },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <Page1
            firstName={[firstName, setFirstName]}
            middleName={[middleName, setMiddleName]}
            lastName={[lastName, setLastName]}
            password={[password, setPassword]}
            email={[email, setEmail]}
            phoneNumber={[phoneNumber, setPhoneNumber]}
            birthday={[birthday, setBirthday]}
            sex={[sex, setSex]}
            nationality={[nationality, setNationality]}
            onNext={handleNext}
            onBackToLogin={handleBackToLogin}
          />
        );
      case 2:
        return (
          <Page2
            learningMode={[learningMode, setLearningMode]}
            branch={[branch, setBranch]}
            schedule={[schedule, setSchedule]}
            program={[program, setProgram]}
            programs={[programs, setPrograms]}
            allprograms={allprograms}
            handleRegister={handleRegister}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />
      <main style={{ flex: 1, padding: "2rem", backgroundColor: "#f8f9fa" }}>
        <div className="container" style={{ marginTop: "6rem" }}>
          <h1 className="text" style={{ color: "#009688" }}>
            Registration Form
          </h1>

          <form onSubmit={handleRegister} className="inputs">
            {renderPage()}
          </form>
        </div>
      </main>
      <Footer brandName="Lifeline International Health Institute" />
    </div>
  );
};

export default Register;
