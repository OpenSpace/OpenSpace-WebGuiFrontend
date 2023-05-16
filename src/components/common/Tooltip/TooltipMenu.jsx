import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import Tooltip from './Tooltip';

function TooltipMenu({
  children, className, disabled, sourceObject
}) {
  const [showPopup, setShowPopup] = React.useState(false);
  const wrapperRef = React.useRef(null);
  const insideClickWrapperRef = React.useRef(null);
  const buttonClickWrapperRef = React.useRef(null);

  useEffect(() => {
    window.addEventListener('scroll', closePopup, true);
    window.addEventListener('mousedown', handleOutsideClick, true);

    return () => {
      window.removeEventListener('scroll', closePopup);
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  });

  function setRef(ref) {
    return (element) => { ref.current = element; };
  }

  function position() {
    if (!wrapperRef.current) return { top: '0px', left: '0px' };
    const { top, right } = wrapperRef.current.getBoundingClientRect();
    return { top: `${top}px`, left: `${right}px` };
  }

  function togglePopup(evt) {
    setShowPopup(!showPopup);
    evt.stopPropagation();
  }

  function handleOutsideClick(evt) {
    if (!insideClickWrapperRef.current?.contains(evt.target) &&
        !buttonClickWrapperRef.current?.contains(evt.target)) {
      closePopup();
    }
  }

  function closePopup() {
    setShowPopup(false);
  }

  const customTooltipCss = {
    paddingRight: '4px', paddingLeft: '4px', maxWidth: '200px'
  };

  return (
    <div
      ref={setRef(wrapperRef)}
      className={className}
    >
      <div ref={setRef(buttonClickWrapperRef)} onClick={togglePopup}>
        { sourceObject }
      </div>
      {!disabled && showPopup && (
        <Tooltip
          fixed
          placement="right" // TODO: fix so placement can be set from property
          style={{ ...position(), ...customTooltipCss }}
        >
          <div ref={setRef(insideClickWrapperRef)}>
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
