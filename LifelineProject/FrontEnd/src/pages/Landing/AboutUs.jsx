import React from "react";
import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import logo from "../../components/assets/logo.png";

const AboutUs = () => {
  const items = [
    { type: "link", url: "/aboutus", text: "About Us" },
    localStorage.getItem("authTokens")
      ? { type: "link", url: "/login", text: "Dashboard" }
      : { type: "link", url: "/register", text: "Register" },
    localStorage.getItem("authTokens")
      ? { type: "link", url: "/logout", text: "Logout" }
      : { type: "link", url: "/login", text: "Login" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />

      <main style={{ flex: "1", padding: "4rem 3rem", textAlign: "center" }}>
        <div className="card shadow" style={{
          width: "90%",
          backgroundColor: "#FFFFFF",
          margin: "auto",
          padding: "3rem",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
          marginTop: "5.5rem",
        }}>
          <div className="card-body" style={{ textAlign: "center" }}>
            <div style={{ padding: "2rem 0" }}>
              <img
                src={logo}
                alt="Logo"
                width="150"
                height="150"
                className="d-inline-block align-center"
              />
              <div style={{ width: "60%", margin: "auto", marginTop: "2rem" }}>
                <h5 className="card-title" style={{ color: "#009688", fontWeight: "700" }}>
                  Lifeline International Health Institute is the PIONEER and has been the most reliable Caregiver Training provider in Western Visayas for over 21 years.
                </h5>
                <br />
                <h5 className="card-title" style={{ color: "#555555" }}>
                  Thousands of Lifeline graduates are all over the world. The training we provide has passed Canadian Embassy standards as well as other countries’ requirements.
                </h5>
                <br />
                <h5 className="card-title" style={{ color: "#555555" }}>
                  We are committed to quality, internationally benchmarked training and globally competent graduates. We partner and are registered with TESDA.
                </h5>
              </div>
            </div>

            <div style={{ paddingTop: "3rem" }}>
              <a
                href="https://www.facebook.com/lifelineinstitute"
                className="card-link"
                style={{
                  textDecoration: "none",
                  color: "#009688",
                  fontWeight: "600",
                  fontSize: "1.1rem"
                }}
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer brandName="Lifeline International Health Institute" />
    </div>
  );
};

export default AboutUs;
