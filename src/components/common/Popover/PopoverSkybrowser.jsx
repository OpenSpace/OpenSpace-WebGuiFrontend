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

class PopoverSkybrowser extends Component {
  constructor(props) {
    super(props);
    this.state = { isDetached: !props.attached, isSideview: !props.sideview };
    this.toggleDetach = this.toggleDetach.bind(this);
    this.toggleSideview = this.toggleSideview.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);
  }

  onResizeStop(e, direction, ref, delta) {
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
            width:290,
            height:400,
          }}
          minHeight={280}
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
              { this.props.detachable && (
                <Button onClick={this.toggleDetach} transparent small>
                  <MaterialIcon icon="filter_none" />
                </Button>
              )}
               { this.props.sideview && (
                <Button onClick={this.toggleSideview} transparent small>
                  <MaterialIcon icon="exit_to_app" />
                </Button>
              )}
              { this.props.closeCallback && (
                <Button onClick={this.props.closeCallback} transparent small>
                  <MaterialIcon icon="close" className="small" />
                </Button>
              )}
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
        <WindowSkybrowser {...this.windowInheritedProps}>
          { this.props.children } 
        </WindowSkybrowser>
    );
  }

  get asSideview() {
    return ( 

      <PaneSkybrowser {...this.sideviewInheritedProps}>
        { this.props.children } 
      </PaneSkybrowser>

  );

  }

  toggleDetach() {
    this.setState({ isDetached: !this.state.isDetached });
  }

  toggleSideview() {
    this.setState({ isSideview: !this.state.isSideview });
  }

  render() {

    if(this.state.isDetached) return this.asWindow
    else if(this.state.isSideview) return this.asSideview 
    else return this.asPopup

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
