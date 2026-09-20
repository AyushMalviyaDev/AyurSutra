const TherapyCard = ({ therapy }) => {
  return (
    <div className="therapy-card">
      <div>
        <span className="therapy-type">{therapy.type}</span>

        <h3>{therapy.name}</h3>

        <p>{therapy.description}</p>
      </div>

      <div className="therapy-info">
        <span>{therapy.time}</span>
        <span>{therapy.therapist}</span>
      </div>

      <div className={`therapy-status ${therapy.status.toLowerCase()}`}>
        {therapy.status}
      </div>
    </div>
  );
};

export default TherapyCard;