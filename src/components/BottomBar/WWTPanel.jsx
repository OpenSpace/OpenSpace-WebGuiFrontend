import React, { Component } from 'react';
import Popover from '../common/Popover/Popover';
import Button from '../common/Input/Button/Button';
import Picker from './Picker';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Input from '../common/Input/Input/Input';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Row from '../common/Row/Row';
import ScrollOverlay from '../common/ScrollOverlay/ScrollOverlay';
import FilterList from '../common/FilterList/FilterList';
import SkybrowserFocusEntry from './Origin/SkybrowserFocusEntry';
import propertyDispatcher from '../../api/propertyDispatcher';

import { Resizable } from 're-resizable';
import PopoverSkybrowser from '../common/Popover/PopoverSkybrowser';

import {
  setPopoverVisibility,
  selectImgSkyBrowser,
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


class WWTPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      imageName: undefined,
      showOnlyNearest: true,
      targetData: [{RA: 0, Dec: 0}],
      selectedTarget: 0,
      cameraData: {FOV : 70, RA: 0, Dec: 0}
    };
    this.togglePopover = this.togglePopover.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.hoverOnImage = this.hoverOnImage.bind(this);
    this.getAllImages = this.getAllImages.bind(this);
    this.getNearestImages = this.getNearestImages.bind(this);
    this.getTargetData = this.getTargetData.bind(this);
    this.hoverLeavesImage = this.hoverLeavesImage.bind(this);
    this.lockTarget = this.lockTarget.bind(this);
    this.unlockTarget = this.unlockTarget.bind(this);
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


  updateimageName(evt) {
    this.setState({
      imageName: evt.target.value
    });
  }

  onSelect(identifier, evt) {
    this.setState({
      imageName: identifier,
    });
    this.props.luaApi.skybrowser.selectImage(Number(identifier));
    //this.props.luaApi.skybrowser.lockTarget(this.state.selectedTarget);
  }

  hoverOnImage(identifier) {
    this.props.luaApi.skybrowser.moveCircleToHoverImage(Number(identifier));
  }

  hoverLeavesImage() {
    this.props.luaApi.skybrowser.disableHoverCircle();
  }

  async getTargetData() {
    try {
      let target = await this.props.luaApi.skybrowser.getTargetData();
      target = Object.values(target[1]);
      // Set the first object in the array to the camera and remove from array
      let camera = target[0];
      target = target.slice(1);
      this.setState({
        targetData: target,
        cameraData: {FOV: camera.WindowHFOV, CartesianDirection: camera.CartesianDirection, RA : camera.RA, Dec: camera.Dec},
        selectedTarget: camera.SelectedBrowserIndex
      });
      console.log(this.state.selectedTarget);
    }
    catch(e) {
      console.log(e);
    }
  }

  getAllImages() {
    // console.log(this.props.systemList);
    let images = this.props.systemList;
    if(this.props.systemList == null) return {};
    return images;

  }

  lockTarget(index) {
    this.props.luaApi.skybrowser.lockTarget(Number(index));
  }

  unlockTarget(index) {
    this.props.luaApi.skybrowser.unlockTarget(Number(index));
  }

  getNearestImages() {
    let targetPoint = this.state.cameraData;
    let searchRadius = this.state.cameraData.FOV / 2;

    let isWithinFOV = function (coord, target, FOV) {
      if(coord < (target + FOV) && coord > (target - FOV )) {
        return true;
      }
      else return false;
    };

    // Only load images that have coordinates within current window
    let imgsWithinTarget = this.props.systemList.filter(function(img) {
      if(img["hasCoords"] == false) {
        return false; // skip
      }
      else if (isWithinFOV(img["RA"], targetPoint.RA, searchRadius) &&
               isWithinFOV(img["Dec"], targetPoint.Dec, searchRadius)) {
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
          sum += distPow2(a.CartesianDirection[i], b.CartesianDirection[i])
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
   const imageNameLabel = <span>Image name</span>;

   let imageList = this.state.showOnlyNearest ? this.getNearestImages() : this.getAllImages();

   let filterList = <FilterList
      className={styles.filterList}
      data={imageList}
      searchText={"Search from " + imageList.length.toString() + " images..."}
      viewComponent={SkybrowserFocusEntry}
      viewComponentProps={{"hoverFunc" : this.hoverOnImage, "hoverLeavesImage" : this.hoverLeavesImage}}
      onSelect={this.onSelect}
      active={this.state.imageName}
      searchAutoFocus
   />;
    return (

      <PopoverSkybrowser
        title="WorldWide Telescope"
        closeCallback={this.togglePopover}
        detachable
        attached={true}
        sideview = {true}
      >
        <div className={PopoverSkybrowser.styles.content}>
          <div className={styles.row}>
          <Button onClick={() => this.props.luaApi.skybrowser.adjustCamera(this.state.selectedTarget)}>
          Camera look at target
          </Button>
          <Button onClick={() => this.lockTarget(this.state.selectedTarget)}>
          Lock target
          </Button>
          <Button onClick={() => this.unlockTarget(this.state.selectedTarget)}>
          Unlock target
          </Button>
            <Picker
              className={`${styles.picker} ${this.state.showOnlyNearest ? styles.unselected: styles.selected}`}
              onClick={() => this.setState({ showOnlyNearest: false })}>
                <span>All images</span> {/*<MaterialIcon className={styles.photoIcon} icon="list_alt" />*/}
            </Picker>
            <Picker
              className={`${styles.picker} ${this.state.showOnlyNearest ? styles.selected : styles.unselected}`}
              onClick={() => this.setState({ showOnlyNearest: true })}>
                <span>Nearby images</span> {/*<MaterialIcon className={styles.photoIcon} icon="my_location" />*/}
            </Picker>
          </div>
          {/*
            <Checkbox
              checked={this.state.showOnlyNearest}
              label={textFormatLabel}
              setChecked={() => this.setState({ showOnlyNearest: ! this.state.showOnlyNearest })}
            />
          */}
        {filterList}
        </div>
      </PopoverSkybrowser>

    );
  }

  render() {
    const { popoverVisible, hasSystems } = this.props;


    return (

      <div className={Picker.Wrapper}>
        {
          <Picker onClick={this.togglePopover}>
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
  selectImage: (imgName) => {
    dispatch(selectImgSkyBrowser({
      imgName
    }));
  },
})

WWTPanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(WWTPanel);

export default WWTPanel;
