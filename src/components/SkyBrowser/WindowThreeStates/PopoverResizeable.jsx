import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import styles from './WindowThreeStates.scss';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import Button from '../../common/Input/Button/Button';

class PopoverResizeable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { children } = this.props;
    return (
      <section className={`${styles.popover}`}>
        <Resizable
          enable={{
            top: true,
            right: false,
            left: false,
            bottom: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          defaultSize={{
            width: this.props.size.width,
            height: this.props.size.height,
          }}
          minHeight={280}
          maxHeight={900}
          handleClasses={{
            top: styles.topHandle,
            right: styles.rightHandle,
            left: styles.leftHandle,
          }}
          onResizeStop={this.onResizeStop}
        >
          { children }
        </Resizable>
      </section>
    );
  }
}

PopoverResizeable.propTypes = {
  children: PropTypes.node,
  size: PropTypes.shape({
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
};

PopoverResizeable.defaultProps = {
  children: [],
  size: { height: 'auto', width: 'auto' },
};

PopoverResizeable.styles = styles;

export default PopoverResizeable;
