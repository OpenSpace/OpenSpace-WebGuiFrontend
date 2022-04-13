import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';
import styles from './WindowThreeStates.scss';
import MaterialIcon from '../../../common/MaterialIcon/MaterialIcon';
import Button from '../../../common/Input/Button/Button';

class FloatingWindow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      children, size, position, setNewHeight,
    } = this.props;

    return (
      <Draggable defaultPosition={position} handle=".header">
        <section
          className={`${styles.floatingWindow}`}
          ref={(divElement) => {
            this.windowDiv = divElement;
          }}
        >
          <Resizable
            enable={{ right: true, bottom: true }}
            defaultSize={{ width: size.width, height: size.height }}
            minWidth={280}
            minHeight={this.props.minHeight}
            handleClasses={{ right: styles.rightHandle, bottom: styles.bottomHandle }}
            onResizeStop={() => {
              if(setNewHeight) {
                setNewHeight(this.windowDiv.clientWidth, this.windowDiv.clientHeight)
              }
            }}
          >
            {children}
          </Resizable>
        </section>
      </Draggable>
    );
  }
}

FloatingWindow.propTypes = {
  children: PropTypes.node,
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  size: PropTypes.shape({
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
};

FloatingWindow.defaultProps = {
  children: [],
  position: { x: 10, y: -600 },
  size: { height: 'auto', width: 'auto' },
};

export default FloatingWindow;
