import React from 'react';
import HelpButton from './presentational/HelpButton';
import HomeButtonContainer from './containers/HomeButtonContainer';
import InfoButtonController from './containers/InfoButtonContainer';
import Controllers from './containers/Controllers';

import styles from './style/UtilitiesMenu.scss';

const UtilitiesMenu = (props) => (
  <div className={styles.UtilitiesMenu}>
    <HomeButtonContainer resetStory={props.resetStory}/>
    <HelpButton />
    <InfoButtonController />
    <Controllers />
  </div>
);

export default UtilitiesMenu;
