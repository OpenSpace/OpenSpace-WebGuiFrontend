import React, { Component } from 'react';
import Popover from '../common/Popover/Popover';
import Button from '../common/Input/Button/Button';
import Input from '../common/Input/Input/Input';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Row from '../common/Row/Row';
import FilterList from '../common/FilterList/FilterList';
import Picker from './Picker';
import propertyDispatcher from '../../api/propertyDispatcher';
import { Resizable } from 're-resizable';
import PropertyOwner from '../Sidebar/Properties/PropertyOwner'
import subStateToProps from '../../utils/subStateToProps';
import { setPopoverVisibility } from '../../api/Actions';
import { NavigationAnchorKey, NavigationAimKey, RetargetAnchorKey } from '../../api/keys';
import { connect } from 'react-redux';
// Sky  browser
import SkybrowserFocusEntry from '../SkyBrowser/SkybrowserFocusEntry';
import PopoverSkybrowser from '../SkyBrowser/PopoverSkybrowser';
import SkybrowserTabs from '../SkyBrowser/SkybrowserTabs';
import wwtLogo from './wwtlogo.png';
import styles from './WWTPanel.scss';

class WWTPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      imageName: "",
      showOnlyNearest: true,
      targetData: "",
      selectedTarget: "",
      isUsingRae : false,
      isFacingCamera : false,
      cameraInSolarSystem : true,
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
  }

  async componentDidMount(){
    try {
       this.interval = setInterval(() => this.getTargetData(), 1000);
    }
    catch(e) {
      console.log(e);
    }
  }

  // Getters
  async getTargetData() {
    try {
      let  target = await this.props.luaApi.skybrowser.getTargetData();
      target = target[1];

      // Set the first object in the array to the camera and remove from array
      let camera = target.OpenSpace;
      delete target.OpenSpace;

      this.setState({
        targetData: target,
        selectedTarget: camera.selectedTargetId,
        selectedBrowser: camera.selectedBrowserId,
        isUsingRae: camera.isUsingRadiusAzimuthElevation,
        isFacingCamera: camera.isFacingCamera,
        cameraInSolarSystem: camera.cameraInSolarSystem
      });
    }
    catch(e) {
      console.log(e);
    }
  }

  getSelectedTargetImages() {
    let selectedImagesIndices = this.state.targetData[this.state.selectedBrowser];

    if(!selectedImagesIndices) {
      return [];
    }
    else {
      // For some reason, ghoul sends this vector as an object. Convert to array
      let images = selectedImagesIndices.selectedImages;
      if(!images) return [];
      let indices = Object.values(images);
      return indices.map((index) => this.props.systemList[index.toString()]);
    }
  }

  getAllImages() {
    let images = this.props.systemList;
    if(this.props.systemList == null) return {};
    return images;
  }

  getCurrentTargetColor() {
    if(this.state.targetData[this.state.selectedBrowser]) {
      const color = this.state.targetData[this.state.selectedBrowser].color;
      return 'rgb(' + color + ')';
    }
    else {
      return 'gray';
    }
  }

  getNearestImages() {
    let targetPoint = this.state.targetData[this.state.selectedBrowser];
    if(!targetPoint) return [];

    let searchRadius = targetPoint.FOV / 2;

    let isWithinFOV = function (coord, target, FOV) {
      if(coord < (target + FOV) && coord > (target - FOV )) {
        return true;
      }
      else return false;
    };

    // Only load images that have coordinates within current window
    let imgsWithinTarget = this.props.systemList.filter(function(img) {
      if(img["hasCelestialCoords"] == false) {
        return false; // skip
      }
      else if (isWithinFOV(img["ra"], targetPoint.ra, searchRadius) &&
               isWithinFOV(img["dec"], targetPoint.dec, searchRadius)) {
              return true;
      }
      return false;
    });

    let distPow2 = function(a, b) {
      return (a - b)*(a - b);
    };

    let euclidianDistance = function (a, b) {
      let sum = 0;
      for(let i = 0; i < 3; i++) {
          sum += distPow2(a.cartesianDirection[i], b.cartesianDirection[i])
      }
      let distance = Math.sqrt(sum);
      return distance;
    };

    imgsWithinTarget.sort((a, b) => {
      let targetPoint = this.state.targetData[this.state.selectedBrowser];
      let result = euclidianDistance(a, targetPoint) > euclidianDistance(b, targetPoint);
      return result ? 1 : -1;
    }
    );
    return imgsWithinTarget;
  }
  // Setters
  setCurrentTabHeight(height) {
    this.setState({ currentTabHeight : height })
  }

  setCurrentPopoverHeight(height) {
    this.setState({ currentPopoverHeight : height })
  }

  selectImage(identifier) {
    if(identifier) {
      this.setState({
        imageName: identifier,
      });
      this.props.luaApi.skybrowser.selectImage(Number(identifier));
    }
  }
  // Popover
  togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible)
  }

  get popover() {

    let imageList = this.state.showOnlyNearest ? this.getNearestImages() : this.getAllImages();
    let api = this.props.luaApi;
    let skybrowserApi = api.skybrowser;

    let filterList = imageList.length == 0 ? "" : <FilterList
      className={styles.filterList}
      data={imageList}
      searchText={"Search from " + imageList.length.toString() + " images..."}
      viewComponent={SkybrowserFocusEntry}
      viewComponentProps={{"skybrowserApi" : skybrowserApi, "currentTargetColor" : this.getCurrentTargetColor}}
      onSelect={this.selectImage}
      active={this.state.imageName}
      searchAutoFocus
      />;

    let thisTabsImages = this.getSelectedTargetImages();
    thisTabsImages = thisTabsImages ? thisTabsImages : [];

    const selectionButtonsAndSearchHeight = 120; // Height of the image selection buttons and search image field
    let currentPopoverHeight = this.state.currentPopoverHeight - selectionButtonsAndSearchHeight;

    let skybrowserTabs = <SkybrowserTabs
      api = {api}
      skybrowserApi = {api.skybrowser}
      cameraInSolarSystem = {this.state.cameraInSolarSystem}
      targets={this.state.targetData}
      selectedTarget={this.state.selectedTarget}
      selectedBrowser={this.state.selectedBrowser}
      isUsingRae = {this.state.isUsingRae}
      isFacingCamera = {this.state.isFacingCamera}
      currentPopoverHeight={currentPopoverHeight}
      setCurrentTabHeight= {this.setCurrentTabHeight}
      data={thisTabsImages}
      selectImage = {this.selectImage}
      currentTargetColor = {this.getCurrentTargetColor}
      />;

      const skybrowser = <div><div className={styles.row}>
          <Picker
            className={`${styles.picker} ${this.state.showOnlyNearest ? styles.unselected: styles.selected}`}
            onClick={() => this.setState({ showOnlyNearest: false })}>
              <span>All images</span> {/*<MaterialIcon className={styles.photoIcon} icon="list_alt" />*/}
          </Picker>
          <Picker
            className={`${styles.picker} ${this.state.showOnlyNearest ? styles.selected : styles.unselected}`}
            onClick={() => this.setState({ showOnlyNearest: true })}>
              <span>Images within view</span> {/*<MaterialIcon className={styles.photoIcon} icon="my_location" />*/}
          </Picker>
        </div>
        <div className={PopoverSkybrowser.styles.content}>
          <div className={PopoverSkybrowser.styles.scrollArea}
          style={{height: 'calc(100% - ' + (this.state.currentTabHeight) + 'px)'}}>
          {filterList}
          </div>
          {skybrowserTabs}
        </div></div>;

        const errorMessage = <div>
                                <span> The camera has to be within the solar system for the sky browser to work. </span>
                            </div>

  return (

      <PopoverSkybrowser
        title="AAS WorldWide Telescope"
        closeCallback={this.togglePopover}
        detachable
        heightCallback={this.setCurrentPopoverHeight}
        >
        {this.state.cameraInSolarSystem ? skybrowser : errorMessage}

      </PopoverSkybrowser>

    );
  }

  render() {
    const { popoverVisible } = this.props;

    return (

      <div className={Picker.Wrapper}>
        {
          <Picker onClick={this.togglePopover} style={{padding: 0}}>
            <div style={{textAlign: 'center', display: 'block'}}>
              <img src={wwtLogo} alt="WWT"  style={{width:'50%', height: '50%'}} />
            </div>
          </Picker>
        }
        {popoverVisible && this.popover }
      </div>


    );
  }
}

const mapSubStateToProps = ({propertyOwners, popoverVisible, luaApi, skybrowserData}) => {
  return {
    popoverVisible: popoverVisible,
    luaApi: luaApi,
    systemList: skybrowserData,
  }
};

const mapStateToSubState = (state) => ({
  propertyOwners: state.propertyTree.propertyOwners,
  popoverVisible: state.local.popovers.skybrowser.visible,
  luaApi: state.luaApi,
  skybrowserData: state.skybrowser.data
});


const mapDispatchToProps = dispatch => ({
  setPopoverVisibility: visible => {
    dispatch(setPopoverVisibility({
      popover: 'skybrowser',
      visible
    }));
  },
})

WWTPanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(WWTPanel);

export default WWTPanel;
