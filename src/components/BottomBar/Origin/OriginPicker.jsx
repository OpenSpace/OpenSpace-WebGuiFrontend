import React, { Component } from 'react';
import { connect } from 'react-redux';

import SmallLabel from '../../common/SmallLabel/SmallLabel';
import LoadingString from '../../common/LoadingString/LoadingString';
import Picker from '../Picker';
import Popover from '../../common/Popover/Popover';
import Button from '../../common/Input/Button/Button';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import FilterList from '../../common/FilterList/FilterList';
import DataManager from '../../../api/DataManager';
import { NavigationAnchorKey, NavigationAimKey, RetargetAnchorKey, RetargetAimKey } from '../../../api/keys';
import FocusEntry from './FocusEntry';

import { setNavigationAction } from '../../../api/Actions';

import styles from './OriginPicker.scss';

import SvgIcon from '../../common/SvgIcon/SvgIcon';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import Anchor from 'svg-react-loader?name=Anchor!../../../icons/anchor.svg';
import Aim from 'svg-react-loader?name=Aim!../../../icons/aim.svg';
import Focus from 'svg-react-loader?name=Focus!../../../icons/focus.svg';

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

    this.state = {
      anchor: '',
      aim: '',
      hasAnchor: false,
      hasAim: false,
      sceneGraphNodes: [],
      showPopover: false,
    };

    this.updateAnchor = this.updateAnchor.bind(this);
    this.updateAim = this.updateAim.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  componentDidMount() {
    DataManager.subscribe(NavigationAnchorKey, this.updateAnchor);
    DataManager.subscribe(NavigationAimKey, this.updateAim);
  }

  componentWillUnmount() {
    DataManager.unsubscribe(NavigationAnchorKey, this.updateAnchor);
    DataManager.unsubscribe(NavigationAimKey, this.updateAim);
  }

  get anchor() {
    return this.state.anchor;
  }

  get aim() {
    return this.state.aim;
  }

  updateAnchor(data) {
    const { Value } = data;
    this.setState({ anchor: Value, hasAnchor: Value !== '' });
  }

  updateAim(data) {
    const { Value } = data;
    this.setState({ aim: Value, hasAim: Value !== '' });
  }

  hasDistinctAim() {
    return (this.state.aim !== '') &&
           (this.state.aim !== this.state.anchor);
  }

  togglePopover() {
    this.setState({ showPopover: !this.state.showPopover });
  }

  get focusPicker() {
    const { hasAnchor } = this.state;
    return (
      <div className={styles.Grid}>
        <SvgIcon className={styles.Icon}><Focus/></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={!hasAnchor}>
              { this.anchor }
            </LoadingString>
          </span>
          <SmallLabel>Focus</SmallLabel>
        </div>
      </div>);
  }

  get anchorAndAimPicker() {
    const { hasAnchor, hasAim } = this.state;
    return (
      <div className={styles.Grid}>
        <SvgIcon className={styles.Icon}><Anchor/></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={!hasAnchor}>
              { this.anchor }
            </LoadingString>
          </span>
          <SmallLabel>Anchor</SmallLabel>
        </div>
        <SvgIcon style={{marginLeft: 10}} className={styles.Icon}><Aim/></SvgIcon>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={!hasAnchor}>
              { this.aim }
            </LoadingString>
          </span>
          <SmallLabel>Aim</SmallLabel>
        </div>
      </div>
      );
  }

  onSelect(identifier, evt) {
    if (this.props.navigationAction === NavigationActions.Focus) {
      DataManager.setValue(NavigationAimKey, '');
      DataManager.setValue(NavigationAnchorKey, identifier);
    } else if (this.props.navigationAction === NavigationActions.Anchor) {
      DataManager.setValue(NavigationAnchorKey, identifier);
    } else if (this.props.navigationAction === NavigationActions.Aim) {
      DataManager.setValue(NavigationAimKey, identifier);
    }
    if (!evt.shiftKey) {
      if (this.props.navigationAction === NavigationActions.Aim) {
        DataManager.trigger(RetargetAimKey);
      } else {
        DataManager.trigger(RetargetAnchorKey);
      }
    }
  };

  render() {
    const { hasAnchor, showPopover } = this.state;
    const { nodes, favorites, setNavigationAction, navigationAction } = this.props;

    const defaultList = favorites.slice();

    // Make sure current anchor is in the default list
    if (hasAnchor &&
        !defaultList.find(node => node.identifier === this.state.anchor))
    {
      defaultList.push(
        nodes.find(node => node.identifier === this.state.anchor)
      );
    }

    // Make sure current aim is in the defualt list
    if (this.hasDistinctAim() &&
        !defaultList.find(node => node.identifier === this.state.aim))
    {
      defaultList.push(
        nodes.find(node => node.identifier === this.state.aim)
      );
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
        <Picker onClick={this.togglePopover} className={(showPopover ? Picker.Active : '')}>
          {this.hasDistinctAim() ? this.anchorAndAimPicker : this.focusPicker }
        </Picker>
        { showPopover && (
          <Popover closeCallback={this.togglePopover} title="Navigation" className={Picker.Popover}>
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

const mapStateToProps = (state) => {
  const sceneType = 'Scene';
  let nodes = [];
  let favorites = [];
  if (Object.keys(state.propertyTree).length !== 0) {
    const rootNodes = state.propertyTree.subowners.filter(
      element => element.identifier === sceneType
    );
    rootNodes.forEach((node) => {
      nodes = [...nodes, ...node.subowners];
    });
    favorites = nodes.filter(node => node.tag.some(tag => tag.includes(REQUIRED_TAG)))
      .map(node => Object.assign(node, { key: node.identifier }));
  }

  const navigationAction = state.local.navigationAction;

  return {
    nodes,
    favorites,
    navigationAction
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setNavigationAction: (action) => {
      dispatch(setNavigationAction(action))
    }
  }
}

OriginPicker = connect(
  mapStateToProps,
  mapDispatchToProps
)(OriginPicker);

export default OriginPicker;
