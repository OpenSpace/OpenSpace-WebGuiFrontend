import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subscribeToTime, unsubscribeToTime } from '../../../api/Actions';
import WindowThreeStates from '../SkyBrowser/WindowThreeStates/WindowThreeStates';
import { ActionsButton } from '../ActionsPanel';
import Button from '../../common/Input/Button/Button';
import Picker from '../Picker';
import { useLocalStorageState } from '../../../utils/customHooks';
import { Icon } from '@iconify/react';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import Timeline from './Timeline';
import styles from './Missions.scss';

export function makeUtcDate(time) {
  if (!time) {
    return null;
  }
  const utcString = time.includes("Z") ? time : `${time}Z`;
  return new Date(utcString);
}

export const DisplayType = {
  phase: "phase",
  milestone: "milestone"
};

function SetTimeButton({onClick, name}) {
  return (
    <Button block smalltext onClick={onClick}>
      {name}
    </Button>
  );
}

export default function Missions({ }) {
  // Make panel being shown stored in local storage
  const [popoverVisible, setPopoverVisibility] = useLocalStorageState('missionsPanelVisible', true);

  // Access Redux state
  const missions = useSelector((state) => state.missions);
  const allActions = useSelector((state) => state.shortcuts?.data?.shortcuts);
  const luaApi = useSelector((state) => state.luaApi);
  const now = useSelector((state) => state.time.time);

  const [overview, setOverview] = React.useState(missions?.data?.missions[0]);
  const [displayedPhase, setDisplayedPhase] = React.useState({ type: DisplayType.phase, data: overview });
  const [currentActions, setCurrentActions] = React.useState([]);
  const [size, setSize] = React.useState({width: 350, height: window.innerHeight});
  const [displayCurrentPhase, setDisplayCurrentPhase] = React.useState(false);
  const [wholeTimeRange, setWholeTimeRange] = React.useState(
    [new Date(missions.data.missions[0].timerange.start), new Date(missions.data.missions[0].timerange.end)]
  );

  const allPhasesNested = React.useRef(null);
  const topBarHeight = 30;
  const browserHasLoaded = window.innerHeight > 1;

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(subscribeToTime());
    return () => dispatch(unsubscribeToTime());
  }, []);

  React.useEffect(() => {
    if (displayCurrentPhase) {
      setPhaseToCurrent()
    }
  }, [now]);

  // Every time a phase changes, get the actions that are valid for that phase
  React.useEffect(() => {
    let result = [];
    findCurrentActions(result, overview);
    setCurrentActions(result);
  }, [allActions, displayedPhase]);

  // When missions data changes, update phases
  React.useEffect(() => {
    let phases = [];
    findAllPhases(phases, missions.data.missions[0].phases, 0);
    allPhasesNested.current = phases;
  }, [missions.data]);

  function findAllPhases(result, phases, nestedLevel) {
    if (!Boolean(result?.[nestedLevel])) {
      result.push(phases);
    }
    else {
      result[nestedLevel].push(...phases);
    }
    phases.map(phase => {
      if (phase?.phases && phase.phases.length > 0) {
        findAllPhases(result, phase.phases, nestedLevel + 1);
      }
    });
  }

  function findCurrentActions(result, phase) {
    phase.actions.map(action => {
      const found = allActions?.find(item => item.identifier === action)
      if (found) {
        result.push(found);
      }
    });
  }

  // Locate the next instrument activity capture
  function nextCapture() {
    let nextFoundCapture;
    // Assume the captures are sorted w regards to time
    for (const capture in overview.capturetimes) {
      // Find the first time that is after the current time
      if (now?.getTime() < makeUtcDate(capture)?.getTime()) {
        nextFoundCapture = capture;
        break;
      }
    }
    return nextFoundCapture;
  }

  // Locate the previous instrument activity capture
  function lastCapture() {
    let lastFoundCapture;
    // Assume the captures are sorted w regards to time
    for (const capture in overview.capturetimes.reverse()) {
      // Find the first time that is before the current time
      if (now?.getTime() > makeUtcDate(capture)?.getTime()) {
        lastFoundCapture = capture;
        break;
      }
    }
    return lastFoundCapture;
  }

  function setPhaseToCurrent() {
    const flatAllPhases = allPhasesNested.current.flat();
    const filteredPhases = flatAllPhases.filter(mission => {
      return Date.parse(now) < Date.parse(makeUtcDate(mission.timerange.end)) &&
        Date.parse(now) > Date.parse(makeUtcDate(mission.timerange.start))
    });
    const found = filteredPhases.pop();
    // If the found phase is already displayed, do nothing
    if (found.name === displayedPhase.data.name) {
      return;
    }
    if (found) {
      setDisplayedPhase({ type: DisplayType.phase, data: found });
    }
    else {
      setDisplayedPhase({ type: null, data: undefined });
    }
  }

  function togglePopover() {
    setPopoverVisibility(lastValue => !lastValue);
  }

  function sizeCallback(width, height) {
    setSize({ width, height });
  }

  // Fadetime is in seconds
  async function jumpToTime(timeNow, time, fadeTime = 1) {
    const utcTime = time instanceof Date ? time : makeUtcDate(time);
    const timeDiffSeconds = parseInt(Math.abs(timeNow - utcTime) / 1000);
    const diffBiggerThanADay = timeDiffSeconds > 86400; // No of seconds in a day
    if (diffBiggerThanADay) {
      let promise = new Promise((resolve, reject) => {
        luaApi.setPropertyValueSingle('RenderEngine.BlackoutFactor', 0, fadeTime, "QuadraticEaseOut");
        setTimeout(() => resolve("done!"), fadeTime * 1000)
      });
      let result = await promise;
      luaApi.time.setTime(utcTime.toISOString());
      luaApi.setPropertyValueSingle('RenderEngine.BlackoutFactor', 1, fadeTime, "QuadraticEaseIn");
    }
    else {
      luaApi.time.interpolateTime(utcTime.toISOString(), fadeTime);
    }
  }

  function jumpToNextCapture() {
    jumpToTime(now, nextCapture());
  }

  function jumpToLastCapture() {
    jumpToTime(now, lastCapture());
  }

  function jumpToEndOfPhase() {
    jumpToTime(now, displayedPhase.data.timerange.end);
  }

  function jumpToStartOfPhase() {
    jumpToTime(now, displayedPhase.data.timerange.start);
  } 

  function jumpToDate() {
    jumpToTime(now, displayedPhase.data.date)
  } 

  function openUrl(url) {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  }

  function setPhaseManually(phase) {
    setDisplayedPhase(phase);
    setDisplayCurrentPhase(false);
  }

  function createTimeButtons() {
    if (displayedPhase.type === DisplayType.phase) {
      const phaseType = displayedPhase.data === overview ? "Mission" : "Phase";
      return (
        <>
          <SetTimeButton name={`Set Time to End of ${phaseType}`} onClick={jumpToEndOfPhase} />
          <SetTimeButton name={`Set Time to Beginning of ${phaseType}`} onClick={jumpToStartOfPhase} />
        </>
      );
    } 
    if (displayedPhase.type === DisplayType.milestone) {
      return <SetTimeButton name={"Set Time"} onClick={jumpToDate} />;
    }
  }

  function getTimeString() {
    if (displayedPhase.type === DisplayType.milestone) {
      return `${new Date(displayedPhase.data.date).toDateString()}`;
    }
    else if (displayedPhase.type === DisplayType.phase) {
      const start = new Date(displayedPhase.data.timerange.start).toDateString();
      const end = new Date(displayedPhase.data.timerange.end).toDateString();
      return `${start} - ${end}`;
    }
  }

  function popover() {
    const timeString = getTimeString();
    const typeTitle = displayedPhase.type === DisplayType.phase ? "Phase" : "Milestone";
    const title = `${typeTitle}: ${displayedPhase?.data?.name}`;
    const hideTitle = displayedPhase.type === DisplayType.phase && displayedPhase?.data?.name === overview.name;
    
    return (
      <>
      { browserHasLoaded ? 
        <Timeline
          fullWidth={120}
          fullHeight={window.innerHeight}
          timeRange={wholeTimeRange}
          currentPhases={allPhasesNested.current}
          captureTimes={overview.capturetimes}  
          now={now}
          setDisplayedPhase={setPhaseManually}
          displayedPhase={displayedPhase}
          panelWidth={size.width}
          milestones={overview?.milestones}
          jumpToTime={jumpToTime}
        />
          :
        null
      }
      <WindowThreeStates
        title={overview.name}
        sizeCallback={sizeCallback}
        acceptedStyles={["PANE"]}
        defaultStyle={"PANE"}
        closeCallback={() => setPopoverVisibility(false)}
        > 
        <div style={{ height: size.height - topBarHeight, overflow: 'auto'}}>
          <div style={{ display: 'flex', justifyContent: 'space-around'}}>
            <Button onClick={() => setPhaseManually({ type: DisplayType.phase, data: overview }) }>{"Mission Overview"}</Button>
            <Button
              onClick={() => setDisplayCurrentPhase(lastValue => !lastValue)}
              className={displayCurrentPhase ? styles.selectedButton : null}
            >
              {"Current Phase"}
            </Button>
          </div>
            <div style={{ padding: '10px' }}>
              {displayedPhase ?
                <>
                  <p>{!hideTitle && title}</p>
                  <p style={{ color: 'darkgray' }}>
                    {timeString}
                  </p>
                  <p style={{ paddingBottom: '15px' }}>
                    <br />
                    {displayedPhase.data.description}
                  </p>
                  {displayedPhase.data.link &&
                    <Button onClick={() => openUrl(displayedPhase.data.link)}>{"Read more"}</Button>
                  }
                  {displayedPhase.data.image &&
                    <img style={{ width: '100%', padding: '20px 5px', maxWidth: window.innerWidth * 0.25 }} src={displayedPhase.data.image} />
                  }
                </>
                :
                <CenteredLabel>{"No current phase in this mission"}</CenteredLabel>
              }
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', padding: '10px 0px' }}>
                {createTimeButtons()}
                {nextCapture() && <SetTimeButton name={"Set Time to Next Capture"} onClick={jumpToNextCapture} />}
                {lastCapture() && <SetTimeButton name={"Set Time to Last Capture"} onClick={jumpToLastCapture} />}
              </div>
              {currentActions.map(action =>
                <ActionsButton key={action.identifier} action={action} />
              )}
            </div>
          </div>
      </WindowThreeStates>
    </>
    );
  }

  return (
    <>
      <div className={Picker.Wrapper}>
        <Picker
          refKey="Actions"
          className={`${popoverVisible && Picker.Active}`}
          onClick={togglePopover}
        >
          <Icon icon={"ic:baseline-rocket-launch"} color={"white"} alt={"Missions"} style={{ fontSize: '2em' }}/>
        </Picker>
      </div>
      { popoverVisible && popover() }
    </>
  );
}
