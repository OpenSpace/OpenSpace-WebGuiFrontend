import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import FocusButton from './FocusButton';
import {
  ScenePrefixKey,
  NavigationAnchorKey,
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
    this.props.startListening(NavigationAnchorKey);
  }

  componentWillUnmount() {
    this.props.stopListening(NavigationAnchorKey);
  }

  onChangeFocus(origin) {
    this.props.luaApi.time.setPause(false);
    UpdateDeltaTimeNow(this.props.luaApi, 1);
    this.props.changePropertyValue(NavigationAnchorKey, origin.origin);
    this.applyFlyTo();
    
    this.props.luaApi.globebrowsing.goToGeo(
      globeBrowsingLocationDefaultLatLon[0],
      globeBrowsingLocationDefaultLatLon[1]
    );
  }

  applyFlyTo() {
    this.props.changePropertyValue(FlightDestinationDistanceKey, 200000000)
    this.props.changePropertyValue(ApplyFlyToKey, true);
  }

  applyOverview() {
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
  startListening: (uri) => {
    dispatch(subscribeToProperty(uri));
  },
  stopListening: (uri) => {
    dispatch(unsubscribeToProperty(uri));
  },
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
  startListening: PropTypes.func,
  stopListening: PropTypes.func,
};

FocusMenu.defaultProps = {
  focusNodes: [],
  properties: [],
  subowners: [],
  changePropertyValue: null,
  stopListening: null,
  startListening: null,
};

export default FocusMenu;
