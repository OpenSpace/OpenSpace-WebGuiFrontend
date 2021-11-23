import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import FocusButton from './FocusButton';
import {
  ScenePrefixKey,
  ValuePlaceholder,
  NavigationAnchorKey,
  RetargetAnchorKey,
  ApplyFlyToKey,
  FlightDestinationDistanceKey,
  globeBrowsingLocationDefaultLatLon
} from '../../../api/keys';
import {
  setPropertyValue,
  subscribeToProperty,
  unsubscribeToProperty
} from '../../../api/Actions';
import styles from './FocusMenu.scss';
import OverViewButton from './OverViewButton';
import { UpdateDeltaTimeNow } from '../../../utils/timeHelpers';
import propertyDispatcher from '../../../api/propertyDispatcher';

const DISTANCE_FACTOR = 4.0;

class FocusMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      origin: '',
    };

    this.applyOverview = this.applyOverview.bind(this);
    this.applyFlyTo = this.applyFlyTo.bind(this);
  }

  componentDidUpdate() {
    if (this.props.anchor !== undefined) {
      if (this.state.origin !== this.props.anchor.value) {
        this.setState({ origin: this.props.anchor.value });
      }
    }
  }

  componentDidMount() {
    this.props.anchorDispatcher.subscribe();
    this.props.retargetAnchorDispatcher.subscribe();
    this.props.flightDestinationDispatcher.subscribe();
  }

  componentWillUnmount() {
    this.props.anchorDispatcher.unsubscribe();
    this.props.retargetAnchorDispatcher.unsubscribe();
    this.props.flightDestinationDispatcher.unsubscribe();
  }

  onChangeFocus(origin) {
    this.props.luaApi.time.setPause(false);
    UpdateDeltaTimeNow(this.props.luaApi, 1);
    this.props.anchorDispatcher.set(origin.origin);
    this.props.retargetAnchorDispatcher.set(null);
    this.applyFlyTo(origin.origin);
  }

  async applyFlyTo(flyToNode) {
    const radius = await this.props.luaApi.boundingSphere(flyToNode);
    // Little ugly, but the [1] is needed since we use the version of the Lua API 
    // that returns an object instead of a single value
    const distance = radius[1] * DISTANCE_FACTOR; 

    this.props.changePropertyValue(FlightDestinationDistanceKey, distance);
    this.props.changePropertyValue(ApplyFlyToKey, true);
    // TODO: use camera paths instead
  }

  applyOverview() {
    // TODO: Handle an interpolation of SetNavigationState to be able to have a
    // smooth navigation to a pre-defined overview location
    this.props.changePropertyValue(FlightDestinationDistanceKey, this.props.overviewLimit);
    this.props.changePropertyValue(ApplyFlyToKey, true);
  }

  createFocusButtons() {
    const { focusNodes } = this.props;
    const focusPicker = focusNodes
      .map(node =>
        (<FocusButton
          key={node.identifier}
          identifier={node.identifier}
          active={this.props.anchor.value}
          onChangeFocus={origin => this.onChangeFocus({ origin })}
        />));
    return (focusPicker);
  }

  render() {
    return (
      <div className={styles.FocusMenu}>
        {this.props.anchor !== undefined &&
          <OverViewButton onClick={this.applyOverview} />
        }
        {this.props.focusNodes.length > 0 && this.createFocusButtons()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let anchor = [];
  let focusNodes = [];

  const overviewLimit = state.storyTree.story.overviewlimit;

  if (Object.keys(state.propertyTree).length !== 0) {
    const buttons = state.storyTree.story.focusbuttons;
    if (buttons) {
      focusNodes = buttons.map(button => 
        state.propertyTree.propertyOwners[ScenePrefixKey + button]
      );
    }

    anchor = state.propertyTree.properties[NavigationAnchorKey];
  }

  return {
    overviewLimit,
    focusNodes,
    anchor,
    luaApi: state.luaApi
  };
};

const mapDispatchToProps = dispatch => ({
  changePropertyValue: (uri, value) => {
    dispatch(setPropertyValue(uri, value));
  },
  flightDestinationDispatcher: propertyDispatcher(
    dispatch, FlightDestinationDistanceKey),
  anchorDispatcher: propertyDispatcher(
    dispatch, NavigationAnchorKey),
  retargetAnchorDispatcher: propertyDispatcher(
    dispatch, RetargetAnchorKey)
});

FocusMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FocusMenu);

FocusMenu.defaultProps = {
  focusNodes: [],
  properties: [],
  changePropertyValue: null,
};

export default FocusMenu;
