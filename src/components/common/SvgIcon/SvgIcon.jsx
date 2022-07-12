import React from 'react';

function SvgIcon(props) {
  return <div {...props} style={{ ...props.style, display: 'inline-grid', width: '1em' }}>{ props.children }</div>;
}

export default SvgIcon;
