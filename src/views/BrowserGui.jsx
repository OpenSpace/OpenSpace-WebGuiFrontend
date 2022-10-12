import React, { Component } from 'react';
import { useLocation } from "react-router-dom";
import OnScreenGui from './OnScreenGui';

function BrowserGui() {
  let location = useLocation();

  return (
    <div style={{backgroundColor: '#050505'}}>
      <OnScreenGui isInBrowser />
    </div>
  );
}

export default BrowserGui;
