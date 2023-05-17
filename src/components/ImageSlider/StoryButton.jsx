import React from 'react';
import PropTypes from 'prop-types';

import SmallLabel from '../common/SmallLabel/SmallLabel';

import styles from './StoryButton.scss';

function StoryButton({ pickStory, storyIdentifier }) {
  return (
    <div className={styles.StoryButton} onClick={pickStory} id={storyIdentifier} role="button" tabIndex="0">
      <SmallLabel style={{ fontSize: 'calc(7px + 1vw)' }} id={storyIdentifier}>Tap here to explore</SmallLabel>
    </div>
  );
}

StoryButton.propTypes = {
  pickStory: PropTypes.func.isRequired,
  storyIdentifier: PropTypes.string.isRequired
};

export default StoryButton;
