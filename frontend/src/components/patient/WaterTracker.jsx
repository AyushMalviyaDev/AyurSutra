import { useState } from "react";

const WaterTracker = () => {
  const [glasses, setGlasses] = useState(4);

  const addGlass = () => {
    if (glasses < 8) {
      setGlasses(glasses + 1);
    }
  };

  return (
    <div className="card water-tracker">
      <h3>Water Intake</h3>

      <p>Stay hydrated throughout your healing journey.</p>

      <div className="water-count">
        {glasses} / 8 glasses
      </div>

      <div className="water-progress">
        <div
          style={{
            width: `${(glasses / 8) * 100}%`,
          }}
        />
      </div>

      <button onClick={addGlass}>
        + Add Glass
      </button>
    </div>
  );
};

export default WaterTracker;