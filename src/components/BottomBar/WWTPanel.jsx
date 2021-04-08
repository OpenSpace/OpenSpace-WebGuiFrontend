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
      starName: undefined,
    };
    this.togglePopover = this.togglePopover.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible)
  }

  updateStarName(evt) {
    this.setState({
      starName: evt.target.value
    });
  }

  onSelect(identifier, evt) {
    this.setState({
      starName: identifier
    });
    this.props.selectImage(identifier);
  }

  get popover() {

   const starNameLabel = <span>Image name</span>;

   let imgList =  this.props.systemList != null ? this.props.systemList : {};
   let filterList = <FilterList
     data={imgList}
     className={styles.list}
     searchText={"Search from " + Object.keys(imgList).length.toString() + " images..."}
     viewComponent={SkybrowserFocusEntry}
     onSelect={this.onSelect}
     active={this.state.starName}
     searchAutoFocus
   />;

    return (
      <Popover
        className={Picker.Popover}
        title="WorldWide Telescope"
        closeCallback={this.togglePopover}
        detachable
        attached={true}
      >
        <div className={Popover.styles.content}>
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
