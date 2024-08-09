import React from 'react';
import { IoTelescopeSharp } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';

import {
  loadSkyBrowserData,
  setPopoverVisibility,
  subscribeToSkyBrowser,
  unsubscribeToSkyBrowser
} from '../../api/Actions';
import { SkyBrowserHideTargetsBrowsersWithGuiKey } from '../../api/keys';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Button from '../common/Input/Button/Button';
import LoadingBlock from '../common/LoadingBlock/LoadingBlock';
import SmallLabel from '../common/SmallLabel/SmallLabel';

import SkyBrowserSelectedImagesList from './SkyBrowser/SkyBrowserSelectedImagesList';
import SkyBrowserSettings from './SkyBrowser/SkyBrowserSettings';
import SkyBrowserImageList from './SkyBrowser/SkyBrowserImageList';
import SkyBrowserTabs from './SkyBrowser/SkyBrowserTabs';
import WindowThreeStates from './SkyBrowser/WindowThreeStates/WindowThreeStates';
import WorldWideTelescope from './SkyBrowser/WorldWideTelescope';
import Picker from './Picker';
import wwtLogo from './wwtlogo.png';

import styles from './SkyBrowserPanel.scss';
import { useSubscribeToProperty } from '../../utils/customHooks';

const State = {
	NotInitialized: "NotInitialized",
	LoadingImageCollection: "LoadingImageCollection",
	OutsideSolarSystem: "OutsideSolarSystem",
	HasNoBrowsers: "HasNoBrowsers",
  IsRunning: "IsRunning"
}

function getState(isDataInitialized, cameraInSolarSystem, browsersExist, imageCollectionIsLoaded) {
  if (!isDataInitialized || cameraInSolarSystem === undefined) return State.NotInitialized;
  if (cameraInSolarSystem === false) return State.OutsideSolarSystem;
  if (!browsersExist) return State.HasNoBrowsers;
  if (!imageCollectionIsLoaded && browsersExist) return State.LoadingImageCollection;
  if (imageCollectionIsLoaded && browsersExist) return State.IsRunning;
  else return State.NotInitialized;
}

