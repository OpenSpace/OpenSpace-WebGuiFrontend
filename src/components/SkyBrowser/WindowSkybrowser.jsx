import React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';
import styles from './WindowSkybrowser.scss';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Button from '../common/Input/Button/Button';
import { excludeKeys } from '../../utils/helpers';

const WindowSkybrowser = (props) => {
  const {
    children, size, position, onResizeStop,
  } = props;

  return (
    <Draggable
      defaultPosition={position}
      handle=".header"
    >
      <section
        className={styles.window}
      >
        <Resizable
          enable={{ right: true, bottom: true }}
          defaultSize={{ width: size.width, height: size.height }}
          minWidth={280}
          minHeight={280}
          handleClasses={{ right: styles.rightHandle, bottom: styles.bottomHandle }}
          onResizeStop={onResizeStop}
        >
          <div className={styles.content}>
            { children }
          </div>
        </Resizable>
      </section>
    </Draggable>
  );
};

WindowSkybrowser.propTypes = {
  children: PropTypes.node,
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  size: PropTypes.shape({
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  })
};

WindowSkybrowser.defaultProps = {
  children: [],
  position: { x: 10, y: -600 },
  size: { height: 'auto', width: 'auto' },
};

export default WindowSkybrowser;
