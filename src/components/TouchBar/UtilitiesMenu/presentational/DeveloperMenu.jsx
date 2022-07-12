import PropTypes from 'prop-types';
import React from 'react';
import Button from '../../../common/Input/Button/Button';
import stories from '../../../../stories/stories.json';
import styles from '../style/DeveloperMenu.scss';

function DeveloperMenu(props) {
  const buttons = stories.stories.map((story) => (
    <Button
      onClick={props.changeStory}
      id={story.identifier}
      key={story.identifier}
      className={`${styles.developerButtons}
        ${props.storyIdentifier === story.identifier && styles.active}`}
    >
      {story.identifier}
    </Button>
  ));
  return (
    <div className={styles.menuContainer}>
      {buttons}
    </div>
  );
}

DeveloperMenu.propTypes = {
  changeStory: PropTypes.func.isRequired,
  storyIdentifier: PropTypes.string.isRequired,
};

export default DeveloperMenu;
