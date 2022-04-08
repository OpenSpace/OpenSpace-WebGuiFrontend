import React, { Component } from 'react';
import { connect } from 'react-redux';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Picker from './Picker';
import Button from '../common/Input/Button/Button';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import subStateToProps from '../../utils/subStateToProps';
import { setPopoverVisibility } from '../../api/Actions';
// Sky  browser
import WindowThreeStates from '../SkyBrowser/WindowThreeStates/WindowThreeStates';
import SkybrowserTabs from '../SkyBrowser/SkybrowserTabs';
import SkyBrowserImageList from '../SkyBrowser/SkyBrowserImageList';
import styles from './SkyBrowserPanel.scss';
import { Icon } from '@iconify/react';
import WorldWideTelescope from '../SkyBrowser/WorldWideTelescope';

class SkyBrowserPanel extends Component {
  constructor(props) {
    super(props);
    this.wwt = React.createRef();
    this.state = {
      moduleIsLoaded: false,
      activeImage: '',
      targetData: '',
      selectedTarget: '',
      isUsingRae: false,
      isFacingCamera: false,
      cameraInSolarSystem: true,
      currentTabHeight: 220,
      currentPopoverHeight: 440,
      showOnlyNearest: true,
      menuHeight: 70,
      wwtBrowsers: [],
      imageCollectionIsLoaded: false
    };
    this.getAllImages = this.getAllImages.bind(this);
    this.getTargetData = this.getTargetData.bind(this);
    this.getCurrentTargetColor = this.getCurrentTargetColor.bind(this);
    this.getSelectedTargetImages = this.getSelectedTargetImages.bind(this);
    this.setCurrentTabHeight = this.setCurrentTabHeight.bind(this);
    this.setCurrentPopoverHeight = this.setCurrentPopoverHeight.bind(this);
    this.selectImage = this.selectImage.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.createImageMenu = this.createImageMenu.bind(this);
    this.createWwtBrowsers = this.createWwtBrowsers.bind(this);
    this.passMessageToWwt = this.passMessageToWwt.bind(this);
    this.setImageCollectionIsLoaded = this.setImageCollectionIsLoaded.bind(this);
  }

  async componentDidMount() {
    try {
      this.targetDataID = setInterval(() => this.getTargetData(), 1000);
    } catch (e) {
      console.log(e);
    }
  }

