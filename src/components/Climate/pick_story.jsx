import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import styles from '../ImageSlider/Slide.scss';
import StoryButton from '../ImageSlider/StoryButton';

class Pick extends Component {
  constructor(props) {
    super(props);

    this.handleStory = this.handleStory.bind(this);
  }

  handleStory(e) {
    this.props.onChangeStory(e.target.id);
  }

  render() {
    const { storyInfo } = this.props;

    return (
      <div className={styles.Container}>
        
        <div className={styles.StoryInfo}>
          <CenteredLabel className={styles.StoryName}>{storyInfo.title}</CenteredLabel>
          <CenteredLabel className={styles.Description}>{storyInfo.info}</CenteredLabel>
          <StoryButton
            pickStory={this.handleStory}
            storyIdentifier={storyInfo.identifier}
          />
        </div>
      </div>
    );
  }
}

Pick.propTypes = {

  onChangeStory: PropTypes.func.isRequired,
  storyInfo: PropTypes.shape({
    title: PropTypes.string,
    info: PropTypes.string,
  }).isRequired,
};

export default Pick;
