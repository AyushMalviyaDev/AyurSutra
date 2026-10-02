const TherapyCard = ({ therapy }) => {
  const statusClass = therapy.status
    ? therapy.status.toLowerCase().replace("_", "-")
    : "";

  return (
    <div className="therapy-card">
      <div>
        <span className="therapy-type">
          Session {therapy.session_number}
        </span>

        <h3>
          {therapy.therapy_name || "Panchakarma Therapy"}
        </h3>

        <p>
          {therapy.session_date
            ? new Date(therapy.session_date).toLocaleDateString()
            : "Date not available"}
        </p>
      </div>

      <div className="therapy-info">
        <span>
          {therapy.start_time
            ? therapy.start_time.slice(0, 5)
            : "--:--"}
          {" - "}
          {therapy.end_time
            ? therapy.end_time.slice(0, 5)
            : "--:--"}
        </span>

        <span>
          {therapy.therapist_name || "Therapist"}
        </span>
      </div>

      <div className={`therapy-status ${statusClass}`}>
        {therapy.status || "UNKNOWN"}
      </div>
    </div>
  );
};

export default TherapyCard;