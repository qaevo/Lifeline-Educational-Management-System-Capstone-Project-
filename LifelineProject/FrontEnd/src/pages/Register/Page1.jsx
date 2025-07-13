import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Page1 = ({
  firstName: [firstName, setFirstName],
  middleName: [middleName, setMiddleName],
  lastName: [lastName, setLastName],
  password: [password, setPassword],
  email: [email, setEmail],
  phoneNumber: [phoneNumber, setPhoneNumber],
  birthday: [birthday, setBirthday],
  sex: [sex, setSex],
  nationality: [nationality, setNationality],
  onNext,
  onBackToLogin,
}) => {
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleMiddleNameChange = (event) => {
    setMiddleName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleBirthdayChange = (event) => {
    setBirthday(event.target.value);
  };

  const handleSexChange = (event) => {
    setSex(event.target.value);
  };

  const handleNationalityChange = (event) => {
    setNationality(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleBackToLogin = () => {
    console.log("Going back to login page");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let hasErrors = false;

    // First Name and Last Name validation
    if (!firstName.trim()) {
      toast.error("First Name is required");
      hasErrors = true;
    }
    if (!lastName.trim()) {
      toast.error("Last Name is required");
      hasErrors = true;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast.error("Invalid email format");
      hasErrors = true;
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      hasErrors = true;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      hasErrors = true;
    }

    // Phone number validation (Philippine standard)
    const phonePattern = /^(09|\+639)\d{9}$/;
    if (!phonePattern.test(phoneNumber)) {
      toast.error("Invalid Philippine phone number format");
      hasErrors = true;
    }

    // Birthday validation
    const today = new Date();
    const inputBirthday = new Date(birthday);
    const minDate = new Date("1900-01-01"); // Minimum allowed date
    if (inputBirthday >= today || inputBirthday < minDate) {
      toast.error("Birthday must be a valid date after 1900 and in the past");
      hasErrors = true;
    }

    // Sex validation
    if (sex === "") {
      toast.error("Please select valid sex");
      hasErrors = true;
    }

    // Nationality validation
    if (nationality === "") {
      toast.error("Please select valid nationality");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    // Proceed with onNext
    onNext();
  };

  return (
    <div className="page1-content">
      <ToastContainer />
      <div className="row">
        <div className="col-md-6 mt-md-0 mt-3">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            value={firstName}
            onChange={handleFirstNameChange}
            required
          />
        </div>
        <div className="col-md-6 mt-md-0 mt-3">
          <label htmlFor="middleName">Middle Name</label>
          <input
            type="text"
            className="form-control"
            id="middleName"
            value={middleName}
            onChange={handleMiddleNameChange}
            required
          />
        </div>
      </div>
      <div className="row" style={{ marginTop: "10px" }}>
        <div className="col-md-6 mt-md-0 mt-3">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            className="form-control"
            id="lastName"
            value={lastName}
            onChange={handleLastNameChange}
            required
          />
        </div>
        <div className="col-md-6 mt-md-0 mt-3">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
      </div>
      <div className="row" style={{ marginTop: "10px" }}>
        <div className="col-md-6 mt-md-0 mt-3">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <div className="col-md-6 mt-md-0 mt-3">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
          />
        </div>
      </div>
      <div className="row" style={{ marginTop: "10px" }}>
        <div className="col-md-6 mt-md-0 mt-3">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            className="form-control"
            id="phoneNumber"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            required
          />
        </div>
        <div className="col-md-6 mt-md-0 mt-3">
          <label htmlFor="birthday">Birthday </label>
          <input
            type="date"
            className="form-control"
            id="birthday"
            value={birthday}
            onChange={handleBirthdayChange}
            required
          />
        </div>
      </div>
      <div className="row" style={{ marginTop: "10px" }}>
        <div className="col-md-6 mt-md-0 mt-3">
          <label htmlFor="sex">Sex </label>
          <select
            id="sex"
            className="form-control"
            value={sex}
            onChange={handleSexChange}
          >
            <option value="" disabled>
              Select Sex
            </option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
        <div className="col-md-6 mt-md-0 mt-3">
          <label htmlFor="nationality">Nationality:</label>
          <select
            name="nationality"
            className="form-control"
            id="nationality"
            value={nationality}
            onChange={handleNationalityChange}
          >
            <option value="">Select...</option>
            <option value="Filipino">Filipino</option>
            <option value="Non-Filipino">Non-Filipino</option>
          </select>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-12">
          <label htmlFor="alreadyRegistered">
            Already have an account?{" "}
            <a href="#" style={{ color: "#009688" }} onClick={onBackToLogin}>
              Login instead.
            </a>
          </label>
        </div>
      </div>
      <div className="d-flex justify-content-end mt-4">
        <button
          style={{
            padding: "0.6rem 1.2rem", // Reduced padding for smaller buttons
            fontSize: "0.9rem", // Adjusted font size
            backgroundColor: "#009688",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background-color 0.3s ease, transform 0.3s ease", // Smooth transition
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#00796b"; // Darker green on hover
            e.target.style.transform = "scale(1.05)"; // Slightly larger on hover
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#009688"; // Revert to original color
            e.target.style.transform = "scale(1)"; // Reset scale
          }}
          onClick={handleSubmit}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Page1;
