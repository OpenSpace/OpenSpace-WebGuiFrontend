import React, { Component } from 'react';
import { useLocation } from 'react-router-dom';
import OnScreenGui from './OnScreenGui';

function BrowserGui() {
  const location = useLocation();

  return (
    <div style={{ backgroundColor: '#050505' }}>
      <OnScreenGui showFlightController />
    </div>
  );
}

export default BrowserGui;
