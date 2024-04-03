import React from 'react';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import PropTypes from 'prop-types';

import { useContextRefs } from '../../../GettingStartedTour/GettingStartedContext';
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

const Months = 'January February March April May June July August September October November December'.split(' ');

function findIndexForMonth(input) {
  const isNumber = !Number.isNaN(Number(input));
  // If input is number
  if (isNumber) {
    // Assume that people use 1-indexed months
    return Number.parseFloat(input - 1);
  }
  // Else input is string
  const lowerInput = input.toLowerCase();
  const index = Months.findIndex((mm) => {
    const lowerMonth = mm.toLowerCase();
    // Finds the first occurence of the input substring
    // Should be 0 when found
    return lowerMonth.indexOf(lowerInput) === 0;
  });

  if (index !== -1) {
    return index;
  }
  return null;
}

function zeroPad(number) {
  return number < 10 ? `0${number}` : number;
}

function Time({ elements, onChange, time }) {
  const hasCallback = onChange !== null;
  function shouldInclude(what) {
    return elements.includes(what);
  }

  function onClick(e, what, change) {
    const getterFunc = `getUTC${what}`;
    const setterFunc = `setUTC${what}`;
    const newTime = new Date(time);
    newTime[setterFunc](newTime[getterFunc]() + change);
    const shift = e.getModifierState('Shift');
    if (hasCallback) {
      onChange({
        time: newTime,
        interpolate: !shift,
        delta: (newTime - time) / 1000,
        relative: true
      });
    }
  }

  function onInput(what) {
    const setterFunc = `setUTC${what}`;
    const interpretFunc = what === 'Month' ? findIndexForMonth : Number.parseFloat;

    return (event) => {
      const newTime = new Date(time);
      const { value } = event.target;
      const param = interpretFunc(value);
      if (Number.isNaN(param)) {
        return;
      }
      newTime[setterFunc](param);

      if (hasCallback) {
        onChange({
          time: newTime,
          interpolate: false,
          delta: (newTime - time) / 1000,
          relative: false
        });
      }
    };
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
      const type = (what === 'Month') ? 'text' : 'number';
      const ref = useContextRefs();
      return (
        <div key={what} className={styles.element}>
          <Button nopadding transparent onClick={(e) => onClick(e, what, 1)}>
            <MdExpandLess />
          </Button>
          <span key={`span${what}`} ref={(el) => { ref.current[what] = el; }}>
            <InlineInput
              value={inner}
              size={width}
              className={styles.textInput}
              onEnter={onInput(what)}
              type={type}
              noExtraWidth
            />
          </span>
          <Button nopadding transparent onClick={(e) => onClick(e, what, -1)}>
            <MdExpandMore />
          </Button>
        </div>
      );
    }

    return (
      <div className={styles.element}>
        { inner }
        { after }
      </div>
    );
  }

  function fullYear() {
    const mm = shouldInclude(Elements.Month);
    try {
      return wrap(`${zeroPad(time.getUTCFullYear())}`, 'FullYear', mm && ':');
    } catch {
      return wrap(time.split(' ')[0], 'FullYear', mm && ':');
    }
  }

  function month() {
    const dd = shouldInclude(Elements.Date);
    let mm = '';
    try {
      mm = Months[time.getUTCMonth()];
    } catch {
      mm = time.split(' ')[1];
    }
    if (!mm) {
      mm = Months[0];
    }
    mm = mm.substring(0, 3);

    return wrap(mm, 'Month', dd && ':');
  }

  function date() {
    const hh = shouldInclude(Elements.Hours);
    let dd = 0;
    try {
      dd = time.getUTCDate();
    } catch {
      dd = time.split(' ')[2];
    }
    const zpd = zeroPad(dd);
    return wrap(`${zpd}`, 'Date', hh && ':');
  }

  function hours() {
    const mm = shouldInclude(Elements.Minutes);
    let hh = 0;
    try {
      hh = time.getUTCHours();
    } catch {
      try {
        hh = time.split(' ')[3].split(':')[0];
      } catch {
        hh = 0
      }
    }
    const zph = zeroPad(hh);
    return wrap(`${zph}`, 'Hours', mm && ':');
  }

  function minutes() {
    const ss = shouldInclude(Elements.Seconds);
    let mm = 0;
    try {
      mm = time.getUTCMinutes();
    } catch {
      mm = time.split(' ')[3].split(':')[1];
    }
    const zpm = zeroPad(mm);
    return wrap(`${zpm}`, 'Minutes', ss && ':');
  }

  function seconds() {
    const ms = shouldInclude(Elements.Milliseconds);
    let ss = 0;
    try {
      ss = time.getUTCSeconds();
    } catch {
      ss = time.split(' ')[3].split(':')[2].split('.')[0];
    }
    const zps = zeroPad(ss);
    return wrap(`${zps}`, 'Seconds', ms && '.');
  }

  function milliseconds() {
    let ms = 0;
    try {
      ms = time.getUTCMilliseconds();
    } catch {
      ms = time.split(' ')[3].split(':')[2].split('.')[1];
    }

    return wrap(ms, 'Milliseconds');
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
            return <div key={getterName} className={styles.padding} />;
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
  time: PropTypes.instanceOf(Date).isRequired
};

Time.defaultProps = {
  elements: Elements.DateAndTime,
  onChange: null
};

export default Time;
