import React, { Component, useState } from "react";
import { connect } from "react-redux";
import {
  setPopoverVisibility,
} from "../../../api/Actions";
import PropTypes from 'prop-types';
import {
  sessionStateIdle,
  sessionStatePaused,
  sessionStatePlaying,
  sessionStateRecording,
} from "../../../api/keys";
import subStateToProps from "../../../utils/subStateToProps";
import InfoBox from "../../common/InfoBox/InfoBox";
import Button from "../../common/Input/Button/Button";
import Input from "../../common/Input/Input/Input";
import Select from "../../common/Input/Select/Select";
import MaterialIcon from "../../common/MaterialIcon/MaterialIcon";
import climateButton from '../../../../images/climateButton.png'
import cur from '../../../../images/cur.png'
import glac from '../../../../images/glac.png'
import cons from '../../../../images/cons.png'
import SmallLabel from '../../common/SmallLabel/SmallLabel';
import Popover from "../../common/Popover/Popover";
import Row from "../../common/Row/Row";
import styles from "./ClimatePanel.scss";
import Picker from "../../BottomBar/Picker";
import {
  storyResetLayer
} from '../../../utils/storyHelpers';

class ClimatePanel extends Component {
  constructor(props) {
    super(props);
    this.state = { isToggleOn: true };
    this.togglePopover = this.togglePopover.bind(this); //makes it possible to click at climate button
  }

  //appears when cliked in buttom menu
togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible);
    this.props.setNoShow();

    this.props.luaApi.pathnavigation.flyToNavigationState({
      Anchor: "Earth",
      Pitch: -0.025697526978135675,
      Position: [2314072.2457855055,-13824807.97957724,10089542.198761959],
      Up: [-0.48458829410384396,0.461299844968446,0.7432204506400601],
      Yaw: -0.021084089833419275
    })

  }

