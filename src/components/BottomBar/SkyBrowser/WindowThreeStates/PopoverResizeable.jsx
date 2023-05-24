import React from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';

import styles from './WindowThreeStates.scss';

function PopoverResizeable({
  children, sizeCallback, size, minHeight
}) {
  const windowDiv = React.useRef(null);
  return (
    <section
      className={`${styles.popover}`}
      ref={windowDiv}
    >
      <Resizable
        enable={{
          top: true,
          right: false,
          left: false,
          bottom: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
        defaultSize={{
          width: size.width,
          height: size.height
        }}
        minHeight={minHeight}
        maxHeight={900}
        handleClasses={{
          top: styles.topHandle,
          right: styles.rightHandle,
          left: styles.leftHandle
        }}
        onResizeStop={() => {
          const { clientWidth, clientHeight } = windowDiv.current;
          sizeCallback(clientWidth, clientHeight);
        }}
      >
        {children}
      </Resizable>
    </section>
  );
}

PopoverResizeable.propTypes = {
  children: PropTypes.node,
  size: PropTypes.shape({
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  })
};

PopoverResizeable.defaultProps = {
  children: [],
  size: { height: 'auto', width: 'auto' }
};

PopoverResizeable.styles = styles;

export default PopoverResizeable;
