import React, { Component } from 'react';
import { connect } from 'react-redux';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Picker from './Picker';
import Button from '../common/Input/Button/Button';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import SkyBrowserImageList from './SkyBrowser/SkyBrowserImageList';
import SkyBrowserTabs from './SkyBrowser/SkyBrowserTabs';
import WindowThreeStates from './SkyBrowser/WindowThreeStates/WindowThreeStates';
import WorldWideTelescope from './SkyBrowser/WorldWideTelescope';
import { Icon } from '@iconify/react';
import { setPopoverVisibility, subscribeToSkyBrowser, unsubscribeToSkyBrowser } from '../../api/Actions';
import subStateToProps from '../../utils/subStateToProps';
import styles from './SkyBrowserPanel.scss';

class SkyBrowserPanel extends Component {
  constructor(props) {
    super(props);
    this.wwt = React.createRef();
    this.state = {
      activeImage: '',
      minimumTabHeight: 300,
      currentTabHeight: 300,
      currentPopoverHeight: 440,
      showOnlyNearest: true,
      menuHeight: 70,
      imageCollectionIsLoaded: false,
      wwtBrowsers: []
    };
    this.togglePopover = this.togglePopover.bind(this);
    this.setImageCollectionIsLoaded = this.setImageCollectionIsLoaded.bind(this);
    this.setCurrentTabHeight = this.setCurrentTabHeight.bind(this);
    this.setCurrentPopoverHeight = this.setCurrentPopoverHeight.bind(this);
    this.currentBrowserColor = this.currentBrowserColor.bind(this);
    this.passMessageToWwt = this.passMessageToWwt.bind(this);
    this.getSelectedBrowserImages = this.getSelectedBrowserImages.bind(this);
    this.selectImage = this.selectImage.bind(this);
    this.createWwtBrowser = this.createWwtBrowser.bind(this);
    this.createAddBrowserInterface = this.createAddBrowserInterface.bind(this);
    this.createBrowserContent = this.createBrowserContent.bind(this);
  }

  async componentDidMount() {
    this.props.startSubscriptions();
  }

  async componentWillUnmount() {
    this.props.stopSubscriptions();
  }

  togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible);
  }

  setImageCollectionIsLoaded(isLoaded) {
    this.setState({
      imageCollectionIsLoaded : isLoaded
    });
  }

  setCurrentTabHeight(height) {
    this.setState({ currentTabHeight: height });
  }

  setCurrentPopoverHeight(width, height) {
    this.setState({ currentPopoverHeight: height });
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

  passMessageToWwt(message) {
    this.wwt.current.sendMessageToWwt(message);
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
        id: identifier,
        url: this.props.imageList[identifier].url,
        mode: "preloaded",
        goto: false
      });
    }
  }

  createWwtBrowser() {
    const { browsers, selectedBrowserId } = this.props;
    if (browsers === undefined) {
      return "";
    }
    const browser = browsers[selectedBrowserId];
    const selectedImages = this.getSelectedBrowserImages();
    return (
      <WorldWideTelescope
        browser = {browser}
        skybrowserApi={this.props.luaApi.skybrowser}
        ref={this.wwt}
        setImageCollectionIsLoaded = {this.setImageCollectionIsLoaded}
        selectedImages={selectedImages}
        selectImage={this.selectImage}
      />
    );
  }

  createAddBrowserInterface() {
    const { luaApi } = this.props;
    const addBrowserPairButton = (
      <div className={styles.upperPart}>
        <Button
          onClick={() => luaApi.skybrowser.createTargetBrowserPair()}
          className={styles.addTabButton}
          transparent
        >
          <CenteredLabel>Add Sky Browser</CenteredLabel>
          <div className={styles.plus}>
          </div>
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
    </div>);

    return <div className={`${styles.content} ${styles.center}`}>
      {addBrowserPairButton}
      {wwtLogoImg}
    </div>;
  }

  createBrowserContent() {
    const { luaApi, cameraInSolarSystem, browsers, selectedBrowserId, imageList } = this.props;
    const { currentPopoverHeight, currentTabHeight, menuHeight, activeImage, showOnlyNearest, minimumTabHeight } = this.state;
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
        currentBrowserColor={this.currentBrowserColor}
        passMessageToWwt={this.passMessageToWwt}
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
    const { cameraInSolarSystem, browsers, selectedBrowserId } = this.props;
    const { currentPopoverHeight, imageCollectionIsLoaded } = this.state;
    let allImageCollectionsAreLoaded = imageCollectionIsLoaded;

    const browsersExist = browsers && Object.keys(browsers).length !== 0;
    if (browsersExist) {
      const browser = browsers[selectedBrowserId];
      allImageCollectionsAreLoaded = browser.isImageCollectionLoaded && imageCollectionIsLoaded;
    }

    let content = "";
    if (!cameraInSolarSystem) {
      content = (
        <CenteredLabel>
          The camera has to be within the solar system for the sky browser to work.
        </CenteredLabel>
      );
    }
    else if (!browsersExist) {
      content = this.createAddBrowserInterface();
    }
    else if (!allImageCollectionsAreLoaded && browsersExist) {
      content = (
        <CenteredLabel>
          Loading image collection...
        </CenteredLabel>
      );
    }
    else if (allImageCollectionsAreLoaded && browsersExist) {
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
          <Picker onClick={this.togglePopover} >
            <Icon icon="mdi:telescope" color="white" alt="WWT" style={{ fontSize: '2em' }}/>
          </Picker>
          {this.props.popoverVisible && this.popover}
          {this.props.popoverVisible && this.createWwtBrowser()}
        </div>
    );
  }
}

const mapSubStateToProps = ({ luaApi, popoverVisible, imageList, selectedBrowserId, cameraInSolarSystem, browsers}) => ({
  luaApi,
  popoverVisible,
  imageList,
  selectedBrowserId,
  cameraInSolarSystem,
  browsers
});

const mapStateToSubState = state => ({
  propertyOwners: state.propertyTree.propertyOwners,
  popoverVisible: state.local.popovers.skybrowser.visible,
  luaApi: state.luaApi,
  imageList: state.skybrowser.data,
  cameraInSolarSystem: state.skybrowser.cameraInSolarSystem,
  selectedBrowserId: state.skybrowser.selectedBrowserId,
  browsers: state.skybrowser.browsers
});

const mapDispatchToProps = dispatch => ({
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
  }
});

SkyBrowserPanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(SkyBrowserPanel);

export default SkyBrowserPanel;
