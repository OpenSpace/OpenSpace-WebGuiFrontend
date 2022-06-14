import React from 'react';
import { connect } from 'react-redux';
import { setPopoverVisibility } from '../../api/Actions';
import subStateToProps from '../../utils/subStateToProps';
import Button from '../common/Input/Button/Button';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Popover from '../common/Popover/Popover';
import styles from './GeoPositionPanel.scss';
import Picker from './Picker';
import Input from '../common/Input/Input/Input';
import Geocode from "react-geocode";

function GeoPositionPanel({ luaApi, popoverVisible, setPopoverVisibilityProp }) {
  const [long, setLong] = React.useState(50);
  const [lat, setLat] = React.useState(30);

  React.useEffect(() => {
    // GET request using fetch inside useEffect React hook
    fetch('https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/<request>?<parameters>')
        .then(response => console.log(response.json()))
        .then(data => console.log(setTotalReactPackages(data.total)));

// empty dependency array means this effect will only run once (like componentDidMount in classes)
}, []);

  function getLongLat(address) {
    // Get latitude & longitude from address.
    Geocode.fromAddress(address).then(
      (response) => {
        const { lat, lng } = response.results[0].geometry.location;
        console.log(lat, lng);
        setLong(lng);
        setLat(lat);
      },
      (error) => {
        console.error(error);
      }
    );
  }
  
  function togglePopover() {
    setPopoverVisibilityProp(!popoverVisible);
  }
 
  function popover() {
    return (
      <Popover
        className={`${Picker.Popover} ${styles.actionsPanel}`}
        title="Geo Position"
        closeCallback={() => togglePopover()}
        detachable
        attached={true}
      >        
        <Input placeholder={"Search..."} onChange={(value) => getLongLat(value)}></Input>
        long lat
        <Button onClick={() => luaApi.globebrowsing.flyToGeo("Earth", lat, long, 8000000)}>Go to position</Button>
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      <Picker 
        className={`${popoverVisible && Picker.Active}`} 
        onClick={() => togglePopover() }
      >
        <div>
          <MaterialIcon className={styles.bottomBarIcon} icon="public" />
        </div>
      </Picker>
      { popoverVisible && popover() }
    </div>
  );
}

const mapSubStateToProps = ({popoverVisible, luaApi}) => {
  return {
    popoverVisible: popoverVisible,
    luaApi: luaApi,
  }
};

const mapStateToSubState = (state) => ({
  popoverVisible: state.local.popovers.geoposition.visible,
  luaApi: state.luaApi,
});

const mapDispatchToProps = dispatch => ({
  setPopoverVisibilityProp: visible => {
    dispatch(setPopoverVisibility({
      popover: 'geoposition',
      visible
    }));
  },
})

GeoPositionPanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(GeoPositionPanel);

export default GeoPositionPanel;