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
  setPopoverVisibility,
  subscribeToEngineMode,
  subscribeToSessionRecording,
  unsubscribeToEngineMode,
  unsubscribeToSessionRecording,
} from '../../../api/Actions';
import {
  EngineModeCameraPath,
  EngineModeSessionRecordingPlayback,
  EngineModeUserControl,
  NavigationAimKey,
  NavigationAnchorKey,
  RetargetAimKey,
  RetargetAnchorKey,
  ScenePrefixKey,
  SessionStatePaused,
  SessionStatePlaying,
} from '../../../api/keys';
import propertyDispatcher from '../../../api/propertyDispatcher';
import subStateToProps from '../../../utils/subStateToProps';
import {FilterList, FilterListData, FilterListFavorites} from '../../common/FilterList/FilterList';
import Button from '../../common/Input/Button/Button';
import LoadingString from '../../common/LoadingString/LoadingString';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
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

function OriginPicker({ favorites, nodes, engineMode, anchorName, luaApi, sessionRecordingState,
  setPopoverVisibility, popoverVisible, aim, anchor, aimDispatcher, navigationAction, connectFlightController, sendFlightControl,
  retargetAimDispatcher, retargetAnchorDispatcher, anchorDispatcher, startSubscriptions, stopSubscriptions, setNavigationAction, aimName }) {

  React.useEffect(() => {
    startSubscriptions();
    return () => stopSubscriptions();
  }, [startSubscriptions, stopSubscriptions]);

  React.useEffect(() => {
    anchorDispatcher.subscribe();
    return () => anchorDispatcher.unsubscribe();
  }, [anchorDispatcher]);


  React.useEffect(() => {
    aimDispatcher.subscribe();
    return () => aimDispatcher.unsubscribe();
  }, [aimDispatcher]);


  function onSelect(identifier, evt) {
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

    sendFlightControl(updateViewPayload);
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

  function focusPicker() {
    return (
      <div className={styles.Grid}>
        <SvgIcon className={styles.Icon}><Focus /></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={anchor === undefined}>
              {anchorName}
            </LoadingString>
          </span>
          <SmallLabel>Focus</SmallLabel>
        </div>
      </div>
    );
  }

  function anchorAndAimPicker() {
    return (
      <div className={styles.Grid}>
        <SvgIcon className={styles.Icon}><Anchor /></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={anchor === undefined}>
              {anchorName}
            </LoadingString>
          </span>
          <SmallLabel>Anchor</SmallLabel>
        </div>
        <SvgIcon style={{ marginLeft: 10 }} className={styles.Icon}><Aim /></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={anchor === undefined}>
              {aimName}
            </LoadingString>
          </span>
          <SmallLabel>Aim</SmallLabel>
        </div>
      </div>
    );
  }

  function cameraPathPicker() {
    const cancelFlight = () => {
      luaApi.pathnavigation.stopPath();
    };

    return (
      <div
        className={`${styles.Grid} ${styles.cancelButton}`}
        onClick={cancelFlight}
      >
        <MaterialIcon className={styles.Icon} icon="airplanemode_inactive" />
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={anchor === undefined}>
              Cancel
            </LoadingString>
          </span>
          <div>
            <SmallLabel>
              <SvgIcon><Anchor /></SvgIcon>
              {' '}
              <LoadingString loading={anchor === undefined}>
                {anchorName}
              </LoadingString>
            </SmallLabel>
          </div>
        </div>
      </div>
    );
  }

  function pickerContent() {
    if (engineMode === EngineModeCameraPath) {
      return cameraPathPicker();
    }
    return (
      <>{hasDistinctAim() ? anchorAndAimPicker() : focusPicker()}</>
    );
  }

  // OBS same as timepicker
  function pickerStyle() {
    const isSessionRecordingPlaying = (engineMode === EngineModeSessionRecordingPlayback)
      && (sessionRecordingState === SessionStatePlaying);

    const isSessionRecordingPaused = (engineMode === EngineModeSessionRecordingPlayback)
      && (sessionRecordingState === SessionStatePaused);

    const isCameraPathPlaying = (engineMode === EngineModeCameraPath);

    if (isSessionRecordingPaused) { // TODO: add camera path paused check
      return Picker.DisabledOrange;
    }
    if (isCameraPathPlaying) {
      return Picker.Blue;
    }
    if (isSessionRecordingPlaying) {
      return Picker.DisabledBlue;
    }
    return '';
  }

  function popover() {
    const defaultList = favorites.slice();

    // Make sure current anchor is in the default list
    if (anchor !== undefined && !defaultList.find(node => node.identifier === anchor)) {
      const anchorNode = nodes.find(node => node.identifier === anchor);
      if (anchorNode) {
        defaultList.push(anchorNode);
      }
    }

    // Make sure current aim is in the default list
    if (hasDistinctAim() && !defaultList.find(node => node.identifier === aim)) {
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

    const isInFocusMode = navigationAction === NavigationActions.Focus;
    const active = navigationAction === NavigationActions.Aim ? aim : anchor;

    return (
      <Popover
        closeCallback={togglePopover}
        title="Navigation"
        className={Picker.Popover}
        detachable
        attached
      >
        <div>
          <Button
            className={styles.NavigationButton}
            onClick={() => setNavigationAction(NavigationActions.Focus)}
            title="Select focus"
            transparent={navigationAction !== NavigationActions.Focus}
          >
            <SvgIcon className={styles.ButtonIcon}><Focus /></SvgIcon>
          </Button>
          <Button
            className={styles.NavigationButton}
            onClick={() => setNavigationAction(NavigationActions.Anchor)}
            title="Select anchor"
            transparent={navigationAction !== NavigationActions.Anchor}
          >
            <SvgIcon className={styles.ButtonIcon}><Anchor /></SvgIcon>
          </Button>
          <Button
            className={styles.NavigationButton}
            onClick={() => setNavigationAction(NavigationActions.Aim)}
            title="Select aim"
            transparent={navigationAction !== NavigationActions.Aim}
          >
            <SvgIcon className={styles.ButtonIcon}><Aim /></SvgIcon>
          </Button>
        </div>
        <FilterList
          className={styles.list}
          searchText={searchPlaceholder}
          showMoreButton
        >
          <FilterListFavorites>
            {sortedDefaultList.map((entry) => {
              if(isInFocusMode) {
                return <FocusEntryWithNavigation onSelect={onSelect} active={active} {...entry} />;
              }
              else {
                return <FocusEntry onSelect={onSelect} active={active} {...entry}/>
              }
            })}
          </FilterListFavorites>
          <FilterListData>
            {sortedNodes.map((entry) => {
              if(isInFocusMode) {
                return <FocusEntryWithNavigation onSelect={onSelect} active={active} {...entry} />;
              }
              else {
                return <FocusEntry onSelect={onSelect} active={active} {...entry}/>
              }
            })}
          </FilterListData>
        </FilterList>
      </Popover>
    );
  }

  function hasDistinctAim() {
    return (aim !== '') && (aim !== anchor);
  }

  function togglePopover() {
    setPopoverVisibility(!popoverVisible);
    if (!popoverVisible) {
      connectFlightController();
    }
  }

  const enabled = (engineMode === EngineModeUserControl);
  const popoverEnabledAndVisible = popoverVisible && enabled;

  const pickerClasses = [
    styles.originPicker,
    popoverEnabledAndVisible ? Picker.Active : '',
    enabled ? '' : pickerStyle(),
  ].join(' ');

  return (
    <div className={Picker.Wrapper}>
      <Picker refKey={"Origin"} onClick={() => togglePopover()} className={pickerClasses}>
        {pickerContent()}
      </Picker>
      {popoverEnabledAndVisible && popover()}
    </div>
  );
}

const mapSubStateToProps = ({
  engineMode,
  luaApi,
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
  const anchorProp = properties[NavigationAnchorKey];
  const aimProp = properties[NavigationAimKey];

  const anchor = anchorProp && anchorProp.value;
  const aim = aimProp && aimProp.value;

  const anchorNode = propertyOwners[ScenePrefixKey + anchor];
  const aimNode = propertyOwners[ScenePrefixKey + aim];

  const anchorName = anchorNode ? anchorNode.name : anchor;
  const aimName = aimNode ? aimNode.name : aim;

  const popoverVisible = originPickerPopover.visible;

  const mode = engineMode.mode || EngineModeUserControl;

  return {
    nodes,
    anchor,
    aim,
    anchorName,
    aimName,
    engineMode: mode,
    luaApi,
    favorites,
    navigationAction,
    popoverVisible,
    sessionRecordingState,
  };
};

const mapStateToSubState = state => ({
  engineMode: state.engineMode,
  luaApi: state.luaApi,
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
  anchorDispatcher: propertyDispatcher(dispatch, NavigationAnchorKey),
  aimDispatcher: propertyDispatcher(dispatch, NavigationAimKey),
  startSubscriptions: () => {
    dispatch(subscribeToSessionRecording());
    dispatch(subscribeToEngineMode());
  },
  stopSubscriptions: () => {
    dispatch(unsubscribeToSessionRecording());
    dispatch(unsubscribeToEngineMode());
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
  engineMode: PropTypes.string.isRequired,
  favorites: PropTypes.array.isRequired,
  luaApi: PropTypes.object,
  navigationAction: PropTypes.string.isRequired,
  popoverVisible: PropTypes.bool.isRequired,
  sessionRecordingState: PropTypes.string.isRequired,

  // Functions
  connectFlightController: PropTypes.func.isRequired,
  sendFlightControl: PropTypes.func.isRequired,
  setNavigationAction: PropTypes.func.isRequired,
  setPopoverVisibility: PropTypes.func.isRequired,
  startSubscriptions: PropTypes.func.isRequired,
  stopSubscriptions: PropTypes.func.isRequired,

  // Property dispatchers
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
  luaApi: undefined,
};

OriginPicker = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(OriginPicker);

export default OriginPicker;
