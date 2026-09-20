import TherapyCard from "./TherapyCard";
import { therapies } from "../../data/mockData";

const HealingItinerary = () => {
  return (
    <section>
      <div className="section-heading">
        <div>
          <h2>Healing Itinerary</h2>
          <p>Your upcoming Panchakarma therapies</p>
        </div>
      </div>

      <div className="therapy-list">
        {therapies.map((therapy) => (
          <TherapyCard
            key={therapy.id}
            therapy={therapy}
          />
        ))}
      </div>
    </section>
  );
};

export default HealingItinerary;