import React from 'react';
import { connect } from 'react-redux';
import subStateToProps from '../../utils/subStateToProps';
import Button from '../common/Input/Button/Button';
import { Icon } from '@iconify/react';
import Popover from '../common/Popover/Popover';
import styles from './GeoPositionPanel.scss';
import Picker from './Picker';
import Input from '../common/Input/Input/Input';
import {FilterList, FilterListData } from '../common/FilterList/FilterList'
import {
  setPopoverVisibility,
  subscribeToProperty,
  unsubscribeToProperty,
  reloadPropertyTree
} from '../../api/Actions';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Dropdown from '../common/DropDown/Dropdown';

function MultiStateToggle({title, labels, checked, setChecked}) {
  return <div className={styles.wrapper}>
    <p className={`${styles.toggleTitle} ${styles.resultsTitle}`}>Mode</p>
    <div className={styles.toggles}>
    {labels.map(label => 
      <React.Fragment key ={`${label}fragment`}>
        <input id={label} key={label} className={styles.toggle_option} name="state-d" type="radio" onChange={() => setChecked(label)} checked={ label === checked ? "checked" : ""} />
        <label htmlFor={label} key={`${label}label`} onClick={() => setChecked(label)}>{label}</label>
      </React.Fragment>)}
    <div className={styles.toggle_option_slider}>
    </div>
  </div>
  </div>;
}

function useLocalStorageState(
  key,
  defaultValue = '',
  // the = {} fixes the error we would get from destructuring when no argument was passed
  // Check https://jacobparis.com/blog/destructure-arguments for a detailed explanation
  {serialize = JSON.stringify, deserialize = JSON.parse} = {},
) {
  const [state, setState] = React.useState(() => {
    const valueInLocalStorage = window.localStorage.getItem(key)
    if (valueInLocalStorage) {
      // the try/catch is here in case the localStorage value was set before
      // we had the serialization in place (like we do in previous extra credits)
      try {
        return deserialize(valueInLocalStorage)
      } catch (error) {
        window.localStorage.removeItem(key)
      }
    }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue
  })

  const prevKeyRef = React.useRef(key)

  // Check the example at src/examples/local-state-key-change.js to visualize a key change
  React.useEffect(() => {
    const prevKey = prevKeyRef.current
    if (prevKey !== key) {
      window.localStorage.removeItem(prevKey)
    }
    prevKeyRef.current = key
    window.localStorage.setItem(key, serialize(state))
  }, [key, state, serialize])

  return [state, setState]
}

const Interaction = {
  flyTo : "Fly To",
  jumpTo: "Jump To",
  addFocus: "Add Focus"
};

function createSceneGraphNodeTable(globe, label, lat, long, alt) {
  const position = {
      Identifier : label,
      Parent : globe,
      Transform : {
        Translation : {
          Type : "GlobeTranslation",
          Globe : globe,
          Latitude : lat,
          Longitude : long,
          Altitude : 0
        }
      },
      InteractionSphere : alt,
      GUI : {
        Path : "/GeoLocation"
      }
  };
  return position;
}

function Place({address, onClick, found}) {
  return <Button 
    onClick={onClick}
    className={`${styles.place} ${found ? styles.addedPlace : null}`}
    >
    <p>{address}</p>
  </Button>;
}

function GeoPositionPanel({ refresh, luaApi, popoverVisible, setPopoverVisibilityProp }) {
  const [inputValue, setInputValue] = useLocalStorageState('inputValue',"");
  const [places, setPlaces] = useLocalStorageState('places', undefined);
  const [addedSceneGraphNodes, setAddedSceneGraphNodes] = useLocalStorageState('addedSceneGraphNodes', undefined);
  const [altitude, setAltitude] = useLocalStorageState('altitude', 300000);
  const [interaction, setInteraction] = useLocalStorageState('interaction', Interaction.flyTo);
  const [currentAnchor, setCurrentAnchor] = useLocalStorageState('anchor', 'Earth');
  const options = ['Earth'];

  function getPlaces()  {
    const searchString = inputValue.replaceAll(" ", "%");
    fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${searchString}&category=&outFields=*&forStorage=false&f=json`)
        .then(response => response.json())
        .then(json => setPlaces(json))
        .catch(error => console.log("Error fetching: ", error));
  };

  function pushSceneGraphNode(nodeId) {
    // Deep copy
    const nodes = [...addedSceneGraphNodes];
    nodes.push(nodeId);
    setAddedSceneGraphNodes(nodes);
  }

  function togglePopover() {
    setPopoverVisibilityProp(!popoverVisible);
  }

  function onClick(location, address, pushSceneGraphNode) {
    const lat = location.y;
    const long = location.x;
    switch(interaction) {
      case Interaction.flyTo: {
        luaApi?.globebrowsing?.flyToGeo(currentAnchor, lat, long, altitude);
        break;
      }
      case Interaction.jumpTo: {
        luaApi?.globebrowsing?.goToGeo(currentAnchor, lat, long, altitude);
        break;
      }
      case Interaction.addFocus: {
        luaApi?.addSceneGraphNode(createSceneGraphNodeTable(currentAnchor, address, lat, long, altitude));
        pushSceneGraphNode(address);
        // TODO: Once we have a proper way to subscribe to additions and removals
        // of property owners, this 'hard' refresh should be removed.
        setTimeout(() => {
          refresh();
        });
        break;
      }
      default: {
        luaApi?.globebrowsing?.flyToGeo(currentAnchor, lat, long, altitude);
        break;
      }
    }
  }

  function popover() {
    return (
      <Popover
        className={`${Picker.Popover} ${styles.geoPositionPanel}`}
        title={`Geo location`}
        closeCallback={() => togglePopover()}
        detachable
        attached={true}
      >
        <div className={styles.content}>
        <Dropdown 
          options={options} 
          onChange={(anchor) => setCurrentAnchor(anchor.value)} 
          value={currentAnchor} 
          placeholder="Select an anchor"
        />
        {currentAnchor === 'Earth' ? 
        <>
        <div className={styles.searchField}>
          <Input placeholder={"Search places..."} onChange={(e) => setInputValue(e.target.value)}></Input>
          <Button onClick={() => getPlaces() }>Search</Button>
        </div>
        <MultiStateToggle 
          title={"Mode"}
          labels={Object.values(Interaction)} 
          checked={interaction} 
          setChecked={setInteraction}
        />
        <p className={styles.resultsTitle}>Results</p>
          {places?.candidates && 
          <FilterList
            searchText={"Filter results..."}
            height={'235px'}
            >
            <FilterListData>
            {places.candidates.map((place) => {
              const found = Boolean(addedSceneGraphNodes.indexOf(place.address) > -1);
              return <Place 
                key={`${place.location.x} ${place.location.y}`} 
                onClick={ () => 
                  onClick(place.location, place.address, pushSceneGraphNode)
                }
                address={place.address}
                found={found}
                />
              })
            }
            </FilterListData>
          </FilterList>}
          </> : <CenteredLabel>{`Currently there is no data for locations on ${currentAnchor}`}</CenteredLabel>
          }
        </div>
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      <Picker
        className={`${popoverVisible && Picker.Active}`}
        onClick={() => togglePopover() }
      >
        <div style={{height: '100%'}}>
          <Icon style={{height : '100%', width: '30px'}} icon="entypo:location-pin" />
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
  refresh: () => {
    dispatch(reloadPropertyTree());
  },
  setPopoverVisibilityProp: visible => {
    dispatch(setPopoverVisibility({
      popover: 'geoposition',
      visible
    }));
  }
})

GeoPositionPanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(GeoPositionPanel);

export default GeoPositionPanel;