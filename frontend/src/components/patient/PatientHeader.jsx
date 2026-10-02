import useAuth from "../../hooks/useAuth";

const PatientHeader = () => {
  const { user } = useAuth();

  return (
    <div className="patient-header">
      <div>
        <p className="eyebrow">PATIENT DASHBOARD</p>
        <h1>Hello, {user?.name || user?.username || "Patient"}</h1>
        <p>Track your Panchakarma healing journey.</p>
      </div>

      <div className="patient-avatar">
        {(user?.name || user?.username || "P").charAt(0).toUpperCase()}
      </div>
    </div>
  );
};

export default PatientHeader;