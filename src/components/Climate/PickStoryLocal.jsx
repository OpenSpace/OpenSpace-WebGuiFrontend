import PropTypes from 'prop-types';
import React from 'react';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import Icon from '../common/MaterialIcon/MaterialIcon';
import styles from '../Climate/Button.scss';

const StoryButton = ({ pickStory,storyTitle }) => (
  <div className = {styles.generalB} onClick={pickStory} id={storyTitle} role="button" tabIndex="0">

    <SmallLabel  id={storyTitle}>{storyTitle}</SmallLabel>
    <Icon icon="chevron_right" className={styles.Icon} />
  </div>
);

StoryButton.propTypes = {


};

export default StoryButton;
