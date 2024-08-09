import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  addStoryInfo, addStoryTree, fetchData, resetStoryInfo, setPropertyValue,
  startConnection, triggerAction
} from '../api/Actions';
import {
  DefaultStory, InfoIconKey, NavigationAnchorKey, ScaleKey,
  ValuePlaceholder, ZoomInLimitKey, ZoomOutLimitKey
} from '../api/keys';
import Error from '../components/common/Error/Error';
import Overlay from '../components/common/Overlay/Overlay';
import Slider from '../components/ImageSlider/Slider';
import TouchBar from '../components/TouchBar/TouchBar';
import DeveloperMenu from '../components/TouchBar/UtilitiesMenu/presentational/DeveloperMenu';
import {
  flyTo, infoFileParser, setStoryStart, showDevInfoOnScreen,
  storyFileParser, toggleGalaxies, toggleHighResolution, toggleShading, toggleShowNode
} from '../utils/storyHelpers';
import { UpdateDeltaTimeNow } from '../utils/timeHelpers';

import '../styles/base.scss';
import styles from './OnTouchGui.scss';

const KEYCODE_D = 68;

function OnTouchGui() {
  const [developerMode, setDeveloperMode] = React.useState(false);
  const [currentStory, setCurrentStory] = React.useState(DefaultStory);
  const [sliderStartStory, setSliderStartStory] = React.useState();

  const luaApi = useSelector((state) => state.luaApi);
  const connectionLost = useSelector((state) => state.connection.connectionLost);

  const story = useSelector((state) => state.storyTree?.story);
  const storyIdentifier = story?.identifier;
  const anchorNode = useSelector((state) => state.propertyTree.properties[NavigationAnchorKey]);

  const scaleNodes = useSelector((state) => {
    const nodes = [];
    if (story.scalenodes) {
      story.scalenodes.nodes.forEach((node) => {
        const key = ScaleKey.replace(ValuePlaceholder, `${node}`);
        const foundScaleNode = state.propertyTree.properties[key];

        if (foundScaleNode) {
          nodes.push(foundScaleNode);
        }
      });
    }
    return nodes;
  });

  const dispatch = useDispatch();

  function changePropertyValue(uri, value) {
    dispatch(setPropertyValue(uri, value));
  }

  React.useEffect(() => {
    // StartConnection(); // Was not called?
    dispatch(fetchData(InfoIconKey));

    function handleKeyPress(e) {
      if (e.keyCode === KEYCODE_D) {
        setDeveloperMode(!developerMode);
        showDevInfoOnScreen(luaApi, developerMode);
      }
    }

    document.addEventListener('keydown', handleKeyPress);
    showDevInfoOnScreen(luaApi, false);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Read in json-file for new story and add it to redux
  function addStoryTreeFromSelection(selectedStory) {
    const storyFile = storyFileParser(selectedStory);

    dispatch(addStoryTree(storyFile));
    if (storyFile.infoiconsfile) {
      const info = infoFileParser(storyFile.infoiconsfile);
      dispatch(addStoryInfo(info));
    } else {
      dispatch(resetStoryInfo());
    }

    return storyFile;
  }

  function checkStorySettings(storyJson, value) {
    const oppositeValue = !value;

    if (storyJson.hidenodes) {
      storyJson.hidenodes.forEach((node) => toggleShowNode(luaApi, node, value));
    }
    if (storyJson.highresplanets) {
      storyJson.highresplanets.forEach((node) => toggleHighResolution(luaApi, node, oppositeValue));
    }
    if (storyJson.noshadingplanets) {
      storyJson.noshadingplanets.forEach((node) => toggleShading(luaApi, node, value));
    }
    if (storyJson.galaxies) {
      toggleGalaxies(luaApi, oppositeValue);
    }
  }

  function setStory(selectedStory) {
    const previousStory = storyIdentifier;
    setCurrentStory(selectedStory);

    // Return if the selected story is the same as the OpenSpace property value
    if (previousStory === selectedStory) {
      return;
    }

    const json = addStoryTreeFromSelection(selectedStory);

    // Set all the story specific properties
    changePropertyValue(anchorNode.description.Identifier, json.start.planet);
    setStoryStart(luaApi, json.start.location, json.start.date);

    if (json.overviewlimit) {
      changePropertyValue(ZoomOutLimitKey, json.overviewlimit);
    }
    if (json.inzoomlimit) {
      changePropertyValue(ZoomInLimitKey, json.inzoomlimit);
    } else {
      json.inzoomlimit = 1.0;
      changePropertyValue(ZoomInLimitKey, 1.0);
    }
    if (json.start.overviewzoom) {
      flyTo(luaApi, json.overviewlimit, 5.0);
    }

    changePropertyValue(anchorNode.description.Identifier, json.start.planet);

    // Check settings of the previous story and reset values
    checkStorySettings(story, true);
    // Check and set the settings of the current story
    checkStorySettings(json, false);

    // If the previous story scaled planets reset value
    if (story.scalenodes) {
      scaleNodes.forEach((node) => {
        changePropertyValue(node.description.Identifier, 1);
      });
    }
    // If the previous story toggled bool properties reset them to default value
    if (story.toggleboolproperties) {
      story.toggleboolproperties.forEach((property) => {
        const defaultValue = !!property.defaultvalue;
        if (property.isAction) {
          if (defaultValue) {
            dispatch(triggerAction(property.actionEnabled));
          } else {
            dispatch(triggerAction(property.actionDisabled));
          }
        } else {
          changePropertyValue(property.URI, defaultValue);
        }
      });
    }
  }

  function resetStory() {
    setSliderStartStory(currentStory);
    UpdateDeltaTimeNow(luaApi, 1);
    setStory(DefaultStory);
  }

  function changeStory(e) {
    setStory(e.target.id);
  }

  return (
    <div className={styles.app}>
      { connectionLost && (
        <Overlay>
          <Error>
            Connection lost. Trying to reconnect again soon.
          </Error>
        </Overlay>
      )}
      { developerMode && (
        <DeveloperMenu
          changeStory={changeStory}
          storyIdentifier={storyIdentifier}
        />
      )}
      <p className={styles.storyTitle}>
        {story.title}
      </p>
      {(currentStory === DefaultStory) ?
        <Slider startSlide={sliderStartStory} changeStory={setStory} /> :
        <TouchBar resetStory={resetStory} />}
    </div>
  );
}

// Because some of the functionality in OnTouch Gui requires the luaApi
// we wrap it up in another component that only renders the gui after
// luaApi has been connected
function RequireLuaApi({ children }) {
  const luaApi = useSelector((state) => state.luaApi);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(startConnection());
  }, []);

  return !luaApi ? null : children;
}

function WrappedOnTouchGui(props) {
  return <RequireLuaApi><OnTouchGui {...props} /></RequireLuaApi>;
}

export default WrappedOnTouchGui;
