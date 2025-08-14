import React from "react";
import "../../styles/ErrorBanner.css";

export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="error-banner">
      <span>{message}</span>
      <button onClick={onClose} className="close-btn">✕</button>
    </div>
  );
}
