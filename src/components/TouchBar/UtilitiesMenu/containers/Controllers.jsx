import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  setPropertyValue,
  subscribeToProperty,
  unsubscribeToProperty
} from '../../../../api/Actions';
import { NavigationAnchorKey, ScaleKey, ValuePlaceholder } from '../../../../api/keys';
import { UpdateDeltaTimeNow } from '../../../../utils/timeHelpers';
import DateController from '../presentational/DateController';
import ScaleController from '../presentational/ScaleController';
import SightsController from '../presentational/SightsController';
import TimePlayerController from '../presentational/TimePlayerController';
import ToggleBoolButtons from '../presentational/ToggleBoolButtons';

function Controllers() {
  const luaApi = useSelector((state) => state.luaApi);
  const story = useSelector((state) => state.storyTree.story);
  const originNode = useSelector((state) => state.propertyTree.properties[NavigationAnchorKey]);

  const scaleNodes = useSelector((state) => {
    const nodes = [];
    if (story.scalenodes) {
      story.scalenodes.nodes.forEach((node) => {
        const key = ScaleKey.replace(ValuePlaceholder, `${node}`);
        const scaleNode = state.propertyTree.properties[key];
        if (scaleNode) {
          nodes.push(scaleNode);
        }
      });
    }
    return nodes;
  });

  const dispatch = useDispatch();

  React.useEffect(() => {
    scaleNodes.forEach((n) => dispatch(subscribeToProperty(n.metaData.identifier)));
    return () => {
      scaleNodes.forEach((n) => dispatch(unsubscribeToProperty(n.metaData.identifier)));
    };
  }, []);

  function changePropertyValue(uri, value) {
    dispatch(setPropertyValue(uri, value));
  }

  function onChangeSight(selected) {
    UpdateDeltaTimeNow(luaApi, 1);
    // Check if the sight is on the current anchor, otherwise change anchor node
    if (originNode !== selected.planet) {
      changePropertyValue(originNode.metaData.identifier, selected.planet);
    }

    luaApi?.navigation?.jumpToGeo(
      '',
      selected.location.latitude,
      selected.location.longitude,
      selected.location.altitude,
      0
    );
  }

  function onChangeScale() {
    const { scale } = story.scalenodes;
    const currentScale = scaleNodes[0].value;

    if (Number(currentScale) !== Number(scale)) {
      story.scalenodes.nodes.forEach((node, i) => {
        changePropertyValue(scaleNodes[i].metaData.identifier, scale);
        // scaleNodes[i].value = scale;
      });
    } else {
      story.scalenodes.nodes.forEach((node, i) => {
        changePropertyValue(scaleNodes[i].metaData.identifier, 1);
        // scaleNodes[i].value = 1;
      });
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      {story && story.timecontroller && <TimePlayerController />}
      {story && story.datecontroller && (
        <DateController dateList={story.datecontroller} onChangeSight={onChangeSight} />
      )}
      {story && story.sightscontroller && (
        <SightsController sightsList={story.sightscontroller} onChangeSight={onChangeSight} />
      )}
      {story && story.scalenodes && (
        <ScaleController
          info={story.scalenodes.info}
          scale={
            Number(scaleNodes[0].value) !== Number(story.scalenodes.scale)
              ? 1
              : Number(story.scalenodes.scale)
          }
          onChangeScale={onChangeScale}
        />
      )}
      {story && story.toggleboolproperties && <ToggleBoolButtons />}
    </div>
  );
}

export default Controllers;
