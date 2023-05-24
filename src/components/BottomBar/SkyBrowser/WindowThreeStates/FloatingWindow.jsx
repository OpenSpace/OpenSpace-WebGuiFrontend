import React from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';

import styles from './WindowThreeStates.scss';

function FloatingWindow({
  children, defaultSize, position, sizeCallback, size, handleStop, minHeight
}) {
  const windowDiv = React.useRef(null);

  return (
    <Draggable defaultPosition={position} handle=".header" onStop={handleStop}>
      <section
        className={`${styles.floatingWindow}`}
        ref={windowDiv}
      >
        <Resizable
          enable={{ right: true, bottom: true, bottomRight: true }}
          defaultSize={{ width: defaultSize.width, height: defaultSize.height }}
          size={size || undefined}
          minWidth={280}
          minHeight={minHeight}
          handleClasses={{ right: styles.rightHandle, bottom: styles.bottomHandle }}
          onResizeStop={() => {
            if (sizeCallback) {
              const { clientHeight, clientWidth } = windowDiv.current;
              sizeCallback(clientWidth, clientHeight);
            }
          }}
        >
          {children}
        </Resizable>
      </section>
    </Draggable>
  );
}

FloatingWindow.propTypes = {
  children: PropTypes.node,
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }),
  defaultSize: PropTypes.shape({
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  })
};

FloatingWindow.defaultProps = {
  children: [],
  position: { x: 10, y: -600 },
  defaultSize: { height: 'auto', width: 'auto' }
};

export default FloatingWindow;
