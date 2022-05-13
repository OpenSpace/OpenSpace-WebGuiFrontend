import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SkyBrowser_HideTargetsBrowsersWithGuiKey } from '../../api/keys';
import { getBoolPropertyValue } from '../../utils/propertyTreeHelpers';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Picker from './Picker';
import Button from '../common/Input/Button/Button';
<<<<<<< HEAD
import subStateToProps from '../../utils/subStateToProps';
import { setPopoverVisibility } from '../../api/Actions';
// Sky  browser
import WindowThreeStates from '../SkyBrowser/WindowThreeStates/WindowThreeStates';
import SkybrowserTabs from '../SkyBrowser/SkybrowserTabs';
import SkyBrowserImageList from '../SkyBrowser/SkyBrowserImageList';
import wwtLogo from './wwtlogo.png';
=======
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
>>>>>>> origin/master
import styles from './SkyBrowserPanel.scss';

class SkyBrowserPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeImage: '',
      minimumTabHeight: 80,
      currentTabHeight: 200,
      currentPopoverHeight: 440,
      showOnlyNearest: true,
      menuHeight: 70,
<<<<<<< HEAD
=======
      imageCollectionIsLoaded: false,
      wwtBrowsers: [],
      wwtSize: {width: 400, height: 400},
      wwtPosition: { x: -800, y: -600 }
>>>>>>> origin/master
    };
    this.addTargetBrowserPair = this.addTargetBrowserPair.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.setImageCollectionIsLoaded = this.setImageCollectionIsLoaded.bind(this);
    this.setCurrentTabHeight = this.setCurrentTabHeight.bind(this);
    this.setCurrentPopoverHeight = this.setCurrentPopoverHeight.bind(this);
    this.setWwtSize = this.setWwtSize.bind(this);
    this.setWwtRatio = this.setWwtRatio.bind(this);
    this.setSelectedBrowser = this.setSelectedBrowser.bind(this);
    this.addAllSelectedImages = this.addAllSelectedImages.bind(this);
    this.removeAllSelectedImages = this.removeAllSelectedImages.bind(this);
    this.currentBrowserColor = this.currentBrowserColor.bind(this);
    this.getSelectedBrowserImages = this.getSelectedBrowserImages.bind(this);
    this.selectImage = this.selectImage.bind(this);
<<<<<<< HEAD
    this.togglePopover = this.togglePopover.bind(this);
    this.createImageMenu = this.createImageMenu.bind(this);
=======
    this.setOpacityOfImage = this.setOpacityOfImage.bind(this);
    this.removeImageSelection = this.removeImageSelection.bind(this);
    this.createWwtBrowser = this.createWwtBrowser.bind(this);
    this.createAddBrowserInterface = this.createAddBrowserInterface.bind(this);
    this.createBrowserContent = this.createBrowserContent.bind(this);
    this.setWwtPosition = this.setWwtPosition.bind(this);
>>>>>>> origin/master
  }

  async componentDidMount() {
    const { isDataInitialized, loadData, luaApi, startSubscriptions } = this.props;

    startSubscriptions();

    if (!isDataInitialized) {
      loadData(luaApi);
    }
  }

  async componentWillUnmount() {
    this.props.stopSubscriptions();
  }

