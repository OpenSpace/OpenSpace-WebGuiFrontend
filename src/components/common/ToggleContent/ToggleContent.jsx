import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styles from './ToggleContent.scss';
import ToggleHeader from './ToggleHeader';

class ToggleContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hovered: false
    };

    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.mouseEntered = this.mouseEntered.bind(this);
    this.mouseLeft = this.mouseLeft.bind(this);
  }

  toggleExpanded() {
    this.props.setExpanded(!this.props.expanded);
  }

  mouseEntered() {
    this.setState({ hovered: true });
  }

  mouseLeft() {
    this.setState({ hovered: false });
  }

  render() {
    const { children, header, title, expanded, showEnabled } = this.props;

    return ( (children.length !== 0) && ((children[0].length != 0) || (children[1].length != 0)) ) ? (
      <div className={styles.toggleContent}
           onMouseEnter={this.mouseEntered}
           onMouseLeave={this.mouseLeft}>
        { header ? header : 
          <ToggleHeader
            title={title}
            onClick={this.toggleExpanded}
            showEnabled={showEnabled}
            expanded={expanded}
          />
        }
        <div className={styles.content}>
          { expanded && children }
        </div>
      </div>
    ) : null;
  }
}

ToggleContent.propTypes = {
  children: PropTypes.node,
  header: PropTypes.node,
  setExpanded: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
  showEnabled: PropTypes.bool,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ])
};

ToggleContent.defaultProps = {
  children: '',
  expanded: false
};

export default ToggleContent;
