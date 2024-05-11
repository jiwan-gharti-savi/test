import React, { useState, useEffect } from "react";
import "./Modal.css";

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } 

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);


  if (!isOpen) {
    return null;
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
        {/* <button onClick={onClose}>Close</button> */}
      </div>
    </div>
  );
};
export default Modal;
