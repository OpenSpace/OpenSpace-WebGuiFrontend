import React from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';

import styles from './WindowThreeStates.scss';

function FloatingWindow({
  children = [],
  defaultSize = { height: 'auto', width: 'auto' },
  handleDragStop = () => {},
  minHeight = undefined,
  defaultPosition = { x: 10, y: -600 },
  size = undefined,
  sizeCallback = undefined
}) {
  const windowDiv = React.useRef(null);
  return (
    <Draggable defaultPosition={defaultPosition} handle=".header" onStop={handleDragStop}>
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
              sizeCallback({ width: clientWidth, height: clientHeight });
            }
          }}
          onResize={() => {
            if (sizeCallback) {
              const { clientHeight, clientWidth } = windowDiv.current;
              sizeCallback({ width: clientWidth, height: clientHeight });
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
  defaultSize: PropTypes.shape({
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }),
  handleDragStop: PropTypes.func,
  minHeight: PropTypes.number,
  defaultPosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }),
  size: PropTypes.shape({
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }),
  sizeCallback: PropTypes.func
};

export default FloatingWindow;
