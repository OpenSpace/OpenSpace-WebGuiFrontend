import React, { Component } from 'react';
import { connect } from 'react-redux';

import SmallLabel from '../../common/SmallLabel/SmallLabel';
import LoadingString from '../../common/LoadingString/LoadingString';
import Picker from '../Picker';
import Popover from '../../common/Popover/Popover';
import Button from '../../common/Input/Button/Button';
import FilterList from '../../common/FilterList/FilterList';
import {
  NavigationAnchorKey,
  NavigationAimKey,
  RetargetAnchorKey,
  RetargetAimKey,
  ScenePrefixKey
} from '../../../api/keys';
import FocusEntry from './FocusEntry';

import {
  setNavigationAction, 
  setOriginPickerShowFavorites,
  setPopoverVisibility
} from '../../../api/Actions';

import styles from './OriginPicker.scss';

import SvgIcon from '../../common/SvgIcon/SvgIcon';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import Anchor from 'svg-react-loader?name=Anchor!../../../icons/anchor.svg';
import Aim from 'svg-react-loader?name=Aim!../../../icons/aim.svg';
import Focus from 'svg-react-loader?name=Focus!../../../icons/focus.svg';

import propertyDispatcher from '../../../api/propertyDispatcher';
import subStateToProps from '../../../utils/subStateToProps';


// tag that each focusable node must have
const REQUIRED_TAG = 'GUI.Interesting';

const NavigationActions = {
  Focus: 'Focus',
  Anchor: 'Anchor',
  Aim: 'Aim'
};

class OriginPicker extends Component {
  constructor(props) {
    super(props);
    this.togglePopover = this.togglePopover.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  componentDidMount() {
    this.props.anchorDispatcher.subscribe();
    this.props.aimDispatcher.subscribe();
  }

  componentWillUnmount() {
    this.props.anchorDispatcher.unsubscribe();
    this.props.aimDispatcher.unsubscribe();
  }

  get anchor() {
    return this.props.anchor;
  }

  get aim() {
    return this.props.aim;
  }

  hasDistinctAim() {
    return (this.props.aim !== '') &&
           (this.props.aim !== this.props.anchor);
  }

  togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible)
  }

  get focusPicker() {
    return (
      <div className={styles.Grid}>
        <SvgIcon className={styles.Icon}><Focus/></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={this.props.anchor === undefined}>
              { this.props.anchorName }
            </LoadingString>
          </span>
          <SmallLabel>Focus</SmallLabel>
        </div>
      </div>);
  }

  get anchorAndAimPicker() {
    return (
      <div className={styles.Grid}>
        <SvgIcon className={styles.Icon}><Anchor/></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={this.props.anchor === undefined}>
              { this.props.anchorName }
            </LoadingString>
          </span>
          <SmallLabel>Anchor</SmallLabel>
        </div>
        <SvgIcon style={{marginLeft: 10}} className={styles.Icon}><Aim/></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={this.props.anchor === undefined}>
              { this.props.aimName }
            </LoadingString>
          </span>
          <SmallLabel>Aim</SmallLabel>
        </div>
      </div>
      );
  }

  onSelect(identifier, evt) {
    if (this.props.navigationAction === NavigationActions.Focus) {
      this.props.aimDispatcher.set('');
      this.props.anchorDispatcher.set(identifier);
    } else if (this.props.navigationAction === NavigationActions.Anchor) {
      if (this.props.aim === '') {
        this.props.aimDispatcher.set(this.props.anchor);
      }
      this.props.anchorDispatcher.set(identifier);
    } else if (this.props.navigationAction === NavigationActions.Aim) {
      this.props.aimDispatcher.set(identifier);
    }
    if (!evt.shiftKey) {
      if (this.props.navigationAction === NavigationActions.Aim) {
        this.props.retargetAimDispatcher.set(null);
      } else {
        this.props.retargetAnchorDispatcher.set(null);
      }
    }
  };

  render() {
    const {
      nodes,
      favorites,
      showFavorites,
      setShowFavorites,
      setNavigationAction,
      navigationAction,
      popoverVisible
    } = this.props;

    const defaultList = favorites.slice();

    // Make sure current anchor is in the default list
    if (this.props.anchor !== undefined &&
        !defaultList.find(node => node.identifier === this.props.anchor))
    {
      const anchorNode = nodes.find(node => node.identifier === this.props.anchor);
      if (anchorNode) {
        defaultList.push(anchorNode);
      }
    }

    // Make sure current aim is in the defualt list
    if (this.hasDistinctAim() &&
        !defaultList.find(node => node.identifier === this.props.aim))
    {
      const aimNode = nodes.find(node => node.identifier === this.props.aim);
      if (aimNode) {
        defaultList.push(aimNode);
      }
    }

    const searchPlaceholder = {
      Focus: "Search for a new focus...",
      Anchor: "Search for a new anchor...",
      Aim: "Search for a new aim...",
    }[navigationAction];

    const setNavigationActionToFocus = () => { setNavigationAction(NavigationActions.Focus); };
    const setNavigationActionToAnchor = () => { setNavigationAction(NavigationActions.Anchor); };
    const setNavigationActionToAim = () => { setNavigationAction(NavigationActions.Aim); };

    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover} className={(popoverVisible ? Picker.Active : '')}>
          {this.hasDistinctAim() ? this.anchorAndAimPicker : this.focusPicker }
        </Picker>
        { popoverVisible && (
          <Popover closeCallback={this.togglePopover} title="Navigation" className={Picker.Popover} attached={true}>
            <div>
              <Button className={styles.NavigationButton}
                      onClick={setNavigationActionToFocus}
                      title="Select focus"
                      transparent={this.props.navigationAction !== NavigationActions.Focus}>
                <SvgIcon className={styles.ButtonIcon}><Focus/></SvgIcon>
              </Button>
              <Button className={styles.NavigationButton}
                      onClick={setNavigationActionToAnchor}
                      title="Select anchor"
                      transparent={this.props.navigationAction !== NavigationActions.Anchor}>
                <SvgIcon className={styles.ButtonIcon}><Anchor/></SvgIcon>
              </Button>
              <Button className={styles.NavigationButton}
                      onClick={setNavigationActionToAim}
                      title="Select aim"
                      transparent={this.props.navigationAction !== NavigationActions.Aim}>
                <SvgIcon className={styles.ButtonIcon}><Aim/></SvgIcon>
              </Button>
            </div>
            <FilterList
              data={nodes}
              favorites={defaultList}
              showFavorites={showFavorites}
              setShowFavorites={setShowFavorites}
              className={styles.list}
              searchText={searchPlaceholder}
              viewComponent={FocusEntry}
              onSelect={this.onSelect}
              active={this.props.navigationAction === NavigationActions.Aim ? this.aim : this.anchor}
              searchAutoFocus
            />
          </Popover>
        )}
      </div>
    );
  }
}

