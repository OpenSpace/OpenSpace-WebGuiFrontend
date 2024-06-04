import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { removeUserPanel } from '../../../api/Actions';
import Popover from '../../common/Popover/Popover';
import Picker from '../Picker';

import styles from './UserControlPanel.scss';

function IndividualUserControlPanel({ uri }) {
  const myPopover = useSelector((state) => state.local.popovers.activeUserControlPanels[uri]);
  const showPopover = myPopover ? myPopover.visible : false;
  const slash = (navigator.platform.indexOf('Win') > -1) ? '\\' : '/';

  const panelName = uri.substr(uri.lastIndexOf(slash) + 1);

  const dispatch = useDispatch();

  function closePopover() {
    dispatch(removeUserPanel(uri));
  }

  function popover() {
    let iframesrc = `http://${window.location.host}/webpanels/${panelName}/index.html`;
    if ((panelName.indexOf('http://') === 0) || (panelName.indexOf('https://') === 0)) {
      iframesrc = panelName;
    }
    return (
      <Popover
        className={`${Picker.Popover} ${styles.userPanel}`}
        title={panelName}
        closeCallback={closePopover}
        attached={false}
      >
        <div className={styles.content}>
          <hr className={Popover.styles.delimiter} />
          <iframe className={`${styles.panelIframe}`} src={iframesrc} />
        </div>
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      {showPopover && popover()}
    </div>
  );
}

IndividualUserControlPanel.propTypes = {
  uri: PropTypes.string.isRequired
};

export default IndividualUserControlPanel;
