import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import styles from './WindowThreeStates.scss';

class PaneRightHandSide extends Component {
  constructor(props) {
    super(props);
    this.onResizeStop = this.onResizeStop.bind(this);
  }

  onResizeStop() {
    const { sizeCallback } = this.props;
    if (sizeCallback) {
      sizeCallback(this.windowDiv.clientWidth, this.windowDiv.clientHeight)
    }
  }

  componentDidMount() {
    this.onResizeStop();
    window.addEventListener('resize', this.onResizeStop);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResizeStop)
  }

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
      <section
        className={`${styles.pane}`}
        ref={(divElement) => { this.windowDiv = divElement; }}
      >
        <Resizable
          enable={resizablePlacement}
          defaultSize={{
            width: this.props.width,
            height: '100%',
          }}
          minWidth={250}
          handleClasses={{ left: styles.leftHandle }}
          onResizeStop={this.onResizeStop}
          onResize={this.onResizeStop}
        >
          {children}
        </Resizable>
      </section>
    );
  }
}

PaneRightHandSide.propTypes = {
  children: PropTypes.node,
};

PaneRightHandSide.defaultProps = {
  children: [],
};

PaneRightHandSide.styles = styles;

export default PaneRightHandSide;
