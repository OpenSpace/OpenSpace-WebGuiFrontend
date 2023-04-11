import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subscribeToTime, unsubscribeToTime } from '../../../api/Actions';
import WindowThreeStates from '../SkyBrowser/WindowThreeStates/WindowThreeStates';
import * as d3 from 'd3';
import styles from './missions.scss';
import { ActionsButton } from '../ActionsPanel';
import Button from '../../common/Input/Button/Button';
import Picker from '../Picker';
import { useLocalStorageState } from '../../../utils/customHooks';
import { Icon } from '@iconify/react';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import Tooltip from '../../common/Tooltip/Tooltip';

const DisplayType = {
  phase: "phase",
  importantDate: "importantDate"
};

function makeUtcDate(time) {
  if (!time) {
    return null;
  }
  const utcString = time.includes("Z") ? time : `${time}Z`;
  return new Date(utcString);
}

function Arrow({ x, y, rotation, onClick, width = 20 }) {
  const paddingFactor = rotation === 90 ? 1 : -1;
  return (
    <polygon
      points={`0,0 ${width}, ${width * 0.5} 0, ${width} ${width * 0.2}, ${width * 0.5}`}
      className={styles.arrow}
      transform={`translate(${x + (0.5 * width * paddingFactor)}, ${y})rotate(${rotation})`}
      onClick={onClick}
    />
  );
}