function SkyBrowserPanel() {
  const [activeImage, setActiveImage] = React.useState('');
  const [currentTabHeight, setCurrentTabHeight] = React.useState(200);
  const [currentPopoverHeight, setCurrentPopoverHeight] = React.useState(440);
  const [imageCollectionIsLoaded, setImageCollectionIsLoaded] = React.useState(false);
  const [wwtSize, setWwtSize] = React.useState({ width: 400, height: 400 });
  const [wwtPosition, setWwtPositionState] = React.useState({ x: -800, y: -600 });
  const [showSettings, setShowSettings] = React.useState(false);

  const MenuHeight = 70;
  const MinimumTabHeight = 80;

  const browsersExist = useSubscribeToProperty(`Modules.SkyBrowser.AllPairs`)?.length !== 0;
  const hideTargetsBrowsersWithGui = useSubscribeToProperty(SkyBrowserHideTargetsBrowsersWithGuiKey);
  const selectedPairId = useSubscribeToProperty(`Modules.SkyBrowser.SelectedPairId`);
  const selectedBrowserId = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPairId}.Browser`);
  const selectedImagesUrls = useSubscribeToProperty(`ScreenSpace.${selectedBrowserId}.SelectedImagesUrls`) ?? [];
  const cameraInSolarSystem = useSelector((state) => state.skybrowser.cameraInSolarSystem);
  const imageList = useSelector((state) => state.skybrowser.imageList);
  const isDataInitialized = useSelector((state) => state.skybrowser.isInitialized);
  const luaApi = useSelector((state) => state.luaApi);
  const popoverVisible = useSelector((state) => state.local.popovers.skybrowser.visible);

  // Determine what state we are currently in for the SkyBrowser
  const currentState = getState(isDataInitialized, cameraInSolarSystem, browsersExist, imageCollectionIsLoaded);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(subscribeToSkyBrowser());
    return () => {
      dispatch(unsubscribeToSkyBrowser());
    };
  }, []);


  React.useEffect(() => {
    if (!isDataInitialized) {
      // Declare async data fetching function
      const getData = async () => {
        await dispatch(loadSkyBrowserData(luaApi));
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

  function setWwtPosition(e, data) {
    setWwtPositionState({ x: data.x, y: data.y });
  }

  function selectImage(identifier, passToOs = true) {
    if (imageList?.[identifier].url) {
      setActiveImage(identifier);
      if (passToOs && !selectedImagesUrls.includes(imageList?.[identifier].url)) {
        luaApi.appendToListProperty(`ScreenSpace.${selectedBrowserId}.SelectedImagesUrls`, imageList[identifier].url)
        luaApi.appendToListProperty(`ScreenSpace.${selectedBrowserId}.SelectedImagesOpacities`, 1)
      }
    }
  }

  function popover() {
    switch (currentState) {
      case State.NotInitialized: {
        return (
          <CenteredLabel>
            Oops! There was a problem loading data from OpenSpace :(
          </CenteredLabel>
        );
      }
      case State.OutsideSolarSystem: {
        return (
          <CenteredLabel>
            The camera has to be within the solar system for the sky browser to work
          </CenteredLabel>
        );
      }
      case State.HasNoBrowsers: {
        return (
          <div className={`${styles.content} ${styles.center}`}>
            <div className={styles.upperPart}>
              <Button
                onClick={() => luaApi.skybrowser.createTargetBrowserPair()}
                className={styles.addTabButton}
                transparent
              >
                <CenteredLabel>Add Sky Browser</CenteredLabel>
                <div className={styles.plus} />
              </Button>
            </div>
            <div className={styles.credits}>
              <div className={styles.wwtLogoContainer}>
                <img src={wwtLogo} alt="WwtLogo" className={styles.wwtLogo} />
                <SmallLabel>
                  Powered by AAS WorldWide Telescope
                </SmallLabel>
              </div>
            </div>
          </div>
        );
      }
      case State.LoadingImageCollection: {
        return (
          <>
            <CenteredLabel> Loading image collection... </CenteredLabel>
            <div className={styles.loading}>
              <LoadingBlock loading />
            </div>
          </>
        );
      }
      case State.IsRunning: {
        return (
          <div className={styles.content}>
            <SkyBrowserImageList
              activeImage={activeImage}
              height={currentPopoverHeight - currentTabHeight - MenuHeight}
              selectImage={selectImage}
            />
            <SkyBrowserTabs
              setCurrentTabHeight={setCurrentTabHeight}
              activeImage={activeImage}
              selectImage={selectImage}
              maxHeight={currentPopoverHeight - MenuHeight}
              minHeight={MinimumTabHeight}
              height={currentTabHeight}
              imageCollectionIsLoaded={imageCollectionIsLoaded}
              setShowSettings={setShowSettings}
              showSettings={showSettings}
            >
              {showSettings && <SkyBrowserSettings />}
              {!showSettings && (selectedImagesUrls?.length === 0 ?
                <CenteredLabel>
                  There are no selected images in this sky browser
                </CenteredLabel>
                :
                <SkyBrowserSelectedImagesList
                  selectImage={selectImage}
                  activeImage={activeImage}
                />
              )}
            </SkyBrowserTabs>
          </div>
        );
      }
    }
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
      {popoverVisible && (
        <WindowThreeStates
          title="AAS WorldWide Telescope"
          closeCallback={togglePopover}
          sizeCallback={(object) => setCurrentPopoverHeight(object.height)}
          height={currentPopoverHeight}
          defaultHeight={440}
          minHeight={440}
          >
          {popover()}
        </WindowThreeStates>
      )}
      {popoverVisible && browsersExist && (
        <WorldWideTelescope
        imageCollectionIsLoaded={imageCollectionIsLoaded}
        setImageCollectionIsLoaded={setImageCollectionIsLoaded}
        size={wwtSize}
        setSize={setWwtSize}
        position={wwtPosition}
        setPosition={setWwtPosition}
        togglePopover={togglePopover}
        activeImage={activeImage}
        />
      )}
    </div>
  );
}

export default SkyBrowserPanel;
