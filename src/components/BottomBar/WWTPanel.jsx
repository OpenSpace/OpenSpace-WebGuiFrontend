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
import Checkbox from '../common/Input/Checkbox/Checkbox';

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
      targetData: [{RA: 0, Dec: 0}]
    };
    this.togglePopover = this.togglePopover.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.hoverOnImage = this.hoverOnImage.bind(this);
    this.getAllImages = this.getAllImages.bind(this);
    this.getNearestImages = this.getNearestImages.bind(this);
    this.getTargetData = this.getTargetData.bind(this);
    this.hoverLeavesImage = this.hoverLeavesImage.bind(this);
  }

  async componentDidMount(){
    try {
       this.interval = setInterval(() => this.getTargetData(), 2000);
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
      target = target.map( function(img, index) {
        return {"identifier": index.toString() ,"key": index.toString(), "RA" : img["RA"], "Dec": img["Dec"], "FOV" : img["FOV"] };
      });
      this.setState({
        targetData: target
      })
    }
    catch(e) {
      console.log(e);
    }
  }

  getAllImages() {
//    console.log(this.props.systemList);
    let images = this.props.systemList;
    if(this.props.systemList == null) return {};
    return images;

  }

  getNearestImages() {
    let targetPoint = {RA: this.state.targetData[0].RA, Dec:  this.state.targetData[0].Dec};
    let searchRadius = this.state.targetData[0].FOV;

    let isWithinFOV = function (coord, target, FOV) {
      if(coord < (target + FOV) && coord > (target - FOV )) {
        return true;
      }
      else return false;
    };

    // Only load images that have coordinates for this mode
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
    console.log(imgsWithinTarget);
    let nearestImages = imgsWithinTarget.map( function(item, index) {
      return {"name" : item["name"] , "identifier":  item["identifier"] , "key": item["key"], "url": item["url"] };
    });

    return nearestImages;
  }

  get popover() {
   const imageNameLabel = <span>Image name</span>;

   let imageList = this.state.showOnlyNearest ? this.getNearestImages() : this.getAllImages();

   let filterList = <FilterList
     data={imageList}
     className={styles.list}
     searchText={"Search from " + imageList.length.toString() + " images..."}
     viewComponent={SkybrowserFocusEntry}
     viewComponentProps={{"hoverFunc" : this.hoverOnImage, "hoverLeavesImage" : this.hoverLeavesImage}}
     onSelect={this.onSelect}
     active={this.state.imageName}
     searchAutoFocus
   />;
   //const textFormatLabel = <span>Show only near images</span>;

    return (

      <PopoverSkybrowser

        title="WorldWide Telescope"
        closeCallback={this.togglePopover}
        detachable
        attached={true}
        sideview = {true}
      >
        <div className={Popover.styles.content}>
          <div className={styles.row}>
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
