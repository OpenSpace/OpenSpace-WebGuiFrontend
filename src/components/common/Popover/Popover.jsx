import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { excludeKeys } from '../../../utils/helpers';
import Button from '../Input/Button/Button';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
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

            <div>
              { headerButton && headerButton }
              { detachable && (
                <Button onClick={this.toggleDetach} transparent small>
                  <MaterialIcon icon="filter_none" />
                </Button>
              )}
              { closeCallback && (
                <Button onClick={closeCallback} transparent small>
                  <MaterialIcon icon="close" className="small" />
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
  children: PropTypes.node.isRequired,
  closeCallback: PropTypes.func,
  className: PropTypes.string,
  detachable: PropTypes.bool,
  attached: PropTypes.bool,
  title: PropTypes.string
};

Popover.defaultProps = {
  arrow: 'arrow bottom center',
  closeCallback: null,
  className: '',
  detachable: false,
  attached: true,
  title: null
};

Popover.styles = styles;

export default Popover;
