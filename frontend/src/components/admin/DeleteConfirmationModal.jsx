// src/components/admin/DeleteConfirmationModal.jsx
import React from "react";
import "../../styles/DeleteConfirmationModal.css";

export default function DeleteConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <p>{message}</p>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="confirm-btn" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
