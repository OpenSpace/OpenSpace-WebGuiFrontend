import PropTypes from 'prop-types';
import React from 'react';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import Icon from '../common/MaterialIcon/MaterialIcon';
import styles from './Button.scss';

const StoryButton = ({ pickStory, storyIdentifier }) => (
  <div className = {styles.generalB} onClick={pickStory} id={storyIdentifier} role="button" tabIndex="0">

    <SmallLabel  id={storyIdentifier}>{storyIdentifier}</SmallLabel>
    <Icon icon="chevron_right" className={styles.Icon} />
  </div>
);

StoryButton.propTypes = {
  pickStory: PropTypes.func.isRequired,
  storyIdentifier: PropTypes.string.isRequired,
  storyId: PropTypes.string.isRequired,
};

export default StoryButton;
