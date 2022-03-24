import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import styles from './WindowThreeStates.scss';
import FloatingWindow from './FloatingWindow';
import PaneRightHandSide from './PaneRightHandSide';
import PopoverResizeable from './PopoverResizeable';
import Button from '../../common/Input/Button/Button';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';

const WindowStyle = {
  DETACHED: 'DETACHED',
  PANE: 'PANE',
  ATTACHED: 'ATTACHED',
};

class WindowThreeStates extends Component {
  constructor(props) {
    super(props);
    this.state = {
      windowStyle: WindowStyle.ATTACHED,
      windowWidth: 350,
    };

    this.setAsPane = this.setAsPane.bind(this);
    this.setAsDetached = this.setAsDetached.bind(this);
    this.setAsAttached = this.setAsAttached.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);
    this.createTopBar = this.createTopBar.bind(this);
  }

  componentDidMount() {
    // const height = this.divElement.clientHeight;
    // this.props.heightCallback(height);
  }

  onResizeStop(e, direction, ref, delta) {
    console.log(this.props.heightWindow + delta.height);
    this.props.heightCallback(this.props.heightWindow + delta.height);
  }

  get asPopup() {
    const { children, height } = this.props;
    return (
      <PopoverResizeable
        onResizeStop={this.onResizeStop}
        size={{ height: `${height}px`, width: `${this.state.windowWidth}px` }}
        setAsPane={this.setAsPane}
        setAsDetached={this.setAsDetached}
      >
        {this.createTopBar()}
        {children}
      </PopoverResizeable>
    );
  }

  get asWindow() {
    const { children, height } = this.props;
    return (
      <FloatingWindow
        onResizeStop={this.onResizeStop}
        size={{ height, width: `${this.state.windowWidth}px` }}
        setAsPane={this.setAsPane}
        setAsAttached={this.setAsAttached}
      >
        {this.createTopBar()}
        {children}
      </FloatingWindow>
    );
  }

  get asSideview() {
    const { children } = this.props;
    return (
      <PaneRightHandSide
        setAsAttached={this.setAsAttached}
        setAsDetached={this.setAsDetached}
        width={`${this.state.windowWidth}px`}
        heightCallback={this.props.heightCallback}
      >
        {this.createTopBar()}
        {children}
      </PaneRightHandSide>
    );
  }

  setAsDetached() {
    this.setState({ windowStyle: WindowStyle.DETACHED });
    this.props.heightCallback(this.props.defaultHeight);
  }

  setAsPane() {
    this.setState({ windowStyle: WindowStyle.PANE });
  }

  setAsAttached() {
    this.setState({ windowStyle: WindowStyle.ATTACHED });
    this.props.heightCallback(this.props.defaultHeight);
  }

  createTopBar() {
    const { windowStyle } = this.state;
    const detachedButton = windowStyle != WindowStyle.DETACHED && (
      <Button onClick={this.setAsDetached} transparent small>
        <MaterialIcon icon="filter_none" />
      </Button>
    );
    const paneButton = windowStyle != WindowStyle.PANE && (
      <Button onClick={this.setAsPane} transparent small>
        <MaterialIcon icon="exit_to_app" />
      </Button>
    );
    const attachedButton = windowStyle != WindowStyle.ATTACHED && (
      <Button onClick={this.setAsAttached} transparent small>
        <MaterialIcon icon="open_in_browser" />
      </Button>
    );
    const closeCallbackButton = (
      <Button onClick={this.props.closeCallback} transparent small>
        <MaterialIcon icon="close" />
      </Button>
    );

    return (
      <header className={`header ${styles.topMenu}`}>
        <div className={styles.title}>{this.props.title}</div>
        <div>
          {detachedButton}
          {attachedButton}
          {paneButton}
          {closeCallbackButton}
        </div>
      </header>
    );
  }

  render() {
    const { windowStyle } = this.state;

    switch (windowStyle) {
      case WindowStyle.ATTACHED:
        return this.asPopup;
      case WindowStyle.DETACHED:
        return this.asWindow;
      case WindowStyle.PANE:
        return this.asSideview;
      default:
        return this.asPopup;
    }
  }
}

WindowThreeStates.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  closeCallback: PropTypes.func,
  heightCallback: PropTypes.func,
  heightWindow: PropTypes.number,
  defaultHeight: PropTypes.number,
};

WindowThreeStates.defaultProps = {
  children: [],
  title: '',
  closeCallback: null,
  heightCallback: null,
  heightWindow: 440,
  defaultHeight: 440,
};

WindowThreeStates.styles = styles;

export default WindowThreeStates;