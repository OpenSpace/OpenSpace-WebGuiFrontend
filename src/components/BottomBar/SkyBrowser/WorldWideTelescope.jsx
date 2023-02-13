import React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { lowPrecisionEqual } from '../../../utils/customHooks';
import Picker from '../Picker';
import PropTypes from 'prop-types';
import FloatingWindow from './WindowThreeStates/FloatingWindow'
import styles from './WorldWideTelescope.scss'
import { SkyBrowser_ShowTitleInBrowserKey, SkyBrowser_InverseZoomDirectionKey } from '../../../api/keys';
import { getBoolPropertyValue } from '../../../utils/propertyTreeHelpers';
import {
  subscribeToProperty,
  unsubscribeToProperty
} from '../../../api/Actions';

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
  const [isPinching, setIsPinching] = React.useState(false);
  const [startPinchPositions, setStartPinchPositions] = React.useState([]);
  const [setupWwtFunc, setSetupWwtFunc] = React.useState(null);
  const TopBarHeight = 25;
  // Refs
  const iframe = React.useRef(null);

  // Selectors & dispatch - access Redux store
  // Get each value separately to reduce unnecessary renders
  const fov = useSelector((state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].fov, lowPrecisionEqual);
  const ra = useSelector((state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].ra, lowPrecisionEqual);
  const dec = useSelector((state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].dec, lowPrecisionEqual);
  const roll = useSelector((state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].roll, lowPrecisionEqual);
  const borderRadius = useSelector(
    (state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].borderRadius
  , lowPrecisionEqual);
  const browserName = useSelector((state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].name);
  const browserId = useSelector((state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].id);
  const browserColor = useSelector((state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId].color, shallowEqual);
  const url = useSelector((state) => state.skybrowser.url);
  const skybrowserApi = useSelector((state) => state.luaApi.skybrowser);
  const showTitle = useSelector((state) => getBoolPropertyValue(state, SkyBrowser_ShowTitleInBrowserKey));
  const inverseZoom = useSelector((state) => getBoolPropertyValue(state, SkyBrowser_InverseZoomDirectionKey));
  const BorderWidth = 10;

  const dispatch = useDispatch();

  // Effects
  React.useEffect(() => {
    setMessageFunction(sendMessageToWwt);
    window.addEventListener("message", handleCallbackMessage);
    setImageCollectionIsLoaded(false);
    return () => window.removeEventListener("message", handleCallbackMessage);
  }, []);

  React.useEffect(() => {
    // Send aim messages to WorldWide Telescope to prompt it to reply with a message
    setSetupWwtFunc(setInterval(setAim, 250));
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
    dispatch(subscribeToProperty(SkyBrowser_ShowTitleInBrowserKey));
    dispatch(subscribeToProperty(SkyBrowser_InverseZoomDirectionKey));
    return () => {
      dispatch(unsubscribeToProperty(SkyBrowser_ShowTitleInBrowserKey));
      dispatch(unsubscribeToProperty(SkyBrowser_InverseZoomDirectionKey));
    }; 
  }, []);

  // When WorldWide Telescope has replied with a message, stop sending it unnecessary messages
  function stopSetupWwtFunc() {
    setSetupWwtFunc(interval => {
        clearInterval(interval);
        return null;
    });
  }

  function sendMessageToWwt(message) {
    try {
      let frame = iframe.current.contentWindow;
      if (frame && message) {
        frame.postMessage(message, "*");
      }
    } catch (error) {
      // Do nothing
    }
  }

  function initialize() {
    sendMessageToWwt({
        event: "modify_settings",
        settings: [["hideAllChrome", true]],
        target: "app"
      });
      sendMessageToWwt({
        event: "load_image_collection",
        url: url,
        loadChildFolders: true
      });
      setBorderColor(browserColor);
      setBorderRadius(borderRadius);
  }

  function handleCallbackMessage(event) {
    if (event.data == "wwt_has_loaded") {
      setWwtHasLoaded(true);
      stopSetupWwtFunc();
    }
    if (event.data == "load_image_collection_completed") {
      setImageCollectionIsLoaded(true);
    }
  }

  function setBorderRadius(radius) {
    sendMessageToWwt({
      event: "set_border_radius",
      data: radius
    });
  }

  function setBorderColor(color) {
    sendMessageToWwt({
      event: "set_background_color",
      data: color
    });
  }

  function setAim() {
    sendMessageToWwt({
      "event": "center_on_coordinates",
      "ra": ra,
      "dec": dec,
      "fov": fov,
      "roll": roll,
      "instant": true
    });
  }

  function getClientXY(interaction) {
    let position = undefined;
    if (interaction.type === "touchstart" || interaction.type === "touchmove") {
      if (!interaction?.touches?.[0]?.clientX || !interaction?.touches?.[0]?.clientY) {
        return;
      }
      if (interaction?.touches?.length > 1) {
        const touches = interaction.touches;
        position = [
          [touches[0].clientX, touches[0].clientY],
          [touches[1].clientX, touches[1].clientY]
        ];
      }
      else {
        const touch = interaction.touches[0]; 
        position = [touch.clientX, touch.clientY];
      }
    }
    else { // mouse
      position = [interaction.clientX, interaction.clientY];
    }
    if (!position) {
      return undefined;
    }
    return position;
  }

  function scrollZoom(scroll) {
    if (inverseZoom) {
      scroll *= -1;
    }
    skybrowserApi.scrollOverBrowser(browserId, scroll);
    skybrowserApi.stopAnimations(browserId);
  }

  function handleDrag(interaction) {
    const end = getClientXY(interaction);
    if (isDragging && end) {
      // Calculate pixel translation
      const width = size.width - BorderWidth;
      const height = size.height - BorderWidth;
      const translation = [end[0] - startDragPosition[0], end[1] - startDragPosition[1]];
      
      const percentageX = translation[0] / width;
      const percentageY = translation[1] / height;
      // Calculate [ra, dec] translation without roll
      const percentageTranslation = [ percentageX, percentageY ]; 
      
      // Call lua function
      skybrowserApi.finetuneTargetPosition(
        browserId,
        percentageTranslation
      );
    }
    else if (isPinching && end) {
      const euclidianDistance = (coord => {
        const a = coord[0][0] - coord[1][0];
        const b = coord[0][1] - coord[1][1];
        return Math.sqrt(a * a + b * b);
      });
      // See if distance is larger or smaller compared to first
      // interaction
      const startDistance = euclidianDistance(startPinchPositions);
      const endDistance = euclidianDistance(end);

      const scroll = startDistance < endDistance ? 1 : -1;
      scrollZoom(scroll);
    }
  }

  function startInteraction(interaction) {
    const position = getClientXY(interaction);
    skybrowserApi.startFinetuningTarget(browserId);
    const hasMultipleCoords = Array.isArray(position[0]);
    if (hasMultipleCoords) {
      setIsPinching(true);
      setStartPinchPositions(position);
    } else {
      setIsDragging(true);
      setStartDragPosition(position);
    }
    skybrowserApi.stopAnimations(browserId);
  }

  function endInteraction() {
    setIsDragging(false);
    setIsPinching(false);
  }

  function changeSize(widthWwt, heightWwt) {
    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
    const ratio = widthWwt / (heightWwt - TopBarHeight);
    const scale = (heightWwt - TopBarHeight) / windowHeight;
    const newWidth = 2 * scale * ratio;
    const newHeight = 2 * scale;
    const id = browserId;
    setSize({ width: widthWwt, height: heightWwt });
    skybrowserApi.setBrowserRatio(id, newWidth / newHeight);
  }

  const topBar =
    <header className={`header ${styles.topMenu}`}>
      <div className={styles.title}>{showTitle && browserName}</div>
    </header>;

  // Covering div to handle interaction
  const interactionDiv = <div
    className={styles.container}
    onMouseMove={handleDrag}
    onMouseDown={startInteraction}
    onMouseUp={endInteraction}
    onMouseLeave={endInteraction}
    onTouchStart={startInteraction}
    onTouchMove={handleDrag}
    onTouchEnd={endInteraction}
    onWheel = {(e) => scrollZoom(e.deltaY)}
  />

  return (
    <FloatingWindow
      className={`${Picker.Popover}`}
      title={browserName}
      closeCallback={togglePopover}
      defaultSize={{ height: `425px`, width: `400px` }}
      size={{ height: `${size.height}px`, width: `${size.width}px` }}
      position={position}
      handleStop={setPosition}
      setNewHeight={changeSize}
    >
      {topBar}
      <div className={styles.content}>
        {interactionDiv}
        <iframe
          id="webpage"
          name = "wwt"
          ref={el => iframe.current = el}
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
  imageCollectionIsLoaded: PropTypes.bool,
  position: PropTypes.object,
  setImageCollectionIsLoaded: PropTypes.func,
  setMessageFunction: PropTypes.func,
  setPosition: PropTypes.func,
  setSize: PropTypes.func,
  size: PropTypes.object,
  togglePopover: PropTypes.func
};

export default WorldWideTelescope;
