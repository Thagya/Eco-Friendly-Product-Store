import React from "react";

const Input = ({ icon, type = "text", name, placeholder, value, onChange, required }) => {
  return (
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-10 py-2 bg-slate-800 border border-slate-700 text-gray-200 rounded-xl 
          focus:ring-2 focus:ring-eco-green focus:outline-none`}
      />
    </div>
  );
};

export default Input;
