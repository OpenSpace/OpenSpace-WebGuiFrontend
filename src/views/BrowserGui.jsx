import React from 'react';
import OnScreenGui from './OnScreenGui';

function BrowserGui() {
  return (
    <div style={{ backgroundColor: '#050505' }}>
      <OnScreenGui isInBrowser />
    </div>
  );
}

export default BrowserGui;
