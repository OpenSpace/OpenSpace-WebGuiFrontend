import React, { Component, useState } from "react";
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
import PropTypes from 'prop-types';
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

  }

  //same in all jsx files
togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible);
    this.props.setNoShow();
    console.log(this.props.setNoShow)
  }

getSurfaceLayerAlaska() {
    this.props.luaApi.time.setTime("2021-06-18T19:00:00");
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true);

    //I don't know if we want this
    this.props.luaApi.setPropertyValueSingle(
        "Scene.Earth.Renderable.Layers.ColorLayers.VIIRS_SNPP_Temporal.Enabled", false);
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
    this.props.luaApi.time.setTime("1990-06-18T13:00:00");

    //Solve the camera angle to use this! Also, we need a dataset with height map
    //this.props.luaApi.navigation.addLocalRotation(0 , 85)
    //this.props.luaApi.navigation.addTruckMovement(0 , 250) //zoom
    //this.props.luaApi.navigation.addLocalRoll(10 , 30) // rotering, didn't use this
    var surfaceLayers;
    this.setState((prevState) => ({
      isToggleOn: !prevState.isToggleOn,
    }));
    console.log("togle", this.state.isToggleOn);
    /*surfaceLayers = this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.MODIS_Terra_Chlorophyll_A_Temporal.Enabled",
      this.state.isToggleOn
    );*/

    //DOES NOT WORK, why not??
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.noaa-sos-oceans-greenland_melt.Enabled",
      this.state.isToggleOn   //noaa-sos-overlays-currents
    );
  /*  this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.noaa-sos-oceans-greenland_melt", true);
    surfaceLayers = this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)*/
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

    //use this if using movements
  /*  this.props.luaApi.globebrowsing.flyToGeo(
      "Earth",
      59.1818,
      -44.1987,
      3881000.0000, //53000.0000
      7,
      true
    );*/
    return surfaceLayers;
  }

  getSurfaceLayerAntarctica() {
    console.log("Antarctica")
    this.props.luaApi.time.setTime("2021-12-18T09:00:00");
    this.setState((prevState) => ({
      isToggleOn: !prevState.isToggleOn,
    }));
    console.log("togle", this.state.isToggleOn);
    /*this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Satellites..Enabled",
      this.state.isToggleOn   //noaa-sos-overlays-currents
    );*/

    /*const list = this.props.luaApi.getProperty('{earth_satellites}.Renderable.Enabled');
    console.log(list.length)

    for (v in list){
    console.log("v")
      this.props.luaApi.setPropertyValueSingle(this.props.luaApi.getPropertyValue(v))
    }*/

    /*surfaceLayers = this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.Terra_Modis_Temporal.Enabled",
      this.state.isToggleOn
    );*/
    /*
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)*/
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)

    this.props.luaApi.setPropertyValueSingle(
          "Scene.Earth.Renderable.Layers.ColorLayers.VIIRS_SNPP_Temporal.Enabled", false);
    this.props.luaApi.globebrowsing.flyToGeo(
      "Earth",
      -84.6081,
      94.7813,
      6990000.0000,
      7,
      true
    );
  }

  getSurfaceLayerCurrentsDetailed() {

    this.setState((prevState) => ({
      isToggleOn: !prevState.isToggleOn,
    }));
    console.log("togle", this.state.isToggleOn);
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.OSCAR_Sea_Surface_Currents_Zonal.Enabled",
      this.state.isToggleOn
    );
    //this.props.luaApi.setNavigationState([[60, -90, 0],[90, 60, 0],[0, 0, 1]])
     //this.props.luaApi.navigation.addLocalRoll(60,0)
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)
    this.props.luaApi.setPropertyValueSingle(
          "Scene.Earth.Renderable.Layers.ColorLayers.VIIRS_SNPP_Temporal.Enabled", false);
    }

  getSurfaceLayerCurrentsOverview() {
      this.setState((prevState) => ({
        isToggleOn: !prevState.isToggleOn,
      }));
      console.log("togleff", this.state.isToggleOn);
      this.props.luaApi.setPropertyValueSingle(
        "Scene.Earth.Renderable.Layers.Overlays.noaa-sos-overlays-currents-currents.Enabled",
        this.state.isToggleOn   //noaa-sos-overlays-currents
      );
      this.props.luaApi.setPropertyValueSingle(
        "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)
      this.props.luaApi.setPropertyValueSingle(
            "Scene.Earth.Renderable.Layers.ColorLayers.VIIRS_SNPP_Temporal.Enabled", false);
    }

  getSurfaceLayerCons(showNode, hideNode, hideNode2){

  this.props.luaApi.setPropertyValueSingle(
    `Scene.Earth.Renderable.Layers.ColorLayers.noaa-sos-oceans-6m_sea_level_rise-red-${hideNode}.Enabled`,false);
    this.props.luaApi.setPropertyValueSingle(
      `Scene.Earth.Renderable.Layers.ColorLayers.noaa-sos-oceans-6m_sea_level_rise-red-${hideNode2}.Enabled`,false);

  this.setState((prevState) => ({
      isToggleOn: !prevState.isToggleOn,
    }));
  this.props.luaApi.setPropertyValueSingle(
        `Scene.Earth.Renderable.Layers.ColorLayers.noaa-sos-oceans-6m_sea_level_rise-red-${showNode}.Enabled`,
      true
    );
}

  ShowHideButton(node, pos, opacity){
  const hideNode = document.getElementById(node);
  hideNode.style.position = pos;
  hideNode.style.opacity = opacity;
}

  showHide(button, showarray, hidearray1, hidearray2) {
  var g = document.getElementById(button);

  if(g.value=="HIDE"){

    document.getElementById("glacierButton").style.border = 'none';
    document.getElementById("currentButton").style.border = 'none';
    document.getElementById("consequenceButton").style.border = 'none';
    g.style.border = '2px solid #D3D3D3';

    showarray.map((show) =>{
      this.ShowHideButton(show, 'relative', '1')
    }),
    hidearray1.map((hide) =>{
      this.ShowHideButton(hide, 'absolute', '0')
    }),
    hidearray2.map((hide) =>{
      this.ShowHideButton(hide, 'absolute', '0')
    }),

    document.getElementById("glacierButton").value = 'HIDE';
    document.getElementById("currentButton").value = 'HIDE';
    document.getElementById("consequenceButton").value = 'HIDE';
    g.value="SHOW";
    }
    else if(g.value=="SHOW"){
      g.style.border = 'none';
      showarray.map((show) =>{
        this.ShowHideButton(show, 'absolute', '0')
      }),
      document.getElementById("glacierButton").value = 'SHOW';
      document.getElementById("currentButton").value = 'SHOW';
      document.getElementById("consequenceButton").value = 'SHOW';
      g.value="HIDE";
    }
}


  get popover() {
    var glaciers;
    var antarctica;
    var greenland;
    var alaska;
    var currents;
    var overviewCurrents;
    var detailedCurrents;
    var consequences;
    var firstCons;
    var secondCons;
    var thirdCons;

    var currentHide = [ 'curentsHide1', 'curentsHide2' ];
    var consequenceHide = ['consequenceHide1', 'consequenceHide2', 'consequenceHide3'];
    var glaciersHide = ['glaciersHide1', 'glaciersHide2', 'glaciersHide3']


    glaciers = (
      <Button
        block
        smalltext
        id="glacierButton"
        value="HIDE"
        onClick={() => {
          this.showHide("glacierButton", glaciersHide, currentHide, consequenceHide );
        }}
        className={styles.menuButton}
      >
        <p>
          <MaterialIcon className={styles.buttonIcon} icon="ac_unit" />
        </p>
        Glaciers
      </Button>
    );

    antarctica = (
      <Button
        id = "glaciersHide1"
        block
        smalltext
        onClick={() => {
              this.getSurfaceLayerAntarctica();
        }}
        className={styles.actionButton}
      >
        Antarctica
      </Button>
    );

    greenland = (
      <Button
        id = "glaciersHide2"
        block
        smalltext
        onClick={() => {
          this.getSurfaceLayerGreenland();
      }}
      className={styles.actionButton}
      >
        Greenland
      </Button>

    );

    alaska = (
      <Button
        id = "glaciersHide3"
        block
        smalltext
        className={styles.actionButton}
        onClick={() => {
          this.getSurfaceLayerAlaska();
        }}
      >
        Alaska
      </Button>
    );

    currents = (
      <Button
        block
        smalltext
        id="currentButton"
        value="HIDE"
        onClick={() => {
          this.showHide("currentButton", currentHide, consequenceHide, glaciersHide );
        }}
        className={styles.menuButton}
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

    overviewCurrents = (
      <Button
        id = "curentsHide1"
        block
        className={styles.actionButton2}
        smalltext
        onClick={() => {
          this.getSurfaceLayerCurrentsOverview();
        }}
      >
        Overview
      </Button>
    );

    detailedCurrents = (
      <Button
        id = "curentsHide2"
        onClick={() => {
          this.getSurfaceLayerCurrentsDetailed();
          //event.target.setAttribute('style', 'position: absolute; opacity: 0;');
        }}
        className={styles.actionButton2}
      >
        Detailed
      </Button>
    );

    consequences = (
      <Button
        block
        smalltext
        id="consequenceButton"
        value="HIDE"
        onClick={() => {
          this.showHide("consequenceButton",consequenceHide, glaciersHide, currentHide );
        }}
        className={styles.menuButton}
      >
        <p>
          <MaterialIcon
            className={styles.buttonIcon}
            icon="close"
          />
        </p>
        Consequences
      </Button>
    );

    firstCons = (
      <Button
        id = "consequenceHide1"
        onClick={() => {
          this.getSurfaceLayerCons("2m", "6m", "4m");
        }}
        className={styles.actionButton}
      >
        2 meters
      </Button>
    );

    secondCons = (
      <Button
        id = "consequenceHide2"
        onClick={() => {
          this.getSurfaceLayerCons("4m", "2m", "6m");
        }}
        className={styles.actionButton}
      >
        4 meters
      </Button>
    );

    thirdCons = (
      <Button
        id = "consequenceHide3"
        onClick={() => {
          this.getSurfaceLayerCons("6m", "4m", "2m");
        }}
        className={styles.actionButton}
      >
        6 meters
      </Button>
    );

    return (
      <Popover
        className={`${Picker.Popover} ${styles.climatepanel}`}
        title="What do you want to explore?"
        closeCallback={this.togglePopover}
        detachable
        attached={true}
      >
        <div
          id="actionscroller"
          className={`${Popover.styles.content} ${styles.scroller}`}
        >
          <div className={styles.Grid}>
            {glaciers}
            {currents}
            {consequences}
            {antarctica}
            {greenland}
            {alaska}
            {overviewCurrents}
            {detailedCurrents}
            {firstCons}
            {secondCons}
            {thirdCons}

          </div>
        </div>
      </Popover>
    );
  }

  render() {

    const { popoverVisible, setNoShow } = this.props;

    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover}>
          <div>
            <MaterialIcon className={styles.bottomBarIcon} icon="ac_unit" />
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


ClimatePanel.propTypes = {
 setNoShow: PropTypes.func.isRequired,
};

export default ClimatePanel;