getSurfaceLayerAlaska() {
    this.props.luaApi.time.setTime("2002-06-18T19:00:00");
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.Overlays.Coastlines.Enabled", true)
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.GRACE_temp-layer.Enabled", true)
    this.props.luaApi.setPropertyValueSingle(
      "ScreenSpace.GRACE_temp-colorbar.Enabled", true)
    this.props.luaApi.pathnavigation.flyToNavigationState({
      Anchor: "Earth",
      Pitch: -0.011183821067911243,
      Position: [-4368490.801656256,-2765540.6263565496,11251914.667710423],
      Up: [0.6652907568635162,0.622995748851844,0.4114176779679014],
      Yaw: -0.006981005084270052
    })
  }

  getSurfaceLayerGreenland() {
    this.props.luaApi.time.setTime("1990-06-18T13:00:00");
    this.props.luaApi.setPropertyValueSingle(
        "ScreenSpace.noaa-sos-oceans-greenland_meltingdays-legend.Enabled", true);
    this.props.luaApi.setPropertyValueSingle(
        "Scene.Earth.Renderable.Layers.ColorLayers.noaa-sos-oceans-greenland_melt.Enabled", true);
    this.props.luaApi.pathnavigation.flyToNavigationState({
      Anchor: "Earth",
      Pitch: 0.014254640432675488,
      Position: [2265092.7505675764,-2443758.000099453,9702953.000268325],
      Up: [-0.5392642157018696,0.7781942850583407,0.32188159370486896],
      Yaw: 0.005985688815975313
    })
  }

  getSurfaceLayerAntarctica() {
    this.props.luaApi.time.setTime("2002-12-18T09:00:00");
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.Overlays.Coastlines.Enabled", true)
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.GRACE_temp-layer.Enabled", true)
    this.props.luaApi.setPropertyValueSingle(
      "ScreenSpace.GRACE_temp-colorbar.Enabled", true)
    this.props.luaApi.pathnavigation.flyToNavigationState({
      Anchor: "Earth",
      Pitch: -0.05148877171176595,
      Position: [-129323.86949850991,1546128.4331422765,-16438250.262302065],
      Up: [0.6632136390360268,-0.7446369805197193,-0.07525580535125864],
      Yaw: 0.025502724534127174
    })
  }

  getSurfaceLayerCurrentsDetailed() {
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.noaa-sos-oceans-ecco2_sst-veg_land-layer.Enabled", true)
    this.props.luaApi.setPropertyValueSingle(
      "ScreenSpace.noaa-sos-oceans-ecco2_sst-veg_land-colorbar.Enabled", false)
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", false)
  }

  getSurfaceLayerCurrentsHalfDetailed() {
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.Overlays.noaa-sos-overlays-currents-currents.Enabled", false)
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ECCO_temp-layer.Enabled", true)
    this.props.luaApi.setPropertyValueSingle(
      "ScreenSpace.ECCO_temp-colorbar.Enabled", true)
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", false)
  }

  getSurfaceLayerCurrentsOverview() {
      this.props.luaApi.setPropertyValueSingle(
        "Scene.Earth.Renderable.Layers.Overlays.noaa-sos-overlays-currents-currents.Enabled", true)
      this.props.luaApi.setPropertyValueSingle(
        "ScreenSpace.noaa-sos-oceans-currents-legend.Enabled", false)
      this.props.luaApi.setPropertyValueSingle(
        "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)
  }

  getSurfaceLayerCons(showNode){
    console.log("shoNode: " + showNode)
    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)
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

  showHide(button, showarray, hide1, hide2) {
  var g = document.getElementById(button);

  if(g.value=="HIDE"){
    document.getElementById("glacierButton").style.border = 'none';
    document.getElementById("currentButton").style.border = 'none';
    document.getElementById("consequenceButton").style.border = 'none';
    g.style.border = '2px solid #D3D3D3';

    showarray.map((show) =>{
      this.ShowHideButton(show, 'relative', '1')
    }),
    hide1.map((hide) =>{
      this.ShowHideButton(hide, 'absolute', '0')
    }),
    hide2.map((hide) =>{
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
    var halfDetailedCurrents;
    var detailedCurrents;
    var consequences;
    var firstCons;
    var secondCons;
    var thirdCons;
    var currentHide = ['currentsHide1', 'currentsHide2','currentsHide3'];
    var consequenceHide = ['consequenceHide1', 'consequenceHide2', 'consequenceHide3'];
    var glaciersHide = ['glaciersHide1', 'glaciersHide2', 'glaciersHide3']
    const {luaApi} = this.props;

    glaciers = (
      <Button
        block
        smalltext
        id="glacierButton"
        value="HIDE"
        onClick={() => {
          this.props.luaApi.setPropertyValueSingle(
            "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true);
          this.showHide("glacierButton",glaciersHide, currentHide, consequenceHide );
        }}
        className={styles.menuButton}
      >
        <div>
          <img src = {glac} alt = "glac" />
        </div>
        <div>
          Glaciers
        </div>
      </Button>
    );

    antarctica = (
      <Button
        id = "glaciersHide1"
        block
        smalltext
        onClick={() => {
              storyResetLayer(luaApi);
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
          storyResetLayer(luaApi);
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
          storyResetLayer(luaApi);
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
          this.props.luaApi.setPropertyValueSingle(
            "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true);
          this.showHide("currentButton", currentHide, consequenceHide, glaciersHide );
        }}
        className={styles.menuButton}
      >
        <div className={styles.flex}>
          <img src = {cur} alt = "cur" />
        </div>
        <div>
          Currents
        </div>
      </Button>
    );

    overviewCurrents = (
      <Button
        id = "currentsHide1"
        block
        className={styles.actionButton}
        smalltext
        onClick={() => {
          storyResetLayer(luaApi);
          this.getSurfaceLayerCurrentsOverview();
        }}
      >
        Overview
      </Button>
    );

    halfDetailedCurrents = (
      <Button
        id = "currentsHide2"
        onClick={() => {
          storyResetLayer(luaApi);
          this.getSurfaceLayerCurrentsHalfDetailed();
        }}
        className={styles.actionButton}
      >
        Zonal velocity
      </Button>
    );

    detailedCurrents = (
      <Button
        id = "currentsHide3"
        onClick={() => {
          storyResetLayer(luaApi);
          this.getSurfaceLayerCurrentsDetailed();
        }}
        className={styles.actionButton}
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
          this.props.luaApi.setPropertyValueSingle(
            "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true);
          this.showHide("consequenceButton",consequenceHide, glaciersHide, currentHide);
        }}
        className={styles.menuButton}
      >
        <div className={styles.flex}>
          <img src = {cons} alt = "cons" />
        </div>
        <div>
          Sea level rise
        </div>
      </Button>
    );

    firstCons = (
      <Button
        id = "consequenceHide1"
        onClick={() => {
          storyResetLayer(luaApi);
          this.getSurfaceLayerCons("2m");
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
          storyResetLayer(luaApi);
          this.getSurfaceLayerCons("4m");
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
          storyResetLayer(luaApi);
          this.getSurfaceLayerCons("6m");
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
            {halfDetailedCurrents}
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


    this.props.luaApi.setPropertyValueSingle(
      "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)

    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover}>
          <div className= {styles.iconButton}>
            <img src = {climateButton} alt = "climateButton" />
            <SmallLabel>Explore</SmallLabel>
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
