import React from 'react';
import { useSelector } from 'react-redux';
import WindowThreeStates from '../SkyBrowser/WindowThreeStates/WindowThreeStates';
import * as d3 from 'd3';
import styles from './missions.scss';

const colors = [
  'green', 'purple', 'pink', 'red', 'cyan', 'magenta', 'yellow'
];

function Timeline({ fullWidth, fullHeight, timeRange, currentPhases, now, setDisplayedPhase }) {
  const [k, setK] = React.useState(1);
  const [y, setY] = React.useState(0);

  const nestedLevels = currentPhases?.length ?? 0;
  // Set the dimensions and margins of the graph
  const margin = { top: 10, right: 10, bottom: 25, left: 50 };
  const width = fullWidth - margin.left - margin.right;
  const height = fullHeight - margin.top - margin.bottom;

  const svgRef = React.useRef();
  const xAxisRef = React.useRef();
  const yAxisRef = React.useRef();

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
    .tickFormat(d3.utcFormat('%Y'))
  
  React.useEffect(() => {
    // Change axes on DOM with refs
    console.log("set initial scaling")
    d3.select(xAxisRef.current).call(xAxis);
    d3.select(yAxisRef.current).call(yAxis);

    d3.select(yAxisRef.current).selectAll(".tick text")
    .style("font-size", "1.3em")
    .style("font-family", "Segoe UI")
    
    d3.select(xAxisRef.current).selectAll(".tick line").attr("stroke", 'grey');
  },[]);

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

  function createRectangle(phase, nestedLevel) {
    const timeRange = [new Date(phase.timerange?.start), new Date(phase.timerange?.end)];
    const key = phase.name;
    const isCurrent = Date.parse(now) < Date.parse(timeRange[1]) &&
      Date.parse(now) > Date.parse(timeRange[0]); 
    
    return (
      <rect
        x={xScale(nestedLevels - nestedLevel - 1)}
        y={yScale(timeRange[1])}
        className={isCurrent ? styles.barHighlighted : styles.bar}
        height={yScale(timeRange[0]) - yScale(timeRange[1])}
        width={xScale(1) - xScale(0)}
        key={`${key}${timeRange[0].toString()}${timeRange[1].toString()}`}
        onClick={() => setDisplayedPhase(phase)}
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

  return (
    <svg ref={svgRef} width={width} height={height} style={{ position: 'absolute', top: 0, right: 350 }}>
      <g>
        <g ref={xAxisRef} transform={`translate(0, ${height - margin.bottom})`} />
        <g ref={yAxisRef} transform={`translate(${margin.left}, ${0})`} />
      </g>
      <g transform={`translate(0, ${y})scale(1, ${k})`}>
        {currentPhases?.map((phase, index) => {
          return phase.map(phase => {
            if (!phase.timerange?.start || !phase.timerange?.end) {
              return null;
            }
            return createRectangle(phase, index)
          })
        }
        )}
      </g>
      <g transform={`translate(0, ${y})scale(1, ${k})`}>
        {createCurrentTimeIndicator()}
      </g>
    </svg>
  );
}

export default function Missions(closeCallback) {
  const missions = useSelector((state) => state.missions);
  const now = useSelector((state) => state.time.time);
  const timeRange = [new Date(missions.data.missions[0].timerange.start), new Date(missions.data.missions[0].timerange.end)];
  const years = Math.abs(timeRange[0].getUTCFullYear() - timeRange[1].getUTCFullYear()); 
  const currentPhases = React.useRef(null);
  const [displayedPhase, setDisplayedPhase] = React.useState(missions.data.missions[0]);

  React.useEffect(() => {
    let phases = [];
    findAllPhases(phases, missions.data.missions[0].phases, 0);
    currentPhases.current = phases;
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

  return (
    <>
      <Timeline
        fullWidth={150}
        fullHeight={window.innerHeight}
        timeRange={timeRange}
        currentPhases={currentPhases.current}
        now={new Date(now)}
        setDisplayedPhase={setDisplayedPhase}
      />
      <WindowThreeStates
        title={displayedPhase.name}
        heightCallback={(size) => console.log(size)}
        acceptedStyles={["PANE"]}
        defaultStyle={"PANE"}
        closeCallback={() => closeCallback()}
      > 
      <div style={{ padding: '10px'}}>
        <p>
          {displayedPhase.description}
        </p>
          {displayedPhase.media.image &&
            <img style={{ width: '100%', padding: '20px 5px' }} src={displayedPhase.media.image} />
          }
      </div>
    </WindowThreeStates>
  </>
  );
}