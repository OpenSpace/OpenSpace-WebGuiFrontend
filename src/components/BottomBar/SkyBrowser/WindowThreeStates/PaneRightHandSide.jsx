import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import styles from './WindowThreeStates.scss';
import MaterialIcon from '../../../common/MaterialIcon/MaterialIcon';
import Button from '../../../common/Input/Button/Button';

class PaneRightHandSide extends Component {
  constructor(props) {
    super(props);
    this.handleResize = this.handleResize.bind(this);
  }

  handleResize() {
    const { innerWidth: width, innerHeight: height } = window;
    this.props.heightCallback(innerWidth, innerHeight);
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
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
      <section className={`${styles.pane}`}>
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
