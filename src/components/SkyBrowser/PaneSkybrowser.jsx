import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import styles from './PaneSkybrowser.scss';
import Button from '../common/Input/Button/Button';

class PaneSkybrowser extends Component {
  render() {
    const { children } = this.props;

    const resizablePlacement = {
      top: false,
      right: false,
      bottom: false,
      left: true,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
      topLeft: false,
    };

    return (
      <section className={styles.pane}>
        <Resizable
          enable={resizablePlacement}
          defaultSize={{
            width: this.props.width,
            height: '100%',
          }}
          minWidth={250}
          handleClasses={{ left: styles.leftHandle }}
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

PaneSkybrowser.propTypes = {
  children: PropTypes.node,
};

PaneSkybrowser.defaultProps = {
  children: [],
};

PaneSkybrowser.styles = styles;

export default PaneSkybrowser;
