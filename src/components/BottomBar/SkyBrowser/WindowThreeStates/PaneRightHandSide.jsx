// Turning off linting for no using before define in this file
// due to the many useEffects that use functions, @ylvse 2023-05-24
/* eslint-disable no-use-before-define */
import React from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';

import styles from './WindowThreeStates.scss';

function PaneRightHandSide({ children = [], defaultWidth, sizeCallback = () => {} }) {
  const windowDiv = React.useRef(null);

  React.useEffect(() => {
    onResizeStop();
    window.addEventListener('resize', onResizeStop);
    return () => window.removeEventListener('resize', onResizeStop);
  }, []);

  function onResizeStop() {
    if (sizeCallback) {
      const { clientHeight, clientWidth } = windowDiv.current;
      sizeCallback({ width: clientWidth, height: clientHeight });
    }
  }

  const resizablePlacement = {
    top: false,
    right: false,
    bottom: false,
    left: true,
    topRight: false,
    bottomRight: false,
    bottomLeft: false,
    topLeft: false
  };

  return (
    <section
      className={styles.pane}
      ref={windowDiv}
    >
      <Resizable
        enable={resizablePlacement}
        defaultSize={{
          width: defaultWidth,
          height: '100%'
        }}
        minWidth={250}
        handleClasses={{ left: styles.leftHandle }}
        onResizeStop={onResizeStop}
        onResize={onResizeStop}
      >
        {children}
      </Resizable>
    </section>
  );
}

PaneRightHandSide.propTypes = {
  children: PropTypes.node,
  sizeCallback: PropTypes.func,
  defaultWidth: PropTypes.number.isRequired // css style for width
};

PaneRightHandSide.styles = styles;

export default PaneRightHandSide;
