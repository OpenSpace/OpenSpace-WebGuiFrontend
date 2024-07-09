import React from 'react';
import { IoTelescopeSharp } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';

import {
  disableHoverCircle,
  loadSkyBrowserData,
  moveHoverCircle,
  setPopoverVisibility,
  subscribeToProperty,
  subscribeToSkyBrowser,
  unsubscribeToProperty,
  unsubscribeToSkyBrowser
} from '../../api/Actions';
import { SkyBrowserHideTargetsBrowsersWithGuiKey } from '../../api/keys';
import { getBoolPropertyValue } from '../../utils/propertyTreeHelpers';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Button from '../common/Input/Button/Button';
import LoadingBlock from '../common/LoadingBlock/LoadingBlock';
import SmallLabel from '../common/SmallLabel/SmallLabel';

import SkyBrowserImageList from './SkyBrowser/SkyBrowserImageList';
import SkyBrowserTabs from './SkyBrowser/SkyBrowserTabs';
import WindowThreeStates from './SkyBrowser/WindowThreeStates/WindowThreeStates';
import WorldWideTelescope from './SkyBrowser/WorldWideTelescope';
import Picker from './Picker';
import wwtLogo from './wwtlogo.png';

import styles from './SkyBrowserPanel.scss';

function SkyBrowserPanel() {
  const [activeImage, setActiveImage] = React.useState('');
  const [currentTabHeight, setCurrentTabHeight] = React.useState(200);
  const [currentPopoverHeight, setCurrentPopoverHeightState] = React.useState(440);
  const [imageCollectionIsLoaded, setImageCollectionIsLoaded] = React.useState(false);
  const [dataIsLoaded, setDataIsLoaded] = React.useState(false);
  const [wwtSize, setWwtSize] = React.useState({ width: 400, height: 400 });
  const [wwtPosition, setWwtPositionState] = React.useState({ x: -800, y: -600 });
  const MenuHeight = 70;
  const MinimumTabHeight = 80;

  const wwt = React.useRef();

  // Get redux state
  const browsersExist = useSelector((state) => {
    const { browsers } = state.skybrowser;
    return browsers && Object.keys(browsers)?.length !== 0;
  });
  const cameraInSolarSystem = useSelector((state) => state.skybrowser.cameraInSolarSystem);
  const imageList = useSelector((state) => state.skybrowser.imageList);
  const isDataInitialized = useSelector((state) => state.skybrowser.isInitialized);
  const luaApi = useSelector((state) => state.luaApi);
  const popoverVisible = useSelector((state) => state.local.popovers.skybrowser.visible);
  const hideTargetsBrowsersWithGui = useSelector(
    (state) => getBoolPropertyValue(state, SkyBrowserHideTargetsBrowsersWithGuiKey)
  );
  const browserColor = useSelector((state) => {
    const browser = state.skybrowser.browsers?.[state.skybrowser.selectedBrowserId];
    return browser ? `rgb(${browser.color})` : 'gray';
  });
  const selectedBrowserId = useSelector((state) => state.skybrowser.selectedBrowserId);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(subscribeToSkyBrowser());
    dispatch(subscribeToProperty(SkyBrowserHideTargetsBrowsersWithGuiKey));
    return () => {
      dispatch(unsubscribeToSkyBrowser());
      dispatch(unsubscribeToProperty(SkyBrowserHideTargetsBrowsersWithGuiKey));
    };
  }, []);

  React.useEffect(() => {
    if (!isDataInitialized) {
      // Declare async data fetching function
      const getData = async () => {
        await dispatch(loadSkyBrowserData(luaApi));
        setDataIsLoaded(true);
      };
      // Call the function
      getData().catch(console.error);
    }
  }, []);

  function togglePopover() {
    const visibility = {
      popover: 'skybrowser',
      visible: !popoverVisible
    };
    dispatch(setPopoverVisibility(visibility));
    if (hideTargetsBrowsersWithGui) {
      luaApi.skybrowser.showAllTargetsAndBrowsers(!popoverVisible);
    }
  }

  function passMessageToWwt(args) {
    if (wwt.current) {
      wwt.current(args);
    }
  }

  function setWwtRatio(ratio) {
    setWwtSize({
      width: ratio * wwtSize.height,
      height: wwtSize.height
    });
  }

  function setCurrentPopoverHeight(object) {
    setCurrentPopoverHeightState(object.height);
  }

  function setWwtPosition(e, data) {
    setWwtPositionState({ x: data.x, y: data.y });
  }

  function currentBrowserColor() {
    return browserColor;
  }

  function selectImage(identifier, passToOs = true) {
    if (identifier && imageList) {
      setActiveImage(identifier);

      if (passToOs) {
        luaApi.skybrowser.selectImage(imageList[identifier].url);
      }
      passMessageToWwt({
        event: 'image_layer_create',
        id: String(identifier),
        url: imageList[identifier].url,
        mode: 'preloaded',
        goto: false
      });
    }
  }

  function moveCircleToHoverImage(identifier) {
    dispatch(moveHoverCircle(imageList[identifier].url));
  }

  function removeImageSelection(identifier, passToOs = true) {
    if (passToOs) {
      luaApi.skybrowser.removeSelectedImageInBrowser(selectedBrowserId, imageList[identifier].url);
    }
    passMessageToWwt({
      event: 'image_layer_remove',
      id: String(identifier)
    });
    dispatch(disableHoverCircle);
  }

  function setBorderRadius(radius) {
    passMessageToWwt({
      event: 'set_border_radius',
      data: radius
    });
  }

  function setOpacityOfImage(identifier, opacity, passToOs = true) {
    if (passToOs) {
      luaApi.skybrowser.setOpacityOfImageLayer(
        selectedBrowserId,
        imageList[identifier].url,
        opacity
      );
    }
    passMessageToWwt({
      event: 'image_layer_set',
      id: String(identifier),
      setting: 'opacity',
      value: opacity
    });
  }

  function createWwtBrowser() {
    return (browsersExist && (
      <WorldWideTelescope
        setMessageFunction={(func) => { wwt.current = func; }}
        setImageCollectionIsLoaded={setImageCollectionIsLoaded}
        size={wwtSize}
        setSize={setWwtSize}
        position={wwtPosition}
        togglePopover={togglePopover}
        setPosition={setWwtPosition}
        imageCollectionIsLoaded={imageCollectionIsLoaded}
        browserColor={browserColor}
      />
    )
    );
  }

  function createTargetBrowserPair() {
    luaApi.skybrowser.createTargetBrowserPair();
    setWwtRatio(1);
  }

  function createAddBrowserInterface() {
    const addBrowserPairButton = (
      <div className={styles.upperPart}>
        <Button
          onClick={createTargetBrowserPair}
          className={styles.addTabButton}
          transparent
        >
          <CenteredLabel>Add Sky Browser</CenteredLabel>
          <div className={styles.plus} />
        </Button>
      </div>
    );

    const wwtLogoImg = (
      <div className={styles.credits}>
        <div className={styles.wwtLogoContainer}>
          <img src={wwtLogo} alt="WwtLogo" className={styles.wwtLogo} />
          <SmallLabel>
            Powered by AAS WorldWide Telescope
          </SmallLabel>
        </div>
      </div>
    );

    return (
      <div className={`${styles.content} ${styles.center}`}>
        {addBrowserPairButton}
        {wwtLogoImg}
      </div>
    );
  }

  function popover() {
    let content = '';
    if (!dataIsLoaded || cameraInSolarSystem === undefined) {
      content = (
        <CenteredLabel>
          Oops! There was a problem loading data from OpenSpace :(
        </CenteredLabel>
      );
    } else if (cameraInSolarSystem === false) {
      content = (
        <CenteredLabel>
          The camera has to be within the solar system for the sky browser to work
        </CenteredLabel>
      );
    } else if (!browsersExist) {
      content = createAddBrowserInterface();
    } else if (!imageCollectionIsLoaded && browsersExist) {
      content = (
        <>
          <CenteredLabel> Loading image collection... </CenteredLabel>
          <div className={styles.loading}>
            <LoadingBlock loading />
          </div>
        </>
      );
    } else if (imageCollectionIsLoaded && browsersExist) {
      const currentImageListHeight = currentPopoverHeight - currentTabHeight - MenuHeight;
      const imageMenuList = (
        <SkyBrowserImageList
          activeImage={activeImage}
          currentBrowserColor={currentBrowserColor}
          height={currentImageListHeight}
          moveCircleToHoverImage={moveCircleToHoverImage}
          selectImage={selectImage}
        />
      );

      const skybrowserTabs = (
        <SkyBrowserTabs
          setCurrentTabHeight={setCurrentTabHeight}
          passMessageToWwt={passMessageToWwt}
          setWwtRatio={setWwtRatio}
          activeImage={activeImage}
          currentBrowserColor={currentBrowserColor}
          selectImage={selectImage}
          maxHeight={currentPopoverHeight - MenuHeight}
          minHeight={MinimumTabHeight}
          height={currentTabHeight}
          setBorderRadius={setBorderRadius}
          imageCollectionIsLoaded={imageCollectionIsLoaded}
          moveCircleToHoverImage={moveCircleToHoverImage}
          removeImageSelection={removeImageSelection}
          setOpacityOfImage={setOpacityOfImage}
          createTargetBrowserPair={createTargetBrowserPair}
        />
      );
      content = (
        <div className={styles.content}>
          {imageMenuList}
          {skybrowserTabs}
        </div>
      );
    }

    return (
      <WindowThreeStates
        title="AAS WorldWide Telescope"
        closeCallback={togglePopover}
        sizeCallback={setCurrentPopoverHeight}
        height={currentPopoverHeight}
        defaultHeight={440}
        minHeight={440}
      >
        {content}
      </WindowThreeStates>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      <Picker
        onClick={togglePopover}
        refKey="SkyBrowser"
        className={`${popoverVisible && Picker.Active}`}
      >
        <IoTelescopeSharp color="white" alt="WWT" className={Picker.Icon} />
      </Picker>
      {popoverVisible && popover()}
      {popoverVisible && createWwtBrowser()}
    </div>
  );
}

export default SkyBrowserPanel;
