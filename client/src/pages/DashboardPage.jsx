import React from "react";
import "../styles/DashboardPage.css";
import logoIcon from "../assets/icon.png";

export default function DashboardPage() {
  const students = [
    { name: "Student A", work: "33/36", avg: 23, speech: 45, writing: "-", reading: "-" },
    { name: "Student B", work: "31/36", avg: 53, speech: 6, writing: "-", reading: "-" },
    { name: "Student C", work: "27/36", avg: 82, speech: 23, writing: "-", reading: "-" },
  ];

  const getColor = (score) => {
    if (score < 40) return "#F6B5B5"; // red tone
    if (score < 70) return "#F9E59A"; // yellow tone
    return "#B9E3A3"; // green tone
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <img src={logoIcon} alt="Dashboard icon" className="page-icon" />
          <div className="page-heading">Dashboard</div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="stats-row">
        <div className="stat-card large">
          <div className="stat-label">Overall Class Score</div>
          <div className="stat-value">68%</div>
        </div>

        <div className="stat-card small">
          <div className="stat-value">5</div>
          <div className="stat-info">20% of class<br/>grade avg: 23%</div>
        </div>

        <div className="stat-card small">
          <div className="stat-value">10</div>
          <div className="stat-info">20% of class<br/>grade avg: 23%</div>
        </div>

        <div className="stat-card small">
          <div className="stat-value">5</div>
          <div className="stat-info">20% of class<br/>grade avg: 23%</div>
        </div>
      </div>

      {/* Student Table */}
      <div className="table-section">
        <h2 className="table-title">Students Proficiency</h2>
        <table className="student-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Work Completed</th>
              <th>Average Score</th>
              <th>Speech</th>
              <th>Writing</th>
              <th>Reading</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={i} style={{ backgroundColor: getColor(s.avg) }}>
                <td>{s.name}</td>
                <td>{s.work}</td>
                <td>
                  <div className="score-box" style={{ backgroundColor: getColor(s.avg) }}>
                    {s.avg}%
                  </div>
                </td>
                <td>{s.speech}</td>
                <td>{s.writing}</td>
                <td>{s.reading}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
