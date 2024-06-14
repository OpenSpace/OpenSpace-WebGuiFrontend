import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Popover from '../../common/Popover/Popover';
import { removeUserPanel } from '../../../api/Actions';
import styles from "./UserControlPanel.scss"
import WindowThreeStates from '../SkyBrowser/WindowThreeStates/WindowThreeStates';
import { useLocalStorageState } from '../../../utils/customHooks'

function IndividualUserControlPanel({ uri }) {
  const myPopover = useSelector((state) => state.local.popovers.activeUserControlPanels[uri]);
  const showPopover = myPopover ? myPopover.visible : false;
  var slash = (navigator.platform.indexOf('Win') > -1) ? "\\" : "/";
  let panelName = uri;
  if (panelName.indexOf("http") != 0) {
    panelName = uri.substr(uri.lastIndexOf(slash) + 1)
  }
  const [currentPopoverHeight, setCurrentPopoverHeightState] = React.useState(440);
  const [positionPopover, setPositionPopover] = useLocalStorageState(`${panelName} position`, () => {
    return { x: 200, y: 200 };
  });

  const dispatch = useDispatch();

  function closePopover() {
    dispatch(removeUserPanel(uri));
  }

  function setCurrentPopoverHeight(object) {
    setCurrentPopoverHeightState(object.height);
  }

  function popover() {
    let iframesrc = `http://${window.location.host}/webpanels/${panelName}/index.html`;
    if (panelName.indexOf('http') == 0) {
      iframesrc = panelName;
    }

    return (
      <WindowThreeStates
      title={panelName}
      acceptedStyles={['DETACHED', 'PANE']}
      sizeCallback={setCurrentPopoverHeight}
      height={currentPopoverHeight}
      defaultHeight={440}
      minHeight={200}
      closeCallback={closePopover}
      defaultPosition={positionPopover}
      positionCallback={setPositionPopover}
      defaultStyle='DETACHED'
    >
        <div className={styles.content}>
          <hr className={Popover.styles.delimiter} />
          <iframe className={`${styles.panelIframe}`} src={iframesrc} />
        </div>
      </WindowThreeStates>
    );
  }

  return (
    showPopover && popover()
  );
}

IndividualUserControlPanel.propTypes = {
  uri: PropTypes.string.isRequired
};

export default IndividualUserControlPanel;
