import React from "react";
import "bootstrap/dist/css/bootstrap.css";

const Footer = ({ brandName }) => {
  return (
    <footer
      className="shadow p-4"
      style={{
        backgroundColor: "#333",
        color: "#FFFFFF",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <p style={{ margin: 0 }}>
        &copy; {new Date().getFullYear()} {brandName}. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
