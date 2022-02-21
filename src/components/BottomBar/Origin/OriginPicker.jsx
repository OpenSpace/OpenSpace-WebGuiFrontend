import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Aim from 'svg-react-loader?name=Aim!../../../icons/aim.svg';
import Anchor from 'svg-react-loader?name=Anchor!../../../icons/anchor.svg';
import Focus from 'svg-react-loader?name=Focus!../../../icons/focus.svg';
import {
  connectFlightController,
  sendFlightControl,
  setNavigationAction,
  setOriginPickerShowFavorites,
  setPopoverVisibility,
  subscribeToSessionRecording,
  unsubscribeToSessionRecording,
} from '../../../api/Actions';
import {
  NavigationAimKey,
  NavigationAnchorKey,
  RetargetAimKey,
  RetargetAnchorKey,
  ScenePrefixKey,
  sessionStatePaused,
  sessionStatePlaying,
} from '../../../api/keys';
import propertyDispatcher from '../../../api/propertyDispatcher';
import subStateToProps from '../../../utils/subStateToProps';
import FilterList from '../../common/FilterList/FilterList';
import Button from '../../common/Input/Button/Button';
import LoadingString from '../../common/LoadingString/LoadingString';
import Popover from '../../common/Popover/Popover';
import SmallLabel from '../../common/SmallLabel/SmallLabel';
import SvgIcon from '../../common/SvgIcon/SvgIcon';
import Picker from '../Picker';
import FocusEntry from './FocusEntry';
import FocusEntryWithNavigation from './FocusEntryWithNavigation';
import styles from './OriginPicker.scss';

// tag that each focusable node must have
const REQUIRED_TAG = 'GUI.Interesting';

const NavigationActions = {
  Focus: 'Focus',
  Anchor: 'Anchor',
  Aim: 'Aim',
};

