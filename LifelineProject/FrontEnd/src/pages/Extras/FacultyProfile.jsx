// pages/FacultyProfile.js
import React, { useState } from "react";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBBtn,
  MDBBreadcrumb,
  MDBBreadcrumbItem,
  MDBProgress,
  MDBProgressBar,
  MDBIcon,
  MDBListGroup,
  MDBListGroupItem,
} from "mdb-react-ui-kit";
import NavBar from "../../components/NavBar";
import Jumbotron from "../../components/Jumbotron";
import templatePic from "../../components/assets/blank-user.jpg";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function FacultyProfile({ match }) {
  // FIXME:
  // this part for pag may backend na to match the profile name
  // function FacultyProfile({ match }) {
  // const { profileName } = match.params;
  // Fetch faculty profile data based on profileName
  // ...

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("Johnatan Smith");
  const [email, setEmail] = useState("example@example.com");
  const [phone, setPhone] = useState("(097) 234-5678");
  const [address, setAddress] = useState("Bay Area, San Francisco, CA");
  const [picture, setPicture] = useState(templatePic);

  // for picture change
  const handleImageChange = (files) => {
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      // Set the newly uploaded image to your state or wherever you store the image
      // For now, let's just log the base64 data
      setPicture(reader.result);
      console.log(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // Function to toggle editing mode
  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  // Function to handle changes in input fields
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "phone":
        setPhone(value);
        break;
      case "address":
        setAddress(value);
        break;
      default:
        break;
    }
  };

  const items = [
    { type: "link", url: "/CreateAn", text: "Create Announcement" },
    { type: "link", url: "/addClass", text: "Add Class" },
    { type: "link", url: "/Faculty", text: "Faculty" },
    {
      type: "dropdown",
      text: "User",
      items: [
        { url: "/faculty/user", text: "Profile" },
        { url: "/logout", text: "Logout" },
      ],
    },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />
      <Footer brandName="Lifeline International Health Institute" />
      <div
        style={{
          //marginTop: "1rem",
          marginLeft: "280px",
          width: "100%",
          padding: "2%",
        }}
      >
        <Jumbotron>
          <MDBRow>
            <MDBCol lg="4">
              <MDBCard className="mb-4">
                <MDBCardBody className="text-center">
                  <MDBCardImage
                    src={templatePic}
                    alt="user pic"
                    className="rounded-circle"
                    style={{ width: "150px" }}
                    fluid
                  />
                  <div>
                    {isEditing ? (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files)}
                      />
                    ) : null}
                  </div>

                  {/*TODO: change this to name of user soon */}
                  <p className="text-muted mb-1">{name}</p>
                  <p className="text-muted mb-4"></p>
                  <div className="d-flex justify-content-center mb-2">
                    <MDBBtn
                      style={{ maxHeight: "40px", maxWidth: "120px" }}
                      outline
                      onClick={handleEditClick}
                    >
                      {isEditing ? "Save" : "Edit Profile"}
                    </MDBBtn>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
            <MDBCol lg="8">
              <MDBCard className="mb-4">
                <MDBCardBody>
                  <MDBRow>
                    <MDBCol sm="3">
                      <MDBCardText>Full Name</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={name}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <MDBCardText className="text-muted">{name}</MDBCardText>
                      )}
                    </MDBCol>
                  </MDBRow>

                  <hr />
                  <MDBRow>
                    <MDBCol sm="3">
                      <MDBCardText>Email</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9">
                      {isEditing ? (
                        <input
                          type="text"
                          name="email"
                          value={email}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <MDBCardText className="text-muted">
                          {email}
                        </MDBCardText>
                      )}
                    </MDBCol>
                  </MDBRow>
                  <hr />
                  <MDBRow>
                    <MDBCol sm="3">
                      <MDBCardText>Phone</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9">
                      {isEditing ? (
                        <input
                          type="text"
                          name="phone"
                          value={phone}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <MDBCardText className="text-muted">
                          {phone}
                        </MDBCardText>
                      )}
                    </MDBCol>
                  </MDBRow>
                  <hr />
                  <MDBRow>
                    <MDBCol sm="3">
                      <MDBCardText>Address</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9">
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={address}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <MDBCardText className="text-muted">
                          {address}
                        </MDBCardText>
                      )}
                    </MDBCol>
                  </MDBRow>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </Jumbotron>
      </div>
    </div>
  );
}

export default FacultyProfile;
