import React from 'react';
import { MdRocketLaunch } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { subscribeToTime, unsubscribeToTime } from '../../../api/Actions';
import { useLocalStorageState } from '../../../utils/customHooks';
import { openUrl } from '../../../utils/helpers';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import Button from '../../common/Input/Button/Button';
import ActionsButton from '../Actions/ActionsButton';
import Picker from '../Picker';
import WindowThreeStates from '../SkyBrowser/WindowThreeStates/WindowThreeStates';

import { DisplayType, makeUtcDate, uppercaseFirstLetter } from './missionUtils';
import Timeline from './Timeline';

import styles from './Missions.scss';

function SetTimeButton({ onClick, name }) {
  return (
    <Button block smalltext onClick={onClick}>
      {name}
    </Button>
  );
}

SetTimeButton.propTypes = {
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};

export default function Missions() {
  // Make panel being shown stored in local storage
  const [popoverVisible, setPopoverVisibility] = useLocalStorageState('missionsPanelVisible', true);

  const missions = useSelector((state) => state.missions);

  // Get the first mission in the object
  const loadedMissions = useSelector((state) => state.missions?.data?.missions);
  const overview = Object.values(loadedMissions)[0];

  const allActions = useSelector((state) => state.shortcuts.actions);
  const luaApi = useSelector((state) => state.luaApi);
  // Use time that is updated every second - optimization
  const now = useSelector((state) => state.time.timeCapped);

  const [displayedPhase, setDisplayedPhase] = React.useState({
    type: DisplayType.phase,
    data: overview
  });
  const [currentActions, setCurrentActions] = React.useState([]);
  const [size, setSize] = React.useState({ width: 350, height: window.innerHeight });
  const [displayCurrentPhase, setDisplayCurrentPhase] = React.useState(false);

  const wholeTimeRange = [
    makeUtcDate(overview.timerange.start),
    makeUtcDate(overview.timerange.end)
  ];
  const allPhasesNested = React.useRef(null);
  const browserHasLoaded = window.innerHeight > 1;

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(subscribeToTime());
    return () => dispatch(unsubscribeToTime());
  }, []);

  React.useEffect(() => {
    if (displayCurrentPhase) {
      // eslint-disable-next-line no-use-before-define
      setPhaseToCurrent();
    }
  }, [now]);

  // Every time a phase changes, get the actions that are valid for that phase
  React.useEffect(() => {
    const result = [];
    // eslint-disable-next-line no-use-before-define
    findCurrentActions(result, overview);
    if (displayedPhase.data && displayedPhase.data?.actions && overview !== displayedPhase.data) {
      // eslint-disable-next-line no-use-before-define
      findCurrentActions(result, displayedPhase.data);
    }
    setCurrentActions(result);
  }, [allActions, displayedPhase]);

  // When missions data changes, update phases
  React.useEffect(() => {
    const phases = [];
    // eslint-disable-next-line no-use-before-define
    findAllPhases(phases, Object.values(missions.data.missions)[0].phases, 0);
    allPhasesNested.current = phases;
  }, [missions.data]);

  function findAllPhases(result, phases, nestedLevel) {
    if (!result?.[nestedLevel]) {
      result.push(phases);
    } else {
      result[nestedLevel].push(...phases);
    }
    phases.forEach((phase) => {
      if (phase?.phases && phase.phases.length > 0) {
        findAllPhases(result, phase.phases, nestedLevel + 1);
      }
    });
  }

  function findCurrentActions(result, phase) {
    phase.actions.forEach((action) => {
      const found = allActions?.find((item) => item.identifier === action);
      if (found) {
        result.push(found);
      }
    });
  }

  // Locate the next instrument activity capture
  function nextCapture() {
    if (!now || typeof now === 'string') {
      return null;
    }
    // Assume the captures are sorted w regards to time
    // Find the first time that is after the current time
    const result = overview.capturetimes.find((capture) => {
      const utcDate = makeUtcDate(capture);
      return utcDate !== null && now.getTime() < utcDate.getTime();
    });
    return makeUtcDate(result);
  }

  // Locate the previous instrument activity capture
  function lastCapture() {
    if (!now || typeof now === 'string') {
      return null;
    }
    // Assume the captures are sorted w regards to time
    // Find the last time that is before the current time
    const result = overview.capturetimes.findLast((capture) => {
      const utcDate = makeUtcDate(capture);
      return utcDate !== null && now.getTime() > utcDate.getTime();
    });
    return makeUtcDate(result);
  }

  function setPhaseToCurrent() {
    const flatAllPhases = allPhasesNested.current.flat();
    const filteredPhases = flatAllPhases.filter((mission) => {
      const isBeforeEnd = Date.parse(now) < Date.parse(makeUtcDate(mission.timerange.end));
      const isAfterStart = Date.parse(now) > Date.parse(makeUtcDate(mission.timerange.start));
      return isBeforeEnd && isAfterStart;
    });
    const found = filteredPhases.pop();
    // If the found phase is already displayed, do nothing
    if (!found) {
      setDisplayedPhase({ type: null, data: undefined });
    } else {
      if (found.name === displayedPhase.data?.name) {
        return;
      }
      setDisplayedPhase({ type: DisplayType.phase, data: found });
    }
  }

  function togglePopover() {
    setPopoverVisibility((lastValue) => !lastValue);
  }

  // Fadetime is in seconds
  async function jumpToTime(timeNow, time, fadeTime = 1) {
    const utcTime = time instanceof Date ? time : makeUtcDate(time);
    const timeDiffSeconds = parseInt(Math.abs(timeNow - utcTime) / 1000, 10);
    const diffBiggerThanADay = timeDiffSeconds > 86400; // No of seconds in a day
    if (diffBiggerThanADay) {
      const promise = new Promise((resolve) => {
        luaApi.setPropertyValueSingle(
          'RenderEngine.BlackoutFactor',
          0,
          fadeTime,
          'QuadraticEaseOut'
        );
        setTimeout(() => resolve('done!'), fadeTime * 1000);
      });
      await promise;
      luaApi.time.setTime(utcTime.toISOString());
      luaApi.setPropertyValueSingle('RenderEngine.BlackoutFactor', 1, fadeTime, 'QuadraticEaseIn');
    } else {
      luaApi.time.interpolateTime(utcTime.toISOString(), fadeTime);
    }
  }

  function jumpToNextCapture() {
    const time = nextCapture();
    if (time !== null) {
      jumpToTime(now, time);
    }
  }

  function jumpToLastCapture() {
    const time = lastCapture();
    if (time !== null) {
      jumpToTime(now, time);
    }
  }

  function jumpToEndOfPhase() {
    jumpToTime(now, displayedPhase.data.timerange.end);
  }

  function jumpToStartOfPhase() {
    jumpToTime(now, displayedPhase.data.timerange.start);
  }

  function jumpToDate() {
    jumpToTime(now, displayedPhase.data.date);
  }

  function setPhaseManually(phase) {
    setDisplayedPhase(phase);
    setDisplayCurrentPhase(false);
  }

  function createTimeButtons() {
    switch (displayedPhase.type) {
      case DisplayType.phase: {
        const phaseType = displayedPhase.data === overview ? 'Mission' : 'Phase';
        return (
          <>
            <SetTimeButton name={`Set Time to End of ${phaseType}`} onClick={jumpToEndOfPhase} />
            <SetTimeButton
              name={`Set Time to Beginning of ${phaseType}`}
              onClick={jumpToStartOfPhase}
            />
          </>
        );
      }
      case DisplayType.milestone: {
        return <SetTimeButton name='Set Time' onClick={jumpToDate} />;
      }
      default: {
        return null;
      }
    }
  }

  // Time display string shown under the title
  function getTimeString() {
    switch (displayedPhase.type) {
      case DisplayType.milestone: {
        return `${new Date(displayedPhase.data.date).toDateString()}`;
      }
      case DisplayType.phase: {
        const start = new Date(displayedPhase.data.timerange.start).toDateString();
        const end = new Date(displayedPhase.data.timerange.end).toDateString();
        return `${start} - ${end}`;
      }
      default: {
        return null;
      }
    }
  }

  function popover() {
    const timeString = getTimeString();
    // Title for type: "Milestone" or "Phase"
    const hasType = displayedPhase.type;
    const typeTitle = hasType && uppercaseFirstLetter(displayedPhase.type);
    // Hide title if the overview is currently shown
    const isPhase = displayedPhase.type === DisplayType.phase;
    const isShowingOverview = displayedPhase?.data?.name === overview.name;
    const hideTitle = isPhase && isShowingOverview;
    // Title of the current milestone or phase
    const title = hideTitle ? '' : `${typeTitle}: ${displayedPhase?.data?.name}`;

    return (
      <>
        {browserHasLoaded ? (
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
        ) : null}
        <WindowThreeStates
          title={overview.name}
          acceptedStyles={['PANE']}
          defaultStyle='PANE'
          closeCallback={() => setPopoverVisibility(false)}
          sizeCallback={setSize}
        >
          <div style={{ height: size.height, overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <Button onClick={() => setPhaseManually({ type: DisplayType.phase, data: overview })}>
                Overview
              </Button>
              <Button
                onClick={() => setDisplayCurrentPhase((lastValue) => !lastValue)}
                className={displayCurrentPhase ? styles.selectedButton : null}
              >
                Current Phase
              </Button>
            </div>
            <div style={{ padding: '10px' }}>
              {displayedPhase.data ? (
                <>
                  <p>{title}</p>
                  <p style={{ color: 'darkgray' }}>{timeString}</p>
                  <p style={{ paddingBottom: '15px' }}>
                    <br />
                    {displayedPhase.data?.description}
                  </p>
                  {displayedPhase.data?.link && (
                    <Button onClick={() => openUrl(displayedPhase.data.link)}>Read more</Button>
                  )}
                  {displayedPhase.data?.image && (
                    <img
                      style={{
                        width: '100%',
                        padding: '20px 5px',
                        maxWidth: window.innerWidth * 0.25
                      }}
                      src={displayedPhase.data.image}
                      alt=''
                    />
                  )}
                </>
              ) : (
                <CenteredLabel>No current phase in this mission</CenteredLabel>
              )}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexDirection: 'column',
                  padding: '10px 0px'
                }}
              >
                {createTimeButtons()}
                {nextCapture() && (
                  <SetTimeButton name='Set Time to Next Capture' onClick={jumpToNextCapture} />
                )}
                {lastCapture() && (
                  <SetTimeButton name='Set Time to Last Capture' onClick={jumpToLastCapture} />
                )}
              </div>
              {currentActions.map((action) => (
                <ActionsButton key={action.identifier} action={action} />
              ))}
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
          refKey='Missions'
          className={`${popoverVisible && Picker.Active}`}
          onClick={togglePopover}
        >
          <MdRocketLaunch className={Picker.Icon} alt='Missions' />
        </Picker>
      </div>
      {popoverVisible && popover()}
    </>
  );
}
