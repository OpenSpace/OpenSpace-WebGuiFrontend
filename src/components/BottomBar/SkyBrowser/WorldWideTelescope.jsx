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

  const dispatch = useDispatch();

  // Effects
  React.useEffect(() => {
    setMessageFunction(sendMessageToWwt);
    window.addEventListener("message", handleCallbackMessage);
    setImageCollectionIsLoaded(false);
    
    return () => window.removeEventListener("message", handleCallbackMessage);
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

  function handleDrag(mouse) {
    if (isDragging) {
      const end = [mouse.clientX, mouse.clientY];
      skybrowserApi.finetuneTargetPosition(
        browserId,
        startDragPosition,
        end
      );
    }
  }

  function mouseDown(mouse) {
    skybrowserApi.startFinetuningTarget(browserId);
    const position = [mouse.clientX, mouse.clientY];
    setIsDragging(true);
    setStartDragPosition(position);
    skybrowserApi.stopAnimations(browserId);
  }

  function mouseUp(mouse) {
    setIsDragging(false);
  }

  function scroll(e) {
    let scroll = e.deltaY;
    if (inverseZoom) {
      scroll *= -1;
    }
    skybrowserApi.scrollOverBrowser(browserId, scroll);
    skybrowserApi.stopAnimations(browserId);
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
    onMouseDown={mouseDown}
    onMouseUp={mouseUp}
    onMouseLeave={mouseUp}
    onWheel = {(e) => scroll(e)}
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
