import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import Button from '../Input/Button/Button';

import Tooltip from './Tooltip';

function TooltipMenu({
  children, className, disabled, sourceObject
}) {
  const [showPopup, setShowPopup] = React.useState(false);
  const wrapperRef = React.useRef(null);
  const insideClickWrapperRef = React.useRef(null);
  const buttonClickWrapperRef = React.useRef(null);

  useEffect(() => {
    function closePopup() {
      setShowPopup(false);
    }
    window.addEventListener('scroll', closePopup, true);
    return () => {
      window.removeEventListener('scroll', closePopup);
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(evt) {
      if (!insideClickWrapperRef.current?.contains(evt.target) &&
          !buttonClickWrapperRef.current?.contains(evt.target)) {
        setShowPopup(false);
      }
    }
    window.addEventListener('mousedown', handleOutsideClick, true);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  function position() {
    if (!wrapperRef.current) return { top: '0px', left: '0px' };
    const { top, right } = wrapperRef.current.getBoundingClientRect();
    return { top: `${top}px`, left: `${right}px` };
  }

  function togglePopup(evt) {
    setShowPopup((current) => !current);
    evt.stopPropagation();
  }

  const customTooltipCss = {
    paddingRight: '4px', paddingLeft: '4px', maxWidth: '200px'
  };

  return (
    <div
      ref={wrapperRef}
      className={className}
    >
      <Button
        ref={buttonClickWrapperRef}
        onClick={togglePopup}
        style={{
          backgroundColor: 'transparent',
          cursor: 'default'
        }}
        block
        small
        nopadding
      >
        { sourceObject }
      </Button>
      {!disabled && showPopup && (
        <Tooltip
          fixed
          placement="right" // TODO: fix so placement can be set from property
          style={{ ...position(), ...customTooltipCss }}
        >
          <div ref={insideClickWrapperRef}>
            { children }
          </div>
        </Tooltip>
      )}
    </div>
  );
}

TooltipMenu.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  // An object that this tooltip menu should originate from
  sourceObject: PropTypes.object.isRequired
};

TooltipMenu.defaultProps = {
  className: '',
  disabled: false
};

export default TooltipMenu;
