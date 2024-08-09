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
import shallowEqualArrays from 'shallow-equal/arrays';

import FloatingWindow from './WindowThreeStates/FloatingWindow';

import styles from './WorldWideTelescope.scss';
import propertyDispatcher from '../../../api/propertyDispatcher';

function WorldWideTelescope({
  imageCollectionIsLoaded,
  position,
  setImageCollectionIsLoaded,
  setPosition,
  setSize,
  size,
  togglePopover,
  activeImage
}) {
  const hasNewPosition = React.useRef(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startDragPosition, setStartDragPosition] = React.useState([0, 0]);
  const [wwtHasLoaded, setWwtHasLoaded] = React.useState(false);

  const selectedPairId = useSubscribeToProperty("Modules.SkyBrowser.SelectedPairId");
  const browserId = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPairId}.Browser`);
  const borderColor = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPairId}.Color`)?.map(x => x * 255);
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
  const imageList = useSelector((state) => state.skybrowser.imageList);

  const iframe = React.useRef(null);
  const container = React.useRef(null);
  const pingPongInterval = React.useRef(null);
  const wwtAim = React.useRef({ ra: 0, dec: 0, fov: 70, roll: 0});
  const previousImagesUrls = React.useRef(selectedImagesUrls);
  const previousImagesOpacities = React.useRef(selectedImagesOpacities);

  const BorderWidth = 10;
  const TopBarHeight = 25;
  const w = container.current?.clientWidth ?? 1;
  const h = container.current?.clientHeight ?? 1;
  const radiusPixels = borderRadius * Math.min(w * 0.5, h * 0.5);
  const coloredBorderWidth = 5;

  const dispatch = useDispatch();

  // Effects
  React.useEffect(() => {
    setImageCollectionIsLoaded(false);
  }, [])

  // Upon startup, we set the function so we can send WWT messages
  // Dependent on the id of the selected pair so we send to the correct pair
  React.useEffect(() => {
    window.addEventListener('message', handleCallbackMessage);
    return () => window.removeEventListener('message', handleCallbackMessage);
  }, [selectedPairId]);

  // Start pinging WWT to see when it responds
  React.useEffect(() => {
    if (!wwtHasLoaded) {
      pingPongInterval.current = setInterval(() => {
        sendMessageToWwt({
          event: 'center_on_coordinates',
          ra: 0,
          dec: 0,
          fov: 60,
          roll: 0,
          instant: true
        });
      }, 1000);
    } else {
      clearInterval(pingPongInterval.current);
    }
  }, [wwtHasLoaded]);

  // Go to images when a new one is selected
  React.useEffect(() => {
    const imageData = imageList[activeImage];
    if (!imageData) return;
    sendMessageToWwt({
      event: 'center_on_coordinates',
      ra: imageData.ra,
      dec: imageData.dec,
      fov: imageData.fov,
      roll,
      instant: false
    })
  }, [activeImage])


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
    }
  }, [wwtHasLoaded, url]);

  React.useEffect(() => {
    if (!isDragging && (!lowPrecisionEqual(ra, wwtAim.current.ra) ||
        !lowPrecisionEqual(dec, wwtAim.current.dec) ||
        !lowPrecisionEqual(fov, wwtAim.current.fov) ||
        !lowPrecisionEqual(roll, wwtAim.current.roll))) {


    }
  }, [roll]);

  React.useEffect(() => {
    setSize({ width: ratio * (size.height - TopBarHeight), height: size.height });
  }, [ratio]);

  // Brute force this as the performance loss is negligible and there are many complicated cases
  React.useEffect(() => {
    previousImagesUrls.current.map(url => {
      sendMessageToWwt({
        event: 'image_layer_remove',
        id: url
      });
    });
    selectedImagesUrls.map((url, i) => {
      console.log(selectedImagesOpacities, i)
      sendMessageToWwt({
        event: 'image_layer_create',
        id: url,
        url: url,
        mode: 'preloaded',
        goto: false
      })
      if (selectedImagesOpacities[i]) {
        sendMessageToWwt({
          event: 'image_layer_set',
          id: url,
          setting: 'opacity',
          value: selectedImagesOpacities[i]
        });
      }
      });
    previousImagesUrls.current = selectedImagesUrls;
    previousImagesOpacities.current = selectedImagesOpacities;
  }, [wwtHasLoaded, selectedImagesUrls, selectedImagesOpacities]);

  /*
    function setImageLayerOrder(browserId, identifier, order) {
    luaApi.skybrowser.setImageLayerOrder(browserId, imageList[identifier].url, order);
    const reverseOrder = imageIndicesCurrent.length - order - 1;
    passMessageToWwt({
      event: 'image_layer_order',
      id: String(identifier),
      order: Number(reverseOrder),
      version: messageCounter
    });
    setMessageCounter(messageCounter + 1);
  }

    // Each message to WorldWide Telescope has a unique order number
  const [messageCounter, setMessageCounter] = React.useState(0);


    function addAllSelectedImages(browserId, passToOs = true) {
    if (browsers === undefined || browsers[browserId] === undefined) {
      return;
    }
    // Make deep copies in order to reverse later
    const reverseImages = [...browsers[browserId].selectedImages];
    const opacities = [...browsers[browserId].opacities];
    reverseImages.reverse().forEach((image, index) => {
      selectImage(String(image), passToOs);
      setOpacityOfImage(String(image), opacities.reverse()[index], passToOs);
    });
      // When WWT has loaded the image collection, add all selected images
  React.useEffect(() => {
    if (imageCollectionIsLoaded) {
      // eslint-disable-next-line no-use-before-define
      //addAllSelectedImages(selectedBrowserId, false);
    }
  }, [imageCollectionIsLoaded]);
  }
*/

  function sendMessageToWwt(message) {
    try {
      const frame = iframe.current?.contentWindow;
      if (frame && message) {
        frame.postMessage(message, 'http://localhost:8080/');
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleCallbackMessage(event) {
    if (event.data.type === 'wwt_pointer_move') {
      setIsDragging(true);
    }
    if (event.data.type === 'wwt_pointer_up') {
      hasNewPosition.current = true;
      setIsDragging(false);
    }
    if (event.data.type === "wwt_ping_pong") {
      setWwtHasLoaded(true);
    }
    if (event.data.type === 'wwt_view_state') {
      if (!wwtHasLoaded) {
        setWwtHasLoaded(true);
      }
        const newAim = [ event.data.raRad, event.data.decRad ].map(rad => rad * (180/Math.PI));
        const newRoll = event.data.rollDeg;
        const newFov = event.data.fovDeg;
        propertyDispatcher(dispatch, `Modules.SkyBrowser.${selectedPairId}.EquatorialAim`).set(newAim);

        //api.setPropertyValueSingle(`Modules.SkyBrowser.${selectedPairId}.EquatorialAim`, newAim, 0.1);
        //api.setPropertyValueSingle(`Modules.SkyBrowser.${selectedPairId}.VerticalFov`, newFov, 0.1);
        //api.setPropertyValueSingle(`Modules.SkyBrowser.${selectedPairId}.Roll`, newRoll, 0.1);
        propertyDispatcher(dispatch, `Modules.SkyBrowser.${selectedPairId}.Roll`).set(newRoll);
        propertyDispatcher(dispatch, `Modules.SkyBrowser.${selectedPairId}.VerticalFov`).set(newFov);
        wwtAim.current = ({ ra: newAim[0], dec: newAim[1], fov: newFov, roll: newRoll});
        hasNewPosition.current = false;
    }
    if (event.data.event === 'load_image_collection_completed') {
      setImageCollectionIsLoaded(true);
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
        {/* Covering div to handle interaction
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
        */}
        <div
          className={styles.roundedCorners}
          style={{
            borderRadius: `${radiusPixels}px`,
            borderWidth: `${coloredBorderWidth}px`,
            borderColor: `rgb(${borderColor})`
            }}
          ref={container}
          >
          <iframe
              id="webpage"
              name="wwt"
              title="WorldWideTelescope"
              ref={(el) => { iframe.current = el; }}
              src={`http://localhost:8080/?origin=${window.location.origin}`}
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
  setPosition: PropTypes.func.isRequired,
  setSize: PropTypes.func.isRequired,
  size: PropTypes.object.isRequired,
  togglePopover: PropTypes.func.isRequired
};

export default WorldWideTelescope;
