import React, { useEffect, useState, useContext } from "react";
import NavBar from "../../components/NavBar";
import Jumbotron from "../../components/Jumbotron";
import Card from "../../components/Card";
import useAxios from "../../utils/useAxios";
import { jwtDecode } from "jwt-decode";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthContext from "../../context/AuthContext";

const StudentProto = () => {
  const axios = useAxios();
  const [classrooms, setClassrooms] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const [modules, setModules] = useState([]);
  
  const getModules = async () => {
    try {
      const response = await axios.get(`modulelist/`);
      if (response.status === 200) {
        setModules(response.data);
      } else {
        alert("Something went wrong. " + response.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  useEffect(() => {
    getModules();
  }, []);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await fetch("https://localhost:8000/api/classroom/", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setClassrooms(data.courses);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  const handleLogin = async () => {
    try {
      window.location.href = "https://localhost:8000/api/login/";
    } catch (error) {
      console.error("Error during login:", error);
      setError("Error during login");
    }
  };

  const [announcements, setAnnouncements] = useState([]);
  const getAnnouncements = async () => {
    try {
      const response = await axios.get(`getannouncements/`);
      if (response.status === 200) {
        setAnnouncements(response.data);
        console.log("Announcements", announcements);
      } else {
        alert("Something went wrong. " + response.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  useEffect(() => {
    getAnnouncements();
  }, []);

  const [moduleItems, setModuleItems] = useState([]);
  const getModulesOfStudent = async () => {
    try {
      const studentid = jwtDecode(localStorage.getItem("authTokens")).user_id;
      const response = await axios.get(`enrollmentslist/s/${studentid}`);
      if (response.status === 200) {
        const moduleItems = response.data.map((item) => {
          const module = modules.find((module) => item.course === module.id);
          return {
            text: module.name,
            description: module.description,
            url: module.studentLink,
          };
        });
        setModuleItems(moduleItems);
      } else {
        alert("Something went wrong. " + response.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  useEffect(() => {
    if (modules.length > 0) {
      getModulesOfStudent();
    }
  }, [modules]);

  const navItems = [
    {
      type: "dropdown",
      text: "Modules",
      items: classrooms
        .map((classroom) => ({
          url: classroom.alternateLink,
          text: classroom.name,
          target: "_blank",
          rel: "noreferrer",
        }))
        .sort((a, b) => a.text.localeCompare(b.text)),
    },
    { type: "link", url: "/", text: "Dashboard" },
    { type: "link", url: "/logout", text: "Logout" },
    {/*
      type: "dropdown",
      text: "User",
      items: [
        { url: "/profile", text: "Profile", description: "" },
        { url: "/logout", text: "Logout", description: "" },
      ],
    */},
  ];

  return (
     <div style={{ display: "flex" }}>
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={navItems} />
      <Footer brandName="Lifeline International Health Institute" />
      <div
        style={{
          //marginTop: "0.5rem",
          marginLeft: "280px",
          width: "100%",
          padding: "2%",
        }}
      >
        <Jumbotron>
          <Card items={announcements} />
          {!user && (
            <div className="d-flex justify-content-center" style={{ marginTop: "1rem" }}>
              <button className="btn btn-dark" onClick={handleLogin}>
                Get Courses
              </button>
            </div>
          )}
        </Jumbotron>
      </div>
    </div>
  );
};

export default StudentProto;
