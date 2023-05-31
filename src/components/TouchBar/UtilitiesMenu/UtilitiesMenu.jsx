import React from 'react';
import PropTypes from 'prop-types';

import Controllers from './containers/Controllers';
import HomeButtonContainer from './containers/HomeButtonContainer';
import InfoButtonController from './containers/InfoButtonContainer';
import HelpButton from './presentational/HelpButton';

import styles from './style/UtilitiesMenu.scss';

function UtilitiesMenu({ resetStory }) {
  return (
    <div className={styles.UtilitiesMenu}>
      <HomeButtonContainer resetStory={resetStory} />
      <HelpButton />
      <InfoButtonController />
      <Controllers />
    </div>
  );
}

UtilitiesMenu.propTypes = {
  resetStory: PropTypes.func.isRequired
};

export default UtilitiesMenu;
