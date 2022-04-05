import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setActionsPath,
  setPopoverVisibility,
  triggerAction,
} from "../../api/Actions";
import {
  refreshSessionRecording,
  subscribeToSessionRecording,
  unsubscribeToSessionRecording,
} from "../../api/Actions";
import {
  sessionStateIdle,
  sessionStatePaused,
  sessionStatePlaying,
  sessionStateRecording,
} from "../../api/keys";
import subStateToProps from "../../utils/subStateToProps";
import InfoBox from "../common/InfoBox/InfoBox";
import Button from "../common/Input/Button/Button";
import Input from "../common/Input/Input/Input";
import Select from "../common/Input/Select/Select";
import MaterialIcon from "../common/MaterialIcon/MaterialIcon";
import Popover from "../common/Popover/Popover";
import Row from "../common/Row/Row";
import styles from "./ClimatePanel.scss";
import Picker from "./Picker";

class ClimatePanel extends Component {
  constructor(props) {
    super(props);
    this.state = { isToggleOn: true };
    this.togglePopover = this.togglePopover.bind(this); //makes it possible to click at climate button

    this.addNavPath = this.addNavPath.bind(this);
    this.goBack = this.goBack.bind(this);
  }

  //same in all jsx files
  togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible);
  }

  //copies from ActionsPanel
  addNavPath(e) {
    var navString = this.props.navigationPath;
    if (this.props.navigationPath == '/') {
      navString += e.currentTarget.getAttribute('foldername');
    } else {
      navString +=  "/" + e.currentTarget.getAttribute('foldername');
    }
    this.props.actionPath(navString);
  }

  goBack(e) {
    var navString = this.props.navigationPath;
    navString = navString.substring(0,navString.lastIndexOf('/'));
    if (navString.length == 0) {
      navString = '/';
    }
    this.props.actionPath(navString);
  }

  getSurfaceLayerAlaska() {
    this.props.luaApi.time.setTime("2021-06-18T19:00:00");
    //this.props.luaApi.navigation.addLocalRotation(20, 10);
    this.setState((prevState) => ({
      isToggleOn: !prevState.isToggleOn,
    }));
    console.log("togle", this.state.isToggleOn);
    /*surfaceLayers = this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.VIIRS_SNPP_Temporal.Enabled",
      this.state.isToggleOn
    );*/
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true);

    this.props.luaApi.setPropertyValueSingle(
        "Scene.Earth.Renderable.Layers.ColorLayers.VIIRS_SNPP_Temporal.Enabled", false);
    //this.props.luaApi.setPropertyValue('Dashboard.StartPositionOffset', [10, -70]);
    this.props.luaApi.globebrowsing.flyToGeo(
      "Earth",
      61.7810,
      -156.4567,
      2556000.0000,
      7,
      true
    );

  }

  getSurfaceLayerGreenland() {
    this.props.luaApi.time.setTime("2021-06-18T19:00:00");
    var surfaceLayers;
    this.setState((prevState) => ({
      isToggleOn: !prevState.isToggleOn,
    }));
    console.log("togle", this.state.isToggleOn);
    /*surfaceLayers = this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.MODIS_Terra_Chlorophyll_A_Temporal.Enabled",
      this.state.isToggleOn
    );*/
    surfaceLayers = this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)

    this.props.luaApi.setPropertyValueSingle(
        "Scene.Earth.Renderable.Layers.ColorLayers.VIIRS_SNPP_Temporal.Enabled", false);

    this.props.luaApi.globebrowsing.flyToGeo(
      "Earth",
      71.0472,
      -47.1729,
      3881000.0000,
      7,
      true
    );


    return surfaceLayers;
  }

  getSurfaceLayerAntarctica() {
    this.props.luaApi.time.setTime("2021-12-18T09:00:00");
    //this.props.luaApi.navigation.addGlobalRotation(20, 10);
//  var surfaceLayers;
    this.setState((prevState) => ({
      isToggleOn: !prevState.isToggleOn,
    }));
    console.log("togle", this.state.isToggleOn);
    /*surfaceLayers = this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.Terra_Modis_Temporal.Enabled",
      this.state.isToggleOn
    );*/
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)
    this.props.luaApi.setPropertyValueSingle(
          "Scene.Earth.Renderable.Layers.ColorLayers.VIIRS_SNPP_Temporal.Enabled", false);
    //this.props.luaApi.time.setTime("2018-12-18T12:00:00");
    this.props.luaApi.globebrowsing.flyToGeo(
      "Earth",
      -84.6081,
      94.7813,
      6990000.0000,
      7,
      true
    );



    //return surfaceLayers;
  }

  getSurfaceLayerCurrents() {
    this.props.luaApi.time.setTime("2021-12-18T09:00:00");
    //this.props.luaApi.navigation.addGlobalRotation(20, 10);
//  var surfaceLayers;
    this.setState((prevState) => ({
      isToggleOn: !prevState.isToggleOn,
    }));
    console.log("togle", this.state.isToggleOn);
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.OSCAR_Sea_Surface_Currents_Zonal.Enabled",
      this.state.isToggleOn
    );
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)
    this.props.luaApi.setPropertyValueSingle(
          "Scene.Earth.Renderable.Layers.ColorLayers.VIIRS_SNPP_Temporal.Enabled", false);
    //this.props.luaApi.time.setTime("2018-12-18T12:00:00");
    /*this.props.luaApi.globebrowsing.flyToGeo(
      "Earth",
      -67.2303,
      48.9053,
      12526000.0000,
      7,
      true
    );*/

}

  get popover() {
    var actionsContent;
    var backButton;
    var antarctica;
    var greenland;
    var alaska;
    var currents;

    antarctica = (
      <Button
        block
        smalltext
        onClick={() => {
          this.getSurfaceLayerAntarctica();
        }}

        className={styles.actionButton}
      >
        <p>
          <MaterialIcon className={styles.buttonIcon} icon="whatshot" />
        </p>
        Antarctica
        <InfoBox
          inpanel
          panelscroll="actionscroller"
          text="Shows the ice melting at Antarctica"
        />
      </Button>
    );

    var surfaceLayer = true;

    greenland = (
      <Button
        block
        smalltext
        onClick={() => {
          this.getSurfaceLayerGreenland();
        }}
        className={styles.actionButton}
      >
        <p>
          <MaterialIcon className={styles.buttonIcon} icon="ac_unit" />
        </p>
        Greenland
        <InfoBox
          inpanel
          panelscroll="actionscroller"
          text="Shows the ice melting at Greenland"
        />
      </Button>
    );

    alaska = (
      <Button
        block
        smalltext
        onClick={() => {
          this.getSurfaceLayerAlaska();
        }}
        className={styles.actionButton}
      >
        <p>
          <MaterialIcon
            className={styles.buttonIcon}
            icon="person_pin_circle"
          />
        </p>
        Alaska
        <InfoBox
          inpanel
          panelscroll="actionscroller"
          text="Shows the ice melting at Alaska"
        />
      </Button>
    );

    currents = (
      <Button
        block
        smalltext
        onClick={() => {
          this.getSurfaceLayerCurrents();
        }}
        className={styles.actionButton}
      >
        <p>
          <MaterialIcon
            className={styles.buttonIcon}
            //icon="reply_all"
            icon="import_export"
          />
        </p>
        Currents

      </Button>
    );

    return (
      <Popover
        className={`${Picker.Popover} ${styles.climatepanel}`}
        title="Which ice do you want to explore?"
        closeCallback={this.togglePopover}
        detachable
        attached={true}
      >
        <div
          id="actionscroller"
          className={`${Popover.styles.content} ${styles.scroller}`}
        >
          <div className={styles.Grid}>
            {backButton}
            {actionsContent}
            {antarctica}
            {greenland}
            {alaska}
            {currents}
          </div>
        </div>
      </Popover>
    );
  }

  get popover2() {
    var overview;

    overview = (
      <Button
        block
        smalltext

        className={styles.actionButton}
      >
        <p>
          <MaterialIcon
            className={styles.buttonIcon}
            //icon="reply_all"
            icon="import_export"
          />
        </p>
        Overview

      </Button>
    );

    return (
      <Popover
        className={`${Picker.Popover} ${styles.climatepanel}`}
        title="Overview or detailed view?"
        closeCallback={this.togglePopover}
        detachable
        attached={true}
      >
        <div
          id="actionscroller"
          className={`${Popover.styles.content} ${styles.scroller}`}
        >
          <div className={styles.Grid}>

            {overview}
          </div>
        </div>
      </Popover>
    );
  }

  render() {
    const { popoverVisible } = this.props;

    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover}>
          <div>
            <MaterialIcon className={styles.bottomBarIcon} icon="whatshot" />
          </div>
        </Picker>
        {popoverVisible && this.popover}
      </div>
    );
  }
}

const mapSubStateToProps = ({ popoverVisible, luaApi }) => {
  return {
    popoverVisible: popoverVisible,
    luaApi: luaApi,
  };
};

const mapStateToSubState = (state) => ({
  popoverVisible: state.local.popovers.climate.visible,
  luaApi: state.luaApi,
});

const mapDispatchToProps = (dispatch) => ({
  setPopoverVisibility: (visible) => {
    dispatch(
      setPopoverVisibility({
        popover: "climate",
        visible,
      })
    );
  },
});

ClimatePanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(ClimatePanel);

export default ClimatePanel;
