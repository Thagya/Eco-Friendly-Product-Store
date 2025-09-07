import React from "react";

const Badge = ({ children, color = "green" }) => {
  const colors = {
    green: "bg-emerald-600/30 text-emerald-400 border-emerald-600/40",
    purple: "bg-purple-600/30 text-purple-400 border-purple-600/40",
    red: "bg-red-600/30 text-red-400 border-red-600/40",
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${colors[color]}`}>
      {children}
    </span>
  );
};

export default Badge;
