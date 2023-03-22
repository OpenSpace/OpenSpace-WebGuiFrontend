import React from 'react';
import { useSelector } from 'react-redux';
import WindowThreeStates from '../SkyBrowser/WindowThreeStates/WindowThreeStates';

export default function Missions(closeCallback) {
  const missions = useSelector((state) => state.missions);

  return (
    <WindowThreeStates
      title={missions.data.missions[0].name}
      heightCallback={() => console.log("resize")}
      acceptedStyles={["PANE"]}
      defaultStyle={"PANE"}
      closeCallback={() => closeCallback()}
    >
      {missions.data.missions[0].description}
      <img style={{ width : '100%'}} src={missions.data.missions[0].media.image} />
    </WindowThreeStates>
  );
}