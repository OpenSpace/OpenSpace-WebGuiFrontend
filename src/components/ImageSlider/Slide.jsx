import React from 'react';
import PropTypes from 'prop-types';

import CenteredLabel from '../common/CenteredLabel/CenteredLabel';

import StoryButton from './StoryButton';

import styles from './Slide.scss';

function Slide({ image, onChangeStory, storyInfo }) {
  function handleStory(e) {
    onChangeStory(e.target.id);
  }

  return (
    <div className={styles.Container}>
      <img src={image} className={styles.Slide} alt="Story" />
      <div className={styles.StoryInfo}>
        <CenteredLabel className={styles.StoryName}>{storyInfo.title}</CenteredLabel>
        <CenteredLabel className={styles.Description}>{storyInfo.info}</CenteredLabel>
        <StoryButton
          pickStory={handleStory}
          storyIdentifier={storyInfo.identifier}
        />
      </div>
    </div>
  );
}

Slide.propTypes = {
  image: PropTypes.string.isRequired,
  onChangeStory: PropTypes.func.isRequired,
  storyInfo: PropTypes.shape({
    identifier: PropTypes.string,
    title: PropTypes.string,
    info: PropTypes.string
  }).isRequired
};

export default Slide;
