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

class SkyBrowserPanel extends Component {
  constructor(props) {
    super(props);
    this.wwt = React.createRef();
    this.state = {
      activeImage: '',
      minimumTabHeight: 80,
      currentTabHeight: 200,
      currentPopoverHeight: 440,
      showOnlyNearest: true,
      menuHeight: 70,
      imageCollectionIsLoaded: false,
      wwtBrowsers: [],
      wwtSize: {width: 400, height: 400},
      wwtPosition: { x: -800, y: -600 }
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
    this.setOpacityOfImage = this.setOpacityOfImage.bind(this);
    this.removeImageSelection = this.removeImageSelection.bind(this);
    this.createWwtBrowser = this.createWwtBrowser.bind(this);
    this.createAddBrowserInterface = this.createAddBrowserInterface.bind(this);
    this.createBrowserContent = this.createBrowserContent.bind(this);
    this.setWwtPosition = this.setWwtPosition.bind(this);
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

  setCurrentPopoverHeight(width, height) {
    this.setState({ currentPopoverHeight: height });
  }

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
    if (identifier) {
      this.setState({
        activeImage: identifier,
      });
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
        removeImageSelection={this.removeImageSelection}
        removeAllSelectedImages={this.removeAllSelectedImages}
        currentBrowserColor={this.currentBrowserColor}
        passMessageToWwt={this.passMessageToWwt}
        setSelectedBrowser={this.setSelectedBrowser}
        setWwtRatio={this.setWwtRatio}
        setOpacityOfImage={this.setOpacityOfImage}
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
        passMessageToWwt={this.passMessageToWwt}
      />
    );

    return <div className={styles.content}>
        {imageMenu}
        {imageListComponent}
        {skybrowserTabs}
      </div>;
  }

  get popover() {
    const { cameraInSolarSystem, browsers } = this.props;
    const { currentPopoverHeight, imageCollectionIsLoaded } = this.state;

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
      content = this.createAddBrowserInterface();
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
      content = this.createBrowserContent();
    }

    return (
      <WindowThreeStates
        title="AAS WorldWide Telescope"
        closeCallback={this.togglePopover}
        heightCallback={this.setCurrentPopoverHeight}
        height={currentPopoverHeight}
        defaultHeight={440}
        minHeight={440}
      >
        {content}
      </WindowThreeStates>
    );
  }

  render() {
    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover} refKey={"SkyBrowser"}>
          <Icon icon="mdi:telescope" color="white" alt="WWT" style={{ fontSize: '2em' }}/>
        </Picker>
        {this.props.popoverVisible && this.popover}
        {this.props.popoverVisible && this.createWwtBrowser()}
      </div>
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