<<<<<<< HEAD
  async getTargetData() {
    try {
      if (!this.props.luaApi.skybrowser) {
        throw new Error('Sky Browser Module is not loaded!');
      } else {
        let target = await this.props.luaApi.skybrowser.getTargetData();
        target = target[1];

        // Set the first object in the array to the camera and remove from array
        const camera = target.OpenSpace;
        delete target.OpenSpace;

        this.setState({
          targetData: target,
          selectedTarget: camera.selectedTargetId,
          selectedBrowser: camera.selectedBrowserId,
          isUsingRae: camera.isUsingRadiusAzimuthElevation,
          isFacingCamera: camera.isFacingCamera,
          cameraInSolarSystem: camera.cameraInSolarSystem,
          moduleIsLoaded: true,
        });
      }
    } catch (e) {
      console.log(e);
      // Stop the timer to get the target data
      clearInterval(this.targetDataID);
      this.setState({
        moduleIsLoaded: false,
      });
    }
  }

  getSelectedTargetImages() {
    const { imageList } = this.props;
    const { targetData, selectedBrowser } = this.state;
    const selectedImagesIndices = targetData[selectedBrowser];

    if (!imageList || !selectedImagesIndices) {
      return [];
    }

    // For some reason, ghoul sends this vector as an object. Convert to array
    const images = selectedImagesIndices.selectedImages;
    if (!images) return [];
    const indices = Object.values(images);
    return indices.map(index => imageList[index.toString()]);
  }

  getAllImages() {
    if (this.props.imageList.length) {
      return this.props.imageList;
    }
    return [];
=======
  togglePopover() {
    const { luaApi, setPopoverVisibility, popoverVisible, hideTargetsBrowsersWithGui } = this.props;
    setPopoverVisibility(!popoverVisible);
    if(hideTargetsBrowsersWithGui) {
      luaApi.skybrowser.showAllTargetsAndBrowsers(!this.props.popoverVisible)
    }
  }

  setImageCollectionIsLoaded(isLoaded) {
    this.setState({
      imageCollectionIsLoaded : isLoaded
    });
  }

  setWwtSize(size) {
    this.setState({
      wwtSize: size
    });
>>>>>>> origin/master
  }

  setWwtRatio(ratio) {
    this.setWwtSize({
      width: ratio * this.state.wwtSize.height,
      height: this.state.wwtSize.height
    });
  }

  setCurrentTabHeight(height) {
    this.setState({ currentTabHeight: height });
  }

  setCurrentPopoverHeight(height) {
    this.setState({ currentPopoverHeight: height });
  }

<<<<<<< HEAD
  selectImage(identifier) {
=======
  setWwtPosition(e, data) {
    this.setState({
      wwtPosition: { x: data.x, y: data.y}
    });
  }

  getSelectedBrowserImages() {
    const { imageList, browsers, selectedBrowserId } = this.props;
    const browser = browsers[selectedBrowserId];
    if (!imageList || !browser) {
      return [];
    }
    const images = browser.selectedImages;
    if (!images) {
      return [];
    }
    const indices = Object.values(images);
    return indices.map(index => imageList[index.toString()]);
  }

  currentBrowserColor() {
    const { browsers, selectedBrowserId } = this.props;
    const browser = browsers[selectedBrowserId];
    return (browser !== undefined) ? `rgb(${browser.color})` : 'gray';
  }

  selectImage(identifier, passToOs = true) {
>>>>>>> origin/master
    if (identifier) {
      this.setState({
        activeImage: identifier,
      });
<<<<<<< HEAD
      this.props.luaApi.skybrowser.selectImage(Number(identifier));
=======
      if (passToOs) {
        this.props.luaApi.skybrowser.selectImage(Number(identifier));
      }
      this.passMessageToWwt({
        event: "image_layer_create",
        id: String(identifier),
        url: this.props.imageList[identifier].url,
        mode: "preloaded",
        goto: false
      });
>>>>>>> origin/master
    }
  }

  setOpacityOfImage(identifier, opacity, passToOs = true) {
    const { luaApi, selectedBrowserId } = this.props;
    if(passToOs) {
      luaApi.skybrowser.setOpacityOfImageLayer(selectedBrowserId, Number(identifier), opacity);
    }
    this.passMessageToWwt({
      event: "image_layer_set",
      id: String(identifier),
      setting: "opacity",
      value: opacity
    });
  }

  removeImageSelection(identifier, passToOs = true) {
    const { luaApi, selectedBrowserId } = this.props;
    if(passToOs) {
      luaApi.skybrowser.removeSelectedImageInBrowser(selectedBrowserId, Number(identifier));
    }
    this.passMessageToWwt({
      event: "image_layer_remove",
      id: String(identifier),
    });
  }

<<<<<<< HEAD
  get popover() {
    const { imageList, luaApi } = this.props;
=======
  setSelectedBrowser(browserId) {
    const {browsers, selectedBrowserId} = this.props;
    if (browsers === undefined || browsers[browserId] === undefined) {
      return "";
    }
    // Don't pass the selection to OpenSpace as we are only changing images in the GUI
    // This is a result of only having one instance of the WWT application, but making
    // it appear as there are many
    const passToOs = false;
    this.removeAllSelectedImages(selectedBrowserId, passToOs);
    this.addAllSelectedImages(browserId, passToOs);
    this.props.luaApi.skybrowser.setSelectedBrowser(browserId);
    this.setWwtRatio(browsers[browserId].ratio);
  }

  addAllSelectedImages(browserId, passToOs = true) {
    const {browsers} = this.props;
    if (browsers === undefined || browsers[browserId] === undefined) {
      return "";
    }
    // Make deep copies in order to reverse later
    const reverseImages = [...browsers[browserId].selectedImages];
    const opacities = [...browsers[browserId].opacities];
    reverseImages.reverse().map((image, index) => {
      this.selectImage(String(image), passToOs);
      this.setOpacityOfImage(String(image), opacities.reverse()[index], passToOs);
    });
  }

  removeAllSelectedImages(browserId, passToOs = true) {
    const {browsers} = this.props;
    if (browsers === undefined || browsers[browserId] === undefined) {
      return "";
    }
    browsers[browserId].selectedImages.map(image => {
      this.removeImageSelection(Number(image), passToOs);
    });
  }

  createWwtBrowser() {
    const { browsers, selectedBrowserId, url } = this.props;

    if (browsers === undefined) {
      return "";
    }
    const browser = browsers[selectedBrowserId];
    if (browser === undefined) {
      return "";
    }

    const selectedImages = this.getSelectedBrowserImages();
    return (
      <WorldWideTelescope
        browserId = {browser.id}
        browserName = {browser.name}
        browserAimInfo = {{
          ra: browser.ra,
          dec: browser.dec,
          fov: browser.fov,
          roll: browser.roll
        }}
        browserColor = {browser.color}
        skybrowserApi={this.props.luaApi.skybrowser}
        setMessageFunction={func => this.passMessageToWwt = func}
        setImageCollectionIsLoaded = {this.setImageCollectionIsLoaded}
        selectedImages={selectedImages}
        addAllSelectedImages={this.addAllSelectedImages}
        selectImage={this.selectImage}
        size={this.state.wwtSize}
        setSize={this.setWwtSize}
        url={url}
        position={this.state.wwtPosition}
        setPosition={this.setWwtPosition}
      />
    );
  }

  addTargetBrowserPair() {
    this.props.luaApi.skybrowser.createTargetBrowserPair()
    // TODO: Once we have a proper way to subscribe to additions and removals
    // of property owners, this 'hard' refresh should be removed.
    setTimeout(() => {
      this.props.refresh();
    }, 500);
  }

  createAddBrowserInterface() {
    const addBrowserPairButton = (
      <div className={styles.upperPart}>
        <Button
          onClick={this.addTargetBrowserPair}
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

  createBrowserContent() {
    const { luaApi, cameraInSolarSystem, browsers, selectedBrowserId, imageList } = this.props;
>>>>>>> origin/master
    const {
      currentPopoverHeight,
      currentTabHeight,
      menuHeight,
      activeImage,
      showOnlyNearest,
      minimumTabHeight
    } = this.state;
    const thisTabsImages = this.getSelectedBrowserImages() || [];
    const currentImageListHeight = currentPopoverHeight - currentTabHeight - menuHeight;

<<<<<<< HEAD
    const skybrowserApi = luaApi.skybrowser;

    if (!cameraInSolarSystem) {
      const errorMessage = (
        <WindowThreeStates
          title="AAS WorldWide Telescope"
          closeCallback={this.togglePopover}
          heightCallback={this.setCurrentPopoverHeight}
          heightWindow={currentPopoverHeight}
        >
          <CenteredLabel>
            The camera has to be within the solar system for the sky browser to work.
          </CenteredLabel>
        </WindowThreeStates>
      );
      return errorMessage;
    }

    const thisTabsImages = this.getSelectedTargetImages() || [];
=======
    const imageMenu = (
      <div className={styles.row}>
        <Picker
          className={`${styles.picker} ${showOnlyNearest ? styles.unselected : styles.selected}`}
          onClick={() => this.setState({ showOnlyNearest: false })}
        >
          <span>All images</span>
        </Picker>
        <Picker
          className={`${styles.picker} ${showOnlyNearest ? styles.selected : styles.unselected}`}
          onClick={() => this.setState({ showOnlyNearest: true })}
        >
          <span>Images within view</span>
        </Picker>
      </div>
    );
>>>>>>> origin/master

    const skybrowserTabs = (
      <SkyBrowserTabs
        luaApi={luaApi}
        cameraInSolarSystem={cameraInSolarSystem}
        selectedBrowserId={selectedBrowserId}
        browsers={browsers}
        maxHeight={currentPopoverHeight - menuHeight}
        minHeight={minimumTabHeight}
        setCurrentTabHeight={this.setCurrentTabHeight}
        height={currentTabHeight}
        data={thisTabsImages}
        selectImage={this.selectImage}
<<<<<<< HEAD
        currentTargetColor={this.getCurrentTargetColor}
=======
        removeImageSelection={this.removeImageSelection}
        removeAllSelectedImages={this.removeAllSelectedImages}
        currentBrowserColor={this.currentBrowserColor}
        passMessageToWwt={this.passMessageToWwt}
        setSelectedBrowser={this.setSelectedBrowser}
        setWwtRatio={this.setWwtRatio}
        setOpacityOfImage={this.setOpacityOfImage}
>>>>>>> origin/master
      />
    );

    const imageListComponent = (
      <SkyBrowserImageList
        luaApi={luaApi}
        imageList={imageList}
        selectedBrowserData={browsers[selectedBrowserId]}
        showOnlyNearest={showOnlyNearest}
        activeImage={activeImage}
        currentBrowserColor={this.currentBrowserColor}
        selectImage={this.selectImage}
        height={currentImageListHeight}
      />
    );

<<<<<<< HEAD
    const targetsExist = Object.keys(targetData).length !== 0;
    const addTargetBrowserPairButton = <Button
        onClick={() => skybrowserApi.createTargetBrowserPair()}
        className={styles.addTabButton}
        transparent
      >
        <CenteredLabel>Add Sky Browser</CenteredLabel>
        <div className={styles.plus} />
      </Button>;
=======
    return <div className={styles.content}>
        {imageMenu}
        {imageListComponent}
        {skybrowserTabs}
      </div>;
  }

  get popover() {
    const { cameraInSolarSystem, browsers, selectedBrowserId } = this.props;
    const { currentPopoverHeight, imageCollectionIsLoaded } = this.state;
    let allImageCollectionsAreLoaded = imageCollectionIsLoaded;

    const browsersExist = browsers && Object.keys(browsers).length !== 0;

    let content = "";
    if(cameraInSolarSystem === undefined) {
      content = (
        <CenteredLabel>
          Oops! There was a problem loading data from OpenSpace :(
        </CenteredLabel>
      );
    }
    else if (cameraInSolarSystem === false) {
      content = (
        <CenteredLabel>
          The camera has to be within the solar system for the sky browser to work.
        </CenteredLabel>
      );
    }
    else if (!browsersExist) {
      content = this.createAddBrowserInterface();
    }
    else if (!imageCollectionIsLoaded && browsersExist) {
      content = (
        <CenteredLabel>
          Loading image collection...
        </CenteredLabel>
      );
    }
    else if (imageCollectionIsLoaded && browsersExist) {
      content = this.createBrowserContent();
    }
>>>>>>> origin/master

    return (
      <WindowThreeStates
        title="AAS WorldWide Telescope"
        closeCallback={this.togglePopover}
        heightCallback={this.setCurrentPopoverHeight}
        height={currentPopoverHeight}
        defaultHeight={440}
        minHeight={currentTabHeight + menuHeight}
      >
<<<<<<< HEAD
      {targetsExist ? <div className={styles.content}>
          {this.createImageMenu()}
          {imageListComponent}
          {skybrowserTabs}
        </div> :
        <div className={`${styles.content} ${styles.center}`}>
          {addTargetBrowserPairButton}
        </div>
      }
=======
        {content}
>>>>>>> origin/master
      </WindowThreeStates>
    );
  }

  render() {
    return (
<<<<<<< HEAD
      this.state.moduleIsLoaded && (
        <div className={Picker.Wrapper}>
          <Picker onClick={this.togglePopover} style={{ padding: 0 }}>
            <div style={{ textAlign: 'center', display: 'block' }}>
              <img src={wwtLogo} alt="WWT" style={{ width: '50%', height: '50%' }} />
            </div>
          </Picker>
          {this.props.popoverVisible && this.popover}
        </div>
      )
=======
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover} >
          <Icon icon="mdi:telescope" color="white" alt="WWT" style={{ fontSize: '2em' }}/>
        </Picker>
        {this.props.popoverVisible && this.popover}
        {this.props.popoverVisible && this.createWwtBrowser()}
      </div>
>>>>>>> origin/master
    );
  }
}

const mapStateToProps = state => ({
  browsers: state.skybrowser.browsers,
  cameraInSolarSystem: state.skybrowser.cameraInSolarSystem,
  imageList: state.skybrowser.imageList,
  url: state.skybrowser.url,
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
