import useAuth from "../../hooks/useAuth";

const PatientHeader = () => {
  const { user } = useAuth();

  return (
    <div className="patient-header">
      <div>
        <p className="eyebrow">PATIENT DASHBOARD</p>
        <h1>Hello, {user?.name}</h1>
        <p>Track your Panchakarma healing journey.</p>
      </div>

      <div className="patient-avatar">
        {user?.name?.charAt(0)}
      </div>
    </div>
  );
};

export default PatientHeader;