function Timeline({
  fullWidth,
  fullHeight,
  timeRange,
  currentPhases,
  now,
  setDisplayedPhase,
  displayedPhase,
  captureTimes,
  panelWidth, 
  importantDates,
  jumpToTime
}) {
  const [k, setK] = React.useState(1); // Scale, d3 notation
  const [y, setY] = React.useState(0); // Translation, d3 notation
  // Tooltip
  const [showToolTip, setShowToolTip] = React.useState(false);
  const [toolTipData, setToolTipData] = React.useState({ title: "", text: ""});
  const [toolTipPosition, setToolTipPosition] = React.useState([0,0]);
  // Depth of nesting for phases
  const nestedLevels = currentPhases?.length ?? 0;

  // Set the dimensions and margins of the graph
  const margin = { top: 0, right: 10, bottom: 70, left: 60 };
  const minLevelWidth = 15;
  const minWidth = (minLevelWidth * nestedLevels) + margin.left + margin.right;
  //const timelinePadding = 5;
  const zoomButtonHeight = 40;
  const height = fullHeight - zoomButtonHeight;
  const width = Math.max(fullWidth, minWidth);
  //const clipMargin = { top: margin.top - timelinePadding, bottom: height - margin.bottom + timelinePadding };
  const importantDatePadding = 10;
  const radius = 2;
  const arrowPadding = 25;
  const scaleExtent = [ 1, 1000 ];
  const translateExtent = [[0, 0], [width, height]];
  // Refs
  const svgRef = React.useRef();
  const xAxisRef = React.useRef();
  const yAxisRef = React.useRef();
  const timeIndicatorRef = React.useRef();
  const zoomRef = React.useRef();

  // Calculate scaling for x and y
  const xScale = d3.scaleLinear().range([margin.left, width - margin.right]).domain([0, nestedLevels]);
  let yScale = d3.scaleUtc().range([height - margin.bottom, margin.top]).domain(timeRange);

  // Calculate axes
  const xAxis = d3.axisTop()
    .scale(xScale)
    .tickFormat(d => ``)
    .tickSize(0)
    .ticks(nestedLevels);
  let yAxis = d3.axisLeft().scale(yScale); // Y axis will change
  
  // On mount, style axes
  React.useEffect(() => {
    // Change axes on DOM with refs
    d3.select(xAxisRef.current).call(xAxis);
    d3.select(yAxisRef.current).call(yAxis);

    d3.select(yAxisRef.current).selectAll(".tick text")
      .style("font-size", "1.3em")
      .style("font-family", "Segoe UI")
    
    d3.select(xAxisRef.current).selectAll(".tick line").attr("stroke", 'grey');
  }, []);

  // When height changes of window, rescale y axis
  React.useEffect(() => {
    // Update the axis every time window rescales 
    yScale = d3.scaleUtc().range([height - margin.bottom, margin.top]).domain(timeRange);
    yAxis = d3.axisLeft().scale(yScale);
    d3.select(yAxisRef.current).call(yAxis);
  }, [height]);

  // Add zoom
  // Update zoom function every time the y scale changes (when window is resized)
  React.useEffect(() => {
    zoomRef.current = d3.zoom().on("zoom", (event) => {
      const newScaleY = event.transform.rescaleY(yScale);
      d3.select(yAxisRef.current).call(yAxis.scale(newScaleY));
      setK(event.transform.k);
      setY(event.transform.y);
    })
      .scaleExtent(scaleExtent)
      .translateExtent(translateExtent);
    d3.select(svgRef.current).call(zoomRef.current);
  }, [yScale]);

  // Zooming function for transition
  function interpolateZoom(scale = 1, centerCurrentTime = true) {
    const cappedScale = Math.max(Math.min(scaleExtent[1], scale), scaleExtent[0]);
    const scaledCenterOfHeight = (height * 0.5) / (cappedScale);
    const currentTimeY = yScale(now) - scaledCenterOfHeight;
    const currentCenterY = ((-y + (height * 0.5)) / k) - scaledCenterOfHeight;
    const newY = centerCurrentTime ? currentTimeY : currentCenterY;
    const cappedTranslation = Math.max(Math.min(translateExtent[1][1], newY), translateExtent[0][1]);
    const transform = d3.zoomIdentity.scale(cappedScale).translate(1, -cappedTranslation);
    d3.select(svgRef.current).transition().call(zoomRef.current.transform, transform);
  };

  function onClick(event, time) {
    if (event.shiftKey) {
      jumpToTime(now, time);
    }
  }

  function mouseOver(e, title, value) {
    setToolTipData({ title, value });
    setShowToolTip(true);
    setToolTipPosition([e.clientX, e.clientY])
  }

  function mouseLeave() {
    setShowToolTip(false);
  }

  // Used for phases
  function createRectangle(phase, nestedLevel, noBorder = false, padding = 0, color = undefined) {
    if (!phase?.timerange) {
      return null;
    }
    const timeRange = [makeUtcDate(phase.timerange?.start), makeUtcDate(phase.timerange?.end)];
    const key = phase.name;
    const isCurrent = Date.parse(now) < Date.parse(timeRange[1]) &&
      Date.parse(now) > Date.parse(timeRange[0]);
    const paddingY = padding / k;
    return (
      <rect
        x={xScale(nestedLevels - nestedLevel - 1) - padding}
        y={yScale(timeRange[1]) - (paddingY)}
        ry={radius / k}
        rx={radius}
        className={isCurrent ? styles.barHighlighted : styles.bar}
        height={yScale(timeRange[0]) - yScale(timeRange[1]) + (2 * paddingY)}
        width={xScale(1) - xScale(0) + (2 * padding)}
        key={`${key}${timeRange[0].toString()}${timeRange[1].toString()}${color}`}
        onClick={(e) => {
          setDisplayedPhase({ type: DisplayType.phase, data: phase });
          onClick(e, timeRange[0]);
        }}
        style={color ? { fill: 'white', opacity: 1.0 } : null}
        stroke={'black'}
        strokeWidth={noBorder ? 0 : 0.5}
        onMouseOver={(e) => mouseOver(e, "Phase", phase.name)}
        onMouseLeave={mouseLeave}
      />
    );
  }

  // Used for instantaneous times such as current time or capture times 
  function createLine(time, color, ref) {
    // Check so time is valid
    if (!(time instanceof Date && !isNaN(time))) {
      return null;
    }
    const lineWidth = 3 / k;
    const yPosition = yScale(time) - (lineWidth * 0.5);
    return (
      <rect
        key={time.toUTCString()}
        ref={el => ref ? ref.current = el : null}
        x={margin.left}
        y={yPosition}
        height={lineWidth}
        width={width - margin.left - margin.right}
        fill={color}
        stroke={'black'}
        strokeWidth={0.5/k}
      />
    )
  }

  // Used for instantaneous times such as current time or capture times 
  function createCircle(time, color, ref) {
    return (
      <ellipse 
        key={time?.toUTCString()}
        ref={el => ref ? ref.current = el : null}
        cx={margin.left}
        cy={yScale(time)}
        ry={3 / k}
        rx={3}
        fill={color}
        onClick={(e) => onClick(e, time)}
        className={styles.capture}
        onMouseOver={(e) => mouseOver(e, "Instrument Activity")}
        onMouseLeave={mouseLeave}
      />
    )
  }

  function createPolygon(date, color = undefined, noBorder = false, padding = 0) {
    const time = makeUtcDate(date.date);
    const width = 12 + (2 * padding);
    const y = yScale(time) - (width * 0.5 / k);
    const x = margin.left - width;
    return (
      <polygon
        points={`0,${width * 0.5} ${width * 0.5},${width} ${width},${width * 0.5} ${width * 0.5},0`}
        transform={`translate(${x + (0.5 * width)}, ${y})scale(1, ${1/k})`}
        fill={color}
        stroke={'black'}
        strokeWidth={noBorder ? 0 : 0.5}
        key={`${time.toUTCString()}${padding}${color}`}
        onClick={(e) => {
          onClick(e, time);
          setDisplayedPhase({ type: DisplayType.importantDate, data: date });
        }}
        onMouseOver={(e) => mouseOver(e, "Important date", date.name)}
        onMouseLeave={mouseLeave}
        className={styles.polygon}
      />
    )
  }

  function createCurrentTimeArrow() {
    const pixelPosition = timeIndicatorRef.current?.getBoundingClientRect()?.y;
    // Before the boundingrect is initialized properly it returns 0
    if (!timeIndicatorRef.current || pixelPosition === 0) {
      return null;
    }
    const center = ((fullWidth - margin.left - margin.right) * 0.5) + margin.left;
    const isAtTop = pixelPosition < (margin.top + zoomButtonHeight);
    const isAtBottom = pixelPosition > window.innerHeight - margin.bottom;

    if (isAtTop) {
      return (
        <Arrow
          x={center}
          y={margin.top + arrowPadding}
          rotation={-90}
          onClick={() => interpolateZoom(k)}
        />
      );
    }
    else if (isAtBottom) {
      return (
        <Arrow
          x={center}
          y={height - (margin.bottom + arrowPadding)}
          rotation={90}
          onClick={() => interpolateZoom(k)}
        />
      );
    }
    return null;
  }

  // Store the selected phase for later rendering
  let selectedPhase = null;
  let selectedDate = null;
  let selectedPhaseIndex = 0;

  const polygonPadTop = margin.top - importantDatePadding;
  const polygonPadBottom = height - margin.bottom + (2 * importantDatePadding);

  const tooltipStyling = {
    display: showToolTip ? 'block' : 'none',
    top: toolTipPosition[1], left: toolTipPosition[0] - 120,
    marginRight: 10,
    width: 100

  };
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: panelWidth,
          display: 'flex',
          width: width,
          height: zoomButtonHeight,
          justifyContent: 'right',
          padding: '10px 12px 8px 8px ',
          gap: '10px'
        }}
      >
        <Button onClick={() => interpolateZoom(Math.floor(Math.sqrt(k - 1)), false)} style={{ margin: 0, padding: 0 }}>
          <Icon icon={"mi:zoom-out"} color={"white"} alt={"zoom-in"} style={{ fontSize: '1.5em' }}/>
        </Button>
        <Button onClick={() => interpolateZoom(Math.pow(k + 1, 2), false)} style={{ margin: 0, padding: 0 }}>
          <Icon icon={"mi:zoom-in"} color={"white"} alt={"zoom-out"} style={{ fontSize: '1.5em' }}/>
        </Button>
        <Button onClick={() => interpolateZoom(1, false)} style={{ margin: 0, padding: 0 }}>
          <Icon icon={"fluent:full-screen-zoom-24-filled"} color={"white"} alt={"full-view"} style={{ fontSize: '1.5em' }}/>
        </Button>
      </div>
      <Tooltip fixed placement={"left"} className={styles.toolTip} style={tooltipStyling}>
        <p style={{ fontWeight: 'bold' }}>{toolTipData.title}</p>
        <p>{toolTipData.value}</p>
      </Tooltip>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          top: zoomButtonHeight - importantDatePadding,
          right: panelWidth,
          clipPath: `polygon(0% ${polygonPadTop}px, 100% ${polygonPadTop}px, 100% ${polygonPadBottom}px, 0% ${polygonPadBottom}px`,
        }}
      >
        <g transform={`translate(0, ${importantDatePadding})`}>
          <g style={{ clipPath: 'none'}}>
            <g ref={xAxisRef} transform={`translate(0, ${height - margin.bottom})`} />
            <g ref={yAxisRef} transform={`translate(${margin.left}, ${0})`} />
          </g>
          <g transform={`translate(0, ${y})scale(1, ${k})`}>
            {currentPhases?.map((phase, index) => {
              return phase.map(phase => {
                if (!phase.timerange?.start || !phase.timerange?.end) {
                  return null;
                }
                if (displayedPhase.type === DisplayType.phase && phase.name === displayedPhase.data.name) {
                  // We want to draw the selected phase last
                  // Save for later
                  selectedPhase = phase;
                  selectedPhaseIndex = index;
                  return null;
                }
                return createRectangle(phase, index)
              })
            }
            )}
            {selectedPhase ? <>
              {createRectangle(selectedPhase, selectedPhaseIndex, true, 2, 'white')}
              {createRectangle(selectedPhase, selectedPhaseIndex, true)}
            </> : null}
          </g>
          <g transform={`translate(0, ${y})scale(1, ${k})`}>
            {createLine(now, 'white', timeIndicatorRef)}
            {captureTimes?.map(capture => createCircle(makeUtcDate(capture), 'rgba(255, 255, 0, 0.8)'))}
            {importantDates?.map(date => {
              if (displayedPhase.type === DisplayType.importantDate && date.name === displayedPhase.data.name) {
                // We want to draw the selected phase last
                // Save for later
                selectedDate = date;
                return null;
              }
              return createPolygon(date, 'rgba(255, 150, 0, 1)');
            })}
            {selectedDate ? <>
              {createPolygon(selectedDate, 'white', true, 3)}
              {createPolygon(selectedDate, 'rgba(255, 150, 0, 1)', true)}
            </> : null}
          </g>
          {createCurrentTimeArrow()}
        </g>
      </svg>
    </>
  );
}

