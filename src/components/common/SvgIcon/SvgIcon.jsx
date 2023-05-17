import React from 'react';

function SvgIcon({ style, children, ...props }) {
  return (
    <div
      style={{ style, display: 'inline-grid', width: '1em' }}
      {...props}
    >
      {children}
    </div>
  );
}

export default SvgIcon;
