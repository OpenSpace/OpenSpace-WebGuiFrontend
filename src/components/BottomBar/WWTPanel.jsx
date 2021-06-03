import React, { Component } from 'react';
import Popover from '../common/Popover/Popover';
import Button from '../common/Input/Button/Button';
import Picker from './Picker';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Input from '../common/Input/Input/Input';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Row from '../common/Row/Row';
import FilterList from '../common/FilterList/FilterList';
import SkybrowserFocusEntry from './Origin/SkybrowserFocusEntry';
import propertyDispatcher from '../../api/propertyDispatcher';

import { Resizable } from 're-resizable';
import PopoverSkybrowser from '../common/Popover/PopoverSkybrowser';

import {
  setPopoverVisibility,
} from '../../api/Actions';

import {
  NavigationAnchorKey,
  NavigationAimKey,
  RetargetAnchorKey,
} from '../../api/keys';

import { connect } from 'react-redux';

import styles from './WWTPanel.scss';

import PropertyOwner from '../Sidebar/Properties/PropertyOwner'
import subStateToProps from '../../utils/subStateToProps';
import SkybrowserTabs from '../common/Tabs/SkybrowserTabs';


class WWTPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      imageName: "",
      showOnlyNearest: true,
      targetIsLocked: true,
      targetData: [{ra: 0, dec: 0}],
      selectedTarget: 0,
      cameraData: {FOV : 70, RA: 0, Dec: 0},
      currentTabHeight: 120,
      currentPopoverHeight: 440,
    };
    this.togglePopover = this.togglePopover.bind(this);
    this.selectImage = this.selectImage.bind(this);
    this.hoverOnImage = this.hoverOnImage.bind(this);
    this.getAllImages = this.getAllImages.bind(this);
    this.getNearestImages = this.getNearestImages.bind(this);
    this.getTargetData = this.getTargetData.bind(this);
    this.add3dImage = this.add3dImage.bind(this);
    this.removeImageSelection = this.removeImageSelection.bind(this);
    this.hoverLeavesImage = this.hoverLeavesImage.bind(this);
    this.lockTarget = this.lockTarget.bind(this);
    this.unlockTarget = this.unlockTarget.bind(this);
    this.getCurrentTargetColor = this.getCurrentTargetColor.bind(this);
    this.onToggleWWT = this.onToggleWWT.bind(this);
    this.getImagesWith3Dcoord = this.getImagesWith3Dcoord.bind(this);
    this.createTargetBrowserPair = this.createTargetBrowserPair.bind(this);
    this.adjustCameraToTarget = this.adjustCameraToTarget.bind(this);
    this.getSelectedTargetImages = this.getSelectedTargetImages.bind(this);
    this.setCurrentTabHeight = this.setCurrentTabHeight.bind(this);
    this.setCurrentPopoverHeight = this.setCurrentPopoverHeight.bind(this);
    this.setOpacityOfImage = this.setOpacityOfImage.bind(this);
    this.set2dSelectionAs3dSelection = this.set2dSelectionAs3dSelection.bind(this);
  }

  async componentDidMount(){
    try {
       this.interval = setInterval(() => this.getTargetData(), 1000);
    }
    catch(e) {
      console.log(e);
    }
  }

  togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible)
  }

  selectImage(identifier) {
    if(identifier) {
      this.setState({
        imageName: identifier,
      });
      this.props.luaApi.skybrowser.selectImage(Number(identifier));
    }
    //this.props.luaApi.skybrowser.lockTarget(this.state.selectedTarget);
  }

  hoverOnImage(identifier) {
    if(identifier) {
      this.props.luaApi.skybrowser.moveCircleToHoverImage(Number(identifier));
    }

  }

  hoverLeavesImage() {
    this.props.luaApi.skybrowser.disableHoverCircle();
  }

  add3dImage(identifier) {
    this.props.luaApi.skybrowser.create3dSkyBrowser(Number(identifier));
  }

  removeImageSelection(identifier) {
    this.props.luaApi.skybrowser.removeSelectedImageInBrowser(Number(identifier), this.state.selectedTarget);
  }

  setOpacityOfImage(identifier, opacity) {
    this.props.luaApi.skybrowser.setOpacityOfImageLayer(this.state.selectedTarget, Number(identifier), opacity);
  }


  async getTargetData() {
    try {
      let  target = await this.props.luaApi.skybrowser.getTargetData();
      target = target[1];

      // Set the first object in the array to the camera and remove from array
      let camera = target.OpenSpace;
      delete target.OpenSpace;

      this.setState({
        targetData: target,
        cameraData: {FOV: camera.windowHFOV, cartesianDirection: camera.cartesianDirection, ra : camera.ra, dec: camera.dec},
        selectedTarget: camera.selectedBrowserId
      });
    }
    catch(e) {
      console.log(e);
    }
  }

  getSelectedTargetImages() {
    let selectedImagesIndices = this.state.targetData[this.state.selectedTarget];

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

  lockTarget(target) {
    this.props.luaApi.skybrowser.lockTarget(target);
  }

  unlockTarget(target) {
    this.props.luaApi.skybrowser.unlockTarget(target);
  }

  createTargetBrowserPair() {
    this.props.luaApi.skybrowser.createTargetBrowserPair();
  }

  adjustCameraToTarget(target) {
    this.props.luaApi.skybrowser.lockTarget(target);
    this.props.luaApi.skybrowser.adjustCamera(target);
  }

  set2dSelectionAs3dSelection() {
    this.props.luaApi.skybrowser.set3dSelectedImagesAs2dSelection(this.state.selectedTarget);
  }

  getCurrentTargetColor() {
    return this.state.targetData[this.state.selectedTarget].color;
  }

  setCurrentTabHeight(height) {
    this.setState({ currentTabHeight : height })
  }

  setCurrentPopoverHeight(height) {
    this.setState({ currentPopoverHeight : height })
  }

  onToggleWWT() {
    this.togglePopover();
  }

  getImagesWith3Dcoord() {
    let imagesWith3DPosition = this.props.systemList.filter(function(img) {
      if(img["has3dCoords"] == true) {
        return true;
      }
      return false;
    });
    return imagesWith3DPosition;
  }

  getNearestImages() {
    let targetPoint = this.state.targetData[this.state.selectedTarget];
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
      let targetPoint = this.state.targetData[this.state.selectedTarget];
      let result = euclidianDistance(a, targetPoint) > euclidianDistance(b, targetPoint);
      return result ? 1 : -1;
    }
    );
    return imgsWithinTarget;
  }

  get popover() {

    let imageList = this.state.showOnlyNearest ? this.getNearestImages() : this.getAllImages();
    let targetIsLocked = false;
    if(this.state.targetData[this.state.selectedTarget]) {
      targetIsLocked = this.state.targetData[this.state.selectedTarget].isLocked;
    }
    //let imageList = this.state.showOnlyNearest ? this.getImagesWith3Dcoord() : this.getAllImages();

    let filterList = <FilterList
      className={styles.filterList}
      data={imageList}
      searchText={"Search from " + imageList.length.toString() + " images..."}
      viewComponent={SkybrowserFocusEntry}
      viewComponentProps={{"hoverFunc" : this.hoverOnImage, "hoverLeavesImage" : this.hoverLeavesImage,
        "currentTargetColor" : this.getCurrentTargetColor, "add3dImage" : this.add3dImage}}
      onSelect={this.selectImage}
      active={this.state.imageName}
      searchAutoFocus
      />;

    let thisTabsImages = this.getSelectedTargetImages();
    thisTabsImages = thisTabsImages ? thisTabsImages : [];
    let currentPopoverHeight = this.state.currentPopoverHeight - 120; //

    let skybrowserTabs =
    <SkybrowserTabs
      targets={this.state.targetData}
      currentTarget={this.state.selectedTarget.toString()}
      targetIsLocked={targetIsLocked}
      currentPopoverHeight={currentPopoverHeight}
      data={thisTabsImages}
      viewComponent={SkybrowserFocusEntry}
      viewComponentProps={{"hoverFunc" : this.hoverOnImage, "hoverLeavesImage" : this.hoverLeavesImage,
      "lockTarget" : this.lockTarget , "unlockTarget" : this.unlockTarget, "createTargetBrowserPair" : this.createTargetBrowserPair,
      "add3dImage" : this.add3dImage,  "removeImageSelection" : this.removeImageSelection, "setOpacity": this.setOpacityOfImage, "onImageSelect":this.selectImage,
      "adjustCameraToTarget" : this.adjustCameraToTarget, "add3dImage" : this.add3dImage,  "removeImageSelection" : this.removeImageSelection,
      "select2dImagesAs3d" : this.set2dSelectionAs3dSelection, "setCurrentTabHeight" : this.setCurrentTabHeight,}}
      onSelect={this.onSelect}
      //active={this.state.imageName}
      />;

  return (

      <PopoverSkybrowser
        title="WorldWide Telescope"
        closeCallback={this.togglePopover}
        detachable
        attached={true}
        sideview = {true}
        heightCallback={this.setCurrentPopoverHeight}
        >

        <div className={styles.row}>
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
          </div>
      </PopoverSkybrowser>

    );
  }

  render() {
    const { popoverVisible, hasSystems } = this.props;


    return (

      <div className={Picker.Wrapper}>
        {
          <Picker onClick={this.onToggleWWT}>
            <div>
              <MaterialIcon className={styles.photoIcon} icon="picture_in_picture" />
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
    hasSystems: (skybrowserData && skybrowserData.length > 0)
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
