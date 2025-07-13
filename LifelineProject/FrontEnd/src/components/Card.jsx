import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import DOMPurify from "dompurify";

const Card = ({ items }) => {
  const createMarkup = (htmlContent) => {
    return { __html: DOMPurify.sanitize(htmlContent) };
  };

  return (
    <div className="row g-4">
      {items.map((item, index) => (
        <div key={index} className="col-md-4">
          <div className="card text-bg-light border-0 h-100" style={{
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#FFFFFF",
          }}>
            {/* Conditional Rendering for Image */}
            {item.imglink ? (
              <img src={item.imglink} className="card-img-top" alt="Card" style={{
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px"
              }} />
            ) : (
              <div></div>
            )}
            <div className="card-body d-flex flex-column">
              <h5 className="card-title" style={{ color: "#009688" }}>{item.title}</h5>
              <h6 className="card-subtitle mb-2" style={{ color: "#555" }}>{item.subtitle}</h6>
              <p className="card-text" dangerouslySetInnerHTML={createMarkup(item.content)}></p>
              <div className="mt-auto" style={{ textAlign: "center" }}>
                {/* Conditional Rendering for Links */}
                {item.link && (
                  <a href={item.link} className="btn" style={{
                    padding: "0.6rem 1.2rem",
                    fontSize: "0.9rem",
                    backgroundColor: "#009688",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease, transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#00796b";
                    e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#009688";
                    e.target.style.transform = "scale(1)";
                  }}>
                    {item.linkname}
                  </a>
                )}
                {item.link2 && (
                  <a href={item.link2} className="btn" style={{ color: "#009688" }}onMouseEnter={(e) => {
                    e.target.style.color = "#00796b";
                    e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "#009688";
                    e.target.style.transform = "scale(1)";
                  }}>
                    {item.linkname2}
                  </a>
                )}
                
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Card;
