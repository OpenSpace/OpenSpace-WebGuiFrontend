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

import { setReAim } from '../../../api/Actions';

import styles from './OriginPicker.scss';

import SvgIcon from '../../common/SvgIcon/SvgIcon';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import Anchor from 'svg-react-loader?name=Anchor!../../../icons/anchor.svg';
import Aim from 'svg-react-loader?name=Aim!../../../icons/aim.svg';
import Focus from 'svg-react-loader?name=Focus!../../../icons/focus.svg';

// tag that each focusable node must have
const REQUIRED_TAG = 'GUI.Interesting';

const SelectionModes = {
  Focus: 'Focus',
  Anchor: 'Anchor',
  Aim: 'Aim'
};

class OriginPicker extends Component {
  constructor(props) {

    super(props);

    this.state = {
      anchor: 'Earth',
      aim: 'Earth',
      hasAnchor: false,
      hasAim: false,
      selectionMode: SelectionModes.Focus,
      sceneGraphNodes: [],
      showPopover: false,
    };

    this.updateAnchor = this.updateAnchor.bind(this);
    this.updateAim = this.updateAim.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.setSelectionModeToFocus = this.setSelectionModeToFocus.bind(this);
    this.setSelectionModeToAnchor = this.setSelectionModeToAnchor.bind(this);
    this.setSelectionModeToAim = this.setSelectionModeToAim.bind(this);
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
    return this.state.aim !== this.state.anchor;
  }


  setSelectionModeToFocus() {
    this.setState({
      selectionMode: SelectionModes.Focus
    })
  }

  setSelectionModeToAnchor() {
    this.setState({
      selectionMode: SelectionModes.Anchor
    })
  }

  setSelectionModeToAim() {
    this.setState({
      selectionMode: SelectionModes.Aim
    })
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
        <SvgIcon className={styles.Icon}><Aim/></SvgIcon>
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
    if (this.state.selectionMode !== SelectionModes.Aim) {
      DataManager.setValue(NavigationAnchorKey, identifier);
    }
    if (this.state.selectionMode !== SelectionModes.Anchor) {
      DataManager.setValue(NavigationAimKey, identifier);
    }
    if (!evt.shiftKey) {
      if (this.state.selectionMode === SelectionModes.Aim) {
        DataManager.trigger(RetargetAimKey);
      } else {
        DataManager.trigger(RetargetAnchorKey);
      }
    }
    this.setState({
      selectionMode: SelectionModes.Focus
    })
  };

  render() {
    const { showPopover, selectionMode } = this.state;
    const { nodes, favorites } = this.props;

    const searchPlaceholder = {
      Focus: "Search for new focus...",
      Anchor: "Search for new anchor...",
      Aim: "Search for new aim...",
    }[selectionMode];

    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover} className={(showPopover ? Picker.Active : '')}>
          {this.hasDistinctAim() ? this.anchorAndAimPicker : this.focusPicker }
        </Picker>
        { showPopover && (
          <Popover closeCallback={this.togglePopover} title="Navigation" className={Picker.Popover}>
            <div>
              <Button className={styles.NavigationButton}
                      onClick={this.setSelectionModeToFocus}
                      title="Select focus"
                      transparent={this.state.selectionMode !== SelectionModes.Focus}>
                <SvgIcon className={styles.ButtonIcon}><Focus/></SvgIcon>
              </Button>
              <Button className={styles.NavigationButton}
                      onClick={this.setSelectionModeToAnchor}
                      title="Select anchor"
                      transparent={this.state.selectionMode !== SelectionModes.Anchor}>
                <SvgIcon className={styles.ButtonIcon}><Anchor/></SvgIcon>
              </Button>
              <Button className={styles.NavigationButton}
                      onClick={this.setSelectionModeToAim}
                      title="Select aim"
                      transparent={this.state.selectionMode !== SelectionModes.Aim}>
                <SvgIcon className={styles.ButtonIcon}><Aim/></SvgIcon>
              </Button>
            </div>
            <FilterList
              data={nodes}
              favorites={favorites}
              className={styles.list}
              searchText={searchPlaceholder}
              viewComponent={FocusEntry}
              onSelect={this.onSelect}
              active={this.anchor}
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

  return {
    nodes,
    favorites,
  };
};

OriginPicker = connect(
  mapStateToProps
)(OriginPicker);

export default OriginPicker;