class OriginPicker extends Component {
  constructor(props) {
    super(props);
    this.hasDistinctAim = this.hasDistinctAim.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  componentDidMount() {
    const { aimDispatcher, anchorDispatcher, startSessionRecordingSubscription } = this.props;
    anchorDispatcher.subscribe();
    aimDispatcher.subscribe();
    startSessionRecordingSubscription();
  }

  componentWillUnmount() {
    const { aimDispatcher, anchorDispatcher, stopSessionRecordingSubscription } = this.props;
    anchorDispatcher.unsubscribe();
    aimDispatcher.unsubscribe();
    stopSessionRecordingSubscription();
  }

  onSelect(identifier, evt) {
    const {
      aim, anchor, anchorDispatcher, aimDispatcher, navigationAction, retargetAimDispatcher,
      retargetAnchorDispatcher,
    } = this.props;
    const updateViewPayload = {
      type: 'updateView',
      focus: '',
      aim: '',
      anchor: '',
    };

    if (navigationAction === NavigationActions.Focus) {
      updateViewPayload.aim = '';
      updateViewPayload.focus = identifier;
      updateViewPayload.anchor = '';
    } else if (navigationAction === NavigationActions.Anchor) {
      if (aim === '') {
        updateViewPayload.aim = anchor;
      }
      updateViewPayload.anchor = identifier;
    } else if (navigationAction === NavigationActions.Aim) {
      updateViewPayload.aim = identifier;
      updateViewPayload.anchor = anchor;
    }

    if (!evt.shiftKey) {
      if (navigationAction === NavigationActions.Aim) {
        retargetAimDispatcher.set(null);
      } else {
        retargetAnchorDispatcher.set(null);
      }
    }

    const shouldRetargetAim = !evt.shiftKey && updateViewPayload.aim != null;
    const shouldRetargetAnchor = !evt.shiftKey && updateViewPayload.aim == null;

    updateViewPayload.retargetAim = shouldRetargetAim;
    updateViewPayload.retargetAnchor = shouldRetargetAnchor;
    updateViewPayload.resetVelocities = !evt.ctrlKey;

    this.props.sendFlightControl(updateViewPayload);
    if (updateViewPayload.aim) {
      anchorDispatcher.set(updateViewPayload.anchor);
      aimDispatcher.set(updateViewPayload.aim);
    } else if (updateViewPayload.anchor !== '') {
      anchorDispatcher.set(updateViewPayload.anchor);
    } else {
      anchorDispatcher.set(updateViewPayload.focus);
      aimDispatcher.set(updateViewPayload.aim);
    }
  }

  get focusPicker() {
    const { anchor, anchorName } = this.props;
    return (
      <div className={styles.Grid}>
        <SvgIcon className={styles.Icon}><Focus /></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={anchor === undefined}>
              { anchorName }
            </LoadingString>
          </span>
          <SmallLabel>Focus</SmallLabel>
        </div>
      </div>
    );
  }

  get anchorAndAimPicker() {
    const { anchor, anchorName, aimName } = this.props;
    return (
      <div className={styles.Grid}>
        <SvgIcon className={styles.Icon}><Anchor /></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={anchor === undefined}>
              { anchorName }
            </LoadingString>
          </span>
          <SmallLabel>Anchor</SmallLabel>
        </div>
        <SvgIcon style={{ marginLeft: 10 }} className={styles.Icon}><Aim /></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={anchor === undefined}>
              { aimName }
            </LoadingString>
          </span>
          <SmallLabel>Aim</SmallLabel>
        </div>
      </div>
    );
  }

  hasDistinctAim() {
    const { aim, anchor } = this.props;
    return (aim !== '') && (aim !== anchor);
  }

  togglePopover() {
    const { popoverVisible } = this.props;
    this.props.setPopoverVisibility(!popoverVisible);
    if (!popoverVisible) {
      this.props.connectFlightController();
    }
  }

  render() {
    const {
      anchor,
      aim,
      nodes,
      favorites,
      showFavorites,
      setShowFavorites,
      navigationAction,
      popoverVisible,
      sessionRecordingState,
    } = this.props;

    const defaultList = favorites.slice();

    // Make sure current anchor is in the default list
    if (anchor !== undefined && !defaultList.find(node => node.identifier === anchor)) {
      const anchorNode = nodes.find(node => node.identifier === anchor);
      if (anchorNode) {
        defaultList.push(anchorNode);
      }
    }

    // Make sure current aim is in the defualt list
    if (this.hasDistinctAim() && !defaultList.find(node => node.identifier === aim)) {
      const aimNode = nodes.find(node => node.identifier === aim);
      if (aimNode) {
        defaultList.push(aimNode);
      }
    }

    const sortedDefaultList = defaultList.slice(0).sort((a, b) => a.name.localeCompare(b.name));
    const filteredNodes = nodes.filter((node) => {
      const hasHiddenProp = node.properties.indexOf(`${node.key}.GuiHidden`) > -1;
      return !hasHiddenProp;
    });
    const sortedNodes = filteredNodes.slice(0).sort((a, b) => a.name.localeCompare(b.name));

    const searchPlaceholder = {
      Focus: 'Search for a new focus...',
      Anchor: 'Search for a new anchor...',
      Aim: 'Search for a new aim...',
    }[navigationAction];

    const setNavigationActionToFocus = () => { this.props.setNavigationAction(NavigationActions.Focus); };
    const setNavigationActionToAnchor = () => { this.props.setNavigationAction(NavigationActions.Anchor); };
    const setNavigationActionToAim = () => { this.props.setNavigationAction(NavigationActions.Aim); };

    const enabled = (sessionRecordingState !== sessionStatePlaying)
      && (sessionRecordingState !== sessionStatePaused);
    const disableClass = (sessionRecordingState === sessionStatePaused)
      ? styles.disabledBySessionPause : styles.disabledBySessionPlayback;

    const popoverEnabledAndVisible = popoverVisible && enabled;

    const pickerClasses = [
      styles.originPicker,
      popoverEnabledAndVisible ? Picker.Active : '',
      enabled ? '' : disableClass,
    ].join(' ');

    const isInFocusMode = navigationAction === NavigationActions.Focus;

    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover} className={pickerClasses}>
          {this.hasDistinctAim() ? this.anchorAndAimPicker : this.focusPicker }
        </Picker>
        { popoverEnabledAndVisible && (
          <Popover
            closeCallback={enabled && this.togglePopover}
            title="Navigation"
            className={Picker.Popover}
            detachable
            attached
          >
            <div>
              <Button
                className={styles.NavigationButton}
                onClick={setNavigationActionToFocus}
                title="Select focus"
                transparent={navigationAction !== NavigationActions.Focus}
              >
                <SvgIcon className={styles.ButtonIcon}><Focus /></SvgIcon>
              </Button>
              <Button
                className={styles.NavigationButton}
                onClick={setNavigationActionToAnchor}
                title="Select anchor"
                transparent={navigationAction !== NavigationActions.Anchor}
              >
                <SvgIcon className={styles.ButtonIcon}><Anchor /></SvgIcon>
              </Button>
              <Button
                className={styles.NavigationButton}
                onClick={setNavigationActionToAim}
                title="Select aim"
                transparent={navigationAction !== NavigationActions.Aim}
              >
                <SvgIcon className={styles.ButtonIcon}><Aim /></SvgIcon>
              </Button>
            </div>
            <FilterList
              data={sortedNodes}
              favorites={sortedDefaultList}
              showFavorites={showFavorites}
              setShowFavorites={setShowFavorites}
              className={styles.list}
              searchText={searchPlaceholder}
              viewComponent={isInFocusMode ? FocusEntryWithNavigation : FocusEntry}
              onSelect={this.onSelect}
              active={navigationAction === NavigationActions.Aim ? aim : anchor}
              searchAutoFocus
            />
          </Popover>
        )}
      </div>
    );
  }
}

