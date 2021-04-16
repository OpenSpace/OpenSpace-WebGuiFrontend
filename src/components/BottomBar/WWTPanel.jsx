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
    };
    this.togglePopover = this.togglePopover.bind(this);
    this.onSelect = this.onSelect.bind(this);
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

  get popover() {
    const imageNameLabel = <span>Image name</span>;

    let imgData =  this.props.systemList != null ? this.props.systemList  : {}
    let listArray = imgData.map( function(item, index) {
      return {"name" : item["Name"] , "identifier": index.toString() , "key": index.toString(), "url": item["Thumbnail"] };
    });

   let filterList = <FilterList
     data={listArray}
     className={styles.list}
     searchText={"Search from " + listArray.length.toString() + " images..."}
     viewComponent={SkybrowserFocusEntry}
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
        sideview={true}
      >         
        <div className={PopoverSkybrowser.styles.content}>
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
