import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { removeUserPanel } from '../../../api/Actions';
import { useLocalStorageState } from '../../../utils/customHooks';
import WindowThreeStates from '../SkyBrowser/WindowThreeStates/WindowThreeStates';

import styles from './UserControlPanel.scss';

function IndividualUserControlPanel({ uri }) {
  const myPopover = useSelector((state) => state.local.popovers.activeUserControlPanels[uri]);
  const showPopover = myPopover ? myPopover.visible : false;
  const slash = (navigator.platform.indexOf('Win') > -1) ? '\\' : '/';
  let panelName = uri;
  if (panelName.indexOf('http') !== 0) {
    panelName = uri.substr(uri.lastIndexOf(slash) + 1);
  }
  const [positionPopover, setPositionPopover] = useLocalStorageState(`${panelName} position`, () => ({ x: 200, y: 200 }));
  const [size, sizeCallback] = useLocalStorageState(`${panelName} size`, () => ({ width: 200, height: 440 }));

  const dispatch = useDispatch();

  function closePopover() {
    dispatch(removeUserPanel(uri));
  }

  function popover() {
    let iframesrc = `http://${window.location.host}/webpanels/${panelName}/index.html`;
    if (panelName.indexOf('http') === 0) {
      iframesrc = panelName;
    }

    return (
      <WindowThreeStates
        title={panelName}
        acceptedStyles={['DETACHED', 'PANE']}
        defaultHeight={440}
        minHeight={200}
        closeCallback={closePopover}
        defaultPosition={positionPopover}
        positionCallback={setPositionPopover}
        defaultStyle="DETACHED"
        sizeCallback={sizeCallback}
      >
        <div className={styles.content} style={{ height: size.height }}>
          <iframe title={panelName} className={`${styles.panelIframe}`} src={iframesrc} />
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
