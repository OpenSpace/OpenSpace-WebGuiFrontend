// Turning off linting for no using before define in this file
// due to the many useEffects that use functions, @ylvse 2023-05-24
/* eslint-disable no-use-before-define */
import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import {
  subscribeToProperty,
  unsubscribeToProperty
} from '../../../api/Actions';
import { SkyBrowserInverseZoomDirectionKey, SkyBrowserShowTitleInBrowserKey } from '../../../api/keys';
import { lowPrecisionEqual } from '../../../utils/customHooks';
import { getBoolPropertyValue } from '../../../utils/propertyTreeHelpers';
import Picker from '../Picker';

import FloatingWindow from './WindowThreeStates/FloatingWindow';

import styles from './WorldWideTelescope.scss';

function WorldWideTelescope({
  imageCollectionIsLoaded,
  position,
  setImageCollectionIsLoaded,
  setMessageFunction,
  setPosition,
  setSize,
  size,
  togglePopover
}) {
  // State
  const [isDragging, setIsDragging] = React.useState(false);
  const [startDragPosition, setStartDragPosition] = React.useState([0, 0]);
  const [wwtHasLoaded, setWwtHasLoaded] = React.useState(false);
  const TopBarHeight = 25;

  // Refs
  const iframe = React.useRef(null);
  const setSetupWwtFunc = React.useRef(null);

  // Selectors & dispatch - access Redux store
  // Get each value separately to reduce unnecessary renders
  const selectedId = useSelector((state) => state.skybrowser.selectedBrowserId);
  const fov = useSelector((state) => state.skybrowser.browsers[selectedId].fov, lowPrecisionEqual);
  const ra = useSelector((state) => state.skybrowser.browsers[selectedId].ra, lowPrecisionEqual);
  const dec = useSelector((state) => state.skybrowser.browsers[selectedId].dec, lowPrecisionEqual);
  const roll = useSelector(
    (state) => state.skybrowser.browsers[selectedId].roll,
    lowPrecisionEqual
  );
  const borderRadius = useSelector(
    (state) => state.skybrowser.browsers[selectedId].borderRadius,
    lowPrecisionEqual
  );
  const browserName = useSelector((state) => state.skybrowser.browsers[selectedId].name);
  const browserId = useSelector((state) => state.skybrowser.browsers[selectedId].id);
  const browserColor = useSelector(
    (state) => state.skybrowser.browsers[selectedId].color,
    shallowEqual
  );
  const url = useSelector((state) => state.skybrowser.url);
  const skybrowserApi = useSelector((state) => state.luaApi.skybrowser);
  const showTitle = useSelector(
    (state) => getBoolPropertyValue(state, SkyBrowserShowTitleInBrowserKey)
  );
  const inverseZoom = useSelector(
    (state) => getBoolPropertyValue(state, SkyBrowserInverseZoomDirectionKey)
  );
  const BorderWidth = 10;

  const dispatch = useDispatch();

  // Effects
  React.useEffect(() => {
    setMessageFunction(sendMessageToWwt);
    window.addEventListener('message', handleCallbackMessage);
    setImageCollectionIsLoaded(false);
    return () => window.removeEventListener('message', handleCallbackMessage);
  }, []);

  React.useEffect(() => {
    // Send aim messages to WorldWide Telescope to prompt it to reply with a message
    setSetupWwtFunc.current = setInterval(setAim, 250);
  }, []);

  React.useEffect(() => {
    if (wwtHasLoaded && url !== '' && !imageCollectionIsLoaded) {
      initialize();
    }
  }, [wwtHasLoaded, url]);

  React.useEffect(() => {
    setAim();
  }, [fov, roll, ra, dec]);

  React.useEffect(() => {
    setBorderRadius(borderRadius);
  }, [borderRadius]);

  React.useEffect(() => {
    setBorderColor(browserColor);
  }, [browserColor]);

  React.useEffect(() => {
    dispatch(subscribeToProperty(SkyBrowserShowTitleInBrowserKey));
    dispatch(subscribeToProperty(SkyBrowserInverseZoomDirectionKey));
    return () => {
      dispatch(unsubscribeToProperty(SkyBrowserShowTitleInBrowserKey));
      dispatch(unsubscribeToProperty(SkyBrowserInverseZoomDirectionKey));
    };
  }, []);

  // When WorldWide Telescope has replied with a message, stop sending it unnecessary messages
  function stopSetupWwtFunc() {
    setSetupWwtFunc.current = (interval) => {
      clearInterval(interval);
      return null;
    };
  }

  function sendMessageToWwt(message) {
    try {
      const frame = iframe.current.contentWindow;
      if (frame && message) {
        frame.postMessage(message, '*');
      }
    } catch (error) {
      // Do nothing
    }
  }

  function initialize() {
    sendMessageToWwt({
      event: 'modify_settings',
      settings: [['hideAllChrome', true]],
      target: 'app'
    });
    sendMessageToWwt({
      event: 'load_image_collection',
      url,
      loadChildFolders: true
    });
    setBorderColor(browserColor);
    setBorderRadius(borderRadius);
  }

  function handleCallbackMessage(event) {
    if (event.data === 'wwt_has_loaded') {
      setWwtHasLoaded(true);
      stopSetupWwtFunc();
    }
    if (event.data === 'load_image_collection_completed') {
      setImageCollectionIsLoaded(true);
    }
  }

  function setBorderRadius(radius) {
    sendMessageToWwt({
      event: 'set_border_radius',
      data: radius
    });
  }

  function setBorderColor(color) {
    sendMessageToWwt({
      event: 'set_background_color',
      data: color
    });
  }

  function setAim() {
    sendMessageToWwt({
      event: 'center_on_coordinates',
      ra,
      dec,
      fov,
      roll,
      instant: true
    });
  }

  function handleDrag(mouse) {
    if (isDragging) {
      // Calculate pixel translation
      const end = [mouse.clientX, mouse.clientY];
      const width = size.width - BorderWidth;
      const height = size.height - BorderWidth;
      const translation = [end[0] - startDragPosition[0], end[1] - startDragPosition[1]];
      // Calculate [ra, dec] translation without roll
      const percentageTranslation = [translation[0] / width, translation[1] / height];
      // Call lua function
      skybrowserApi.finetuneTargetPosition(
        browserId,
        percentageTranslation
      );
    }
  }

  function mouseDown(mouse) {
    skybrowserApi.startFinetuningTarget(browserId);
    const mousePosition = [mouse.clientX, mouse.clientY];
    setIsDragging(true);
    setStartDragPosition(mousePosition);
    skybrowserApi.stopAnimations(browserId);
  }

  function mouseUp() {
    setIsDragging(false);
  }

  function scroll(e) {
    const scrollDirection = inverseZoom ? -e.deltaY : e.deltaY;
    skybrowserApi.scrollOverBrowser(browserId, scrollDirection);
    skybrowserApi.stopAnimations(browserId);
  }

  function changeSize(widthWwt, heightWwt) {
    const { innerHeight: windowHeight } = window;
    const ratio = widthWwt / (heightWwt - TopBarHeight);
    const scale = (heightWwt - TopBarHeight) / windowHeight;
    const newWidth = 2 * scale * ratio;
    const newHeight = 2 * scale;
    const id = browserId;
    setSize({ width: widthWwt, height: heightWwt });
    skybrowserApi.setBrowserRatio(id, newWidth / newHeight);
  }

  const topBar = (
    <header className={`header ${styles.topMenu}`}>
      <div className={styles.title}>{showTitle && browserName}</div>
    </header>
  );

  // Covering div to handle interaction
  const interactionDiv = (
    <div
      className={styles.container}
      onMouseMove={handleDrag}
      onMouseDown={mouseDown}
      onMouseUp={mouseUp}
      onMouseLeave={mouseUp}
      onWheel={(e) => scroll(e)}
      role="button"
      aria-label="Dragging area for WorldWideTelescope"
      tabIndex={0}
    />
  );

  return (
    <FloatingWindow
      className={`${Picker.Popover}`}
      title={browserName}
      closeCallback={togglePopover}
      defaultSize={{ height: `425px`, width: `400px` }}
      size={{ height: `${size.height}px`, width: `${size.width}px` }}
      position={position}
      handleStop={setPosition}
      sizeCallback={changeSize}
    >
      {topBar}
      <div className={styles.content}>
        {interactionDiv}
        <iframe
          id="webpage"
          name="wwt"
          title="WorldWideTelescope"
          ref={(el) => { iframe.current = el; }}
          src="http://wwt.openspaceproject.com/1/gui/"
          allow="accelerometer; clipboard-write; gyroscope"
          allowFullScreen
          frameBorder="0"
          align="middle"
          className={styles.wwt}
        >
          <p>ERROR: cannot display AAS WorldWide Telescope research app!</p>
        </iframe>
      </div>
    </FloatingWindow>
  );
}

WorldWideTelescope.propTypes = {
  imageCollectionIsLoaded: PropTypes.bool.isRequired,
  position: PropTypes.object.isRequired,
  setImageCollectionIsLoaded: PropTypes.func.isRequired,
  setMessageFunction: PropTypes.func.isRequired,
  setPosition: PropTypes.func.isRequired,
  setSize: PropTypes.func.isRequired,
  size: PropTypes.object.isRequired,
  togglePopover: PropTypes.func.isRequired
};

export default WorldWideTelescope;
