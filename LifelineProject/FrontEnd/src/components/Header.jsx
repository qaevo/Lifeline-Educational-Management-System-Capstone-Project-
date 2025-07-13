import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import logo from "./assets/logo.png";

const Header = ({ brandName }) => {
  return (
    <header
      className="shadow p-3"
      style={{
        backgroundColor: "#FFFFFF",
        position: "fixed",
        width: "100%",
        top: 0,
        zIndex: 1030,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px",
      }}
    >
      <a className="navbar-brand d-flex align-items-center" href="/">
        <img
          src={logo}
          alt="Logo"
          width="50"
          height="50"
          className="d-inline-block align-center me-2"
        />
        <span className="fw-bold fs-4" style={{ color: "#000000" }}>{brandName}</span>
      </a>
    </header>
  );
};

export default Header;
