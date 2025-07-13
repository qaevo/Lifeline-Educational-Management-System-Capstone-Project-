import React, { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Card from "../../components/Card";

const LandingPage = () => {
  const [cardItems, setCardItems] = useState([]);

  const getThreeRandomPrograms = async () => {
    try {
      await fetch("https://localhost:8000/api/getthreerandomprograms/")
        .then((res) => res.json())
        .then((json) => {
          setCardItems([
            {
              imglink: '',
              title: json[0].name,
              subtitle: '',
              content: 'This program provides foundational knowledge and practical skills essential for individuals seeking to develop expertise. It covers key concepts, hands-on training, and best practices to ensure competency in real-world settings.',
              link2: "/register",
              linkname2: "Apply Now",
            },
            {
              imglink: '',
              title: json[1].name,
              subtitle: '',
              content: 'Designed to equip learners with essential techniques, safety protocols, and effective strategies, this course focuses on practical applications and professional standards.',
              link2: "/register",
              linkname2: "Apply Now",
            },
            {
              imglink: '',
              title: json[2].name,
              subtitle: '',
              content: 'This training program helps participants develop the necessary skills to perform tasks efficiently. It combines theoretical learning with hands-on experience to enhance proficiency and confidence.',
              link2: "/register",
              linkname2: "Apply Now",
            },
          ]);
        });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getThreeRandomPrograms();
  }, []);

  const items = [
    { type: "link", url: "/aboutus", text: "About Us" },
    localStorage.getItem("authTokens")
      ? { type: "link", url: "/login", text: "Dashboard" }
      : { type: "link", url: "/register", text: "Register" },
    localStorage.getItem("authTokens")
      ? { type: "link", url: "/logout", text: "Logout" }
      : { type: "link", url: "/login", text: "Login" }
  ];

  // const cardItems = [
  //   {
  //     imglink: "",
  //     title: "Nursing",
  //     subtitle: "Become a Healthcare Hero",
  //     content: "Our nursing program prepares students for a rewarding career in healthcare, equipping them with essential skills and knowledge.",
  //     link2: "/register",
  //     linkname2: "Apply Now",
  //   },
  //   {
  //     imglink: "",
  //     title: "Medical Assisting",
  //     subtitle: "Support Healthcare Providers",
  //     content: "Learn the essential skills needed to support physicians and healthcare providers in a dynamic healthcare environment.",
  //     link2: "/register",
  //     linkname2: "Apply Now",
  //   },
  //   {
  //     imglink: "",
  //     title: "Healthcare Administration",
  //     subtitle: "Lead the Future of Healthcare",
  //     content: "Prepare for leadership roles in healthcare management and administration, ensuring effective healthcare delivery.",
  //     link2: "/register",
  //     linkname2: "Apply Now",
  //   }
  // ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <Header brandName="Lifeline International Health Institute" />
      <NavBar items={items} />
      <main style={{ flex: "1", padding: "4rem 3rem", textAlign: "center" }}>
        <div className="jumbotron text-center" style={{
          marginTop: "4rem",
          backgroundColor: "#f8f9fb",
          padding: "4rem 2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        }}>
          <h1 className="display-4" style={{ color: "#009688", fontWeight: "700" }}>What is Lifeline?</h1>
          <p className="lead" style={{ color: "#333333", marginBottom: "2rem" }}>
            Lifeline International Health Institute is committed to providing quality health education and training.
          </p>
          <a href="/aboutus" className="btn" style={{
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
            }}>Find Out More</a>
        </div>

        <section className="info-section" style={{ marginTop: "2rem", padding: "2rem" }}>
          <h2 style={{ fontSize: "2.5rem", color: "#009688", marginBottom: "1rem", textAlign: "center" }}>Our Programs</h2>
          <Card items={cardItems} />
        </section>
      </main>
      <Footer brandName="Lifeline International Health Institute" />
    </div>
  );
};

export default LandingPage;
