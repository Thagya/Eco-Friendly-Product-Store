import React from "react";

const Card = ({ children }) => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg p-4 transition hover:border-eco-green/50">
      {children}
    </div>
  );
};

export default Card;
