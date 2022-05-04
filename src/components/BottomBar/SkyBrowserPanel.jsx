import React, { Component } from 'react';
import { connect } from 'react-redux';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Picker from './Picker';
import Button from '../common/Input/Button/Button';
import subStateToProps from '../../utils/subStateToProps';
import { setPopoverVisibility } from '../../api/Actions';
// Sky  browser
import WindowThreeStates from '../SkyBrowser/WindowThreeStates/WindowThreeStates';
import SkybrowserTabs from '../SkyBrowser/SkybrowserTabs';
import SkyBrowserImageList from '../SkyBrowser/SkyBrowserImageList';
import wwtLogo from './wwtlogo.png';
import styles from './SkyBrowserPanel.scss';

class SkyBrowserPanel extends Component {
  constructor(props) {
    super(props);
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
  }

  getCurrentTargetColor() {
    const browser = this.state.targetData[this.state.selectedBrowser];
    return browser ? `rgb(${browser.color})` : 'gray';
  }

  setCurrentTabHeight(height) {
    this.setState({ currentTabHeight: height });
  }

  setCurrentPopoverHeight(height) {
    this.setState({ currentPopoverHeight: height });
  }

  selectImage(identifier) {
    if (identifier) {
      this.setState({
        activeImage: identifier,
      });
      this.props.luaApi.skybrowser.selectImage(Number(identifier));
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
      />
    );

    const targetsExist = Object.keys(targetData).length !== 0;
    const addTargetBrowserPairButton = <Button
        onClick={() => skybrowserApi.createTargetBrowserPair()}
        className={styles.addTabButton}
        transparent
      >
        <CenteredLabel>Add Sky Browser</CenteredLabel>
        <div className={styles.plus} />
      </Button>;

    return (
      <WindowThreeStates
        title="AAS WorldWide Telescope"
        closeCallback={this.togglePopover}
        heightCallback={this.setCurrentPopoverHeight}
        height={currentPopoverHeight}
        defaultHeight={440}
        minHeight={currentTabHeight + menuHeight}
      >
      {targetsExist ? <div className={styles.content}>
          {this.createImageMenu()}
          {imageListComponent}
          {skybrowserTabs}
        </div> :
        <div className={`${styles.content} ${styles.center}`}>
          {addTargetBrowserPairButton}
        </div>
      }
      </WindowThreeStates>
    );
  }

  render() {
    return (
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
