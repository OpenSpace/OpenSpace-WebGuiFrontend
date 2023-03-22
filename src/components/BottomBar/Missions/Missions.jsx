import React from 'react';
import { useSelector } from 'react-redux';
import WindowThreeStates from '../SkyBrowser/WindowThreeStates/WindowThreeStates';
import * as d3 from 'd3';

function Timeline({ fullWidth, fullHeight }) {
  // Set the dimensions and margins of the graph
  const margin = { top: 10, right: 10, bottom: 25, left: 50 };
  const width = fullWidth - margin.left - margin.right;
  const height = fullHeight - margin.top - margin.bottom;

  const xAxisRef = React.useRef();
  const yAxisRef = React.useRef();

  // Calculate scaling for x and y
  let xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
  let yScale = d3.scaleTime().range([height - margin.bottom, margin.top]);

  xScale.domain([0, 20]);
  yScale.domain([0, 100]);

  // Calculate axes
  const xAxis = d3.axisTop()
    .scale(xScale)
    .tickFormat(d => ``)
    .tickSize(height - margin.top - margin.bottom);

  const yAxis = d3.axisLeft()
    .scale(yScale)
    .tickFormat(d3.utcFormat('%Y'))
  
  // Change axes on DOM with refs
  d3.select(xAxisRef.current).call(xAxis);
  d3.select(yAxisRef.current).call(yAxis);

  return (
    <svg width={width} height={height} style={{ position: 'absolute', top: 0, right: 350 }}>
      <g>
        <g ref={xAxisRef} transform={`translate(0, ${height - margin.bottom})`} />
        <g ref={yAxisRef} transform={`translate(${margin.left}, 0)`}/>
      </g>
    </svg>
  );
}

export default function Missions(closeCallback) {
  const missions = useSelector((state) => state.missions);
  const now = useSelector((state) => state.time.time);
  const timeRange = { start: new Date(missions.data.missions[0].timerange.start), end: new Date(missions.data.missions[0].timerange.end) };
  const years = Math.abs(timeRange.start.getUTCFullYear() - timeRange.end.getUTCFullYear()); 
  console.log(Math.abs(timeRange.start.getUTCFullYear() - timeRange.end.getUTCFullYear()));

  let currentPhases = [];

  missions.data.missions[0].timerange.start

  //console.log(new Date(missions.data.missions[0].timerange.start))
  //console.log(new Date(now))

  return (
    <>
      <Timeline
        fullWidth={150}
        fullHeight={window.innerHeight}
      />
      <WindowThreeStates
        title={missions.data.missions[0].name}
        heightCallback={(size) => console.log(size)}
        acceptedStyles={["PANE"]}
        defaultStyle={"PANE"}
        closeCallback={() => closeCallback()}
      > 
        
      <div style={{ padding: '10px'}}>
        <p>
          {missions.data.missions[0].description}
        </p>
        <p>
          {`Missions length: ${years} years`}
        </p>
        <img style={{ width: '100%' }} src={missions.data.missions[0].media.image} />
      </div>
    </WindowThreeStates>
  </>
  );
}