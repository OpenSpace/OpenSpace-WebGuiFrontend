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

import {
  setPopoverVisibility,
  selectImgSkyBrowser
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
      showOnlyNearest: false,
    };
    this.togglePopover = this.togglePopover.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.getAllImages = this.getAllImages.bind(this);
    this.getNearestImages = this.getNearestImages.bind(this);
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
    this.props.selectImage(identifier);
  }

  getAllImages() {
    if(this.props.systemList == null) return {};
    let listArray = this.props.systemList.map( function(item, index) {
      return {"name" : item["Name"] , "identifier": index.toString() , "key": index.toString(), "url": item["Thumbnail"] };
    });
    return listArray;
  }

  getNearestImages() {
    if(this.props.systemList == null) return {};
    let listArray = this.props.systemList.map( function(item, index) {
      return {"name" : item["Name"] , "identifier": index.toString() , "key": index.toString(), "url": item["Thumbnail"] };
    });
    //return listArray;
    return [{"name" : "Cool Cat" , "identifier": "0" , "key": "0", "url": "https://pbs.twimg.com/profile_images/3746761376/1adfb9f32c22458ffa418b6604a630c6.jpeg" }];
  }

  get popover() {
    const imageNameLabel = <span>Image name</span>;

    let imageList = this.state.showOnlyNearest ? this.getNearestImages() : this.getAllImages();

   let filterList = <FilterList
     data={imageList}
     className={styles.list}
     searchText={"Search from " + imageList.length.toString() + " images..."}
     viewComponent={SkybrowserFocusEntry}
     onSelect={this.onSelect}
     active={this.state.imageName}
     searchAutoFocus
   />;
   const textFormatLabel = <span>Show only near images</span>;
    return (
      <Popover
        className={Picker.Popover}
        title="WorldWide Telescope"
        closeCallback={this.togglePopover}
        detachable
        attached={true}
      >
        <div className={Popover.styles.content}>
        <Picker onClick={() => this.setState({ showOnlyNearest: false })}>
            <div>
              <MaterialIcon className={styles.photoIcon} icon="list_alt" />
            </div>
          </Picker>
        <Picker onClick={() => this.setState({ showOnlyNearest: true })}>
            <div>
              <MaterialIcon className={styles.photoIcon} icon="my_location" />
            </div>
          </Picker>
            <Checkbox
              checked={this.state.showOnlyNearest}
              label={textFormatLabel}
              setChecked={() => this.setState({ showOnlyNearest: ! this.state.showOnlyNearest })}
            />

        {filterList}
        </div>
      </Popover>
    );
  }

  render() {
    const { popoverVisible, hasSystems } = this.props;

    return (
      <div className={Picker.Wrapper}>
        {<Picker onClick={this.togglePopover}>
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
    hasSystems: (skybrowserData && skybrowserData.length > 0),
  }
};

const mapStateToSubState = (state) => ({
  propertyOwners: state.propertyTree.propertyOwners,
  popoverVisible: state.local.popovers.skybrowser.visible,
  luaApi: state.luaApi,
  skybrowserData: state.skybrowser.data,
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
