import React from 'react';
import { MdInfo } from 'react-icons/md';
import PropTypes from 'prop-types';

import Tooltip from '../Tooltip/Tooltip';

function InfoBox({ text, ...props }) {
  const [showPopup, setShowPopup] = React.useState(false);
  const wrapper = React.useRef(null);

  function position() {
    if (!wrapper.current) return { top: '0px', left: '0px' };

    const { top, right } = wrapper.current.getBoundingClientRect();
    return { top: `${top}px`, left: `${right}px` };
  }

  return (
    <span
      ref={wrapper}
      {...props}
    >
      <MdInfo
        onMouseEnter={() => setShowPopup(true)}
        onMouseLeave={() => setShowPopup(false)}
      />
      { showPopup && (
        <Tooltip fixed placement="right" style={position()}>
          { text }
        </Tooltip>
      )}
    </span>
  );
}

InfoBox.propTypes = {
  text: PropTypes.node.isRequired // should be text or html object
};

InfoBox.defaultProps = {
};

export default InfoBox;