  componentWillUnmount() {
    clearInterval(this.targetDataID);
  }

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
    }
  }

  setImageCollectionIsLoaded(isLoaded) {
    this.setState({
      imageCollectionIsLoaded : isLoaded
    });
  }

  getSelectedTargetImages() {
    const { imageList } = this.props;
    const { targetData, selectedBrowser } = this.state;
    const target = targetData[selectedBrowser];

    if (!imageList || !target) {
      return [];
    }

    // For some reason, ghoul sends this vector as an object. Convert to array
    const images = target.selectedImages;
    if (!images) return [];
    const indices = Object.values(images);
    return indices.map(index => imageList[index.toString()]);
  }

  getAllImages() {
    if (this.props.imageList.length) {
      return this.props.imageList;
    }
    return [];
  }

  getCurrentTargetColor() {
    const browser = this.state.targetData[this.state.selectedBrowser];
    return browser ? `rgb(${browser.color})` : 'gray';
  }

  setCurrentTabHeight(height) {
    this.setState({ currentTabHeight: height });
  }

  setCurrentPopoverHeight(width, height) {
    this.setState({ currentPopoverHeight: height });
  }

  selectImage(identifier, passToOs = true) {
    if (identifier) {
      this.setState({
        activeImage: identifier,
      });
      if(passToOs) {
        this.props.luaApi.skybrowser.selectImage(Number(identifier));
      }
      this.passMessageToWwt({
        event: "image_layer_create",
        id: identifier,
        url: this.props.imageList[identifier].url,
        mode: "preloaded",
        goto: false});
    }
  }

  togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible);
  }

  createImageMenu() {
    const { showOnlyNearest } = this.state;
    return (
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
  }

  createWwtBrowsers() {
    if(Object.keys(this.state.targetData).length == 0) {
      return "";
    }
    if(!this.state.targetData[this.state.selectedBrowser]) {
      return "";
    }
    else {
      const selectedImages = this.getSelectedTargetImages();
      return <WorldWideTelescope
      target = {this.state.targetData[this.state.selectedBrowser]}
      skybrowserApi={this.props.luaApi.skybrowser}
      ref={this.wwt}
      setImageCollectionIsLoaded = {this.setImageCollectionIsLoaded}
      selectedImages={selectedImages}
      selectImage={this.selectImage}
      />;
    }
  }

  passMessageToWwt(message) {
    this.wwt.current.sendMessageToWwt(message);
  }

  get popover() {
    const { imageList, luaApi } = this.props;
    const {
      cameraInSolarSystem,
      currentTabHeight,
      currentPopoverHeight,
      activeImage,
      isFacingCamera,
      isUsingRae,
      menuHeight,
      showOnlyNearest,
      selectedBrowser,
      selectedTarget,
      targetData,
    } = this.state;

    const skybrowserApi = luaApi.skybrowser;

    const targetsExist = Object.keys(this.state.targetData).length !== 0;
    const imageCollectionIsLoaded = this.state.imageCollectionIsLoaded;
    if (!cameraInSolarSystem || (!imageCollectionIsLoaded && targetsExist)) {
      const msg = !this.state.imageCollectionIsLoaded ? "Loading image collection..." : "The camera has to be within the solar system for the sky browser to work.";
      const errorMessage = (
        <WindowThreeStates
          title="AAS WorldWide Telescope"
          closeCallback={this.togglePopover}
          heightCallback={this.setCurrentPopoverHeight}
          height={currentPopoverHeight}
          defaultHeight={440}
          minHeight={currentTabHeight + menuHeight}
        >
          <CenteredLabel>
          {msg}
          </CenteredLabel>
        </WindowThreeStates>
      );
      return errorMessage;
    }

    const thisTabsImages = this.getSelectedTargetImages() || [];

    const skybrowserTabs = (
      <SkybrowserTabs
        api={luaApi}
        skybrowserApi={skybrowserApi}
        cameraInSolarSystem={cameraInSolarSystem}
        targets={targetData}
        selectedTarget={selectedTarget}
        selectedBrowser={selectedBrowser}
        isUsingRae={isUsingRae}
        isFacingCamera={isFacingCamera}
        maxHeight={currentPopoverHeight - menuHeight}
        minHeight={130}
        setCurrentTabHeight={this.setCurrentTabHeight}
        height={currentTabHeight}
        data={thisTabsImages}
        selectImage={this.selectImage}
        currentTargetColor={this.getCurrentTargetColor}
        passMessageToWwt={this.passMessageToWwt}
      />
    );

    const currentImageListHeight = currentPopoverHeight - currentTabHeight - menuHeight;

    const imageListComponent = (
      <SkyBrowserImageList
        luaApi={luaApi}
        imageList={imageList}
        selectedBrowserData={targetData[selectedBrowser]}
        showOnlyNearest={showOnlyNearest}
        activeImage={activeImage}
        getCurrentTargetColor={this.getCurrentTargetColor}
        selectImage={this.selectImage}
        height={currentImageListHeight}
        passMessageToWwt={this.passMessageToWwt}
      />
    );

    const addTargetBrowserPairButton = (
      <div className={styles.upperPart}>
        <Button
          onClick={() => skybrowserApi.createTargetBrowserPair()}
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

    return (
      <WindowThreeStates
        title="AAS WorldWide Telescope"
        closeCallback={this.togglePopover}
        heightCallback={this.setCurrentPopoverHeight}
        height={currentPopoverHeight}
        defaultHeight={440}
        minHeight={440}
      >
      {targetsExist ? <div className={styles.content}>
          {this.createImageMenu()}
          {imageListComponent}
          {skybrowserTabs}
        </div> :
        <div className={`${styles.content} ${styles.center}`}>
          {addTargetBrowserPairButton}
          {wwtLogoImg}
        </div>
      }
      </WindowThreeStates>
    );
  }

  render() {
    return (
      this.state.moduleIsLoaded && (
        <div className={Picker.Wrapper}>
          <Picker onClick={this.togglePopover} >
            <Icon icon="mdi:telescope" color="white" alt="WWT" style={{ fontSize: '2em' }}/>
          </Picker>
          {this.props.popoverVisible && this.popover}
          {this.props.popoverVisible && this.createWwtBrowsers()}
        </div>
      )
    );
  }
}

const mapSubStateToProps = ({ luaApi, popoverVisible, imageList }) => ({
  luaApi,
  popoverVisible,
  imageList,
});

const mapStateToSubState = state => ({
  propertyOwners: state.propertyTree.propertyOwners,
  popoverVisible: state.local.popovers.skybrowser.visible,
  luaApi: state.luaApi,
  imageList: state.skybrowser.data,
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
});

SkyBrowserPanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(SkyBrowserPanel);

export default SkyBrowserPanel;