const mapSubStateToProps = ({
  properties,
  propertyOwners,
  originPicker,
  originPickerPopover,
  sessionRecordingState,
}) => {
  const scene = propertyOwners.Scene;
  const uris = scene ? scene.subowners : [];

  const nodes = uris.map(uri => ({
    ...propertyOwners[uri],
    key: uri,
  }));

  const favorites = uris.filter(uri => propertyOwners[uri].tags.some(tag => tag.includes(REQUIRED_TAG))).map(uri => ({
    ...propertyOwners[uri],
    key: uri,
  }));

  const navigationAction = originPicker.action;
  const { showFavorites } = originPicker;
  const anchorProp = properties[NavigationAnchorKey];
  const aimProp = properties[NavigationAimKey];

  const anchor = anchorProp && anchorProp.value;
  const aim = aimProp && aimProp.value;

  const anchorNode = propertyOwners[ScenePrefixKey + anchor];
  const aimNode = propertyOwners[ScenePrefixKey + aim];

  const anchorName = anchorNode ? anchorNode.name : anchor;
  const aimName = aimNode ? aimNode.name : aim;

  const popoverVisible = originPickerPopover.visible;

  return {
    nodes,
    anchor,
    aim,
    anchorName,
    aimName,
    favorites,
    showFavorites,
    navigationAction,
    popoverVisible,
    sessionRecordingState,
  };
};

const mapStateToSubState = state => ({
  propertyOwners: state.propertyTree.propertyOwners,
  properties: state.propertyTree.properties,
  originPicker: state.local.originPicker,
  originPickerPopover: state.local.popovers.originPicker,
  sessionRecordingState: state.sessionRecording.recordingState,
});

const mapDispatchToProps = dispatch => ({
  setNavigationAction: (action) => {
    dispatch(setNavigationAction(action));
  },
  setShowFavorites: (action) => {
    dispatch(setOriginPickerShowFavorites(action));
  },
  anchorDispatcher: propertyDispatcher(dispatch, NavigationAnchorKey),
  aimDispatcher: propertyDispatcher(dispatch, NavigationAimKey),
  startSessionRecordingSubscription: () => {
    dispatch(subscribeToSessionRecording());
  },
  stopSessionRecordingSubscription: () => {
    dispatch(unsubscribeToSessionRecording());
  },
  retargetAnchorDispatcher: propertyDispatcher(dispatch, RetargetAnchorKey),
  retargetAimDispatcher: propertyDispatcher(dispatch, RetargetAimKey),
  setPopoverVisibility: (visible) => {
    dispatch(setPopoverVisibility({
      popover: 'originPicker',
      visible,
    }));
  },
  connectFlightController: () => {
    dispatch(connectFlightController());
  },
  sendFlightControl: (payload) => {
    dispatch(sendFlightControl(payload));
  },
});

OriginPicker.propTypes = {
  nodes: PropTypes.array.isRequired,
  anchor: PropTypes.string,
  aim: PropTypes.string,
  anchorName: PropTypes.string,
  aimName: PropTypes.string,
  favorites: PropTypes.array.isRequired,
  showFavorites: PropTypes.bool.isRequired,
  navigationAction: PropTypes.string.isRequired,
  popoverVisible: PropTypes.bool.isRequired,
  sessionRecordingState: PropTypes.string.isRequired,

  // Functions
  connectFlightController: PropTypes.func.isRequired,
  sendFlightControl: PropTypes.func.isRequired,
  setNavigationAction: PropTypes.func.isRequired,
  setPopoverVisibility: PropTypes.func.isRequired,
  setShowFavorites: PropTypes.func.isRequired,
  startSessionRecordingSubscription: PropTypes.func.isRequired,
  stopSessionRecordingSubscription: PropTypes.func.isRequired,

  // Dispatchers
  anchorDispatcher: PropTypes.object.isRequired,
  aimDispatcher: PropTypes.object.isRequired,
  retargetAimDispatcher: PropTypes.object.isRequired,
  retargetAnchorDispatcher: PropTypes.object.isRequired,
};

OriginPicker.defaultProps = {
  anchor: undefined,
  aim: undefined,
  anchorName: undefined,
  aimName: undefined,
};

OriginPicker = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(OriginPicker);

export default OriginPicker;
