import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { Modal, Button, Spinner, Form } from "react-bootstrap";
import NavBar from "../../components/NavBar";
import useAxios from "../../utils/useAxios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EnhancedTable from "../../components/Table";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cashier = () => {
  const axios = useAxios();

  const [students, setStudents] = useState([]);
  const [partiallyPaidStudents, setPartiallyPaidStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");

  const fetchStudents = async () => {
    try {
      const branch = jwtDecode(localStorage.getItem("authTokens")).branch;
      const response = await axios.get(`/studentlist/${branch}/`, {
        params: {
          status: "NEW",
        },
      });

      if (response.status === 200) {
        setStudents(response.data);
      } else {
        toast.error(`Something went wrong. ${response.status}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Something went wrong. Please try again later.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPartiallyPaidStudents = async () => {
    try {
      const branch = jwtDecode(localStorage.getItem("authTokens")).branch;
      const response = await axios.get(`/partiallypaidstudentlist/${branch}/`);

      if (response.status === 200) {
        console.log(response.data);
        setPartiallyPaidStudents(response.data);
      } else {
        toast.error(`Something went wrong. ${response.status}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Something went wrong. Please try again later.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStudents();
    fetchPartiallyPaidStudents();
  }, []);

  const fetchFile = async (userid, fileName, fileID = null) => {
    try {
      const response = fileID
        ? await axios.get(`file/${userid}/${fileName}/`, {
            params: { id: fileID },
          })
        : await axios.get(`file/${userid}/${fileName}/`);
      console.log(response);

      if (response.status === 200 && response.data.length > 0) {
        const base64String = response.data[0].file_data.split(",")[1];
        const filename = response.data[0].file_name;

        const binaryString = atob(base64String);

        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: "application/octet-stream" });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;

        a.click();

        a.remove();

        URL.revokeObjectURL(url);
      } else {
        if (response.data.length == 0) {
          toast.error("File not found.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else
          toast.error(`Something went wrong. ${response.status}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Something went wrong. Please try again later.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleActionClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const updateUserStatus = async (id, status) => {
    try {
      const response = await axios.put(`updateuserstatus/`, {
        id: id,
        status: status,
      });

      if (response.status === 200) {
        toast.success("User Updated.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Something went wrong. Please try again later.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleAccept = async () => {
    setShowModal(false);

    if (paymentStatus === "Partially Paid") {
      updateUserStatus(selectedStudent.user_id, "PARTIALLY_PAID");
    } else {
      updateUserStatus(selectedStudent.user_id, "CONFIRMED");
    }
  };
  const handleReject = async () => {
    // Implement reject logic here
    setShowModal(false);
    try {
      const response = await axios.put(`updateusercomment/`, {
        id: selectedStudent.user_id,
        comment:
          "Please provide valid birth certificate and/or proof of payment",
      });

      if (response.status === 200) {
        toast.error("User Rejected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Something went wrong. Please try again later.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const partiallyPaidRows = partiallyPaidStudents.map((student) => ({
    id: student.user_id,
    name: student.name,
    email: student.email,
    phone: student.phoneNumber,
    proofOfPayment: student.proof_of_payments.map((payment) => {
      const datetime = new Date(payment.datetime);
      const formatter = new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return (
        <Button
          variant="link"
          onClick={() =>
            fetchFile(student.user_id, "proof_of_payment", payment.id)
          }
        >
          {payment.file_name} ({formatter.format(datetime)})
        </Button>
      );
    }),
    actions: (
      <>
        <Button
          variant="warning"
          onClick={() => handleOnHold(student)}
          disabled={student.status == "ON_HOLD"}
        >
          On Hold
        </Button>{" "}
        <Button
          variant="primary"
          onClick={() => handleAllowEnrollment(student)}
          disabled={student.status == "PARTIALLY_PAID"}
        >
          Allow Enrollment
        </Button>{" "}
        <Button variant="success" onClick={() => handleFullyPaid(student)}>
          Fully Paid
        </Button>
      </>
    ),
  }));

  const handleOnHold = (student) => {
    updateUserStatus(student.user_id, "ON_HOLD");
  };

  const handleAllowEnrollment = (student) => {
    updateUserStatus(student.user_id, "PARTIALLY_PAID");
  };

  const handleFullyPaid = (student) => {
    updateUserStatus(student.user_id, "CONFIRMED");
  };

  const studentHeaders = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone Number" },
    { id: "birthCertificate", label: "Birth Certificate" },
    { id: "proofOfPayment", label: "Proof of Payment" },
    { id: "action", label: "Action" },
  ];

  const partiallyPaidHeaders = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone Number" },
    { id: "proofOfPayment", label: "Proof of Payment" },
    { id: "actions", label: "Manage Enrollment" },
  ];

  const studentRows = students.map((student) => ({
    id: student.user_id,
    name: [
      student.firstName,
      student.middleName,
      student.lastName,
      student.extensions,
    ]
      .filter(Boolean)
      .join(" "),
    email: student.email,
    phone: student.details.phoneNumber,
    birthCertificate: (
      <Button
        variant="link"
        onClick={() => fetchFile(student.user_id, "birthCert")}
      >
        Download
      </Button>
    ),
    proofOfPayment: (
      <Button
        variant="link"
        onClick={() => fetchFile(student.user_id, "proof_of_payment")}
      >
        Download
      </Button>
    ),
    action: (
      <Button variant="info" onClick={() => handleActionClick(student)}>
        Take Action
      </Button>
    ),
  }));

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={[{ type: "link", url: "/logout", text: "Logout" }]} />
      <main
        style={{
          marginTop: "5rem",
          flex: 1,
          padding: "2rem",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div className="container-fluid">
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "80vh" }}
            >
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <>
              <EnhancedTable
                title="New Students"
                headers={studentHeaders}
                rows={studentRows}
                showSubmitButton={false}
              />
              {partiallyPaidStudents.length > 0 && (
                <EnhancedTable
                  title="Partially Paid Students"
                  headers={partiallyPaidHeaders}
                  rows={partiallyPaidRows}
                  showSubmitButton={false}
                />
              )}
            </>
          )}
        </div>
      </main>
      <Footer brandName="Lifeline International Health Institute" />

      {/* Modals */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Take Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Do you want to accept or reject the application of{" "}
            {selectedStudent?.name}?
          </p>
          <Form.Group>
            <Form.Label>Payment Status</Form.Label>
            <Form.Control
              as="select"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="">Select Payment Status</option>
              <option value="Fully Paid">Fully Paid</option>
              <option value="Partially Paid">Partially Paid</option>
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={handleReject}>
            Reject
          </Button>
          <Button
            variant="success"
            onClick={handleAccept}
            disabled={!paymentStatus}
          >
            Accept
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Cashier;
