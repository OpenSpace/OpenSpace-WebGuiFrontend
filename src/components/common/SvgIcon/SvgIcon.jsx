import React from 'react';

const SvgIcon = (props) => 
    <div  {...props} style={{...props.style, display: 'inline-grid', width: '1em'}}>{ props.children }</div>
;

export default SvgIcon;
