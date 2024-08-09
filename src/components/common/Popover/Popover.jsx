import React, { Component } from 'react';
import { MdClose, MdOutlineFilterNone } from 'react-icons/md';
import PropTypes from 'prop-types';

import { excludeKeys } from '../../../utils/helpers';
import Button from '../Input/Button/Button';
import Window from '../Window/Window';

import styles from './Popover.scss';

const findStyles = (arr) => arr.split(' ')
  .map((style) => styles[style] || style)
  .join(' ');

class Popover extends Component {
  constructor(props) {
    super(props);
    this.state = { isDetached: !props.attached };
    this.toggleDetach = this.toggleDetach.bind(this);
  }

  get arrowStyle() {
    const { arrow } = this.props;
    return findStyles(arrow);
  }

  get styles() {
    const { className } = this.props;
    return findStyles(className);
  }

  get inheritedProps() {
    const doNotInclude = 'title arrow closeCallback detachable attached headerButton';
    return excludeKeys(this.props, doNotInclude);
  }

  get windowInheritedProps() {
    const doNotInclude = 'detachable attached';
    return excludeKeys(this.props, doNotInclude);
  }

  get asPopup() {
    const {
      title, headerButton, detachable, closeCallback, children
    } = this.props;
    return (
      <section
        {...this.inheritedProps}
        className={`${styles.popover} ${this.arrowStyle} ${this.styles}`}
      >
        { title && (
          <header className={styles.header}>
            <div className={styles.title}>
              { title }
            </div>

            <div style={{ display: 'flex' }}>
              { headerButton && headerButton }
              { detachable && (
                <Button onClick={this.toggleDetach} transparent small>
                  <MdOutlineFilterNone />
                </Button>
              )}
              { closeCallback && (
                <Button onClick={closeCallback} transparent small>
                  <MdClose className="small" />
                </Button>
              )}
            </div>
          </header>
        )}
        { children }
      </section>
    );
  }

  get asWindow() {
    const { children } = this.props;
    return (
      <Window
        {...this.windowInheritedProps}
        className={`${this.styles}`}
      >
        {children}
      </Window>
    );
  }

  toggleDetach() {
    const { isDetached } = this.state;
    this.setState({ isDetached: !isDetached });
  }

  render() {
    const { isDetached } = this.state;
    return isDetached ? this.asWindow : this.asPopup;
  }
}

Popover.propTypes = {
  arrow: PropTypes.string,
  attached: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  closeCallback: PropTypes.func,
  detachable: PropTypes.bool,
  headerButton: PropTypes.element,
  title: PropTypes.string
};

Popover.defaultProps = {
  arrow: 'arrow bottom center',
  attached: true,
  className: '',
  closeCallback: null,
  detachable: false,
  headerButton: undefined,
  title: null
};

Popover.styles = styles;

export default Popover;
