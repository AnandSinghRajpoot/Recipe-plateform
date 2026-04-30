import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ onClick, className = "", label = "Back" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-outline-variant/30 text-primary hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-md active:scale-95 ${className}`}
    >
      <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
        arrow_back
      </span>
      <span className="text-[11px] font-black uppercase tracking-widest leading-none">
        {label}
      </span>
    </button>
  );
};

export default BackButton;
