/*import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import styles from './Button.scss';
import StoryButton from './StoryButton';
import GreenlandButton from './GreenlandButton'
class Selectestorybutton extends Component {
  constructor(props) {
    super(props);

    this.handleStory = this.handleStory.bind(this);
  }

  handleStory(e) {
    this.props.onChangeStory(e.target.id);
  }

  render() {
    const { image, storyInfo } = this.props;

    return (
      <div className={styles.generalB}>

        <div className = {styles.Icon}>
          <CenteredLabel className={styles.StoryName}>{storyInfo.title}</CenteredLabel>
          <StoryButton
            pickStory={this.handleStory}
            storyIdentifier={storyInfo.identifier}
          />
        </div>

      </div>
    );
  }
}

Selectestorybutton.propTypes = {

  onChangeStory: PropTypes.func.isRequired,
  storyInfo: PropTypes.shape({
    title: PropTypes.string,
    info: PropTypes.string,
  }).isRequired,
};

export default Selectestorybutton;
*/
