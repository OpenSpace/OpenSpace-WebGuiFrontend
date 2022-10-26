import React from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { SkyBrowser_HideTargetsBrowsersWithGuiKey } from '../../api/keys';
import { getBoolPropertyValue } from '../../utils/propertyTreeHelpers';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Picker from './Picker';
import Button from '../common/Input/Button/Button';
import LoadingBlock from '../common/LoadingBlock/LoadingBlock';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import SkyBrowserNearestImagesList from './SkyBrowser/SkyBrowserNearestImagesList';
import SkyBrowserTabs from './SkyBrowser/SkyBrowserTabs';
import WindowThreeStates from './SkyBrowser/WindowThreeStates/WindowThreeStates';
import WorldWideTelescope from './SkyBrowser/WorldWideTelescope';
import { FilterList, FilterListData } from '../common/FilterList/FilterList';
import SkyBrowserFocusEntry from './SkyBrowser/SkyBrowserFocusEntry';
import { Icon } from '@iconify/react';
import {
  loadSkyBrowserData,
  reloadPropertyTree,
  setPopoverVisibility,
  subscribeToSkyBrowser,
  unsubscribeToSkyBrowser,
  subscribeToProperty, 
  unsubscribeToProperty
} from '../../api/Actions';
import styles from './SkyBrowserPanel.scss';

