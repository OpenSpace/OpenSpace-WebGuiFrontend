import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SkyBrowser_HideTargetsBrowsersWithGuiKey } from '../../api/keys';
import { getBoolPropertyValue } from '../../utils/propertyTreeHelpers';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Picker from './Picker';
import Button from '../common/Input/Button/Button';
import LoadingBlock from '../common/LoadingBlock/LoadingBlock';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import SkyBrowserImageList from './SkyBrowser/SkyBrowserImageList';
import SkyBrowserTabs from './SkyBrowser/SkyBrowserTabs';
import WindowThreeStates from './SkyBrowser/WindowThreeStates/WindowThreeStates';
import WorldWideTelescope from './SkyBrowser/WorldWideTelescope';
import { Icon } from '@iconify/react';
import {
  loadSkyBrowserData,
  reloadPropertyTree,
  setPopoverVisibility,
  subscribeToSkyBrowser,
  unsubscribeToSkyBrowser,
} from '../../api/Actions';
import styles from './SkyBrowserPanel.scss';

function SkyBrowserPanel({
  isDataInitialized,
  loadData,
  luaApi,
  startSubscriptions,
  browsers,
  selectedBrowserId,
  stopSubscriptions,
  setPopoverVisibility,
  popoverVisible,
  hideTargetsBrowsersWithGui,
  cameraInSolarSystem,
  imageList,
  refresh
 }) {
  const [activeImage, setActiveImage] = React.useState('');
  const [minimumTabHeight, setMinimumTabHeight] = React.useState(80);
  const [currentTabHeight, setCurrentTabHeight] = React.useState(200);
  const [currentPopoverHeight, setCurrentPopoverHeightState] = React.useState(440);
  const [showOnlyNearest, setShowOnlyNearest] = React.useState(true);
  const [menuHeight, setMenuHeight] = React.useState(70);
  const [imageCollectionIsLoaded, setImageCollectionIsLoaded] = React.useState(false);
  const [wwtBrowsers, setWwtBrowsers] = React.useState([]);
  const [wwtSize, setWwtSize] = React.useState({width: 400, height: 400});
  const [wwtPosition, setWwtPositionState] = React.useState({ x: -800, y: -600 });

  const wwt = React.useRef();

  React.useEffect(() => {
    startSubscriptions();
    if (!isDataInitialized) {
      loadData(luaApi);
    }
    return () => stopSubscriptions();
  }, []);

  function togglePopover() {
    setPopoverVisibility(!popoverVisible);
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
    const browser = browsers[selectedBrowserId];
    return (browser !== undefined) ? `rgb(${browser.color})` : 'gray';
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
    if (browsers === undefined) {
      return "";
    }
    const browser = browsers[selectedBrowserId];
    if (browser === undefined) {
      return "";
    }

    return (
      <WorldWideTelescope
        setMessageFunction={func => wwt.current = func}
        setImageCollectionIsLoaded={setImageCollectionIsLoaded}
        size={wwtSize}
        setSize={setWwtSize}
        position={wwtPosition}
        togglePopover={togglePopover}
        setPosition={setWwtPosition}
      />
    );
  }

  function addTargetBrowserPair() {
    luaApi.skybrowser.createTargetBrowserPair()
    // TODO: Once we have a proper way to subscribe to additions and removals
    // of property owners, this 'hard' refresh should be removed.
    setTimeout(() => {
      refresh();
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

    const imageListComponent = (
      <SkyBrowserImageList
        luaApi={luaApi}
        imageList={imageList}
        selectedBrowserData={browsers[selectedBrowserId]}
        showOnlyNearest={showOnlyNearest}
        activeImage={activeImage}
        currentBrowserColor={currentBrowserColor}
        selectImage={selectImage}
        height={currentImageListHeight}
        passMessageToWwt={passMessageToWwt}
      />
    );

    return <div className={styles.content}>
        {imageMenu}
        {imageListComponent}
        {skybrowserTabs}
      </div>;
  }

  function popover() {
    const browsersExist = browsers && (Object.keys(browsers).length !== 0);

    let content = "";
    if (cameraInSolarSystem === undefined) {
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

const mapStateToProps = state => ({
  browsers: state.skybrowser.browsers,
  cameraInSolarSystem: state.skybrowser.cameraInSolarSystem,
  imageList: state.skybrowser.imageList,
  isDataInitialized: state.skybrowser.isInitialized,
  luaApi: state.luaApi,
  popoverVisible: state.local.popovers.skybrowser.visible,
  propertyOwners: state.propertyTree.propertyOwners,
  selectedBrowserId: state.skybrowser.selectedBrowserId,
  hideTargetsBrowsersWithGui: getBoolPropertyValue(state, SkyBrowser_HideTargetsBrowsersWithGuiKey)
});

const mapDispatchToProps = dispatch => ({
  loadData: (luaApi) => {
    dispatch(loadSkyBrowserData(luaApi));
  },
  refresh: () => {
    dispatch(reloadPropertyTree());
  },
  setPopoverVisibility: (visible) => {
    dispatch(
      setPopoverVisibility({
        popover: 'skybrowser',
        visible,
      }),
    );
  },
  startSubscriptions: () => {
    dispatch(subscribeToSkyBrowser());
  },
  stopSubscriptions: () => {
    dispatch(unsubscribeToSkyBrowser());
  },
  startListeningToProperties: () => {
    dispatch(subscribeToProperty(SkyBrowser_HideTargetsBrowsersWithGuiKey));
  },
  stopListeningToProperties: () => {
    dispatch(unsubscribeToProperty(SkyBrowser_HideTargetsBrowsersWithGuiKey));
  },
});

SkyBrowserPanel = connect(mapStateToProps, mapDispatchToProps,
)(SkyBrowserPanel);

export default SkyBrowserPanel;
