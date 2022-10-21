import React from 'react';
import { connect } from 'react-redux';
import Picker from '../Picker';
import FloatingWindow from './WindowThreeStates/FloatingWindow'
import styles from './WorldWideTelescope.scss'
import { SkyBrowser_ShowTitleInBrowserKey, SkyBrowser_InverseZoomDirectionKey } from '../../../api/keys';
import { getBoolPropertyValue } from '../../../utils/propertyTreeHelpers';
import {
  subscribeToProperty,
  unsubscribeToProperty
} from '../../../api/Actions';

function WorldWideTelescope({ 
  setMessageFunction,
  setImageCollectionIsLoaded,
  showTitle,
  inverseZoom,
  startListeningToProperties,
  stopListeningToProperties,
  browserId,
  browserName,
  browserAimInfo,
  borderRadius,
  browserColor,
  skybrowserApi,
  addAllSelectedImages,
  size,
  setSize,
  url,
  position,
  togglePopover,
  setPosition
}) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [startDragPosition, setStartDragPosition] = React.useState([0, 0]);
  const topBarHeight = 25;
  const iframe = React.useRef(null);

  React.useEffect(() => {
    setMessageFunction(sendMessageToWwt);
    window.addEventListener("message", handleCallbackMessage);
    setImageCollectionIsLoaded(false);
    
    return () => window.removeEventListener("message", handleCallbackMessage);
  }, []);

  React.useEffect(() => {
    setAim(browserAimInfo);
  }, [browserAimInfo]);

  React.useEffect(() => {
    setBorderRadius(borderRadius);
  }, [borderRadius]);

  React.useEffect(() => {
    setBorderColor(browserColor);
  }, [browserColor]);

  React.useEffect(() => {
    startListeningToProperties();
    return () => stopListeningToProperties();
  }, []);

  function sendMessageToWwt(message) {
    try {
      let frame = iframe.current.contentWindow;
      if (frame) {
        frame.postMessage(message, "*");
      }
    } catch (error) {
      // Do nothing
    }
  }

  function handleCallbackMessage(event) {
    if (event.data == "wwt_has_loaded") {
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
    if (event.data == "load_image_collection_completed") {
      setImageCollectionIsLoaded(true);
      addAllSelectedImages(browserId, false);
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

  function setAim(aimInfo) {
    sendMessageToWwt({
      "event": "center_on_coordinates",
      "ra": aimInfo.ra,
      "dec": aimInfo.dec,
      "fov": aimInfo.fov,
      "roll": aimInfo.roll,
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
    const ratio = widthWwt / (heightWwt - topBarHeight);
    const scale = (heightWwt - topBarHeight) / windowHeight;
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

const mapStateToProps = (state) => {
  return {
    showTitle: getBoolPropertyValue(state, SkyBrowser_ShowTitleInBrowserKey),
    inverseZoom: getBoolPropertyValue(state, SkyBrowser_InverseZoomDirectionKey),
  }
};

const mapDispatchToProps = dispatch => ({
  startListeningToProperties: () => {
    dispatch(subscribeToProperty(SkyBrowser_ShowTitleInBrowserKey));
    dispatch(subscribeToProperty(SkyBrowser_InverseZoomDirectionKey));
  },
  stopListeningToProperties: () => {
    dispatch(unsubscribeToProperty(SkyBrowser_ShowTitleInBrowserKey));
    dispatch(unsubscribeToProperty(SkyBrowser_InverseZoomDirectionKey));
  },
})

WorldWideTelescope = connect(
  mapStateToProps,
  mapDispatchToProps)
(WorldWideTelescope);

export default WorldWideTelescope;