const mapSubStateToProps = ({properties, propertyOwners, originPicker, originPickerPopover}) => {
  const scene = propertyOwners.Scene;
  const uris = scene ? scene.subowners : [];
  
  const nodes = uris.map(uri => ({
    ...propertyOwners[uri],
    key: uri
  }));

  const favorites = uris.filter(uri =>
    propertyOwners[uri].tags.some(tag =>
      tag.includes(REQUIRED_TAG)
    )
  ).map(uri => ({
    ...propertyOwners[uri],
    key: uri
  }));

  const navigationAction = originPicker.action;
  const showFavorites = originPicker.showFavorites;
  const anchorProp = properties[NavigationAnchorKey];
  const aimProp = properties[NavigationAimKey];

  const anchor = anchorProp && anchorProp.value;
  const aim = aimProp && aimProp.value;

  const anchorNode = propertyOwners[ScenePrefixKey + anchor];
  const aimNode = propertyOwners[ScenePrefixKey + aim];

  const anchorName = anchorNode ? anchorNode.name : anchor;
  let aimName = aimNode ? aimNode.name : aim;

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
  };
};

const mapStateToSubState = (state) => ({
  propertyOwners: state.propertyTree.propertyOwners,
  properties: state.propertyTree.properties,
  originPicker: state.local.originPicker,
  originPickerPopover: state.local.popovers.originPicker
});

const mapDispatchToProps = (dispatch) => {
  return {
    setNavigationAction: action => {
      dispatch(setNavigationAction(action))
    },
    setShowFavorites: action => {
      dispatch(setOriginPickerShowFavorites(action))
    },
    anchorDispatcher: propertyDispatcher(dispatch, NavigationAnchorKey),
    aimDispatcher: propertyDispatcher(dispatch, NavigationAimKey),
    retargetAnchorDispatcher: propertyDispatcher(dispatch, RetargetAnchorKey),
    retargetAimDispatcher: propertyDispatcher(dispatch, RetargetAimKey),
    setPopoverVisibility: (visible) => {
      dispatch(setPopoverVisibility({
        popover: 'originPicker',
        visible
      }));
    },
  }
}


OriginPicker = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(OriginPicker);

export default OriginPicker;
