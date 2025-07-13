import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";

const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );

  const [user, setUser] = useState(() =>
    localStorage.getItem("authTokens")
      ? jwtDecode(localStorage.getItem("authTokens"))
      : null
  );

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Modal State
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");

  const openMessageModal = (title, content) => {
    setMessageTitle(title);
    setMessageContent(content);
    setShowMessageModal(true);
  };

  const closeMessageModal = () => setShowMessageModal(false);

  /*ORIGINAL LOGIN USER----------------------------------------------------------------------------------------------------------------------------------------
  const loginUser = async (email, password) => {
    const response = await fetch("https://localhost:8000/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log("Logged In");
      setAuthTokens(data);
      setUser(jwtDecode(data.access));
      //     const branchId =  user.branch_id;
      //     localStorage.setItem("branch_id", branchId); // Store
      localStorage.setItem("authTokens", JSON.stringify(data));
      // localStorage.setItem("user")
      const userData = (({
        firstName,
        lastName,
        middleName,
        extensions,
        details,
        branch_id,
      }) => ({
        firstName,
        lastName,
        middleName,
        extensions,
        details,
        branch_id,
      }))(jwtDecode(data.access));
      localStorage.setItem("userData", JSON.stringify(userData));

      switch (jwtDecode(JSON.stringify(data)).role) {
        case "PRE-STUDENT":
          navigate("/prestudentdashboard");
          break;
        case "STUDENT":
          navigate("/student");
          break;
        case "FACULTY":
          navigate("/faculty");
          break;
        case "CASHIER":
          navigate("/cashier");
          break;
        case "BRANCH_MANAGER":
          navigate("/branchmanager");
          break;
        case "ADMIN":
          navigate("/");
          break;
        case "SUPERVISOR":
          navigate("/supervisor");
          break;
        default:
          navigate("/");
          break;
      }
    } else {
      console.log(response.status);
      openMessageModal("Error", "Wrong Credentials");
    }
  };
  ----------------------------------------------------------------------------------------------------------------------------------------*/

  // AuthContext.js
  const loginUser = async (email, password, onError) => {
    try {
      const response = await fetch("https://localhost:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        console.log("Logged In");
        setAuthTokens(data);
        setUser(jwtDecode(data.access));
        localStorage.setItem("authTokens", JSON.stringify(data));

        const userData = (({
          firstName,
          lastName,
          middleName,
          extensions,
          details,
          branch_id,
        }) => ({
          firstName,
          lastName,
          middleName,
          extensions,
          details,
          branch_id,
        }))(jwtDecode(data.access));
        localStorage.setItem("userData", JSON.stringify(userData));

        switch (jwtDecode(JSON.stringify(data)).role) {
          case "PRE-STUDENT":
            navigate("/prestudentdashboard");
            break;
          case "STUDENT":
            navigate("/student");
            break;
          case "FACULTY":
            navigate("/faculty");
            break;
          case "CASHIER":
            navigate("/cashier");
            break;
          case "BRANCH_MANAGER":
            navigate("/branchmanager");
            break;
          case "ADMIN":
            navigate("/");
            break;
          case "SUPERVISOR":
            navigate("/supervisor");
            break;
          default:
            navigate("/");
            break;
        }
      } else {
        // Call the onError callback with the error message
        if (onError) {
          onError("Wrong Credentials: Email and password do not match");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      // Call the onError callback with a generic error message
      if (onError) {
        onError("An error occurred during login. Please try again.");
      }
    }
  };

  const registerUser = async (
    email,
    password,
    userprofile,
    context,
    onSuccess,
    onError
  ) => {
    try {
      const response = await fetch("https://localhost:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          userprofile: userprofile,
        }),
      });

      console.log(response);

      if (response.status === 201) {
        if (context === "manageinstructors") {
          onSuccess("Instructor created successfully.");
        } else {
          navigate("/login");
        }
      } else {
        onError("Something went wrong.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      onError("An error occurred during registration. Please try again.");
    }
  };
  const updateUserProfileData = async (
    axiosInstance,
    userid,
    { firstName, middleName, lastName, extensions, ...details }
  ) => {
    try {
      const obj = {
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        extensions: extensions,
        details: details,
      };
      const response = await axiosInstance.put(
        `/updatestudent/${userid}/`,
        obj
      );

      if (response.status === 200) {
        openMessageModal("Success", "Profile successfully updated!");
        delete obj.details.birthCert;
        delete obj.details.birthCertName;
        delete obj.details.proof_of_payment;
        delete obj.details.proof_of_paymentName;
        localStorage.setItem("userData", JSON.stringify(obj));
      } else {
        openMessageModal("Error", "Something went wrong.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      openMessageModal(
        "Error",
        "Something went wrong. Please try again later."
      );
    }
  };

  const setPreStudentToStudent = async (axiosInstance, userid, studentid) => {
    const response = await axiosInstance.put(`enrollstudent/${userid}/`, {
      userid: studentid,
    });

    if (response.status === 200) {
      openMessageModal("Success", "Student enrolled successfully.");
      window.location.reload();
    } else {
      openMessageModal("Error", "Something went wrong.");
    }
  };

  const logoutUser = async (axiosInstance) => {
    const response = await axiosInstance.post(`logout/`);
    if (response.status === 200) {
      setAuthTokens(null);
      setUser(null);
      localStorage.removeItem("authTokens");
      localStorage.removeItem("userData");

      // Redirect back to the login or home page
      navigate("/");
    } else {
      console.error("Logout failed");
    }
  };

  const contextData = {
    user,
    setUser,
    authTokens,
    setAuthTokens,
    registerUser,
    loginUser,
    updateUserProfileData,
    setPreStudentToStudent,
    logoutUser,
  };

  useEffect(() => {
    if (authTokens) {
      setUser(jwtDecode(authTokens.access));
    }
    setLoading(false);
  }, [authTokens, loading]);

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
      <Modal show={showMessageModal} onHide={closeMessageModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{messageTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{messageContent}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeMessageModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </AuthContext.Provider>
  );
};
