import React, { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import "bootstrap/dist/css/bootstrap.css";
import "./preStudentDashboard.css";
import CheckIcon from "../../components/CheckIcon";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import useAxios from "../../utils/useAxios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Jumbotron from "../../components/Jumbotron";

const PreStudentDashboard = () => {
  const userid = jwtDecode(localStorage.getItem("authTokens")).user_id;
  const local = JSON.parse(localStorage.getItem("userData"));
  const axios = useAxios();

  const [formData, setFormData] = useState({
    firstName: local.firstName,
    middleName: local.middleName,
    lastName: local.lastName,
    extensions: local.extensions,
    birthdate: local.details.birthdate,
    phoneNumber: local.details.phoneNumber,
    weight: local.details.weight,
    height: local.details.height,
    nationality: local.details.nationality,
    religion: local.details.religion,
    civilStatus: local.details.civilStatus,
    spouseName: local.details.spouseName,
    spouseOccupation: local.details.spouseOccupation,
    numChildren: local.details.numChildren,
    facebookLink: local.details.facebookLink,
    permanentAddress: local.details.permanentAddress,
    schoolName: local.details.schoolName,
    yearGraduated: local.details.yearGraduated,
    degreeCompleted: local.details.degreeCompleted,
    contactPersonName: local.details.contactPersonName,
    contactPersonNumber: local.details.contactPersonNumber,
    relationshipToContactPerson: local.details.relationshipToContactPerson,
    contactPersonAddress: local.details.contactPersonAddress,
    relativeStatus: local.details.relativeStatus,
    relativeCountry: local.details.relativeCountry,
    employerName: local.details.employerName,
    employerLocation: local.details.employerLocation,
    internetConnection: local.details.internetConnection,
    connectionModes: local.details.connectionModes,
    connectionQuality: local.details.connectionQuality,
    devices: local.details.devices ? local.details.devices : [],
  });

  const [birthCertFile, setBirthCertFile] = useState(local.details.birthCertName ? {name: local.details.birthCertName} : null);
  const [ProofOfPaymentFile, setProofOfPaymentFile] = useState(null);
  // const [allFieldsFilled, setAllFieldsFilled] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    const updatedDevices = [...formData.devices];

    if (checked) {
      updatedDevices.push(name);
    } else {
      const index = updatedDevices.indexOf(name);
      if (index !== -1) {
        updatedDevices.splice(index, 1);
      }
    }
    setFormData({ ...formData, devices: updatedDevices });
  };

  const handleBirthCertFileChange = (e) => {
    const file = e.target.files[0];
    setBirthCertFile(file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      formData.birthCert = reader.result;
      formData.birthCertName = file.name;
    };
  };

  const handleProofOfPaymentFileChange = (e) => {
    const file = e.target.files[0];
    setProofOfPaymentFile(file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      formData.proof_of_payment = reader.result;
      formData.proof_of_paymentName = file.name;
    };
  };
  const handleSaveWithoutValidation = () => {
    // Save data without validation
    updateUserProfileData(axios, userid, formData);
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.birthdate || new Date(formData.birthdate) > new Date()) {
      errors.birthdate = "Invalid Birthdate";
    }

    if (!formData.weight) {
      errors.weight = "Weight is required";
    }

    if (!formData.height) {
      errors.height = "Height is required";
    }

    if (!formData.permanentAddress) {
      errors.permanentAddress = "Permanent Address is required";
    }
    /*
    if (!formData.schoolName) {
      errors.push("School Name is required");
    }

    if (!formData.yearGraduated) {
      errors.push("Year Graduated is required");
    }
*/
    if (formData.relativeStatus !== "yes" && formData.relativeStatus !== "no") {
      errors.relativeStatus = "Please specify if you have relatives abroad";
    }

    if (formData.relativeStatus === "yes" && !formData.relativeCountry) {
      errors.relativeCountry = "Please provide the country of residence";
    }
    /*
    if (!formData.degreeCompleted) {
      errors.push("Degree Completed is required");
    }
*/
    if (!formData.civilStatus || formData.civilStatus === "") {
      errors.civilStatus = "Civil Status is required";
    }
    if (formData.civilStatus === "Married" && !formData.spouseName) {
      errors.spouseName = "Spouse Name is required";
    }
    if (
      formData.civilStatus === "Married" &&
      !formData.spouseOccupation
    ) {
      errors.spouseOccupation = "Spouse Occupation is required";
    }
    if (!formData.nationality || formData.nationality === "") {
      errors.nationality = "Nationality is required";
    }

    if (!formData.internetConnection || formData.internetConnection === "") {
      errors.internetConnection = "Internet Connection is required";
    }

    if (!formData.connectionModes || formData.connectionModes === "") {
      errors.connectionModes = "Connection Modes is required";
    }

    if (!formData.connectionQuality || formData.connectionQuality === "") {
      errors.connectionQuality = "Quality of Connection is required";
    }

    if (formData.devices.length === 0) {
      errors.devices = "Please select at least one device";
    }
    /*
    if (
      isNaN(parseInt(formData.yearGraduated)) ||
      formData.yearGraduated.length !== 4
    ) {
      errors.push("Year Graduated must be a valid 4-digit year");
    }
    */
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const { updateUserProfileData } = useContext(AuthContext);
  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (local.details.info_complete === "Info Complete") {
      formData.info_complete = "Info Complete";
      updateUserProfileData(axios, userid, formData);
    } else if (isValid && local.details.info_complete !== "Info Complete") {
      formData.info_complete = "Pending Approval";
      updateUserProfileData(axios, userid, formData);
      alert("Your information has been submitted successfully! It will be reviewed by the branch manager.");
    } else {
      window.scrollTo(0, 0);
    }
  };

  const items = [{ type: "link", url: "/logout", text: "Logout" }];

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />
      
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "3rem",
          //marginLeft: "280px",
          //padding: "2%",
        }}
      >
        <div
          className="container"
          style={{ maxWidth: "2800px", padding: "2%" }}
        >
          <Jumbotron>
          <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="section">
              <h2>Personal Information</h2>
              {local.details.hasOwnProperty("comments") &&
              local.details.comments !== "" ? (
                <div className="alert alert-danger" role="alert">
                  <p>Comment from branch manager: "{local.details.comments}"</p>
                </div>
              ) : null}
              <div className="form-row">
                <div className="form-group col">
                  <label>
                    First Name:{formData.firstName && <CheckIcon />}
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                  />
                </div>
                <div className="form-group col">
                  <label>
                    Middle Name: {formData.middleName && <CheckIcon />}
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                  />
                </div>
                <div className="form-group col">
                  <label>Last Name: {formData.lastName && <CheckIcon />}</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                  />
                </div>
                <div className="form-group col">
                  <label>
                    Extensions: {formData.extensions && <CheckIcon />}
                  </label>
                  <input
                    type="text"
                    name="extensions"
                    value={formData.extensions}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label>
                    Date of Birth:{" "}
                    <span style={{ color: "red" }}>
                      {validationErrors.birthdate && validationErrors.birthdate}
                    </span>
                    {!validationErrors.birthdate && formData.birthdate && (
                      <CheckIcon />
                    )}
                  </label>
                  <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                  />
                </div>
                <div className="form-group col">
                  <label>
                    Phone Number: {formData.phoneNumber && <CheckIcon />}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label>
                    Weight:{" "}
                    <span style={{ color: "red" }}>
                      {validationErrors.weight && validationErrors.weight}
                    </span>
                    {!validationErrors.weight && formData.weight && (
                      <CheckIcon />
                    )}
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="1000"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                    placeholder="Enter weight in kgs"
                  />
                </div>
                <div className="form-group col">
                  <label>
                    Height:{" "}
                    <span style={{ color: "red" }}>
                      {validationErrors.height && validationErrors.height}
                    </span>
                    {!validationErrors.height && formData.height && (
                      <CheckIcon />
                    )}
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                    placeholder="Enter height in cms"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label>
                    Civil Status:{" "}
                    <span style={{ color: "red" }}>
                      {validationErrors.civilStatus &&
                        validationErrors.civilStatus}
                    </span>
                    {!validationErrors.civilStatus && formData.civilStatus && (
                      <CheckIcon />
                    )}
                  </label>
                  <select
                    name="civilStatus"
                    value={formData.civilStatus}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                  >
                    <option value="">Select...</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Separated">Separated</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div className="form-group col">
                  <label>
                    Nationality: <span style={{ color: "red" }}>
                      {validationErrors.nationality && validationErrors.nationality}
                    </span>{formData.nationality && <CheckIcon />}
                  </label>
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                  >
                    <option value="">Select...</option>
                    <option value="Filipino">Filipino</option>
                    <option value="Non-Filipino">Non-Filipino</option>
                  </select>
                </div>
                <div className="form-group col">
                  <label>
                    Number of Children: {formData.numChildren && <CheckIcon />}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="numChildren"
                    value={formData.numChildren}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                  />
                </div>
              </div>

              {formData.civilStatus === "Married" && (
                <div className="form-row">
                  <div className="form-group col">
                    <label>
                      Spouse Name:{" "}
                      <span style={{ color: "red" }}>
                        {validationErrors.spouseName &&
                          validationErrors.spouseName}
                      </span>
                      {formData.spouseName && <CheckIcon />}
                    </label>
                    <input
                      type="text"
                      name="spouseName"
                      value={formData.spouseName}
                      onChange={handleChange}
                      disabled={local.details.info_complete === "Info Complete"}
                    />
                  </div>
                  <div className="form-group col">
                    <label>
                      Spouse Occupation:{" "}
                      <span style={{ color: "red" }}>
                        {validationErrors.spouseOccupation &&
                          validationErrors.spouseOccupation}
                      </span>
                      {formData.spouseOccupation && <CheckIcon />}
                    </label>
                    <input
                      type="text"
                      name="spouseOccupation"
                      value={formData.spouseOccupation}
                      onChange={handleChange}
                      disabled={local.details.info_complete === "Info Complete"}
                    />
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>
                  Religious Background: {formData.religion && <CheckIcon />}
                </label>
                <input
                  type="text"
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  disabled={local.details.info_complete === "Info Complete"}
                />
              </div>
              <div className="form-group">
                <label>
                  Facebook Link: {formData.facebookLink && <CheckIcon />}
                </label>
                <input
                  type="text"
                  name="facebookLink"
                  value={formData.facebookLink}
                  onChange={handleChange}
                  disabled={local.details.info_complete === "Info Complete"}
                />
              </div>
              <div className="form-group">
                <label>
                  Permanent Address:{" "}
                  <span style={{ color: "red" }}>
                    {validationErrors.permanentAddress &&
                      validationErrors.permanentAddress}
                  </span>
                  {!validationErrors.permanentAddress &&
                    formData.permanentAddress && <CheckIcon />}
                </label>
                <input
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  disabled={local.details.info_complete === "Info Complete"}
                />
              </div>
            </div>
            {/* Educational Background Section */}
            <div className="section">
              <h2>Educational Background</h2>
              <div className="form-group">
                <label>
                  School Name: {formData.schoolName && <CheckIcon />}
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  disabled={local.details.info_complete === "Info Complete"}
                />
              </div>
              <div className="form-group">
                <label>
                  Year Graduated: {formData.yearGraduated && <CheckIcon />}
                </label>
                <input
                  type="number"
                  name="yearGraduated"
                  value={formData.yearGraduated}
                  onChange={(e) => {
                    // Ensure only numeric values are entered
                    const re = /^[0-9\b]+$/;
                    if (e.target.value === "" || re.test(e.target.value)) {
                      // Limit the year to 4 digits
                      if (e.target.value.length <= 4) {
                        handleChange(e);
                      }
                    }
                  }}
                  disabled={local.details.info_complete === "Info Complete"}
                  placeholder="YYYY"
                  min="1900"
                  max={new Date().getFullYear()} // Set max year to current year
                />
              </div>
              <div className="form-group">
                <label>
                  Degree Completed: {formData.degreeCompleted && <CheckIcon />}
                </label>
                <input
                  type="text"
                  name="degreeCompleted"
                  value={formData.degreeCompleted}
                  onChange={handleChange}
                  disabled={local.details.info_complete === "Info Complete"}
                />
              </div>
            </div>
            {/* Emergency Contact Section */}
            <div className="section">
              <h2>Emergency Contact</h2>
              <div className="form-row">
                <div className="form-group col">
                  <label>
                    Contact Person Name:{" "}
                    {formData.contactPersonName && <CheckIcon />}
                  </label>
                  <input
                    type="text"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                  />
                </div>
                <div className="form-group col">
                  <label>
                    Contact Number:{" "}
                    <span style={{ color: "red" }}>
                      {validationErrors.contactPersonNumber &&
                        validationErrors.contactPersonNumber}
                    </span>
                    {!validationErrors.contactPersonNumber &&
                      formData.contactPersonNumber && <CheckIcon />}
                  </label>
                  <input
                    type="tel"
                    name="contactPersonNumber"
                    value={formData.contactPersonNumber}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  Relationship:{" "}
                  {formData.relationshipToContactPerson && <CheckIcon />}
                </label>
                <input
                  type="text"
                  name="relationshipToContactPerson"
                  value={formData.relationshipToContactPerson}
                  onChange={handleChange}
                  disabled={local.details.info_complete === "Info Complete"}
                />
              </div>
              <div className="form-group">
                <label>
                  Contact Person Address:{" "}
                  {formData.contactPersonAddress && <CheckIcon />}
                </label>
                <input
                  type="text"
                  name="contactPersonAddress"
                  value={formData.contactPersonAddress}
                  onChange={handleChange}
                  disabled={local.details.info_complete === "Info Complete"}
                />
              </div>
            </div>

            {/* Employment & Connectivity Section */}
            <div className="section">
              <h2>Employment and Connectivity</h2>
              <div className="form-group">
                <label>
                  Do you have relatives abroad?{" "}
                  <span style={{ color: "red" }}>
                    {validationErrors.relativeStatus &&
                      validationErrors.relativeStatus}
                  </span>
                  {!validationErrors.relativeStatus &&
                    formData.relativeStatus && <CheckIcon />}
                </label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    value="yes"
                    name="relativeStatus"
                    checked={formData.relativeStatus === "yes"}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    value="no"
                    name="relativeStatus"
                    checked={formData.relativeStatus === "no"}
                    onChange={handleChange}
                    disabled={local.details.info_complete === "Info Complete"}
                  />
                  <label className="form-check-label">No</label>
                </div>
                {formData.relativeStatus === "yes" && (
                  <div className="form-group">
                    <label>
                      Which country do your relatives live in?{" "}
                      <span style={{ color: "red" }}>
                        {validationErrors.relativeCountry &&
                          validationErrors.relativeCountry}
                      </span>
                      {!validationErrors.relativeCountry &&
                        formData.relativeCountry && <CheckIcon />}
                    </label>
                    <input
                      type="text"
                      name="relativeCountry"
                      value={formData.relativeCountry}
                      onChange={handleChange}
                      disabled={local.details.info_complete === "Info Complete"}
                    />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>
                  Employer Name: {formData.employerName && <CheckIcon />}
                </label>
                <input
                  type="text"
                  name="employerName"
                  value={formData.employerName}
                  onChange={handleChange}
                  disabled={local.details.info_complete === "Info Complete"}
                />
              </div>
              <div className="form-group">
                <label>
                  Employer Location:{" "}
                  {formData.employerLocation && <CheckIcon />}
                </label>
                <input
                  type="text"
                  name="employerLocation"
                  value={formData.employerLocation}
                  onChange={handleChange}
                  disabled={local.details.info_complete === "Info Complete"}
                />
              </div>
              <div className="form-group">
                <label>
                  Internet Connection:{" "}
                  <span style={{ color: "red" }}>
                    {validationErrors.internetConnection &&
                      validationErrors.internetConnection}
                  </span>
                  {!validationErrors.internetConnection &&
                    formData.internetConnection && <CheckIcon />}
                </label>
                <select
                  name="internetConnection"
                  value={formData.internetConnection}
                  onChange={handleChange}
                  disabled={local.details.info_complete === "Info Complete"}
                >
                  <option value="">Select...</option>
                  <option value="Wireless">Wireless</option>
                  <option value="Cellular">Cellular</option>
                  <option value="Fiber">Fiber</option>
                  <option value="Cable">Cable</option>
                  <option value="DSL">DSL/Broadband</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  Connection Modes:{" "}
                  <span style={{ color: "red" }}>
                    {validationErrors.connectionModes &&
                      validationErrors.connectionModes}
                  </span>
                  {!validationErrors.connectionModes &&
                    formData.connectionModes && <CheckIcon />}
                </label>
                <select
                  name="connectionModes"
                  value={formData.connectionModes}
                  onChange={handleChange}
                  disabled={local.details.info_complete === "Info Complete"}
                >
                  <option value="">Select...</option>
                  <option value="PostPaid">Post Paid</option>
                  <option value="PrePaid">Pre Paid</option>
                  <option value="FreeData">Free Data</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  Quality of Connection:{" "}
                  <span style={{ color: "red" }}>
                    {validationErrors.connectionQuality &&
                      validationErrors.connectionQuality}
                  </span>
                  {!validationErrors.connectionQuality &&
                    formData.connectionQuality && <CheckIcon />}
                </label>
                <select
                  name="connectionQuality"
                  value={formData.connectionQuality}
                  onChange={handleChange}
                  disabled={local.details.info_complete === "Info Complete"}
                >
                  <option value="">Select...</option>
                  <option value="Very Good (200 Mbps+)">
                    Very Good (200 Mbps and above)
                  </option>
                  <option value="Good (40-199 Mbps)">
                    Good (40 - 199 Mbps)
                  </option>
                  <option value="Slow (6-39 Mbps)">Slow (6 - 39 Mbps)</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  Device(s) used:{" "}
                  <span style={{ color: "red" }}>
                    {validationErrors.devices}
                  </span>
                  {!validationErrors.devices && formData.devices.length > 0 && (
                    <CheckIcon />
                  )}
                </label>
                <div className="form-check">
                  <div>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="Desktop"
                      name="Desktop"
                      id="Desktop"
                      checked={formData.devices.includes("Desktop")}
                      onChange={handleCheckboxChange}
                      disabled={local.details.info_complete === "Info Complete"}
                    />
                    <label className="form-check-label" htmlFor="Desktop">
                      Desktop
                    </label>
                  </div>
                  <div>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="Laptop"
                      name="Laptop"
                      id="Laptop"
                      checked={formData.devices.includes("Laptop")}
                      onChange={handleCheckboxChange}
                      disabled={local.details.info_complete === "Info Complete"}
                    />
                    <label className="form-check-label" htmlFor="Laptop">
                      Laptop
                    </label>
                  </div>
                  <div>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="Smartphone"
                      name="Smartphone"
                      id="Smartphone"
                      checked={formData.devices.includes("Smartphone")}
                      onChange={handleCheckboxChange}
                      disabled={local.details.info_complete === "Info Complete"}
                    />
                    <label className="form-check-label" htmlFor="Smartphone">
                      Smartphone
                    </label>
                  </div>
                  <div>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="Smart TV"
                      name="Smart TV"
                      id="SmartTV"
                      checked={formData.devices.includes("Smart TV")}
                      onChange={handleCheckboxChange}
                      disabled={local.details.info_complete === "Info Complete"}
                    />
                    <label className="form-check-label" htmlFor="SmartTV">
                      Smart TV
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="section">
              <h2>Uploads</h2>
              <div className="file-upload">
                <label>Upload Birth Certificate:</label>
                <input
                  type="file"
                  name="birthCertFile"
                  onChange={handleBirthCertFileChange}
                  disabled={local.details.info_complete === "Info Complete"}
                />
                {birthCertFile && <p>File name: {birthCertFile.name}</p>}
              </div>
              <div className="file-upload">
                <label>Upload Proof of Payment:</label>
                <input
                  type="file"
                  name="proofOfPaymentFile"
                  onChange={handleProofOfPaymentFileChange}
                  disabled={local.details.info_complete !== "Info Complete"}
                />
                {ProofOfPaymentFile && (
                  <p>File name: {ProofOfPaymentFile.name}</p>
                )}
              </div>
            </div>
            
            <div class="text-md-end">
              <button
                class="btn btn-info"
                type="button"
                onClick={handleSaveWithoutValidation}
                disabled={local.details.info_complete === "Info Complete"}
                style={{
                  padding: "0.6rem 1.2rem",  // Reduced padding for smaller buttons
                  fontSize: "0.9rem",  // Adjusted font size
                  backgroundColor: "#178AC9",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginRight: "0.3rem",
                  transition: "background-color 0.3s ease, transform 0.3s ease", // Smooth transition
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#147A9B"; // Darker blue on hover
                  e.target.style.transform = "scale(1.05)"; // Slightly larger on hover
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#178AC9"; // Revert to original color
                  e.target.style.transform = "scale(1)"; // Reset scale
                }}
              >
                Save
              </button>
              <button style={{
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
                }} type="Submit">
                Submit
              </button>
            </div>
          </form>
          </Jumbotron>
        </div>
      </div>
      <Footer brandName={"Lifeline International Health Institute"} />
    </div>
  );
};

export default PreStudentDashboard;
