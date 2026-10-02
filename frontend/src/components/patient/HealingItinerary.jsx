import TherapyCard from "./TherapyCard";

const HealingItinerary = ({ sessions = [] }) => {
  return (
    <section>
      <div className="section-heading">
        <div>
          <h2>Healing Itinerary</h2>
          <p>Your upcoming Panchakarma therapies</p>
        </div>
      </div>

      <div className="therapy-list">
        {sessions.length === 0 ? (
          <p>No therapy sessions scheduled.</p>
        ) : (
          sessions.map((session) => (
            <TherapyCard
              key={session.id}
              therapy={session}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default HealingItinerary;