function SkyBrowserPanel({ }) {
  const [activeImage, setActiveImage] = React.useState('');
  const [minimumTabHeight, setMinimumTabHeight] = React.useState(80);
  const [currentTabHeight, setCurrentTabHeight] = React.useState(200);
  const [currentPopoverHeight, setCurrentPopoverHeightState] = React.useState(440);
  const [showOnlyNearest, setShowOnlyNearest] = React.useState(true);
  const [menuHeight, setMenuHeight] = React.useState(70);
  const [imageCollectionIsLoaded, setImageCollectionIsLoaded] = React.useState(false);
  const [dataIsLoaded, setDataIsLoaded] = React.useState(false);
  const [wwtSize, setWwtSize] = React.useState({width: 400, height: 400});
  const [wwtPosition, setWwtPositionState] = React.useState({ x: -800, y: -600 });

  const wwt = React.useRef();

  // Get redux state
  const browsersExist = useSelector((state) => {
    const browsers = state.skybrowser.browsers;
    return browsers && Object.keys(browsers)?.length !== 0
  }, shallowEqual);
  const cameraInSolarSystem = useSelector((state) => {
    return state.skybrowser.cameraInSolarSystem
  }, shallowEqual);
  const imageList = useSelector((state) => {
    return state.skybrowser.imageList
  }, shallowEqual);
  const isDataInitialized = useSelector((state) => {
    return state.skybrowser.isInitialized
  }, shallowEqual);
  const luaApi = useSelector((state) => {
  return state.luaApi
  }, shallowEqual);
  const popoverVisible = useSelector((state) => {
    return state.local.popovers.skybrowser.visible
    }, shallowEqual);
  const hideTargetsBrowsersWithGui = useSelector((state) => {
    return getBoolPropertyValue(state, SkyBrowser_HideTargetsBrowsersWithGuiKey)
  }, shallowEqual);
  const browserColor = useSelector((state) => {
    const browser = state.skybrowser.browsers?.[state.skybrowser.selectedBrowserId]; 
    return browser ? `rgb(${browser.color})` : 'gray';
  }, shallowEqual);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(subscribeToSkyBrowser());
    dispatch(subscribeToProperty(SkyBrowser_HideTargetsBrowsersWithGuiKey));
    return () => {
      dispatch(unsubscribeToSkyBrowser());
      dispatch(unsubscribeToProperty(SkyBrowser_HideTargetsBrowsersWithGuiKey));
    }
  }, []);

  React.useEffect(() => {
    if (!isDataInitialized) {
      // Declare async data fetching function
      const getData = async () => {
        await dispatch(loadSkyBrowserData(luaApi));
        setDataIsLoaded(true);
      }
      // Call the function
      getData().catch(console.error);
    }
  }, []);

  function togglePopover() {
    const visibility = {
        popover: 'skybrowser',
        visible : !popoverVisible
      }
    dispatch(setPopoverVisibility(visibility));
    if(hideTargetsBrowsersWithGui) {
      luaApi.skybrowser.showAllTargetsAndBrowsers(!popoverVisible)
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

  function setCurrentPopoverHeight(width, height) {
    setCurrentPopoverHeightState(height);
  }

  function setWwtPosition(e, data) {
    setWwtPositionState({ x: data.x, y: data.y});
  }

  function currentBrowserColor() {
    return browserColor;
  }

  function selectImage(identifier, passToOs = true) {
    if (identifier && imageList) {
      setActiveImage(identifier);

      if (passToOs) {
        luaApi.skybrowser.selectImage(Number(identifier));
      }
      passMessageToWwt({
        event: "image_layer_create",
        id: String(identifier),
        url: imageList[identifier].url,
        mode: "preloaded",
        goto: false
      });
    }
  }

  function setBorderRadius(radius) {
    passMessageToWwt({
      event: "set_border_radius",
      data: radius
    });
  }

  function createWwtBrowser() {
    return (browsersExist && 
      <WorldWideTelescope
        setMessageFunction={func => wwt.current = func}
        setImageCollectionIsLoaded={setImageCollectionIsLoaded}
        size={wwtSize}
        setSize={setWwtSize}
        position={wwtPosition}
        togglePopover={togglePopover}
        setPosition={setWwtPosition}
        imageCollectionIsLoaded={imageCollectionIsLoaded}
      />
    );
  }

  function addTargetBrowserPair() {
    luaApi.skybrowser.createTargetBrowserPair()
    // TODO: Once we have a proper way to subscribe to additions and removals
    // of property owners, this 'hard' refresh should be removed.
    setTimeout(() => {
      dispatch(reloadPropertyTree());
    }, 500);
  }

  function createAddBrowserInterface() {
    const addBrowserPairButton = (
      <div className={styles.upperPart}>
        <Button
          onClick={addTargetBrowserPair}
          className={styles.addTabButton}
          transparent
        >
          <CenteredLabel>Add Sky Browser</CenteredLabel>
          <div className={styles.plus}/>
        </Button>
      </div>);

    const wwtLogoImg = (
      <div className={styles.credits}>
        <div className={styles.wwtLogoContainer}>
          <img src={require('./wwtlogo.png')} alt="WwtLogo" className={styles.wwtLogo} />
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

  function createBrowserContent() {
    const currentImageListHeight = currentPopoverHeight - currentTabHeight - menuHeight;
    const imageMenu = (
      <div className={styles.row}>
        <Picker
          className={`${styles.picker} ${showOnlyNearest ? styles.unselected : styles.selected}`}
          onClick={() => setShowOnlyNearest(false)}
        >
          <span>All images</span>
        </Picker>
        <Picker
          className={`${styles.picker} ${showOnlyNearest ? styles.selected : styles.unselected}`}
          onClick={() => setShowOnlyNearest(true)}
        >
          <span>Images within view</span>
        </Picker>
      </div>
    );

    const skybrowserTabs = (
      <SkyBrowserTabs
        setCurrentTabHeight={setCurrentTabHeight}
        passMessageToWwt={passMessageToWwt}
        setWwtRatio={setWwtRatio}
        activeImage={activeImage}
        currentBrowserColor={currentBrowserColor}
        selectImage={selectImage}
        maxHeight={currentPopoverHeight - menuHeight}
        minHeight={minimumTabHeight}
        height={currentTabHeight}
        setBorderRadius={setBorderRadius}
        imageCollectionIsLoaded={imageCollectionIsLoaded}
      />
    );

    const imageListComponent = showOnlyNearest ? 
      <SkyBrowserNearestImagesList
        luaApi={luaApi}
        imageList={imageList}
        activeImage={activeImage}
        currentBrowserColor={currentBrowserColor}
        selectImage={selectImage}
        height={currentImageListHeight}
        passMessageToWwt={passMessageToWwt}
      />
      :
      <FilterList
        className={styles.filterList}
        height={currentImageListHeight}
        searchText={`Search from ${imageList.length.toString()} images...`}
      >
        <FilterListData>
          {imageList.map(item => {
            return <SkyBrowserFocusEntry 
                {...item}
                luaApi={luaApi} 
                currentBrowserColor={currentBrowserColor}
                onSelect={selectImage}
                isActive={activeImage === item.identifier}
              />
          })}
        </FilterListData>
      </FilterList>
      ;

    return <div className={styles.content}>
        {imageMenu}
        {imageListComponent}
        {skybrowserTabs}
      </div>;
  }

  function popover() {
    let content = "";
    if (!dataIsLoaded || cameraInSolarSystem === undefined) {
      content = (
        <CenteredLabel>
          Oops! There was a problem loading data from OpenSpace :(
        </CenteredLabel>
      );
    }
    else if (cameraInSolarSystem === false) {
      content = (
        <CenteredLabel>
          The camera has to be within the solar system for the sky browser to work
        </CenteredLabel>
      );
    }
    else if (!browsersExist) {
      content = createAddBrowserInterface();
    }
    else if (!imageCollectionIsLoaded && browsersExist) {
      content = <>
        <CenteredLabel> Loading image collection... </CenteredLabel>
        <div className={styles.loading}>
          <LoadingBlock loading={true}/>
        </div>
      </>;
    }
    else if (imageCollectionIsLoaded && browsersExist) {
      content = createBrowserContent();
    }

    return (
      <WindowThreeStates
        title="AAS WorldWide Telescope"
        closeCallback={togglePopover}
        heightCallback={setCurrentPopoverHeight}
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
        <Picker onClick={togglePopover} refKey={"SkyBrowser"}>
          <Icon icon="mdi:telescope" color="white" alt="WWT" style={{ fontSize: '2em' }}/>
        </Picker>
        {popoverVisible && popover()}
        {popoverVisible && createWwtBrowser()}
      </div>
    );
}

export default SkyBrowserPanel;
