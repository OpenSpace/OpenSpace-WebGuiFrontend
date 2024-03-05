import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import Picker from '../../BottomBar/Picker';
import Popover from '../../common/Popover/Popover';
import { removeUserPanel } from '../../../api/Actions';
import styles from "./UserControlPanel.scss"

function IndividualUserControlPanel({ uri }) {
  const myPopover = useSelector((state) => state.local.popovers.activeUserControlPanels[uri]);
  const showPopover = myPopover ? myPopover.visible : false;

    const panelName = uri.substr(uri.lastIndexOf('/') + 1)

  const dispatch = useDispatch();

  function closePopover() {
    dispatch(removeUserPanel(uri));
  }

  function popover() {
    return (
      <Popover
        className={`${Picker.Popover} ${styles.userPanel}`}
        title={panelName}
        closeCallback={closePopover}
        attached={false}
      >
        <div className={styles.content}>
            <hr className={Popover.styles.delimiter} />
            <iframe className={`${styles.panelIframe}`} src={`http://${window.location.host}/user/${panelName}`}></iframe>
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
