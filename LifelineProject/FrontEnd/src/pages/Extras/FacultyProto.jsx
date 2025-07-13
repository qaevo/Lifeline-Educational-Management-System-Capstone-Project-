import React, { useEffect, useState, useContext } from "react";
import Jumbotron from "../../components/Jumbotron";
import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import useAxios from "../../utils/useAxios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AuthContext from "../../context/AuthContext";

const FacultyProto = () => {
  const axios = useAxios();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const [modules, setModules] = useState([]);
  const [cardItems, setCardItems] = useState([]);

  const items = [
    { type: "link", url: "/CreateAn", text: "Create Announcement" },
    { type: "link", url: "/addClass", text: "Add Class" },
    { type: "link", url: "/Faculty", text: "Faculty" },
    { type: "link", url: "/logout", text: "Logout" },
    {/*
      type: "dropdown",
      text: "User",
      items: [
        //{ url: "/faculty/user", text: "Profile" },
        { url: "/logout", text: "Logout" },
      ],
    */},
  ];

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
        setCardItems(
          data.courses.map((classroom) => ({
            title: classroom.name,
            link: classroom.alternateLink,
            linkname: "Go to Classroom",
          }))
        );
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
      const currentUrl = window.location.href;
      const nextUrl = "/Faculty";
      //   console.log(currentUrl);
      window.location.href = `https://localhost:8000/api/login/?next=${nextUrl}`;
      //    window.location.href = "https://localhost:8000/api/login/";
    } catch (error) {
      console.error("Error during login:", error);
      setError("Error during login");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />
      <Footer brandName="Lifeline International Health Institute" />
      <div
        style={{
          marginTop: "1rem",
          marginLeft: "280px",
          width: "100%",
          padding: "2%",
        }}
      >
        <Jumbotron>
          <Card items={cardItems} />
          <div
            className="d-flex justify-content-center"
            style={{ marginTop: "1rem" }}
          >
            <button className="btn btn-dark" onClick={handleLogin}>
              Get Google Classroom courses
            </button>
          </div>
        </Jumbotron>
      </div>
    </div>
  );
};

export default FacultyProto;
