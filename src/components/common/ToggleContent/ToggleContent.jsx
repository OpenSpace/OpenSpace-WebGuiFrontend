import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ToggleHeader from './ToggleHeader';

import styles from './ToggleContent.scss';

class ToggleContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      toggled: props.show,
      hovered: false
    };

    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.mouseEntered = this.mouseEntered.bind(this);
    this.mouseLeft = this.mouseLeft.bind(this);
  }

  toggleExpanded() {
    this.setState({ toggled: !this.state.toggled });
  }

  mouseEntered() {
    this.setState({ hovered: true });
  }

  mouseLeft() {
    this.setState({ hovered: false });
  }

  render() {
    const { children, headerChildren, title, showEnabled } = this.props;
    const { toggled } = this.state;

    return ( (children.length !== 0) && ((children[0].length != 0) || (children[1].length != 0)) ) ? (
      <div className={styles.toggleContent}
           onMouseEnter={this.mouseEntered}
           onMouseLeave={this.mouseLeft}>
        <ToggleHeader
          title={title}
          onClick={this.toggleExpanded}
          children={headerChildren}
          showEnabled={showEnabled}
          toggled={toggled}
        />
        <div className={styles.content}>
          { toggled && children }
        </div>
      </div>
    ) : null;
  }
}

ToggleContent.propTypes = {
  children: PropTypes.node,
  headerChildren: PropTypes.node,
  show: PropTypes.bool,
  showEnabled: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

ToggleContent.defaultProps = {
  children: '',
  show: false
};

export default ToggleContent;
