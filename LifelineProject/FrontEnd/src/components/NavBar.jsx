import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaInfoCircle,
  FaSignInAlt,
  FaBars,
  FaUserTie,
  FaThList,
  FaTh,
  FaPlusCircle,
  FaPlus
} from "react-icons/fa";
import "./NavBar.css"; // Import the CSS file for the dropdown animation
import { jwtDecode } from "jwt-decode";

const NavBar = ({ items }) => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index); // Toggle the dropdown
  };

  const getIcon = (text) => {
    switch (text.toLowerCase()) {
      case "about us":
        return <FaInfoCircle className="me-2" />;
      case "register":
        return <FaUser className="me-2" />;
      case "login":
        return <FaSignInAlt className="me-2" />;
      case "logout":
        return <FaSignInAlt className="me-2" />;
      case "admin":
        return <FaUserTie className="me-2" />;
      case "modules":
        return <FaThList className="me-2" />;
      case "dashboard" || "faculty":
        return <FaTh className="me-2" />;
      case "faculty":
        return <FaTh className="me-2" />;
      case "create announcement":
        return <FaPlusCircle className="me-2" />;
      case "enroll":
        return <FaPlus className="me-2" />;
      default:
        return null;
    }
  };

  const redirectToDashboard = () => {
    const role = jwtDecode(localStorage.getItem("authTokens")).role;

    switch (role) {
      case "STUDENT":
        navigate("/student");
        break;
      case "FACULTY":
        navigate("/faculty");
        break;
      case "BRANCH_MANAGER":
        navigate("/branchmanager");
        break;
      case "CASHIER":
        navigate("/cashier");
        break;
      case "SUPERVISOR":
        navigate("/supervisor");
        break;
      default:
        navigate("/");
        break;
    }
  }

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light"
      style={{
        backgroundColor: "#009688",
        position: "sticky",
        top: "83px",
        zIndex: 1030,
      }}
    >
      <a
        className="navbar-brand"
        style={{ color: "#FFFFFF", paddingLeft: "1rem", fontSize: "1.1rem",
          transition: "color 0.3s ease", margin:"auto"}}
      >
        {localStorage.getItem("authTokens")
          ? `Hello, ${jwtDecode(localStorage.getItem("authTokens")).firstName} ${jwtDecode(localStorage.getItem("authTokens")).lastName}!`
          : ''}
      </a>
      <button className="navbar-toggler" type="button" onClick={toggleMenu}>
        <FaBars style={{ color: "#FFF" }} />
      </button>
      <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}>
        <ul className="navbar-nav ms-auto">
          {items.map((item, index) => {
            if (item.type === "dropdown") {
              return (
                <li className="nav-item" key={index}>
                  <a
                    className="nav-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent the default anchor behavior
                      toggleDropdown(index);
                    }}
                    style={{
                      color: "#FFFFFF",
                      fontSize: "1.1rem",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = "#e0f7fa"; // Lighter text on hover
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "#FFFFFF"; // Revert to original color
                    }}
                  >
                    {getIcon(item.text)} {item.text}
                  </a>
                  <div className={`dropdown-menu-container ${openDropdown === index ? "show" : ""}`}>
                    <ul className="list-unstyled">
                      {item.items.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <a
                            className="dropdown-item"
                            href={subItem.url}
                            style={{
                              transition: "background-color 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#00796b"; // Darker background on hover
                              e.target.style.color = "#fff"; // White text on hover
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = ""; // Revert to default
                              e.target.style.color = ""; // Revert to default
                            }}
                          >
                            {subItem.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            } else {
              return (
                <li key={index} className="nav-item">
                  {item.text == "Dashboard"
                    ? (<a
                      className="nav-link"
                      href="#"
                      onClick={() => redirectToDashboard()}
                      style={{
                        color: "#FFFFFF",
                        fontSize: "1.1rem",
                        transition: "color 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = "#e0f7fa"; // Lighter text on hover
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = "#FFFFFF"; // Revert to original color
                      }}
                    > {getIcon(item.text)} {item.text}
                    </a>)
                    : (<a
                      className="nav-link"
                      href={item.url}
                      style={{
                        color: "#FFFFFF",
                        fontSize: "1.1rem",
                        transition: "color 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = "#e0f7fa"; // Lighter text on hover
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = "#FFFFFF"; // Revert to original color
                      }}
                    >
                      {getIcon(item.text)} {item.text}
                    </a>)}
                </li>
              );
            }
          })}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
