import React from "react";
import "bootstrap/dist/css/bootstrap.css";

const Jumbotron = ({ children }) => {
  return (
    <div style={{ padding: "2% 0", backgroundColor: "#F0F0F0",borderRadius: "10px", }}>
      <div
        className="row justify-content-center shadow-lg"
        style={{
          padding: "3% 4%",
          margin: "auto",
          width: "85%",
          borderRadius: "10px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          marginTop: "2rem",
        }}
      >
        <div className="mb-3" style={{ color: "#333", fontFamily: "'Inter', sans-serif" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Jumbotron;
