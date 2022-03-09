import React, { Component } from 'react';
import { connect } from 'react-redux';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import FilterList from '../common/FilterList/FilterList';
import Picker from './Picker';
import subStateToProps from '../../utils/subStateToProps';
import { setPopoverVisibility } from '../../api/Actions';
// Sky  browser
import SkybrowserFocusEntry from '../SkyBrowser/SkybrowserFocusEntry';
import WindowThreeStates from '../SkyBrowser/WindowThreeStates';
import SkybrowserTabs from '../SkyBrowser/SkybrowserTabs';
import PopoverResizeable from '../SkyBrowser/PopoverResizeable'
import wwtLogo from './wwtlogo.png';
import styles from './SkyBrowserPanel.scss';

class SkyBrowserPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moduleIsLoaded: false,
      activeImage: '',
      showOnlyNearest: true,
      targetData: '',
      selectedTarget: '',
      isUsingRae: false,
      isFacingCamera: false,
      cameraInSolarSystem: true,
      currentTabHeight: 185,
      currentPopoverHeight: 440,
    };
    this.getAllImages = this.getAllImages.bind(this);
    this.getNearestImages = this.getNearestImages.bind(this);
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

  async getTargetData() {
    try {
      if(!this.props.luaApi.skybrowser) {
        throw new Error('Sky Browser Module is not loaded!');
      }
      else {
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
          moduleIsLoaded: true
        });
      }
    } catch (e) {
      console.log(e);
      // Stop the timer to get the target data
      clearInterval(this.targetDataID);
      this.setState({
        moduleIsLoaded: false
      });
    }
  }

  getSelectedTargetImages() {
    const { systemList } = this.props;
    const { targetData, selectedBrowser } = this.state;
    const selectedImagesIndices = targetData[selectedBrowser];

    if (!systemList || !selectedImagesIndices) {
      return [];
    }

    // For some reason, ghoul sends this vector as an object. Convert to array
    const images = selectedImagesIndices.selectedImages;
    if (!images) return [];
    const indices = Object.values(images);
    return indices.map(index => systemList[index.toString()]);
  }

  getAllImages() {
    if(this.props.systemList.length) {
      return this.props.systemList;
    }
    else {
      return [];
    }
  }

  getCurrentTargetColor() {
    const browser = this.state.targetData[this.state.selectedBrowser];
    return browser ? 'rgb(' + browser.color + ')' :  'gray';
  }

  getNearestImages() {
    const { systemList } = this.props;
    const { targetData, selectedBrowser } = this.state;
    const targetPoint = targetData[selectedBrowser];
    if (!targetPoint || Object.keys(systemList).length === 0) {
      return [];
    }
    const searchRadius = targetPoint.FOV / 2;
    const isWithinFOV = (coord, target, FOV) => (coord < (target + FOV) && coord > (target - FOV));

    // Only load images that have coordinates within current window
    const imgsWithinTarget = systemList.filter((img) => {
      if (!img.hasCelestialCoords) {
        return false; // skip
      }
      if (isWithinFOV(img.ra, targetPoint.ra, searchRadius)
          && isWithinFOV(img.dec, targetPoint.dec, searchRadius)) {
        return true;
      }
      return false;
    });

    const distPow2 = (a, b) => (a - b) * (a - b);

    const euclidianDistance = (a, b) => {
      let sum = 0;
      for (let i = 0; i < 3; i++) {
        sum += distPow2(a.cartesianDirection[i], b.cartesianDirection[i]);
      }
      return Math.sqrt(sum);
    };

    imgsWithinTarget.sort((a, b) => {
      const result = euclidianDistance(a, targetPoint) > euclidianDistance(b, targetPoint);
      return result ? 1 : -1;
    });
    return imgsWithinTarget;
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
    const showOnlyNearest = this.state.showOnlyNearest;
    return <div className={styles.row}>
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
    </div>;
  }

  get popover() {
    const {
      cameraInSolarSystem,
      currentTabHeight,
      currentPopoverHeight,
      activeImage,
      isFacingCamera,
      isUsingRae,
      showOnlyNearest,
      selectedBrowser,
      selectedTarget,
      targetData,
    } = this.state;

    if (!cameraInSolarSystem) {
      const errorMessage = (
        <WindowThreeStates
          title="AAS WorldWide Telescope"
          closeCallback={this.togglePopover}
          heightCallback={this.setCurrentPopoverHeight}
          height={this.state.currentPopoverHeight}
        >
          <CenteredLabel>
            The camera has to be within the solar system for the sky browser to work.
          </CenteredLabel>
        </WindowThreeStates>
      );
      return errorMessage;
    }

    const imageList = showOnlyNearest ? this.getNearestImages() : this.getAllImages();
    const api = this.props.luaApi;
    const skybrowserApi = api.skybrowser;

    const filterList = imageList.length > 0 && (
      <FilterList
        className={styles.filterList}
        data={imageList}
        searchText={`Search from ${imageList.length.toString()} images...`}
        viewComponent={SkybrowserFocusEntry}
        viewComponentProps={{ skybrowserApi, currentTargetColor: this.getCurrentTargetColor }}
        onSelect={this.selectImage}
        active={activeImage}
        searchAutoFocus
      />
    );

    const thisTabsImages = this.getSelectedTargetImages() || [];

    const selectionButtonsAndSearchHeight = 120; // Height of the image selection buttons and search image field
    const popoverHeight = currentPopoverHeight - selectionButtonsAndSearchHeight;

    const skybrowserTabs = (
      <SkybrowserTabs
        api={api}
        skybrowserApi={skybrowserApi}
        cameraInSolarSystem={cameraInSolarSystem}
        targets={targetData}
        selectedTarget={selectedTarget}
        selectedBrowser={selectedBrowser}
        isUsingRae={isUsingRae}
        isFacingCamera={isFacingCamera}
        currentPopoverHeight={this.state.currentPopoverHeight}
        setCurrentTabHeight={this.setCurrentTabHeight}
        data={thisTabsImages}
        selectImage={this.selectImage}
        currentTargetColor={this.getCurrentTargetColor}
      />
    );

    return (
      <WindowThreeStates
        title="AAS WorldWide Telescope"
        closeCallback={this.togglePopover}
        heightCallback={this.setCurrentPopoverHeight}
        height={this.state.currentPopoverHeight}
      >
      <div className={styles.content}>
        { this.createImageMenu() }
        <div
          className={styles.scrollArea}
          style={{ height: `calc(100% - ${currentTabHeight}px)` }}
        >
          {filterList}
        </div>
        {skybrowserTabs}
      </div>
      </WindowThreeStates>
    );
  }

  render() {
    return ( this.state.moduleIsLoaded &&
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover} style={{ padding: 0 }}>
          <div style={{ textAlign: 'center', display: 'block' }}>
            <img src={wwtLogo} alt="WWT" style={{ width: '50%', height: '50%' }} />
          </div>
        </Picker>
        {this.props.popoverVisible && this.popover }
      </div>
    );
  }
}

const mapSubStateToProps = ({
  luaApi,
  popoverVisible,
  skybrowserData,
}) => ({
  luaApi,
  popoverVisible,
  systemList: skybrowserData,
});

const mapStateToSubState = state => ({
  propertyOwners: state.propertyTree.propertyOwners,
  popoverVisible: state.local.popovers.skybrowser.visible,
  luaApi: state.luaApi,
  skybrowserData: state.skybrowser.data,
});

const mapDispatchToProps = dispatch => ({
  setPopoverVisibility: (visible) => {
    dispatch(setPopoverVisibility({
      popover: 'skybrowser',
      visible,
    }));
  },
});

SkyBrowserPanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(SkyBrowserPanel);

export default SkyBrowserPanel;
