import PropTypes from 'prop-types';
import React, { Component } from 'react';
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
    return findStyles(this.props.arrow);
  }

  get styles() {
    return findStyles(this.props.className);
  }

  get inheritedProps() {
    const doNotInclude = 'title arrow closeCallback detachable attached';
    return excludeKeys(this.props, doNotInclude);
  }

  get windowInheritedProps() {
    const doNotInclude = 'detachable attached';
    return excludeKeys(this.props, doNotInclude);
  }

  get asPopup() {
    return (
      <section {...this.inheritedProps} className={`${styles.popover} ${this.arrowStyle} ${this.styles}`}>
        { this.props.title && (
          <header className={styles.header}>
            <div className={styles.title}>
              { this.props.title }
            </div>

            <div>
              { this.props.detachable && (
                <Button onClick={this.toggleDetach} transparent small>
                  <MaterialIcon icon="filter_none" />
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
      </section>
    );
  }

  get asWindow() {
    return (<Window {...this.windowInheritedProps} className={`${this.styles}`}>{ this.props.children }</Window>);
  }

  toggleDetach() {
    this.setState({ isDetached: !this.state.isDetached });
  }

  render() {
    return this.state.isDetached ? this.asWindow : this.asPopup;
  }
}

Popover.propTypes = {
  arrow: PropTypes.string,
  children: PropTypes.node.isRequired,
  closeCallback: PropTypes.func,
  className: PropTypes.string,
  detachable: PropTypes.bool,
  attached: PropTypes.bool,
  title: PropTypes.string,
};

Popover.defaultProps = {
  arrow: 'arrow bottom center',
  closeCallback: null,
  className: '',
  detachable: false,
  attached: true,
  title: null,
};

Popover.styles = styles;

export default Popover;
