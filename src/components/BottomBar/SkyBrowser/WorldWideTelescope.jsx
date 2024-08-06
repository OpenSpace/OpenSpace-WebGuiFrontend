// Turning off linting for no using before define in this file
// due to the many useEffects that use functions, @ylvse 2023-05-24
/* eslint-disable no-use-before-define */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  fineTuneTarget,
  startFineTuningTarget
} from '../../../api/Actions';
import { SkyBrowserInverseZoomDirectionKey, SkyBrowserShowTitleInBrowserKey } from '../../../api/keys';
import { lowPrecisionEqual, useSubscribeToProperty } from '../../../utils/customHooks';
import Picker from '../Picker';

import FloatingWindow from './WindowThreeStates/FloatingWindow';

import styles from './WorldWideTelescope.scss';
import propertyDispatcher from '../../../api/propertyDispatcher';

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
  const [isDragging, setIsDragging] = React.useState(false);
  const [startDragPosition, setStartDragPosition] = React.useState([0, 0]);
  const [wwtHasLoaded, setWwtHasLoaded] = React.useState(false);

  const selectedPairId = useSubscribeToProperty("Modules.SkyBrowser.SelectedPairId");
  const browserId = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPairId}.Browser`);
  const borderColor = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPairId}.Color`);
  const ratio = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPairId}.Ratio`);
  const selectedImagesUrls = useSubscribeToProperty(`ScreenSpace.${browserId}.SelectedImagesUrls`) ?? [];
  const selectedImagesOpacities = useSubscribeToProperty(`ScreenSpace.${browserId}.SelectedImagesOpacities`) ?? [];
  const fov = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPairId}.VerticalFov`, lowPrecisionEqual) ?? [];
  const [ra, dec] = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPairId}.EquatorialAim`) ?? [];
  const roll = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPairId}.Roll`, lowPrecisionEqual) ?? [];
  const borderRadius = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPairId}.BorderRadius`);
  const browserName = useSubscribeToProperty(`ScreenSpace.${browserId}.GuiName`);
  const url = useSubscribeToProperty(`Modules.SkyBrowser.WwtImageCollectionUrl`);
  const showTitle = useSubscribeToProperty(SkyBrowserShowTitleInBrowserKey);
  const inverseZoom = useSubscribeToProperty(SkyBrowserInverseZoomDirectionKey);
  const api = useSelector((state) => state.luaApi);

  const iframe = React.useRef(null);
  let previousImagesUrls = React.useRef(selectedImagesUrls);
  let previousImagesOpacities = React.useRef(selectedImagesOpacities);

  const BorderWidth = 10;
  const TopBarHeight = 25;

  const dispatch = useDispatch();

  // Effects
  // Upon startup, we set the function so we can send WWT messages
  React.useEffect(() => {
    setMessageFunction(sendMessageToWwt);
    window.addEventListener('message', handleCallbackMessage);
    setImageCollectionIsLoaded(false);
    return () => window.removeEventListener('message', handleCallbackMessage);
  }, []);

  // Initialize - WWT has loaded and responded. Load the image
  // collection and set the border properties
  React.useEffect(() => {
    if (wwtHasLoaded && url !== '' && !imageCollectionIsLoaded) {
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
      setBorderRadius(borderRadius);
      setBorderColor(borderColor);
    }
  }, [wwtHasLoaded, url]);

  React.useEffect(() => {
    if (ra !== undefined && dec !== undefined &&
        fov !== undefined && roll !== undefined) {
      sendMessageToWwt({
        event: 'center_on_coordinates',
        ra,
        dec,
        fov,
        roll,
        instant: true
      });
    }
  }, [fov, roll, ra, dec]);

  React.useEffect(() => {
    setBorderRadius(borderRadius);
  }, [borderRadius]);

  React.useEffect(() => {
    setBorderColor(borderColor);
  }, [borderColor]);

  React.useEffect(() => {
    setSize({ width: ratio * (size.height - TopBarHeight), height: size.height });
  }, [ratio]);

  React.useEffect(() => {
    console.log(selectedImagesUrls, previousImagesUrls.current)
    // Image addition
    if (selectedImagesUrls.length > previousImagesUrls.current.length) {
      console.log(selectedImagesUrls, previousImagesUrls.current)
      const newUrl = selectedImagesUrls.filter(url => !previousImagesUrls.current.includes(url));
      console.log("adding image ", newUrl)
      sendMessageToWwt({
        event: 'image_layer_create',
        id: newUrl[0],
        url: newUrl[0],
        mode: 'preloaded',
        goto: false
      });
    } else if (selectedImagesUrls.length < previousImagesUrls.current.length) { // Removal
      const removeUrl = previousImagesUrls.current.filter(url => !selectedImagesUrls.includes(url));
      sendMessageToWwt({
        event: 'image_layer_remove',
        id: removeUrl[0]
      });
    } else { // Opacity change
      console.log(selectedImagesOpacities, previousImagesOpacities.current)
      selectedImagesOpacities?.forEach((x, i) => {
        if (x !== previousImagesOpacities.current[i]) {
          sendMessageToWwt({
            event: 'image_layer_set',
            id: selectedImagesUrls[i],
            setting: 'opacity',
            value: x
          });
        }
      });
    }
    previousImagesUrls.current = selectedImagesUrls;
    previousImagesOpacities.current = selectedImagesOpacities;
  }, [selectedImagesUrls, selectedImagesOpacities]);

  function sendMessageToWwt(message) {
    try {
      const frame = iframe.current.contentWindow;
      if (frame && message) {
        frame.postMessage(message, '*');
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleCallbackMessage(event) {
    if (event.data === 'wwt_has_loaded') {
      setWwtHasLoaded(true);
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
    if (color !== undefined) {
      sendMessageToWwt({
        event: 'set_background_color',
        data: color.map(x => 255 * x)
      });
    }
  }

  // Mouse interactions
  function handleDrag(mouse) {
    if (isDragging) {
      // Calculate pixel translation
      const end = [mouse.clientX, mouse.clientY];
      const width = size.width - BorderWidth;
      const height = size.height - BorderWidth;
      const translation = [end[0] - startDragPosition[0], end[1] - startDragPosition[1]];
      // Calculate [ra, dec] translation without roll
      const percentageTranslation = [translation[0] / width, translation[1] / height];
      dispatch(fineTuneTarget({ identifier: browserId, translation: percentageTranslation }));
    }
  }

  function mouseDown(mouse) {
    dispatch(startFineTuningTarget(browserId));
    const mousePosition = [mouse.clientX, mouse.clientY];
    setIsDragging(true);
    setStartDragPosition(mousePosition);
    propertyDispatcher(dispatch, `Modules.SkyBrowser.${selectedPairId}.StopAnimations`).set(null);
  }

  function mouseUp() {
    setIsDragging(false);
  }

  function scroll(e) {
    const scrollDirection = inverseZoom ? -e.deltaY : e.deltaY;
    api.skybrowser.scrollOverBrowser(selectedPairId, scrollDirection);
    propertyDispatcher(dispatch, `Modules.SkyBrowser.${selectedPairId}.StopAnimations`).set(null);
  }

  function changeSize({width: widthWwt, height: heightWwt}) {
    const newRatio = widthWwt / (heightWwt - TopBarHeight);
    setSize({ width: widthWwt, height: heightWwt });
    propertyDispatcher(dispatch, `Modules.SkyBrowser.${selectedPairId}.Ratio`).set(newRatio);
  }

  return (
    <FloatingWindow
      className={`${Picker.Popover}`}
      title={browserName}
      closeCallback={togglePopover}
      defaultSize={{ height: `425px`, width: `400px` }}
      size={{ height: `${size.height}px`, width: `${size.width}px` }}
      position={position}
      handleDragStop={setPosition}
      sizeCallback={changeSize}
    >
      <header className={`header ${styles.topMenu}`}>
        <div className={styles.title}>{showTitle && browserName}</div>
      </header>
      <div className={styles.content}>
        {/* Covering div to handle interaction */}
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
