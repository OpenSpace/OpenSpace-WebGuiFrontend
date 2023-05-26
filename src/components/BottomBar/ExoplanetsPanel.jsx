import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

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

class ExoplanetsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      starName: undefined
    };
    this.togglePopover = this.togglePopover.bind(this);
    this.addSystem = this.addSystem.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.removeExoplanetSystem = this.removeExoplanetSystem.bind(this);
  }

  componentDidMount() {
    const { isDataInitialized, loadData, luaApi } = this.props;
    if (!isDataInitialized) {
      loadData(luaApi);
    }
  }

  onSelect(identifier) {
    this.setState({ starName: identifier });
  }

  get popover() {
    const { hasSystems, systemList } = this.props;
    const noContentLabel = <CenteredLabel>No active systems</CenteredLabel>;
    const renderables = this.props.exoplanetSystems;
    let panelContent;

    if (renderables.length === 0) {
      panelContent = noContentLabel;
    } else {
      panelContent = renderables.map((prop) => (
        <PropertyOwner
          autoExpand={false}
          key={prop}
          uri={prop}
          trashAction={this.removeExoplanetSystem}
          expansionIdentifier={`P:${prop}`}
        />
      ));
    }

    return (
      <Popover
        className={Picker.Popover}
        title="Exoplanet Systems"
        closeCallback={this.togglePopover}
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
                      key={system.identifier}
                      onSelect={this.onSelect}
                      active={this.state.starName}
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
                onClick={this.addSystem}
                title="Add system"
                style={{ width: 90 }}
                disabled={!this.state.starName}
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

  togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible);
  }

  removeExoplanetSystem(systemName) {
    const matchingAnchor = (this.props.anchor.value.indexOf(systemName) === 0);
    const matchingAim = (this.props.aim.value.indexOf(systemName) === 0);
    if (matchingAnchor || matchingAim) {
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

  render() {
    const { popoverVisible } = this.props;

    return (
      <div className={Picker.Wrapper}>
        <Picker
          className={`${popoverVisible && Picker.Active}`}
          onClick={this.togglePopover}
          refKey="Exoplanets"
        >
          <div>
            <MaterialIcon className={styles.photoIcon} icon="hdr_strong" />
          </div>
        </Picker>
        { popoverVisible && this.popover }
      </div>
    );
  }
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
  Object.values(propertyOwners).forEach((value) => {
    if (value.tags.includes('exoplanet_system')) {
      systems.push(`Scene.${value.identifier}`);
    }
  });

  return {
    popoverVisible,
    exoplanetSystems: systems,
    isDataInitialized,
    luaApi,
    systemList: exoplanetsData.length > 0 ? exoplanetsData : [],
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

ExoplanetsPanel.propTypes = {
  anchor: PropTypes.object.isRequired, // property object
  anchorDispatcher: PropTypes.object.isRequired,
  aim: PropTypes.object.isRequired, // property object
  aimDispatcher: PropTypes.object.isRequired,
  exoplanetSystems: PropTypes.array.isRequired,
  hasSystems: PropTypes.bool.isRequired,
  isDataInitialized: PropTypes.bool.isRequired,
  loadData: PropTypes.func.isRequired,
  luaApi: PropTypes.object.isRequired,
  popoverVisible: PropTypes.bool.isRequired,
  refresh: PropTypes.func.isRequired,
  removeSystem: PropTypes.func.isRequired,
  setPopoverVisibility: PropTypes.func.isRequired,
  systemList: PropTypes.array.isRequired
};

ExoplanetsPanel.defaultProps = {};

ExoplanetsPanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(ExoplanetsPanel);

export default ExoplanetsPanel;
