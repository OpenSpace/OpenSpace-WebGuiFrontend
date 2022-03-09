import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import { excludeKeys } from '../../utils/helpers';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Button from '../common/Input/Button/Button';
import styles from './PopoverSkybrowser.scss';
import WindowSkybrowser from './WindowSkybrowser';
import PaneSkybrowser from './PaneSkybrowser';
import PopoverSkybrowser from './PopoverSkybrowser';

const WindowStyle = {
  DETACHED: 'DETACHED',
  PANE: 'PANE',
  ATTACHED: 'ATTACHED',
};

class SkyBrowserWindowHandler extends Component {
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

  onResizeStop(e, direction, ref, delta) {
    this.props.heightCallback(this.props.height + delta.height);
  }

  get asPopup() {
    const { children, height } = this.props;
    return (
      <PopoverSkybrowser
        onResizeStop={this.onResizeStop}
        size={{ height: `${height}px`, width: `${this.state.windowWidth}px` }}
        setAsPane={this.setAsPane}
        setAsDetached={this.setAsDetached}
      >
      { this.createTopBar() }
      { children }
      </PopoverSkybrowser>
    );
  }

  get asWindow() {
    const { children } = this.props;
    return (
      <WindowSkybrowser
        onResizeStop={this.onResizeStop}
        size={{ height: this.props.height, width: `${this.state.windowWidth}px` }}
        setAsPane={this.setAsPane}
        setAsAttached={this.setAsAttached}
      >
        { this.createTopBar() }
        { children }
      </WindowSkybrowser>
    );
  }

  get asSideview() {
    const { children } = this.props;
    return (
      <PaneSkybrowser
        setAsAttached={this.setAsAttached}
        setAsDetached={this.setAsDetached}
        width={`${this.state.windowWidth}px`}
      >
        { this.createTopBar() }
        { children }
      </PaneSkybrowser>
    );
  }

  setAsDetached() {
    this.setState({ windowStyle: WindowStyle.DETACHED });
  }

  setAsPane() {
    this.setState({ windowStyle: WindowStyle.PANE });
  }

  setAsAttached() {
    this.setState({ windowStyle: WindowStyle.ATTACHED });
  }

  createTopBar() {
    const { windowStyle } = this.state;
    const detachedButton = windowStyle != WindowStyle.DETACHED && <Button onClick={this.setAsDetached} transparent small>
                            <MaterialIcon icon="filter_none" />
                          </Button>;
    const paneButton = windowStyle != WindowStyle.PANE && <Button onClick={this.setAsPane} transparent small>
                            <MaterialIcon icon="exit_to_app" />
                          </Button>
    const attachedButton = windowStyle != WindowStyle.ATTACHED && <Button onClick={this.setAsAttached} transparent small>
                            <MaterialIcon icon="open_in_browser" />
                          </Button>
    const closeCallbackButton = <Button onClick={this.props.closeCallback} transparent small>
                            <MaterialIcon icon="close" />
                          </Button>;

    return <header className="header">
      <div className={styles.title}>
        { this.props.title }
      </div>
      <div>
      { detachedButton }
      { attachedButton }
      { paneButton }
      { closeCallbackButton }
      </div>
    </header>;
  }

  render() {
    const { windowStyle } = this.state;

    switch (windowStyle) {
      case WindowStyle.ATTACHED: return this.asPopup;
      case WindowStyle.DETACHED: return this.asWindow;
      case WindowStyle.PANE: return this.asSideview;
      default: return this.asPopup;
    }
  }
}

SkyBrowserWindowHandler.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  closeCallback: PropTypes.func,
  heightCallback: PropTypes.func,
  height: PropTypes.Number,
};

SkyBrowserWindowHandler.defaultProps = {
  children: [],
  title: '',
  closeCallback: null,
  heightCallback: null,
  height: 440,
};

SkyBrowserWindowHandler.styles = styles;

export default SkyBrowserWindowHandler;
