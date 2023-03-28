import React from 'react';
import { useSelector } from 'react-redux';
import WindowThreeStates from '../SkyBrowser/WindowThreeStates/WindowThreeStates';
import * as d3 from 'd3';
import styles from './missions.scss';
import { ActionsButton } from '../ActionsPanel';
import Button from '../../common/Input/Button/Button';
import Picker from '../Picker';
import { useLocalStorageState } from '../../../utils/customHooks';
import { Icon } from '@iconify/react';

function Timeline({
  fullWidth,
  fullHeight,
  timeRange,
  currentPhases,
  now,
  setDisplayedPhase,
  displayedPhase
}) {
  const [k, setK] = React.useState(1);
  const [y, setY] = React.useState(0);

  const nestedLevels = currentPhases?.length ?? 0;
  // Set the dimensions and margins of the graph
  const margin = { top: 10, right: 10, bottom: 60, left: 60 };
  const width = fullWidth;
  const height = fullHeight;
  const radius = 2;

  const svgRef = React.useRef();
  const xAxisRef = React.useRef();
  const yAxisRef = React.useRef();
  const rectRef = React.useRef();

  // Calculate scaling for x and y
  const xScale = d3.scaleLinear().range([margin.left, width - margin.right]).domain([0, nestedLevels]);
  let yScale = d3.scaleTime().range([height - margin.bottom, margin.top]).domain(timeRange);

   // Calculate axes
  const xAxis = d3.axisTop()
    .scale(xScale)
    .tickFormat(d => ``)
    .tickSize(0)
    .ticks(nestedLevels)

  const yAxis = d3.axisLeft()
    .scale(yScale)
  
  // Axes
  React.useEffect(() => {
    // Change axes on DOM with refs
    d3.select(xAxisRef.current).call(xAxis);
    d3.select(yAxisRef.current).call(yAxis);

    d3.select(yAxisRef.current).selectAll(".tick text")
    .style("font-size", "1.3em")
    .style("font-family", "Segoe UI")
    
    d3.select(xAxisRef.current).selectAll(".tick line").attr("stroke", 'grey');
  },[]);

  // Add zoom
  React.useEffect(() => {
    const zoom = d3.zoom().on("zoom", (event) => {
      const newScaleY = event.transform.rescaleY(yScale); 
      d3.select(yAxisRef.current).call(yAxis.scale(newScaleY));
      setK(event.transform.k);
      setY(event.transform.y);
    })
      .scaleExtent([1, 1000])
      .translateExtent([[0, 0], [width, height]]);;
    d3.select(svgRef.current).call(zoom);
  }, []);

  function createRectangle(phase, nestedLevel, padding = 0, color = undefined) {
    const timeRange = [new Date(phase.timerange?.start), new Date(phase.timerange?.end)];
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
        height={yScale(timeRange[0]) - yScale(timeRange[1]) + ( 2 * paddingY)}
        width={xScale(1) - xScale(0) + ( 2 * padding )}
        key={`${key}${timeRange[0].toString()}${timeRange[1].toString()}${color}`}
        onClick={() => setDisplayedPhase(phase)}
        style={color ? { fill : 'white', opacity: 1.0 } : null}
      />
    );
  }

  function createCurrentTimeIndicator() {
    return (
      <rect
        x={margin.left}
        y={yScale(now)}
        className="bar-filled"
        height={3/k}
        width={width - margin.left - margin.right}
        fill={'white'}
      />
    )
  }

  const clipMargin = { top: margin.top, bottom: window.innerHeight - margin.bottom };
  let selectedPhase = null;
  let selectedPhaseIndex = 0;
  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        right: 350,
        clipPath: `polygon(0% ${clipMargin.top}px, 100% ${clipMargin.top}px, 100% ${clipMargin.bottom}px, 0% ${clipMargin.bottom}px`
      }}
    >
      <g style={{ clipPath: 'none'}}>
        <g ref={xAxisRef} transform={`translate(0, ${height - margin.bottom})`} />
        <g ref={yAxisRef} transform={`translate(${margin.left}, ${0})`} />
      </g>
      <g ref={rectRef} transform={`translate(0, ${y})scale(1, ${k})`}>
        {currentPhases?.map((phase, index) => {
          return phase.map(phase => {
            if (!phase.timerange?.start || !phase.timerange?.end) {
              return null;
            }
            if (phase.name === displayedPhase.name) {
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
          {createRectangle(selectedPhase, selectedPhaseIndex, 2, 'white')}
          {createRectangle(selectedPhase, selectedPhaseIndex)}
        </>: null}
      </g>
      <g transform={`translate(0, ${y})scale(1, ${k})`}>
        {createCurrentTimeIndicator()}
      </g>
    </svg>
  );
}

export default function Missions({}) {
  const [popoverVisible, setPopoverVisibility] = useLocalStorageState('missionsPanelVisible', true);
  const missions = useSelector((state) => state.missions);
  const allActions = useSelector((state) => state.shortcuts?.data?.shortcuts);
  const luaApi = useSelector((state) => state.luaApi);
  const now = useSelector((state) => state.time.time);
  const [overview, setOverview] = React.useState(missions?.data?.missions[0]);
  const [displayedPhase, setDisplayedPhase] = React.useState(overview);

  const timeRange = [new Date(missions.data.missions[0].timerange.start), new Date(missions.data.missions[0].timerange.end)];
  const years = Math.abs(timeRange[0].getUTCFullYear() - timeRange[1].getUTCFullYear()); 
  const allPhasesNested = React.useRef(null);
  const setTimeAction = React.useRef(null);
  
  let actions = [];
  displayedPhase.actions.map(action => {
    if (allActions) {
      const found = allActions?.find(item => item.identifier === action)
      if (found) {
        actions.push(found);
      }
    }
  }
  );
  console.log(actions);

  React.useEffect(() => {
    let phases = [];
    findAllPhases(phases, missions.data.missions[0].phases, 0);
    allPhasesNested.current = phases;
  }, [missions.data]);

  function findAllPhases(phaseArray, phases, nestedLevel) {
    if (!Boolean(phaseArray?.[nestedLevel])) {
      phaseArray.push(phases);
    }
    else {
      phaseArray[nestedLevel].push(...phases);
    }
    phases.map(phase => {
      if (phase?.phases && phase.phases.length > 0) {
        findAllPhases(phaseArray, phase.phases, nestedLevel + 1);
      }
    });
  }

  function setPhaseToCurrent() {
    const flatAllPhases = allPhasesNested.current.flat();
    const filteredPhases = flatAllPhases.filter(mission => {
      return Date.parse(now) < Date.parse(mission.timerange.end) &&
        Date.parse(now) > Date.parse(mission.timerange.start)
    });
    setDisplayedPhase(filteredPhases.pop());
  }
  
  function popover() {

    return (
      <>
      <Timeline
        fullWidth={120}
        fullHeight={window.innerHeight}
        timeRange={timeRange}
        currentPhases={allPhasesNested.current}
        now={new Date(now)}
        setDisplayedPhase={setDisplayedPhase}
        displayedPhase={displayedPhase}
        />
      <WindowThreeStates
        title={overview.name}
        heightCallback={(size) => size}
        acceptedStyles={["PANE"]}
        defaultStyle={"PANE"}
        closeCallback={() => setPopoverVisibility(false)}
        > 
        <div style={{ display: 'flex', justifyContent: 'space-around'}}>
          <Button onClick={() => setDisplayedPhase(overview) }>{"Mission Overview"}</Button>
          <Button onClick={setPhaseToCurrent}>{"Current Phase"}</Button>
        </div>
        <div style={{ padding: '10px'}}>
          <p>
            {displayedPhase.description}
          </p>
            {displayedPhase.media.image &&
              <img style={{ width: '100%', padding: '20px 5px' }} src={displayedPhase.media.image} />
            }
            <header className={styles.title}>
              {"Actions"}
            </header>
            {actions.map(action => <ActionsButton action={action} arg={{ time: displayedPhase.timerange.start }} />)}
        </div>
      </WindowThreeStates>
    </>
    );
  }

  function togglePopover() {
    setPopoverVisibility(lastValue => !lastValue);
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