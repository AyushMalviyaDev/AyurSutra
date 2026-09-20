import { useState } from "react";

const SelfAssessment = () => {
  const [mood, setMood] = useState("");

  return (
    <div className="card">
      <h3>Daily Self Assessment</h3>

      <p>How are you feeling today?</p>

      <div className="assessment-options">
        {["Excellent", "Good", "Okay", "Low"].map((option) => (
          <button
            key={option}
            className={mood === option ? "selected" : ""}
            onClick={() => setMood(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {mood && (
        <p className="assessment-result">
          You selected: <strong>{mood}</strong>
        </p>
      )}
    </div>
  );
};

export default SelfAssessment;