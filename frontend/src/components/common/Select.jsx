const Select = ({ label, value, onChange, options = [] }) => {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}

      <select value={value} onChange={onChange}>
        <option value="">Select...</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;