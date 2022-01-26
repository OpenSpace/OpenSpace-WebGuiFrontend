import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { excludeKeys } from '../../../utils/helpers';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import styles from './PopoverSkybrowser.scss';
import Button from '../Input/Button/Button';
import Window from '../Window/Window';
import { Resizable } from 're-resizable';
import WindowSkybrowser from '../Window/WindowSkybrowser';
import SmallLabel from '../../common/SmallLabel/SmallLabel';
import TabMenu from '../../Sidebar/TabMenu/TabMenu';
import PaneSkybrowser from '../Pane/PaneSkybrowser';
import SkybrowserTabs from '../../common/Tabs/SkybrowserTabs';

const findStyles = arr => arr.split(' ')
  .map(style => styles[style] || style)
  .join(' ');

const WindowStyle = {
  DETACHED : "DETACHED",
  PANE : "PANE",
  ATTACHED : "ATTACHED"
}

class PopoverSkybrowser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      windowStyle: WindowStyle.ATTACHED,
      height: 440,
    };
    this.setAsPane = this.setAsPane.bind(this);
    this.setAsDetached = this.setAsDetached.bind(this);
    this.setAsAttached = this.setAsAttached.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);
  }

  onResizeStop(e, direction, ref, delta) {
    this.setState({
      height : this.state.height + delta.height
    })
    this.props.heightCallback(this.state.height);
  }

  get arrowStyle() {
    return findStyles(this.props.arrow);
  }

  get styles() {
    return findStyles(this.props.className);
  }

  get inheritedProps() {
    const doNotInclude = 'title arrow closeCallback detachable attached sideview';
    return excludeKeys(this.props, doNotInclude);
  }

  get windowInheritedProps() {
    const doNotInclude = 'detachable attached sideview';
    return excludeKeys(this.props, doNotInclude);
  }

  get sideviewInheritedProps() {
    const doNotInclude = 'detachable attached sideview';
    return excludeKeys(this.props, doNotInclude);
  }

  get asPopup() {
    return (

      <section {...this.inheritedProps} className={`${styles.popover} ${this.arrowStyle} ${this.styles}`}>
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
            width: 300,
            height: this.state.height,
          }}
          minHeight={280}
          maxHeight={900}
          handleClasses={{
            top: styles.topHandle,
            right: styles.rightHandle,
            left: styles.leftHandle
          }}
          onResizeStop={this.onResizeStop}
        >
        { this.props.title && (
          <header>
            <div className={styles.title}>
              { this.props.title }
            </div>

            <div>
              { <Button onClick={this.setAsDetached} transparent small>
                  <MaterialIcon icon="filter_none" />
                </Button>
              }
               {
                <Button onClick={this.setAsPane} transparent small>
                  <MaterialIcon icon="exit_to_app" />
                </Button>
              }
              {
                <Button onClick={this.props.closeCallback} transparent small>
                  <MaterialIcon icon="close" className="small" />
                </Button>
              }
            </div>
          </header>
        )}
        { this.props.children }
        </Resizable>
      </section>

    );
  }

  get asWindow() {
    return (
        <WindowSkybrowser {...this.windowInheritedProps} onResizeStop={this.onResizeStop}
          size={{height: this.state.height, width: '300px'}} setAsPane = {this.setAsPane} setAsAttached = {this.setAsAttached}>
          { this.props.children }
        </WindowSkybrowser>
    );
  }

  get asSideview() {
    return (
      <PaneSkybrowser
        {...this.sideviewInheritedProps}
        setAsAttached = {this.setAsAttached}
        setAsDetached = {this.setAsDetached}
      >
        { this.props.children }
      </PaneSkybrowser>
  );

  }

  setAsDetached() {
    this.setState({ windowStyle: WindowStyle.DETACHED });
    //this.props.heightCallback(this.state.height);
  }

  setAsPane() {
    this.setState({ windowStyle: WindowStyle.PANE });
    this.props.heightCallback(window.innerHeight);
  }

  setAsAttached() {
    this.setState({ windowStyle: WindowStyle.ATTACHED });
    this.props.heightCallback(window.innerHeight);
  }

  render() {

    switch(this.state.windowStyle) {
      case WindowStyle.ATTACHED:
        return this.asPopup;
      case WindowStyle.DETACHED:
        return  this.asWindow;
      case WindowStyle.PANE:
        return this.asSideview;
      default:
        return WindowStyle.ATTACHED;
    }

  }
}

PopoverSkybrowser.propTypes = {
  arrow: PropTypes.string,
  children: PropTypes.node.isRequired,
  closeCallback: PropTypes.func,
  className: PropTypes.string,
  detachable: PropTypes.bool,
  attached: PropTypes.bool,
  sideview: PropTypes.bool,
  title: PropTypes.string,

};

PopoverSkybrowser.defaultProps = {
  arrow: 'arrow bottom center',
  closeCallback: null,
  className: '',
  detachable: false,
  attached: true,
  sideview: true,
  title: null,
};

PopoverSkybrowser.styles = styles;

export default PopoverSkybrowser;