function SetTimeButton({onClick, name, documentation}) {
  return (
    <Button
      block
      smalltext
      onClick={onClick}
    >
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
  const [wholeTimeRange, setWholeTimeRange] = React.useState(
    [new Date(missions.data.missions[0].timerange.start), new Date(missions.data.missions[0].timerange.end)]
  );

  const allPhasesNested = React.useRef(null);
  const topBarHeight = 30;

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(subscribeToTime());
    return () => dispatch(unsubscribeToTime());
  }, []);

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
      if (allActions) {
        const found = allActions?.find(item => item.identifier === action)
        if (found) {
          result.push(found);
        }
      }
    });
  }

  // Locate the next instrument activity capture
  function nextCapture() {
    let nextFoundCapture;
    // Assume the captures are sorted w regards to time
    for (let i = 0; i < overview.capturetimes.length; i++) {
      const capture = overview.capturetimes[i];
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
    for (let i = overview.capturetimes.length - 1; i > 0; i--) {
      const capture = overview.capturetimes[i];
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

  function popover() {
    return (
      <>
      <Timeline
        fullWidth={120}
        fullHeight={window.innerHeight}
        timeRange={wholeTimeRange}
        currentPhases={allPhasesNested.current}
        captureTimes={overview.capturetimes}  
        now={now}
        setDisplayedPhase={setDisplayedPhase}
        displayedPhase={displayedPhase}
        panelWidth={size.width}
        importantDates={overview?.importantDates}
        jumpToTime={jumpToTime}
      />
      <WindowThreeStates
        title={overview.name}
        sizeCallback={sizeCallback}
        acceptedStyles={["PANE"]}
        defaultStyle={"PANE"}
        closeCallback={() => setPopoverVisibility(false)}
        > 
        <div style={{ height: size.height - topBarHeight, overflow: 'auto'}}>
          <div style={{ display: 'flex', justifyContent: 'space-around'}}>
            <Button onClick={() => setDisplayedPhase({ type: DisplayType.phase, data: overview }) }>{"Mission Overview"}</Button>
            <Button onClick={setPhaseToCurrent}>{"Current Phase"}</Button>
          </div>
            <div style={{ padding: '10px' }}>
              {displayedPhase.type === DisplayType.phase ?
                <>
                  <p>{displayedPhase?.data?.name !== overview.name && `Phase: ${displayedPhase?.data?.name}`}</p>
                  <p style={{ color: 'darkgray'}}>
                    {`${new Date(displayedPhase.data.timerange.start).toDateString()} `}
                    {`- ${new Date(displayedPhase.data.timerange.end).toDateString()}`}
                  </p>
                  <p style={{ paddingBottom: '15px'}}>
                    <br />
                    {displayedPhase.data.description}
                  </p>
                  {displayedPhase.data.media.link &&
                    <Button onClick={() => openUrl(displayedPhase.data.media.link)}>{"Read more"}</Button>
                  }
                  {displayedPhase.data.media.image &&
                    <img style={{ width: '100%', padding: '20px 5px', maxWidth: window.innerWidth * 0.25 }} src={displayedPhase.data.media.image} />
                  }
                </>
                :
                displayedPhase.type === DisplayType.importantDate ?
                  <>
                  <p>{`Important date: ${displayedPhase?.data?.name}`}</p>
                  <p style={{ color: 'darkgray'}}>
                    {`${new Date(displayedPhase.data.date).toDateString()} `}
                  </p>
                  <p style={{ paddingBottom: '15px'}}>
                    <br />
                    {displayedPhase.data.description}
                  </p>
                  {displayedPhase.data.link &&
                    <Button onClick={() => openUrl(displayedPhase.data.link)}>{displayedPhase.data.link}</Button>
                  }
                  {displayedPhase.data.image &&
                    <img style={{ width: '100%', padding: '20px 5px', maxWidth: window.innerWidth * 0.25 }} src={displayedPhase.data.image} />
                  }
                </> 
                :
                <CenteredLabel>{"No current phase in this mission"}</CenteredLabel>
              }
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', padding: '10px 0px' }}>
                {displayedPhase.type === DisplayType.phase ? 
                    <>
                      <SetTimeButton name={`Set Time to End of ${displayedPhase.data === overview ? "Mission" : "Phase"}`} onClick={jumpToEndOfPhase} />
                      <SetTimeButton name={`Set Time to Beginning of ${displayedPhase.data === overview ? "Mission" : "Phase"}`} onClick={jumpToStartOfPhase} />
                    </>
                  :
                  displayedPhase.type === DisplayType.importantDate ?
                      <SetTimeButton name={"Set Time"} onClick={jumpToDate} />
                  : 
                    <>
                    </>
                }
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