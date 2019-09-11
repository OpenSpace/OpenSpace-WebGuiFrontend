import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import FocusButton from './FocusButton';
import {
  ScenePrefixKey,
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
  }

  componentWillUnmount() {
    this.props.anchorDispatcher.unsubscribe();
    this.props.retargetAnchorDispatcher.unsubscribe();
  }

  onChangeFocus(origin) {
    this.props.luaApi.time.setPause(false);
    UpdateDeltaTimeNow(this.props.luaApi, 1);
    this.props.anchorDispatcher.set(origin.origin);
    this.props.retargetAnchorDispatcher.set(null);
    this.applyFlyTo();
  }

  applyFlyTo() {
    // TODO: Handle the individual flight distances for each node
    // Both by user overriding in json, and getting an automatic
    let myFlightDistance = 200000000;
    this.props.changePropertyValue(FlightDestinationDistanceKey, myFlightDistance)
    this.props.changePropertyValue(ApplyFlyToKey, true);
  }

  applyOverview() {
    this.props.luaApi.globebrowsing.goToGeo(
      globeBrowsingLocationDefaultLatLon[0],
      globeBrowsingLocationDefaultLatLon[0]
    );

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
  anchorDispatcher: propertyDispatcher(
    dispatch, NavigationAnchorKey),
  retargetAnchorDispatcher: propertyDispatcher(
    dispatch, RetargetAnchorKey)
});

FocusMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FocusMenu);

FocusMenu.propTypes = {
  focusNodes: PropTypes.arrayOf(PropTypes.shape({
    identifier: PropTypes.string,
    description: PropTypes.string,
    properties: PropTypes.arrayOf(PropTypes.object),
    subowners: PropTypes.arrayOf(PropTypes.object),
  })),
  anchor: PropTypes.string,
  changePropertyValue: PropTypes.func,
};

FocusMenu.defaultProps = {
  focusNodes: [],
  properties: [],
  subowners: [],
  changePropertyValue: null,
};

export default FocusMenu;
