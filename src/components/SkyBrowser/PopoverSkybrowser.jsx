import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Button from '../common/Input/Button/Button';
import styles from './PopoverSkybrowser.scss';

class PopoverSkybrowser extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { children } = this.props;
    return (
      <section className={`${styles.popover} ${this.styles}`}>
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
          <div className={styles.content}>
            { children }
          </div>
        </Resizable>
      </section>
    );
  }
}

PopoverSkybrowser.propTypes = {
  children: PropTypes.node,
  size: PropTypes.shape({
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
};

PopoverSkybrowser.defaultProps = {
  children: [],
  size: { height: 'auto', width: 'auto' },
};

PopoverSkybrowser.styles = styles;

export default PopoverSkybrowser;
