import React, { useContext, useState } from "react";
import NavBar from "../../components/NavBar";
import { useLocation, useNavigate } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import AuthContext from "../../context/AuthContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const ViewDetails = () => {
  const axiosInstance = useAxios();
  const location = useLocation();
  const studentData = location.state.studentData;
  const navigate = useNavigate();

  // State to track comments and acceptance status
  const [comments, setComments] = useState("");

  const { updateUserProfileData } = useContext(AuthContext);
  // Function to handle accepting student details
  const handleAccept = async (e) => {
    // Logic to handle acceptance (e.g., API call)
    e.preventDefault();
    studentData.details.info_complete = "Info Complete";
    const { firstName, middleName, lastName, extensions, details } = studentData;

    try {
      await updateUserProfileData(axiosInstance, studentData.user_id, {
        firstName,
        middleName,
        lastName,
        extensions,
        ...details,
      });
      navigate("/branchmanager");
      window.location.reload();
    } catch (error) {
      console.error("Failed to request revision:", error);
      // Optionally, display an error message to the user
    }
  };

  const getFile = async () => {
    try {
      const response = await axiosInstance.get(
        `file/${studentData.user_id}/birthCert/`
      );

      if (response.status === 200 && response.data.length > 0) {
        console.log(response.data[0].file_data);
        const base64String = response.data[0].file_data.split(",")[1];
        const filename = response.data[0].file_name;

        const binaryString = atob(base64String);

        // Create a Uint8Array to hold the binary data
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Create a Blob object from the binary data
        const blob = new Blob([bytes], { type: "application/octet-stream" });

        // Create a URL representing the file
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;

        // Simulate a click on the anchor element to initiate the download
        a.click();

        // Remove the anchor element from the DOM
        a.remove();

        // Clean up by revoking the object URL
        URL.revokeObjectURL(url);
      } else {
        alert("File not found");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  const handleRequestRevision = async (e) => {
    e.preventDefault();
    console.log("Revision requested with comments:", comments);

    studentData.details.comments = comments;
    studentData.details.info_complete = "Awaiting Revisions";
    const { firstName, middleName, lastName, extensions, details } = studentData;

    try {
      await updateUserProfileData(axiosInstance, studentData.user_id, {
        firstName,
        middleName,
        lastName,
        extensions,
        ...details,
      });
      navigate("/branchmanager");
    } catch (error) {
      console.error("Failed to request revision:", error);
      // Optionally, display an error message to the user
    }
  };


  const items = [{ type: "link", url: "/logout", text: "Logout" }];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />
      <div
        style={{
          width: "100%",
          padding: "2%",
        }}
      >
        <div
          class="container"
          style={{ maxWidth: "2800px"}}
        >
          <main style={{ flex: 1, width: "100%",  padding: "4rem 3rem" }}>
            <div className="container mt-5" style={{ maxWidth: "2800px" }}>
              <h1 className="mb-4">Student Details</h1>
              <div className="row">
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Full Name:</label>
                    <input
                      type="text"
                      value={[
                        studentData.firstName,
                        studentData.middleName,
                        studentData.lastName,
                        studentData.extensions,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Phone Number:</label>
                    <input
                      type="text"
                      value={studentData.details.phoneNumber}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Birthday:</label>
                    <input
                      type="text"
                      value={studentData.details.birthdate}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Nationality:</label>
                    <input
                      type="text"
                      value={studentData.details.nationality}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>

                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Religion:</label>
                    <input
                      type="text"
                      value={studentData.details.religion}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Civil Status:</label>
                    <input
                      type="text"
                      value={studentData.details.civilStatus}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Weight:</label>
                    <input
                      type="text"
                      value={studentData.details.weight + " kg"}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Height:</label>
                    <input
                      type="text"
                      value={studentData.details.height + " cm"}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Spouse Name:</label>
                    <input
                      type="text"
                      value={studentData.details.spouseName}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Spouse Occupation:</label>
                    <input
                      type="text"
                      value={studentData.details.spouseOccupation}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Number of Children:</label>
                    <input
                      type="text"
                      value={studentData.details.numChildren}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Facebook Link:</label>
                    <input
                      type="text"
                      value={studentData.details.facebookLink}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Permanent Address:</label>
                    <input
                      type="text"
                      value={studentData.details.permanentAddress}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>School Name:</label>
                    <input
                      type="text"
                      value={studentData.details.schoolName}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Year Graduated:</label>
                    <input
                      type="text"
                      value={studentData.details.yearGraduated}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Degree Completed:</label>
                    <input
                      type="text"
                      value={studentData.details.degreeCompleted}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Employer Name:</label>
                    <input
                      type="text"
                      value={studentData.details.employerName}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Employer Location:</label>
                    <input
                      type="text"
                      value={studentData.details.employerLocation}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Internet Connection:</label>
                    <input
                      type="text"
                      value={studentData.details.internetConnection}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Connection Modes:</label>
                    <input
                      type="text"
                      value={studentData.details.connectionModes}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Connection Quality:</label>
                    <input
                      type="text"
                      value={studentData.details.connectionQuality}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Devices Used:</label>
                    <input
                      type="text"
                      value={studentData.details.devices}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Birth Certificate:</label>
                    <button
                      className="form-control btn btn-success mr-2"
                      onClick={getFile}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
              {/* Comments section */}
              <div className="form-group">
                <label>Comments:</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows="4"
                  className="form-control"
                />
              </div>

              {/* Action buttons */}
              {studentData.details.info_complete !== "Pending Approval" ? (
                <div>
                  <button
                    disabled
                    className="btn btn-success mr-2"
                    onClick={handleAccept}
                  >
                    Accept
                  </button>
                  {/* Add space between buttons */}
                  <span style={{ marginRight: "8px" }}></span>
                  <button
                    disabled
                    className="btn btn-warning"
                    onClick={handleRequestRevision}
                  >
                    Request Revision
                  </button>
                  <span style={{ marginRight: "8px" }}></span>
                  <button
                    className="btn btn-primary"
                    onClick={() => window.history.back()}
                  >
                    Return to Previous Page
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    className="btn btn-success mr-2"
                    onClick={handleAccept}
                  >
                    Accept
                  </button>
                  {/* Add space between buttons */}
                  <span style={{ marginRight: "8px" }}></span>
                  <button
                    className="btn btn-warning"
                    onClick={handleRequestRevision}
                  >
                    Request Revision
                  </button>
                  <span style={{ marginRight: "8px" }}></span>
                  <button
                    className="btn btn-primary"
                    onClick={() => window.history.back()}
                  >
                    Return to Previous Page
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer brandName="Lifeline International Health Institute" />
    </div>
  );
};

export default ViewDetails;
