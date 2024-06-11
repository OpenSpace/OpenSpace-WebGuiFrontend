import React from 'react';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import { useSwipeable } from 'react-swipeable';

import { useContextRefs } from '../../../../GettingStartedTour/GettingStartedContext';
// import Button from '../../../common/Input/Button/Button';
// import InlineInput from '../../../common/Input/InlineInput/InlineInput';
import InlineInput from '../InlineInput/InlineInput';

import styles from './Time.scss';

const Months =
  'January February March April May June July August September October November December'.split(
    ' '
  );

function findIndexForMonth(input: string | number): number | null {
  const isNumber = !isNaN(Number(input));
  // If input is number
  if (isNumber) {
    // Assume that people use 1-indexed months
    return Number(input) - 1;
  }

  // Else input is string
  const lowerInput = input.toString().toLowerCase();
  const index = Months.findIndex((mm) => {
    const lowerMonth = mm.toLowerCase();
    // Finds the first occurrence of the input substring
    // Should be 0 when found
    return lowerMonth.indexOf(lowerInput) === 0;
  });
  if (index !== -1) {
    return index;
  }
  return null;
}

function zeroPad(number: number): string {
  return number < 10 ? `0${number}` : number.toString();
}

type ElementTypes =
  | 'FullYear'
  | 'Month'
  | 'Date'
  | 'Hours'
  | 'Minutes'
  | 'Seconds'
  | 'Milliseconds';

const Elements: Record<ElementTypes, ElementTypes> = {
  FullYear: 'FullYear',
  Month: 'Month',
  Date: 'Date',
  Hours: 'Hours',
  Minutes: 'Minutes',
  Seconds: 'Seconds',
  Milliseconds: 'Milliseconds'
};

const TimeElements = [Elements.Hours, Elements.Minutes, Elements.Seconds] as const;
const FullDateElements = [Elements.FullYear, Elements.Month, Elements.Date] as const;
const DateAndTimeElements = [...FullDateElements, null, ...TimeElements] as const;

interface TimeProps {
  elements?: readonly (ElementTypes | null)[];
  onChange?: (data: { time: Date; interpolate: boolean; delta: number; relative: boolean }) => void;
  time: Date;
}

function Time({ elements = DateAndTimeElements, onChange, time }: TimeProps) {
  const hasCallback = onChange !== undefined;

  function shouldInclude(what: ElementTypes): boolean {
    return elements.includes(what);
  }

  function onClick(e: React.MouseEvent, what: ElementTypes, change: number): void {
    const getterFunc = `getUTC${what}`;
    const setterFunc = `setUTC${what}`;
    const newTime = new Date(time);
    // @ts-ignore
    newTime[setterFunc](newTime[getterFunc]() + change);
    const shift = e.getModifierState('Shift');
    if (onChange) {
      onChange({
        time: newTime,
        interpolate: !shift,
        delta: (newTime.getTime() - time.getTime()) / 1000,
        relative: true
      });
    }
  }

  function onInput(what: ElementTypes) {
    const setterFunc = `setUTC${what}`;
    const interpretFunc = what === 'Month' ? findIndexForMonth : parseFloat;

    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = new Date(time);
      const { value } = event.target;
      const param = interpretFunc(value);
      if (Number.isNaN(param)) {
        return;
      }
      // @ts-ignore
      newTime[setterFunc](param);

      if (onChange) {
        onChange({
          time: newTime,
          interpolate: false,
          delta: (newTime.getTime() - time.getTime()) / 1000,
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
  function wrap(inner: React.ReactNode, what: ElementTypes, after = ''): React.ReactNode {
    const swipeHandlers = useSwipeable({
      onSwipedUp: () =>
        onClick(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true
          }) as unknown as React.MouseEvent,
          what,
          -1
        ),
      onSwipedDown: () =>
        onClick(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true
          }) as unknown as React.MouseEvent,
          what,
          1
        ),
      trackMouse: true // This enables swiping with a mouse for testing
    });

    if (hasCallback) {
      const width = what === 'Milliseconds' || what === 'Month' ? 3 : 2;
      const type = what === 'Month' ? 'text' : 'number';
      const ref = useContextRefs();
      return (
        <div key={what} className={styles.element} {...swipeHandlers}>
          <div className={styles.arrows} onClick={(e) => onClick(e, what, 1)}>
            <MdExpandLess />
          </div>
          <span
            key={`span${what}`}
            ref={(el) => {
              ref.current[what] = el;
            }}
          >
            <InlineInput
              value={inner}
              size={width}
              className={styles.textInput}
              onEnter={onInput(what)}
              type={type}
            />
          </span>
          <div className={styles.arrows} onClick={(e) => onClick(e, what, -1)}>
            <MdExpandMore />
          </div>
        </div>
      );
    }

    return (
      <div className={styles.element}>
        {inner}
        {after}
      </div>
    );
  }

  function fullYear() {
    const mm = shouldInclude(Elements.Month);
    return wrap(`${zeroPad(time.getUTCFullYear())}`, 'FullYear', mm ? ':' : '');
  }

  function month() {
    const dd = shouldInclude(Elements.Date);

    let mm = Months[time.getUTCMonth()];
    if (!mm) {
      mm = Months[0];
    }
    mm = mm.substring(0, 3);

    return wrap(mm, 'Month', dd ? ':' : '');
  }

  function date() {
    const hh = shouldInclude(Elements.Hours);
    const dd = time.getUTCDate();
    const zpd = zeroPad(dd);
    return wrap(`${zpd}`, 'Date', hh ? ':' : '');
  }

  function hours() {
    const mm = shouldInclude(Elements.Minutes);
    const hh = time.getUTCHours();
    const zph = zeroPad(hh);
    return wrap(`${zph}`, 'Hours', mm ? ':' : '');
  }

  function minutes() {
    const ss = shouldInclude(Elements.Seconds);
    const mm = time.getUTCMinutes();
    const zpm = zeroPad(mm);
    return wrap(`${zpm}`, 'Minutes', ss ? ':' : '');
  }

  function seconds() {
    const ms = shouldInclude(Elements.Milliseconds);
    const ss = time.getUTCSeconds();
    const zps = zeroPad(ss);
    return wrap(`${zps}`, 'Seconds', ms ? '.' : '');
  }

  function milliseconds() {
    const ms = time.getUTCMilliseconds();
    return wrap(ms, 'Milliseconds');
  }

  const functionMapping: Record<ElementTypes, () => React.ReactNode> = {
    FullYear: fullYear,
    Month: month,
    Date: date,
    Hours: hours,
    Minutes: minutes,
    Seconds: seconds,
    Milliseconds: milliseconds
  };

  return (
    <div className={styles.clock}>
      {elements.map((getterName, index) => {
        if (getterName === null) {
          return <div key={`null-${index}`} className={styles.padding} />;
        }
        const value = functionMapping[getterName]();
        return <React.Fragment key={getterName}>{value}</React.Fragment>;
      })}
    </div>
  );
}

Time.Elements = Elements;

export default Time;
