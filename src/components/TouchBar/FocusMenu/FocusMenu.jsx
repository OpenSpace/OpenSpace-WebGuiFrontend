import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setPropertyValue } from '../../../api/Actions';
import propertyDispatcher from '../../../api/propertyDispatcher';
import { UpdateDeltaTimeNow } from '../../../utils/timeHelpers';
import { abortFlight } from '../../../utils/storyHelpers';
import FocusButton from './FocusButton';
import {
  ScenePrefixKey, NavigationAnchorKey, RetargetAnchorKey,
} from '../../../api/keys';
import styles from './FocusMenu.scss';
import OverViewButton from './OverViewButton';

const DISTANCE_FACTOR = 4.0; // target radii
const SWITCH_FOCUS_DURATION = 5.0; // seconds

class FocusMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      origin: '',
    };

    this.applyOverview = this.applyOverview.bind(this);
    this.applyFlyTo = this.applyFlyTo.bind(this);
  }

  componentDidMount() {
    const {
      anchorDispatcher,
      retargetAnchorDispatcher,
    } = this.props;

    anchorDispatcher.subscribe();
    retargetAnchorDispatcher.subscribe();
  }

  componentDidUpdate() {
    const { anchor } = this.props;
    const { origin } = this.state;

    if (anchor !== undefined && origin !== anchor.value) {
      this.setState({ origin: anchor.value });
    }
  }

  componentWillUnmount() {
    const { anchorDispatcher, retargetAnchorDispatcher } = this.props;

    anchorDispatcher.unsubscribe();
    retargetAnchorDispatcher.unsubscribe();
  }

  async onChangeFocus(origin) {
    const { anchorDispatcher, luaApi, retargetAnchorDispatcher } = this.props;

    luaApi.pathnavigation.stopPath();

    // Reset time controls
    luaApi.time.setPause(false);
    UpdateDeltaTimeNow(luaApi, 1);

    anchorDispatcher.set(origin.origin);
    retargetAnchorDispatcher.set(null);
    this.applyFlyTo();
  }

  applyFlyTo() {
    const { luaApi } = this.props;
    luaApi.pathnavigation.zoomToDistanceRelative(DISTANCE_FACTOR, SWITCH_FOCUS_DURATION);
    // TODO: use camera path instead
  }

  applyOverview() {
    const { luaApi, overviewLimit } = this.props;

    // TODO: Handle an interpolation of SetNavigationState to be able to have a
    // smooth navigation to a pre-defined overview location

    luaApi.pathnavigation.zoomToDistance(overviewLimit, SWITCH_FOCUS_DURATION);
  }

  createFocusButtons() {
    const { anchor, focusNodes } = this.props;
    const focusPicker = focusNodes.map((node) => (
      <FocusButton
        key={node.identifier}
        identifier={node.identifier}
        active={anchor.value}
        onChangeFocus={(origin) => this.onChangeFocus({ origin })}
      />
    ));
    return (focusPicker);
  }

  render() {
    const { anchor, focusNodes } = this.props;

    return (
      <div className={styles.FocusMenu}>
        {anchor !== undefined && <OverViewButton onClick={this.applyOverview} /> }
        {focusNodes.length > 0 && this.createFocusButtons()}
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
      focusNodes = buttons.map((button) => state.propertyTree.propertyOwners[ScenePrefixKey + button]);
    }

    anchor = state.propertyTree.properties[NavigationAnchorKey];
  }

  return {
    overviewLimit,
    focusNodes,
    anchor,
    luaApi: state.luaApi,
  };
};

const mapDispatchToProps = (dispatch) => ({
  changePropertyValue: (uri, value) => {
    dispatch(setPropertyValue(uri, value));
  },
  anchorDispatcher: propertyDispatcher(dispatch, NavigationAnchorKey),
  retargetAnchorDispatcher: propertyDispatcher(dispatch, RetargetAnchorKey),
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
