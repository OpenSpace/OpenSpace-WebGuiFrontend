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
import FocusEntry from './Origin/FocusEntry';
import propertyDispatcher from '../../api/propertyDispatcher';

import { 
  setPopoverVisibility,
  reloadPropertyTree,
  addExoplanets,
  removeExoplanets,
} from '../../api/Actions';

import {
  NavigationAnchorKey,
  NavigationAimKey,
  RetargetAnchorKey,
} from '../../api/keys';

import { connect } from 'react-redux';

import styles from './ExoplanetsPanel.scss';

import PropertyOwner from '../Sidebar/Properties/PropertyOwner'
import subStateToProps from '../../utils/subStateToProps';

class ExoplanetsPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      starName: undefined,
    };
    this.togglePopover = this.togglePopover.bind(this);
    this.addSystem = this.addSystem.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.removeExoplanetSystem = this.removeExoplanetSystem.bind(this);
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
  }

  removeExoplanetSystem(systemName) {

    const matchingAnchor =  (this.props.anchor.value.indexOf(systemName) == 0);
    const matchingAim =  (this.props.aim.value.indexOf(systemName) == 0);
    if ( matchingAnchor || matchingAim ) {
      this.props.anchorDispatcher.set('Sun');
      this.props.aimDispatcher.set('');
    }

    this.props.removeSystem(systemName);
  }


  addSystem() {

    this.props.luaApi.exoplanets.addExoplanetSystem(this.state.starName);
    // TODO: Once we have a proper way to subscribe to additions and removals
    // of property owners, this 'hard' refresh should be removed.
    setTimeout(() => {
      this.props.refresh();
    }, 500);
  }

  get popover() {

    const starNameLabel = <span>Star name</span>;
    const noContentLabel = <CenteredLabel>No active systems</CenteredLabel>;
    const renderables = this.props.exoplanetSystems; 
    let panelContent;

    if (renderables.length == 0) {
      panelContent = noContentLabel;
    } else {
      panelContent = renderables.map(prop =>
        <PropertyOwner autoExpand={false}
                       key={prop}
                       uri={prop}
                       trashAction={this.removeExoplanetSystem}
                       expansionIdentifier={"P:" + prop} />
      )
    }

    return (
      <Popover
        className={Picker.Popover}
        title="Exoplanet Systems"
        closeCallback={this.togglePopover}
        detachable
        attached={true}
      >        
        <div className={Popover.styles.content}>
          <Row>
            <FilterList
              data={this.props.systemList}
              className={styles.list}
              searchText={"Star name..."}
              viewComponent={FocusEntry}
              onSelect={this.onSelect}
              active={this.state.starName}
              searchAutoFocus
            />
            <div className={Popover.styles.row}>
              <Button onClick={this.addSystem}
                      title="Add system"
                      style={{width: 90}}
                      disabled={!this.state.starName}>
                <MaterialIcon icon="public" />
                <span style={{marginLeft: 5}}>Add System</span>
              </Button>
            </div>
          </Row>
        </div>
        <hr className={Popover.styles.delimiter} />
        <div className={Popover.styles.title}>Exoplanet Systems </div>
        <div className={styles.slideList}>
          <ScrollOverlay>
            {panelContent}
          </ScrollOverlay>
        </div>
      </Popover>
    );
  }

  render() {
    const { popoverVisible, hasSystems } = this.props;

    return (
      <div className={Picker.Wrapper}>
        {hasSystems && 
          <Picker 
            className={`${popoverVisible && Picker.Active}`} 
            onClick={this.togglePopover}
          >
            <div>
              <MaterialIcon className={styles.photoIcon} icon="hdr_strong" />
            </div>
          </Picker>
        }
        { popoverVisible && this.popover }
      </div>
    );
  }
}

const mapSubStateToProps = ({propertyOwners, popoverVisible, luaApi, exoplanetsData, anchor, aim}) => {

  var systems = [];
  for (const [key, value] of Object.entries(propertyOwners)) {
    if (value.tags.includes('exoplanet_system')) {
      systems.push("Scene." + value.identifier);
    }
  }

  return {
    popoverVisible: popoverVisible,
    exoplanetSystems: systems,
    luaApi: luaApi,
    systemList: exoplanetsData,
    hasSystems: (exoplanetsData && exoplanetsData.length > 0),
    anchor: anchor,
    aim: aim
  }
};

const mapStateToSubState = (state) => ({
  propertyOwners: state.propertyTree.propertyOwners,
  popoverVisible: state.local.popovers.exoplanets.visible,
  luaApi: state.luaApi,
  exoplanetsData: state.exoplanets.data,
  anchor: state.propertyTree.properties[NavigationAnchorKey],
  aim: state.propertyTree.properties[NavigationAimKey],
});


const mapDispatchToProps = dispatch => ({
  setPopoverVisibility: visible => {
    dispatch(setPopoverVisibility({
      popover: 'exoplanets',
      visible
    }));
  },
  refresh: () => {
    dispatch(reloadPropertyTree());
  },
  removeSystem: (system) => {
    dispatch(removeExoplanets({
      system
    }));
  },
  anchorDispatcher: propertyDispatcher(dispatch, NavigationAnchorKey),
  aimDispatcher: propertyDispatcher(dispatch, NavigationAimKey),  
})

ExoplanetsPanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(ExoplanetsPanel);

export default ExoplanetsPanel;