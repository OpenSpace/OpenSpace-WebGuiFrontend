import React, { Component } from 'react';
import Icon from '../../../common/MaterialIcon/MaterialIcon';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';

import { instructionImage } from '../../../../api/resources';
import styles from './../style/UtilitiesButtons.scss';

class HelpButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showImage: false,
    };

    this.handleClick = this.handleClick.bind(this);
    this.timeout = null;
  }

  componentWillUnmount() {
      if (this.timeout) {
        clearTimeout(this.timeout);
    }
  }

  // Show image for 10s and then set state to false
  handleClick() {
    this.setState({ showImage: !this.state.showImage });
    this.timeout = setTimeout(() => {
      this.setState({
        showImage: false,
      });
    }, 10000);
  }

  render() {
    return (
      <div
        className={`${styles.UtilitiesButton}
        ${this.state.showImage && styles.active}`}
        onClick={this.handleClick}
        role="button"
        tabIndex="0"
      >
        <Icon icon="help_outline" className={styles.Icon} />
        { this.state.showImage && <img src={instructionImage} className={styles.Instructions} alt={'instructions'} />}
        <SmallLabel>Help</SmallLabel>
      </div>
    );
  }
}

export default HelpButton;
