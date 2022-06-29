import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { useTutorial } from '../../../GettingStartedTour/GettingStartedContext';
import MaterialIcon from '../../MaterialIcon/MaterialIcon';
import Button from '../Button/Button';
import InlineInput from '../InlineInput/InlineInput';
import styles from './Time.scss';

const Elements = {
  FullYear: 'fullYear',
  Month: 'month',
  Date: 'date',
  Hours: 'hours',
  Minutes: 'minutes',
  Seconds: 'seconds',
  Milliseconds: 'milliseconds'
};
Elements.Time = [Elements.Hours, Elements.Minutes, Elements.Seconds];
Elements.PreciseTime = [Elements.Hours, Elements.Minutes, Elements.Seconds, Elements.Milliseconds];
Elements.FullDate = [Elements.FullYear, Elements.Month, Elements.Date];
Elements.DateAndTime = Elements.FullDate.concat(null).concat(Elements.Time);
Object.freeze(Elements);

const Months = "January February March April May June July August September October November December".split(" ");

const Interpretors = {
  Month: (input) => {
    const index = Months.findIndex((month) => {
      return month.toLowerCase().indexOf(input.toLowerCase()) === 0
    });
    if (index !== -1) {
      return index;
    }
    return Number.parseFloat(index);
  }
}

function zeroPad(number) {
  return number < 10 ? `0${number}` : number;
}

function Time({elements, onChange, time}) {
  function onClick(what, change) {
    const getterFunc = `getUTC${what}`;
    const setterFunc = `setUTC${what}`;

    return (e) => {
      const newTime = new Date(time);
      newTime[setterFunc](newTime[getterFunc]() + change);
      const shift = e.getModifierState("Shift");

      if (hasCallback) {
        onChange({
          time: newTime,
          interpolate: !shift,
          delta: (newTime - time)/1000,
          relative: true
        });
      }
    };
  }

  function onInput(what) {
    const setterFunc = `setUTC${what}`;
    const interpretFunc = Interpretors[what] || Number.parseFloat;

    return (event) => {
      const newTime = new Date(time);
      const { value } = event.currentTarget;
      const param = interpretFunc(value);
      if (isNaN(param)) {
        return;
      }
      newTime[setterFunc](param);

      if (hasCallback) {
        onChange({
          time: newTime,
          interpolate: false,
          delta: (newTime - time)/1000,
          relative: false
        });
      }
    };
  }

  function fullYear() {
    const month = shouldInclude(Elements.Month);
    return wrap(`${zeroPad(time.getUTCFullYear())}`, 'FullYear', month && ':');
  }

  function month() {
    const date = shouldInclude(Elements.Date);

    let month = Months[time.getUTCMonth()];
    if (!month) {
      month = Months[0];
    }
    month = month.substring(0, 3);

    return wrap(month, 'Month', date && ':');
  }

  function date() {
    const hours = shouldInclude(Elements.Hours);
    const d = time.getUTCDate();
    const zpd = zeroPad(d);
    return wrap(`${zpd}`, 'Date', hours && ':');
  }

  function hours() {
    const minutes = shouldInclude(Elements.Minutes);
    const h = time.getUTCHours();
    const zph = zeroPad(h);
    return wrap(`${zph}`, 'Hours', minutes && ':');
  }

  function minutes() {
    const seconds = shouldInclude(Elements.Seconds);
    const m = time.getUTCMinutes();
    const zpm = zeroPad(m);
    return wrap(`${zpm}`, 'Minutes', seconds && ':');
  }

  function seconds() {
    const milliseconds = shouldInclude(Elements.Milliseconds);
    const s = time.getUTCSeconds();
    const zps = zeroPad(s);
    return wrap(`${zps}`, 'Seconds', milliseconds && '.');
  }

  function milliseconds() {
    const ms = time.getUTCMilliseconds();
    return wrap(ms, 'Milliseconds');
  }

  function hasCallback() {
    return onChange !== null;
  }

  function shouldInclude(what) {
    return elements.includes(what);
  }

  /**
   * wrap the time component with the needed elements
   * @param inner - the time itself
   * @param what - what element is this? hours? seconds?
   * @param after
   * @returns {XML}
   */
  function wrap(inner, what, after = '') {
    // make it editable with input and such?
    if (hasCallback) {
      const width = (what === 'Milliseconds' || what === 'Month') ? 3 : 2;
      const type = (what === 'Month') ? "text" : "number";
      const ref = useTutorial();
      return (
        <div key={what} className={styles.element}>
          <Button nopadding transparent onClick={onClick(what, 1)}>
            <MaterialIcon icon="expand_less" />
          </Button>
          <span key={`span${what}`} ref={ el => ref.current[what] = el}>
            <InlineInput
              value={inner}
              size={width}
              className={styles.textInput}
              onEnter={onInput(what)}
              type={type}
              noExtraWidth
            />
          </span>
          <Button nopadding transparent onClick={onClick(what, -1)}>
            <MaterialIcon icon="expand_more" />
          </Button>
        </div>
      );
    }

    return (
      <div className={styles.element}>
        { inner }{after}
      </div>
    );
  }

  const functionMapping = { 
    fullYear,
    month, 
    date,
    hours, 
    seconds,
    minutes, 
    milliseconds 
  };
  return (
    <div className={styles.clock}>
    {
      elements.map((getterName) => {
        const value = functionMapping?.[getterName]?.();
        if (!value) {
          return <div key={getterName} className={styles.padding}></div>
        }
        return value;
      })
    }
    </div>
  );
}

Time.Elements = Elements;

Time.propTypes = {
  /**
   * decide which element should be shown - should be an array of the elements in Elements
   */
  elements: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  time: PropTypes.instanceOf(Date).isRequired,
};

Time.defaultProps = {
  elements: Elements.DateAndTime,
  onChange: null,
};

export default Time;
