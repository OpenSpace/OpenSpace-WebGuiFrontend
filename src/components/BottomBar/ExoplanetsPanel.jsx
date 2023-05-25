import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  loadExoplanetsData,
  reloadPropertyTree,
  removeExoplanets,
  setPopoverVisibility
} from '../../api/Actions';
import { NavigationAimKey, NavigationAnchorKey } from '../../api/keys';
import propertyDispatcher from '../../api/propertyDispatcher';
import subStateToProps from '../../utils/subStateToProps';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import { FilterList, FilterListData } from '../common/FilterList/FilterList';
import Button from '../common/Input/Button/Button';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';
import ScrollOverlay from '../common/ScrollOverlay/ScrollOverlay';
import PropertyOwner from '../Sidebar/Properties/PropertyOwner';

import FocusEntry from './Origin/FocusEntry';
import Picker from './Picker';

import styles from './ExoplanetsPanel.scss';

function ExoplanetsPanel({
  isDataInitialized, loadData, luaApi, setPopoverVisibility, popoverVisible,
  anchor, aim, anchorDispatcher, aimDispatcher, removeSystem, refresh,
  exoplanetSystems, hasSystems, systemList
}) {
  const [starName, setStarName] = React.useState(undefined);

  React.useEffect(() => {
     if (!isDataInitialized) {
      loadData(luaApi);
    }
  }, []);

  function togglePopover() {
    setPopoverVisibility(!popoverVisible);
  }

  function onSelect(identifier) {
    setStarName(identifier);
  }

  function removeExoplanetSystem(systemName) {
    const matchingAnchor = (anchor.value.indexOf(systemName) == 0);
    const matchingAim = (aim.value.indexOf(systemName) == 0);
    if (matchingAnchor || matchingAim) {
      anchorDispatcher.set('Sun');
      aimDispatcher.set('');
    }

    removeSystem(systemName);
  }

  function addSystem() {
    luaApi.exoplanets.addExoplanetSystem(starName);
    // TODO: Once we have a proper way to subscribe to additions and removals
    // of property owners, this 'hard' refresh should be removed.
    setTimeout(() => {
      refresh();
    }, 500);
  }

  function popover() {
    const noContentLabel = <CenteredLabel>No active systems</CenteredLabel>;
    const renderables = exoplanetSystems;
    let panelContent;

    if (renderables.length === 0) {
      panelContent = noContentLabel;
    } else {
      panelContent = renderables.map((prop) => (
        <PropertyOwner
          autoExpand={false}
          key={prop}
          uri={prop}
          trashAction={removeExoplanetSystem}
          expansionIdentifier={`P:${prop}`}
        />
      ));
    }
    return (
      <Popover
        className={Picker.Popover}
        title="Exoplanet Systems"
        closeCallback={togglePopover}
        detachable
        attached
      >
        <div className={Popover.styles.content}>
          <Row>
            { hasSystems ? (
              <FilterList
                className={styles.list}
                searchText="Star name..."
              >
                <FilterListData>
                  {systemList.map((system) => (
                    <FocusEntry
                      onSelect={onSelect}
                      active={starName}
                      {...system}
                    />
                  ))}
                </FilterListData>
              </FilterList>
            ) : (
              <CenteredLabel className={styles.redText}>
                No exoplanet data was loaded
              </CenteredLabel>
            )}
            <div className={Popover.styles.row}>
              <Button
                onClick={addSystem}
                title="Add system"
                style={{ width: 90 }}
                disabled={!starName}
              >
                <MaterialIcon icon="public" />
                <span style={{ marginLeft: 5 }}>Add System</span>
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

  return (
    <div className={Picker.Wrapper}>
      <Picker
        className={`${popoverVisible && Picker.Active}`}
        onClick={togglePopover}
        refKey="Exoplanets"
      >
        <div>
          <MaterialIcon className={styles.photoIcon} icon="hdr_strong" />
        </div>
      </Picker>
      { popoverVisible && popover() }
    </div>
  );
}

const mapSubStateToProps = ({
  propertyOwners,
  popoverVisible,
  luaApi,
  isDataInitialized,
  exoplanetsData,
  anchor,
  aim
}) => {
  // Find already existing systems
  const systems = [];
  for (const [key, value] of Object.entries(propertyOwners)) {
    if (value.tags.includes('exoplanet_system')) {
      systems.push(`Scene.${value.identifier}`);
    }
  }

  return {
    popoverVisible,
    exoplanetSystems: systems,
    isDataInitialized,
    luaApi,
    systemList: exoplanetsData,
    hasSystems: (exoplanetsData && exoplanetsData.length > 0),
    anchor,
    aim
  };
};

const mapStateToSubState = (state) => ({
  propertyOwners: state.propertyTree.propertyOwners,
  popoverVisible: state.local.popovers.exoplanets.visible,
  luaApi: state.luaApi,
  isDataInitialized: state.exoplanets.isInitialized,
  exoplanetsData: state.exoplanets.data,
  anchor: state.propertyTree.properties[NavigationAnchorKey],
  aim: state.propertyTree.properties[NavigationAimKey]
});

const mapDispatchToProps = (dispatch) => ({
  loadData: (luaApi) => {
    dispatch(loadExoplanetsData(luaApi));
  },
  setPopoverVisibility: (visible) => {
    dispatch(setPopoverVisibility({
      popover: 'exoplanets',
      visible
    }));
  },
  refresh: () => {
    dispatch(reloadPropertyTree());
  },
  removeSystem: (system) => {
    dispatch(removeExoplanets({ system }));
  },
  anchorDispatcher: propertyDispatcher(dispatch, NavigationAnchorKey),
  aimDispatcher: propertyDispatcher(dispatch, NavigationAimKey)
});

ExoplanetsPanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(ExoplanetsPanel);

export default ExoplanetsPanel;
