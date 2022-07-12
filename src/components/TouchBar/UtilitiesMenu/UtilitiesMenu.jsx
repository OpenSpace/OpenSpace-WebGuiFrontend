import React from 'react';
import Controllers from './containers/Controllers';
import HomeButtonContainer from './containers/HomeButtonContainer';
import InfoButtonController from './containers/InfoButtonContainer';
import HelpButton from './presentational/HelpButton';
import styles from './style/UtilitiesMenu.scss';

function UtilitiesMenu(props) {
  return (
    <div className={styles.UtilitiesMenu}>
      <HomeButtonContainer resetStory={props.resetStory} />
      <HelpButton />
      <InfoButtonController />
      <Controllers />
    </div>
  );
}

export default UtilitiesMenu;
