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
  reloadPropertyTree
} from '../../api/Actions';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Dropdown from '../common/DropDown/Dropdown';
import { useLocalStorageState } from '../../utils/customHooks';
import AnimatedCheckmark from '../common/AnimatedCheckmark/AnimatedCheckmark';

function MultiStateToggle({labels, checked, setChecked}) {
  return (
    <div className={styles.wrapper}>
      <p className={`${styles.toggleTitle} ${styles.resultsTitle}`}>Mode</p>
      <div className={styles.toggles}>
      {labels.map(label => 
        <React.Fragment key ={`${label}fragment`}>
          <input
            id={label}
            key={label}
            className={styles.toggle_option}
            name="state-d"
            type="radio"
            onChange={() =>
              setChecked(label)
            }
            checked={label === checked ? "checked" : ""}
          />
          <label htmlFor={label} key={`${label}label`} onClick={() => setChecked(label)}>{label}</label>
        </React.Fragment>)}
        <div className={styles.toggle_option_slider}>
        </div>
      </div>
    </div>);
}

const Interaction = {
  flyTo: "Fly To",
  jumpTo: "Jump To",
  addFocus: "Add Focus"
};

function createSceneGraphNodeTable(globe, label, lat, long, alt) {
  const position = {
      Identifier: label,
      Parent: globe,
      Transform: {
        Translation: {
          Type: "GlobeTranslation",
          Globe: globe,
          Latitude: lat,
          Longitude: long,
          Altitude: 0
        }
      },
      InteractionSphere: alt,
      GUI: {
        Path: "/GeoLocation"
      }
  };
  return position;
}

function Place({address, onClick, found}) {
  return (
    <Button 
      onClick={onClick}
      className={styles.place}
    >
      <div className={styles.placeButton}>
        <p>{address}</p>
        {found && 
          <div style={{width : '20px', height : '20px'}}>
            <AnimatedCheckmark style={{width : '20px', height : '20px'}} color={'transparent'} isAnimated={false} />
          </div>}
      </div>
    </Button>
  );
}

function GeoPositionPanel({ refresh, luaApi, popoverVisible, setPopoverVisibilityProp }) {
  const [inputValue, setInputValue] = useLocalStorageState('inputValue',"");
  const [places, setPlaces] = useLocalStorageState('places', undefined);
  const [addedSceneGraphNodes, setAddedSceneGraphNodes] = useLocalStorageState('addedSceneGraphNodes', undefined);
  const [altitude, setAltitude] = useLocalStorageState('altitude', 300000);
  const [interaction, setInteraction] = useLocalStorageState('interaction', Interaction.flyTo);
  const [currentAnchor, setCurrentAnchor] = useLocalStorageState('anchor', 'Earth');
  const options = ['Earth', "Mars", "Test"];

  function getPlaces()  {
    const searchString = inputValue.replaceAll(" ", "%");
    fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${searchString}&category=&outFields=*&forStorage=false&f=json`)
        .then(response => response.json())
        .then(json => {
          // Remove duplicates
          const uniqueLabels = [];
          const unique = json?.candidates.filter(place => {
            const isDuplicate = uniqueLabels.includes(place.attributes.LongLabel);

            if (!isDuplicate) {
              uniqueLabels.push(place.attributes.LongLabel);
              return true;
            }
            return false;
          });
          setPlaces(unique)
        })
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
        // Don't add if it is already added
        if (addedSceneGraphNodes.indexOf(address) > -1) {
          break;
        }
        pushSceneGraphNode(address);
        let addressString = address;
        addressString.replace(/[^\x00-\x7F]/g, "");
        luaApi?.addSceneGraphNode(createSceneGraphNodeTable(currentAnchor, addressString, lat, long, altitude));
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

  function anchorPanel(anchor) {
    switch (anchor) {
      case 'Earth':
        return <>
            <div className={styles.searchField}>
              <Input
                placeholder={"Search places..."}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    getPlaces();
                  }
                  else {
                    setInputValue(e.target.value);
                  }
                }} 
                clearable
              />
              <Button onClick={() => getPlaces() }>Search</Button>
            </div>
            <MultiStateToggle 
              title={"Mode"}
              labels={Object.values(Interaction)} 
              checked={interaction} 
              setChecked={setInteraction}
            />
            <p className={styles.resultsTitle}>Results</p>
            {places && (
              (places.length < 4) ?
                <>
                  {places?.map?.((place) => {
                    const address = place.attributes.LongLabel;
                    const found = Boolean(addedSceneGraphNodes.indexOf(address) > -1);
                    return (
                      <Place 
                        key={place.attributes.LongLabel} 
                        onClick={ () => 
                          onClick(place.location, address, pushSceneGraphNode)
                        }
                        address={address}
                        found={found}
                      />)
                    })
                  }
                </>
              : 
                  <FilterList
                    searchText={"Filter results..."}
                    height={'235px'}
                  >
                    <FilterListData>
                    {places?.map?.((place) => {
                      const address = place.attributes.LongLabel;
                      const found = Boolean(addedSceneGraphNodes.indexOf(address) > -1);
                      return (
                        <Place 
                          key={place.attributes.LongLabel} 
                          onClick={ () => 
                            onClick(place.location, address, pushSceneGraphNode)
                          }
                          address={address}
                          found={found}
                        />)
                      })
                    }
                    </FilterListData>
              </FilterList>
            )
          } 
              
        </> 
      default:
        return <CenteredLabel>{`Currently there is no data for locations on ${currentAnchor}`}</CenteredLabel>;
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
        {anchorPanel(currentAnchor)}
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
