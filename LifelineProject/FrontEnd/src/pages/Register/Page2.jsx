import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Page2 = ({
  learningMode: [learningMode, setLearningMode],
  branch: [branch, setBranch],
  schedule: [schedule, setSchedule],
  program: [program, setProgram],
  programs: [programs, setPrograms],
  allprograms,
  handleRegister,
  onBack,
}) => {
  const navigate = useNavigate();

  const handleLearningModeChange = (event) => {
    setLearningMode(event.target.value);
  };

  const handleBranchChange = (event) => {
    const dispProgs = allprograms.filter(prog => prog.branch == event.target.value)
    setBranch(event.target.value);
    setPrograms(dispProgs)
    setProgram(dispProgs[0].id)
  };

  const handleScheduleChange = (event) => {
    setSchedule(event.target.value);
  };

  const handleProgramChange = (event) => {
    setProgram(event.target.value);
  };

  useEffect(() => {
    setPrograms(allprograms.filter(prog => prog.branch == branch))
    setProgram(allprograms.filter(prog => prog.branch == branch)[0].id)
  }, [branch]);

  return (
    <div className="page2-content">
      {/* Page 2 Content */}
      <div className="row">
        <div className="col-md-6 mt-md-0 mt-3">
          <label htmlFor="learningMode">Preferred Learning Mode</label>
          <select
            id="learningMode"
            className="form-control"
            value={learningMode}
            onChange={handleLearningModeChange}
            required
          >
            <option value="online">Online/Blended Class</option>
            <option value="onsite">Onsite/Face-to-Face Class</option>
          </select>
        </div>
        <div className="col-md-6 mt-md-0 mt-3">
          <label htmlFor="program">Select Program</label>
          <select
            id="program"
            className="form-control"
            value={program}
            onChange={handleProgramChange}
            required
          >
            {programs.map((program) => (
              <option value={program.id}>{program.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row" style={{marginTop:"10px"}}>
        <div className="col-md-6 mt-md-0 mt-3">
          <label htmlFor="branch">Which Lifeline Branch do you wish to enroll?</label>
          <select
            id="branch"
            className="form-control"
            value={branch}
            onChange={handleBranchChange}
            required
          >
            <option value="1">Roxas</option>
            <option value="2">Iloilo</option>
            <option value="3">Silay</option>
            <option value="4">Bacolod Extension</option>
          </select>
        </div>
        <div className="col-md-6 mt-md-0 mt-3">
          <label htmlFor="schedule">Please select your preferred class schedule</label>
          <select
            id="schedule"
            className="form-control"
            value={schedule}
            onChange={handleScheduleChange}
            required
          >
            <option value="wdMF8am2pm">Weekdays | Monday to Friday | 8:00AM - 2:00 PM</option>
            <option value="wdMF2pm8pm">Weekdays | Monday to Friday | 2:00 PM - 8:00 PM</option>
            <option value="weSS8am6pm">Weekends | Saturday & Sunday | 8:00 AM to 6:00 PM</option>
            <option value="wd5pm9pmS8am6pm">Night Class | Weekdays 5:00 PM - 9:00 PM & Saturdays 8:00 AM - 6:00 PM (Iloilo & Silay Only)</option>
          </select>
        </div>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
        <button
          type="submit"
          style={{
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
          }}
          onClick={handleRegister}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Page2;
