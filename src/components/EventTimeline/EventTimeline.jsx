/**
 * @author Rene Don
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './EventTimeline.scss';
const TWEEN = require('@tweenjs/tween.js')
import { throttle } from 'lodash/function';

if (!Math.degToRad) {
  Math.degToRad = function (degrees) {
    return degrees * Math.PI / 180;// Converts from degrees to radians.
  };
}

if (!Math.radToDeg) {
  Math.radToDeg = function (radians) {
    return radians * 180 / Math.PI;
  };
}

function degreesToCartesian(degrees) {
  return {
    x: Math.sin(Math.degToRad(degrees)),
    y: Math.cos(Math.degToRad(degrees))
  }
}

const ellipseRadii = { x: 60, y: 50 };

const clamp = (number, min, max) => {
  return Math.min(Math.max(number, min), max);
};

class EventTimeline extends Component {
  constructor(props) {
    super(props);

    this.state = {
      timelineParams: {
        desiredSpan: 1,
        zoom: 1,
      },
      eventList: [],
      missionCache: {},
    };

    this.loadMissionData = this.loadMissionData.bind(this);
    this.onMissionDataChanged = this.onMissionDataChanged.bind(this);
    this.onWheel = this.onWheel.bind(this);

    this.state.eventList.sort((firstEl, secondEl) => (firstEl.time - secondEl.time));

    this.calculateDesiredSpan = throttle(this.calculateDesiredSpan, 3000);
  }

  addEvent(eventObject) {
    this.state.eventList.push(eventObject);
  }

  // Function for recursively loading mission phases including nested phases and flattening them into one event array
  loadMissionData(phase) {
    const hasPhases = ('phases' in phase) && phase.phases.length;

    if (hasPhases) {
      phase.phases.forEach(phase => {
        this.loadMissionData(phase);
      });
    }
    else {
      if (!('name' in phase)) return;                 // guard
      if (!('timerange' in phase)) return;            // guard
      if (!('start' in phase["timerange"])) return;   // guard

      const date = new Date(Date.parse(`${phase["timerange"]["start"]}`));

      if (isNaN(date)) {
        console.warn(`EventTimeline invalid date for ${phase.name}`, phase["timerange"]);
        return;
      }

      this.addEvent({ time: date, title: phase["name"] });

    }
  }

  onMissionDataChanged() {
    const missionAvailable = this.props.missions.isInitialized && this.props.missions.data.length;

    if (missionAvailable) {
      this.loadMissionData(this.props.missions.data[0]);
    }

    this.state.missionsCache = this.props.missions;
  }

  get renderTimeLine() {
    return (
      <g>
        <ellipse cx="50" cy="50" rx={ellipseRadii.x} ry={ellipseRadii.y} stroke="rgba(255,255,255,0.65)" strokeWidth="0.2" fill="none" />
        <ellipse cx="50" cy="50" rx={ellipseRadii.x} ry={ellipseRadii.y} stroke="white" strokeWidth="0.25" fill="none" clipPath="url(#rightHalfDimMask)" />
        <line
          x1={50}  // inner radius of line
          y1={50 - ellipseRadii.y - 0.3}  // inner radius of line
          x2={50}  // outer radius of line
          y2={50 - ellipseRadii.y + 0.3}  // outer radius of line
          stroke="white" strokeWidth="0.2" />
      </g>
    );
  }

  calculateDesiredSpan() {
    const { time } = this.props;

    const numberUniqueEventsDisplayed = 5;

    const nextEventIndex = this.state.eventList.findIndex(event => event.time > time);

    var twoBeforeIndex = Math.max(0, nextEventIndex - 2);
    var twoAfterIndex = Math.min(twoBeforeIndex - 1 + numberUniqueEventsDisplayed, this.state.eventList.length - 1);  // twoBeforeIndex minus one(!) to arrive at right count

    if ((twoAfterIndex - twoBeforeIndex) < numberUniqueEventsDisplayed) {
      // We can't find enough number of events in the future, go back into the past
      twoBeforeIndex = Math.max(twoAfterIndex - numberUniqueEventsDisplayed, 0);
    }

    const partialEventList = this.state.eventList.slice(twoBeforeIndex, twoAfterIndex);   // part of the eventlist that we want to display on the timeline
    const timeSpan = partialEventList[partialEventList.length - 1].time - partialEventList[0].time;
    const desiredSpan = Math.max(1000, timeSpan);

    // Now we have a timespan spanning 5 events (if more than 5 available), but note that depending on distribution of these 5 
    // and where the currentTime sits within this span, more or less events may shift outside of view

    new TWEEN.Tween(this.state.timelineParams).to({ desiredSpan: desiredSpan / 1000 }, 1000).start();
  }

  get renderEvents() {
    const { time } = this.props;

    if (!time) return;  // guard

    const fontSize = 1; // px
    const eventTimeLineSpanDegrees = 65.5;  // Section of ellipse that is used to map the events on
    const declutterAngle = 6;               // hide titles when events too close together

    this.calculateDesiredSpan();
    const visibleTimeSpan = this.state.timelineParams.desiredSpan / this.state.timelineParams.zoom;
    const degreesPerSecond = eventTimeLineSpanDegrees / visibleTimeSpan;

    var timelineExceeded = false;

    // First run through the event list and set some parameters
    this.state.eventList.forEach((event, index, array) => {
      event.deltaTime = (event.time.getTime() - time.getTime()) / 1000; // seconds
      event.angle = clamp(event.deltaTime * degreesPerSecond, -eventTimeLineSpanDegrees / 2, eventTimeLineSpanDegrees / 2);   // Clamp to visible timeline so it doesn't reappear the next 360 degrees...
      event.renderTitle = (-0.5 < event.deltaTime / visibleTimeSpan) && (event.deltaTime / visibleTimeSpan < 0.5);                      // Check if outside of desired range
      event.visible = !timelineExceeded;

      // Now check that the previous title isn't too close to this one. If the case - declutter the title of the previous event
      // Note that we're flipping above and below the timeline, so we need to compare 2 events back
      if (index > 1) {
        const previousEvent = array[index - 2];
        if (event.angle - previousEvent.angle < declutterAngle) previousEvent.renderTitle = false;
      }

      if (event.angle >= eventTimeLineSpanDegrees / 2) timelineExceeded = true;
    })

    // Render events to DOM elements
    return (
      <g>
        {this.state.eventList.map((event, index) => {
          if (!event.visible) return null; // guard

          const x = Math.round((50 + ellipseRadii.x * degreesToCartesian(event.angle).x) * 10) / 10;     // Round to prevent unnecessary DOM repaints
          const y = Math.round((50 - ellipseRadii.y * degreesToCartesian(event.angle).y) * 10) / 10;     // Round to prevent unnecessary DOM repaints

          const flip = index % 2 == 0 ? 1 : -1;
          const color = event.deltaTime > 0 ? "rgba(255,255,255,0.65)" : "white";

          return (
            <g key={index}
              onClick={() => this.setDate(event.time)}
              style={{ cursor: 'pointer' }}>
              <g stroke={color}>
                <circle cx={x} cy={y} r="0.5" strokeWidth="0.15" fill="black" />
                <circle cx={x} cy={y} r="0.075" strokeWidth="0.2" fill={color} />
              </g>
              {event.renderTitle &&
                <g>
                  <line
                    x1={Math.round((x - 0.5 * flip * Math.sin(Math.degToRad(event.angle))) * 10) / 10}  // inner radius of line     // Round to prevent unnecessary DOM repaints
                    y1={Math.round((y + 0.5 * flip * Math.cos(Math.degToRad(event.angle))) * 10) / 10}  // inner radius of line     // Round to prevent unnecessary DOM repaints
                    x2={Math.round((x - 0.8 * flip * Math.sin(Math.degToRad(event.angle))) * 10) / 10}  // outer radius of line     // Round to prevent unnecessary DOM repaints
                    y2={Math.round((y + 0.8 * flip * Math.cos(Math.degToRad(event.angle))) * 10) / 10}  // outer radius of line     // Round to prevent unnecessary DOM repaints
                    stroke={color} strokeWidth="0.15" />
                  <text
                    x={Math.round((x - 0.25) * 10) / 10}
                    y={Math.round((y + 0.5 * fontSize + 2 * flip) * 10) / 10}
                    fontSize={`${fontSize}px`} color={color} fill={color} textAnchor="middle"
                    transform={`rotate(${Math.round(event.angle * 10) / 10},${x},${y})`}                 // Round to prevent unnecessary DOM repaints
                  >{event.title}</text>
                </g>
              }
            </g>);
        })
        }
      </g>
    );
  }
  
  setDate(time) {
    this.setState({ time: new Date(time) });
    // Spice, that is handling the time parsing in OpenSpace does not support
    // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
    // is given.
    const fixedTimeString = time.toJSON().replace('Z', '');
    const openspace = this.props.luaApi;
    openspace.time.interpolateTime(fixedTimeString);
  }

  onWheel(event) {
    const { desiredSpan, zoom } = this.state.timelineParams;

    const normalized = Math.sign(-event.deltaY);                  // Browsers may return different values for the delta, so ignore the magnitude

    // Calculate an even zoom response across a wide range of timespans (e.g. seconds, years)
    const visibleTimeSpan = desiredSpan * zoom;
    const zoomStep = 0.5;                                         // i.e. 0.5 = 50% of the timespan
    const absDelta = - normalized * zoomStep * visibleTimeSpan;
    const newZoom = (desiredSpan * zoom - absDelta) / desiredSpan;

    new TWEEN.Tween(this.state.timelineParams).to({ zoom: newZoom }, 200).start();
  }


  render() {
    const { eventTimelineVisible } = this.props;

    if (this.state.missionsCache !== this.props.missions) {
      this.onMissionDataChanged();
    }
    
    if (!this.state.eventList.length) return null; // guard

    TWEEN.update();

    return (
      <>{(eventTimelineVisible) &&
        <div>

          <div className={`${styles.graph}`} onWheel={(e) => this.onWheel(e)}>

          <svg viewBox="0 -1 100 100">      {/* min-y=-1 to ensure that the ellipse stroke doesn't get clipped*/}
            <defs>
              <clipPath id="rightHalfDimMask">
                <rect x="0" y="-1" width="50" height="100" />
              </clipPath>
            </defs>
              {this.renderTimeLine}
              {this.renderEvents}
            </svg>

          </div>
        </div>
      }
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    time: state.time.time,
    targetDeltaTime: state.time.targetDeltaTime,
    luaApi: state.luaApi,
    missions: state.missions,
    eventTimelineVisible: state.missions.showTimeline,
  }
}

EventTimeline = connect(mapStateToProps)(EventTimeline);

export default EventTimeline;
