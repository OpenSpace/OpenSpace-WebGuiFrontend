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
import { getBoolPropertyValue } from '../../utils/propertyTreeHelpers';
import { useContextRefs } from '../GettingStartedTour/GettingStartedContext';
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
  console.table(position);
  return position;
}

function Place({address, onClick}) {
  return <Button 
    className={styles.place} 
    onClick={onClick}
    >
    <p>{address}</p>
  </Button>;
}

function GeoPositionPanel({ refresh, luaApi, popoverVisible, setPopoverVisibilityProp, nodes, currentAnchor, startListeningToFocusNode, stopListeningToFocusNode }) {
  const [inputValue, setInputValue] = useLocalStorageState('inputValue',"");
  const [places, setPlaces] = useLocalStorageState('places', undefined);
  const [altitude, setAltitude] = useLocalStorageState('altitude', 300000);
  const [interaction, setInteraction] = useLocalStorageState('interaction', Interaction.flyTo);
  const [anchor, setAnchor] = useLocalStorageState('anchor', 'Earth');
  const options = ['Earth'];
  // Create animation to show when a scene graph node has been added
  const refs = useContextRefs();
  const originRef = refs?.current?.["Origin"];
  const newElement = document.createElement('div');
  newElement.className = styles.addSceneGraphNodeAnimation;
  const animationDiv = React.useRef(newElement);

  React.useEffect(() => {
    startListeningToFocusNode();
    return stopListeningToFocusNode();
  }, []);

  function getPlaces()  {
    const searchString = inputValue.replaceAll(" ", "%");
    fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${searchString}&category=&outFields=*&forStorage=false&f=json`)
        .then(response => response.json())
        .then(json => setPlaces(json))
        .catch(error => console.log("Error fetching: ", error));
  };

  function togglePopover() {
    setPopoverVisibilityProp(!popoverVisible);
  }

  function onClick(location, address) {
    const lat = location.x;
    const long = location.y;
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
        if(originRef) {
          const content = document.createTextNode(address);
          animationDiv.current.textContent = '';
          animationDiv.current.appendChild(content);
          originRef.appendChild(animationDiv.current);
        }
        
        // TODO: Once we have a proper way to subscribe to additions and removals
        // of property owners, this 'hard' refresh should be removed.
        setTimeout(() => {
          refresh();
        }, 500);
        break;
      }
      default: {
        luaApi?.globebrowsing?.flyToGeo(currentAnchor, lat, long, altitude);
        ;
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
          onChange={(anchor) => setAnchor(anchor.value)} 
          value={anchor} 
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
            searchString={"Filter results..."}
            height={'235px'}
            >
            <FilterListData>
            {places.candidates.map( place => 
              <Place 
                key={`${place.location.x} ${place.location.y}`} 
                onClick={ () => 
                  onClick(place.location, place.address)
                }
                address={place.address}
                />)
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

const mapSubStateToProps = ({popoverVisible, luaApi, currentAnchor, propertyOwners}) => {
  const scene = propertyOwners.Scene;
  const uris = scene ? scene.subowners : [];

  const nodes = uris.map(uri => ({
    ...propertyOwners[uri],
    key: uri,
  }));
  return {
    popoverVisible: popoverVisible,
    luaApi: luaApi,
    currentAnchor: currentAnchor,
    nodes
  }
};

const mapStateToSubState = (state) => ({
  popoverVisible: state.local.popovers.geoposition.visible,
  luaApi: state.luaApi,
  currentAnchor: getBoolPropertyValue(state, "NavigationHandler.OrbitalNavigator.Anchor"),
  propertyOwners: state.propertyTree.propertyOwners
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
  },
  startListeningToFocusNode: () => {
    dispatch(subscribeToProperty("NavigationHandler.OrbitalNavigator.Anchor"));
  },
  stopListeningToFocusNode: () => {
    dispatch(unsubscribeToProperty("NavigationHandler.OrbitalNavigator.Anchor"));
  },
})

GeoPositionPanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(GeoPositionPanel);

export default GeoPositionPanel;
