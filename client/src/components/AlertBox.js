// client/src/components/AlertBox.js
import React from 'react';

export default function AlertBox({ message }) {
  if (!message) return null;
  return (
    <div className="alert-box">
      {message}
    </div>
  );
}
