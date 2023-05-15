import React from 'react';
import * as d3 from 'd3';
import styles from './Timeline.scss';
import Button from '../../common/Input/Button/Button';
import { Icon } from '@iconify/react';
import Tooltip from '../../common/Tooltip/Tooltip';
import { makeUtcDate, DisplayType } from './Missions';

function Arrow({ x, y, orientation, onClick, width = 20 }) {
  // Pad in different directions depending on rotation
  let rotation = 0;
  let centerX = 0;

  if (orientation === "down") {
    rotation = 90;
    centerX = 0.5 * width;
  }
  else if (orientation === "up") {
    centerX = -0.5 * width; // Because svg is rotated, offset is in other direction
    rotation = -90;
  }

  return (
    <polygon
      points={`0,0 ${width}, ${width * 0.5} 0, ${width} ${width * 0.2}, ${width * 0.5}`}
      className={styles.arrow}
      transform={`translate(${x + centerX}, ${y})rotate(${rotation})`}
      onClick={onClick}
    />
  );
}

export default function Timeline({
  captureTimes,
  currentPhases,
  displayedPhase,
  fullHeight,
  fullWidth,
  jumpToTime,
  milestones,
  now,
  panelWidth,
  setDisplayedPhase,
  timeRange
}) {
  // d3 state and translation
  const [k, setK] = React.useState(1); // Scale, d3 notation
  const [y, setY] = React.useState(0); // Translation, d3 notation
  
  // Tooltip
  const [showToolTip, setShowToolTip] = React.useState(false);
  const [toolTipData, setToolTipData] = React.useState({ title: "", text: "" });
  const [toolTipPosition, setToolTipPosition] = React.useState([0, 0]);
  
  // Depth of nesting for phases
  const nestedLevels = currentPhases?.length ?? 0;

  // Set the dimensions and margins of the graph
  const margin = { top: 0, right: 10, bottom: 70, left: 60 };
  const minLevelWidth = 15; // Minimum width of a phase
  const minWidth = (minLevelWidth * nestedLevels) + margin.left + margin.right; // Ensure graph is large enough to show all phases
  const zoomButtonHeight = 40; // Height of buttons that control zoom
  const height = fullHeight - zoomButtonHeight; // Height of graph
  const width = Math.max(fullWidth, minWidth); // Width of graph
  const scaleExtent = [1, 1000]; // Min and max scale
  const translateExtent = [[0, 0], [width, height - margin.bottom]]; // Min and max translation
  const paddingGraph = 10; // How many pixels over and below graph will still show content
  const arrowOffsetY = 25; // "Padding" for the arrow - how far away from the edge it is displayed
  const radiusPhase = 2; // Radius for the rectangles that represent phases
  const transitionTime = 750; // Milliseconds
  
  // Styling
  const milestoneColor = 'rgba(255, 150, 0, 1)';
  const captureColor = 'rgba(255, 255, 0, 0.8)';
  const selectedBorder = 'white';
  const timeIndicatorColor = 'white';
  const borderWidth = 0.5;
  const borderColor = 'black';
  const circleRadius = 3; // Instrument activity
  const lineWidth = 3; // Current time indicator width
  const polygonSize = 12; // Milestone size
  const tooltipWidth = 100;
  const tooltipMargin = 10;

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

  // Refs
  const svgRef = React.useRef();
  const xAxisRef = React.useRef();
  const yAxisRef = React.useRef();
  const timeIndicatorRef = React.useRef();
  const zoomRef = React.useRef();

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
    zoomRef.current = d3.zoom()
      .on("zoom", (event) => {
        const newScaleY = event.transform.rescaleY(yScale);
        d3.select(yAxisRef.current).call(yAxis.scale(newScaleY));
        setK(event.transform.k);
        setY(event.transform.y);
      })
      .scaleExtent(scaleExtent)
      .extent(translateExtent)
      .translateExtent(translateExtent);
    d3.select(svgRef.current).call(zoomRef.current);
  }, [yScale]);

  // Transition to center the current time indicator
  function centerTime() {
    // Calculate new translation
    const centerY = (height * 0.5) / (k);
    const deltaY = centerY - yScale(now);

    // Apply transform 
    const transform = d3.zoomIdentity.scale(k).translate(1, deltaY);
    d3.select(svgRef.current).transition().duration(transitionTime).call(zoomRef.current.transform, transform);
  };

  function reset() {
    d3.select(svgRef.current).transition().duration(transitionTime).call(
      zoomRef.current.transform,
      d3.zoomIdentity,
      d3.zoomTransform(d3.select(svgRef.current).node()).invert([width * 0.5, height * 0.5])
    );
  }

  function zoomByButton(zoomValue) {
    d3.select(svgRef.current).transition().duration(transitionTime).call(zoomRef.current.scaleBy, zoomValue);
  }

  function onClick(event, time) {
    // Shift modifier
    if (event.shiftKey) {
      jumpToTime(now, time);
    }
  }

  // Hover for tooltip
  function mouseOver(e, title, value) {
    setToolTipData({ title, value });
    setShowToolTip(true);
    setToolTipPosition([e.clientX, e.clientY])
  }

  // Hide tooltip
  function mouseLeave() {
    setShowToolTip(false);
  }

  // Used for phases
  // Padding is used for the white rectangle underneath the selected phase
  // It makes the rectangle bigger
  function createRectangle(phase, nestedLevel, padding = 0, color = undefined) {
    if (!phase?.timerange) {
      return null;
    }
    const startTime = makeUtcDate(phase.timerange.start);
    const endTime = makeUtcDate(phase.timerange.end);
    const isCurrent = Date.parse(now) < Date.parse(endTime) && Date.parse(now) > Date.parse(startTime);
    const paddingY = padding / k; // Make sure padding doesn't get stretched when zooming
    const radiusY = radiusPhase / k; // Same here
    return (
      <rect
        key={`${phase.name}${startTime.toString()}${endTime.toString()}${color}`}
        x={xScale(nestedLevels - nestedLevel - 1) - padding}
        y={yScale(endTime) - (paddingY)}
        ry={radiusY}
        rx={radiusPhase}
        height={yScale(startTime) - yScale(endTime) + (2 * paddingY)}
        width={xScale(1) - xScale(0) + (2 * padding)}
        onClick={(e) => {
          setDisplayedPhase({ type: DisplayType.phase, data: phase });
          onClick(e, startTime);
        }}
        onMouseOver={(e) => mouseOver(e, "Phase", phase.name)}
        onMouseLeave={mouseLeave}
        className={isCurrent ? styles.barHighlighted : styles.bar}
        strokeWidth={0}
        style={color ? { fill: color, opacity: 1.0 } : null} // Override stylesheet
      />
    );
  }

  // Used for the current time indicator
  function createLine(time, color, ref) {
    // Check so time is valid
    if (!(time instanceof Date && !isNaN(time))) {
      return null;
    }
    const lineWidthScaled = lineWidth / k; // Ensure line doesn't get stretched when zooming
    const yPosition = yScale(time) - (lineWidthScaled * 0.5); // Center line around time
    return (
      <rect
        key={time.toUTCString()}
        ref={el => ref ? ref.current = el : null}
        x={margin.left}
        y={yPosition}
        height={lineWidthScaled}
        width={width - margin.left - margin.right}
        fill={color}
        stroke={borderColor}
        strokeWidth={borderWidth / k}
      />
    )
  }

  // Used for instrument activity / capture times
  function createCircle(time, color, index) {
    return (
      <ellipse
        key={`${time?.toISOString()}${index}`}
        cx={margin.left}
        cy={yScale(time)}
        ry={circleRadius / k}
        rx={circleRadius}
        fill={color}
        onClick={(e) => onClick(e, time)}
        className={styles.capture}
        onMouseOver={(e) => mouseOver(e, "Instrument Activity")}
        onMouseLeave={mouseLeave}
      />
    )
  }

  // Used for milestones
  function createPolygon(date, color = undefined, noBorder = false, padding = 0) {
    const time = makeUtcDate(date.date);
    const width = polygonSize + (2 * padding);
    const y = yScale(time) - (width * 0.5 / k);
    const x = margin.left - width;
    const centerOffsetX = 0.5 * width;
    // To make the key unique we need to make sure that the time is different for each
    // polygon - the color and padding are added when two polygons are placed at the same
    // time (when it is selected)
    const uniqueKey = `${time.toUTCString()}${padding}${color}`;
    return (
      <polygon
        points={`0, ${width * 0.5} ${width * 0.5}, ${width} ${width}, ${width * 0.5} ${width * 0.5}, 0`}
        transform={`translate(${x + centerOffsetX}, ${y})scale(1, ${1 / k})`}
        fill={color}
        stroke={borderColor}
        strokeWidth={noBorder ? 0 : borderWidth}
        key={uniqueKey}
        onClick={(e) => {
          onClick(e, time);
          setDisplayedPhase({ type: DisplayType.milestone, data: date });
        }}
        onMouseOver={(e) => mouseOver(e, "Milestone", date.name)}
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
    const centerX = ((fullWidth - margin.left - margin.right) * 0.5) + margin.left;
    const isAtTop = pixelPosition <= (margin.top + zoomButtonHeight - paddingGraph);
    const isAtBottom = pixelPosition > window.innerHeight - margin.bottom;
    if (!isAtTop && !isAtBottom) {
      return null;
    }
    const yTop = margin.top + arrowOffsetY;
    const yBottom = height - (margin.bottom + arrowOffsetY);

    return (
      <Arrow
        x={centerX}
        y={isAtTop ? yTop : yBottom}
        orientation={isAtTop ? "up" : "down"}
        onClick={centerTime}
      />
    );
  }

  function createFade(placement) {
    const firstColor = placement === "top" ? 'black' : 'transparent';
    const secondColor = placement === "top" ? 'transparent' : 'black';
    const id = `Gradient${placement}`;
    const yPlacement = placement === "top" ? 0 : height - margin.top - margin.bottom + paddingGraph;
    
    return (
      <>
        <defs>
          <linearGradient id={id} x1={0} x2={0} y1={0} y2={1}>
            <stop stopColor={firstColor} offset={"0%"} />
            <stop stopColor={secondColor} offset={"100%"} />
          </linearGradient>
        </defs>
        <rect
          style={{
            height: paddingGraph + 5,
            width: width - margin.left - margin.right + polygonSize + 5,
            x: margin.left - polygonSize + 3,
            y: yPlacement,
            fill: `url(#${id})`,
            pointerEvents: 'none' 
          }}
        />
      </>
    );
  }

  // Store the selected phase for later rendering
  let selectedPhase = null;
  let selectedMilestone = null;
  let selectedPhaseIndex = 0;
  // Calculate clippath
  const clippathTop = margin.top - paddingGraph;
  const clippathBottom = height - margin.bottom + (2 * paddingGraph);

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
        <Button onClick={() => zoomByButton(0.5)} style={{ margin: 0, padding: 0 }}>
          <Icon icon={"mi:zoom-out"} color={"white"} alt={"zoom-in"} style={{ fontSize: '1.5em' }}/>
        </Button>
        <Button onClick={() => zoomByButton(2)} style={{ margin: 0, padding: 0 }}>
          <Icon icon={"mi:zoom-in"} color={"white"} alt={"zoom-out"} style={{ fontSize: '1.5em' }}/>
        </Button>
        <Button onClick={() => reset()} style={{ margin: 0, padding: 0 }}>
          <Icon icon={"fluent:full-screen-zoom-24-filled"} color={"white"} alt={"full-view"} style={{ fontSize: '1.5em' }}/>
        </Button>
      </div>
      <Tooltip
        fixed
        placement={"left"}
        className={styles.toolTip}
        style={{
          display: showToolTip ? 'block' : 'none',
          top: toolTipPosition[1], left: toolTipPosition[0] - tooltipWidth - (2 * tooltipMargin),
          marginRight: tooltipMargin,
          width: tooltipWidth,
          overflowWrap: 'break-word'
        }}
      >
        <p style={{ fontWeight: 'bold' }}>{toolTipData.title}</p>
        <p>{toolTipData.value}</p>
      </Tooltip>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          top: zoomButtonHeight - paddingGraph,
          right: panelWidth,
          clipPath: `polygon(0% ${clippathTop}px, 100% ${clippathTop}px, 100% ${clippathBottom}px, 0% ${clippathBottom}px`,
        }}
      >
        <g transform={`translate(0, ${paddingGraph})`}>
          <g ref={xAxisRef} transform={`translate(0, ${height - margin.bottom})`} />
          <g ref={yAxisRef} transform={`translate(${margin.left}, ${0})`} />
          <g transform={`translate(0, ${y})scale(1, ${k})`}>
            {currentPhases?.map((phase, index) => {
              return phase.map(phase => {
                if (!phase.timerange?.start || !phase.timerange?.end) {
                  return null;
                }
                if (displayedPhase.type === DisplayType.phase && phase.name === displayedPhase.data.name) {
                  // We want to draw the selected phase last so it appears on top
                  // Save for later
                  selectedPhase = phase;
                  selectedPhaseIndex = index;
                  return null;
                }
                return createRectangle(phase, index);
              })
            }
            )}
            {selectedPhase ?
              <>
                {createRectangle(selectedPhase, selectedPhaseIndex, 2, selectedBorder)}
                {createRectangle(selectedPhase, selectedPhaseIndex)}
              </>
              :
              null
            }
          </g>
          <g transform={`translate(0, ${y})scale(1, ${k})`}>
            {createLine(now, timeIndicatorColor, timeIndicatorRef)}
            {captureTimes?.map((capture, index) => createCircle(makeUtcDate(capture), captureColor, index))}
            {milestones?.map(milestone => {
              if (displayedPhase.type === DisplayType.milestone && milestone.name === displayedPhase.data.name) {
                // We want to draw the selected phase last so it appears on top
                // Save for later
                selectedMilestone = milestone;
                return null;
              }
              return createPolygon(milestone, milestoneColor);
            })}
            {selectedMilestone ?
              <>
                {createPolygon(selectedMilestone, selectedBorder, true, 3)}
                {createPolygon(selectedMilestone, milestoneColor, true)}
              </>
              :
              null
            }
          </g>
          {createCurrentTimeArrow()}
        </g>
        {createFade("top")}
        {createFade("bottom")}
      </svg>
    </>
  );
}
