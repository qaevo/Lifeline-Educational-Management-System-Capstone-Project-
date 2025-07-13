// LoginSignup.jsx
import React, { useContext, useState } from "react";
import {ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import email_icon from "../../components/assets/email.png";
import password_icon from "../../components/assets/password.png";
import AuthContext from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";

const LoginSignup = () => {
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);
  const [action, setAction] = useState("Login");

  const handleActionChange = (newAction) => {
    setAction(newAction);
  };

  const handleCreateAccount = () => {
    navigate("/register");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (email.length > 0 && password.length > 0) {
      loginUser(email, password, (errorMessage) => {
        // Display the error message using react-toastify
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
    } else {
      toast.error("Please fill in both email and password fields.", {
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

  const items = [
    { type: "link", url: "/aboutus", text: "About Us" },
    { type: "link", url: "/register", text: "Register" },
    { type: "link", url: "/login", text: "Login" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#F5F5F5",
      }}
    >
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />
      <ToastContainer /> {/* Add ToastContainer here */}

      <main
        style={{
          flex: "1",
          padding: "2rem 1rem",
          marginTop: "4rem",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: "500px",
            marginTop: "10rem",
            padding: "1.5rem",
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            className="header"
            style={{ textAlign: "center", marginBottom: "1.5rem" }}
          >
            <h2
              style={{
                color: "#009688",
                fontWeight: "600",
                fontSize: "1.5rem",
              }}
            >
              {action}
            </h2>
            <div
              style={{
                height: "2px",
                width: "40px",
                backgroundColor: "#009688",
                margin: "0.5rem auto",
              }}
            />
          </div>

          <form onSubmit={handleLogin}>
            <div
              className="input"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <img
                src={email_icon}
                alt="Email Icon"
                style={{ marginRight: "0.5rem", width: "20px" }}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                style={{
                  flex: "1",
                  padding: "0.6rem",
                  fontSize: "0.9rem",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
            </div>

            <div
              className="input"
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <img
                src={password_icon}
                alt="Password Icon"
                style={{ marginRight: "0.5rem", width: "20px" }}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                style={{
                  flex: "1",
                  padding: "0.6rem",
                  fontSize: "0.9rem",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
            </div>

            <div
              className="submit-container"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.75rem",
              }}
            >
              <button
                type="button"
                className="submit"
                onClick={handleCreateAccount}
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
                Register
              </button>

              <button
                type="submit"
                className="submit"
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
                {action === "Sign Up" ? "Sign Up" : "Login"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer brandName="Lifeline International Health Institute" />
    </div>
  );
};

export default LoginSignup;