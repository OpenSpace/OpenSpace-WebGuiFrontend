import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import InlineInput from '../InlineInput/InlineInput';
import styles from './Time.scss';
import Icon from '../../Icon/Icon';

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

const Months = "January February Mars April May June July August September October November December".split(" ");

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

class Time extends Component {
  static zeroPad(number) {
    return number < 10 ? `0${number}` : number;
  }

  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.onInput = this.onInput.bind(this);
  }

  onClick(what, change) {
    const getterFunc = `getUTC${what}`;
    const setterFunc = `setUTC${what}`;

    return (e) => {
      const newTime = new Date(this.props.time);
      newTime[setterFunc](newTime[getterFunc]() + change);
      const shift = e.getModifierState("Shift");

      if (this.hasCallback) {
        this.props.onChange({
          time: newTime,
          interpolate: !shift,
          delta: (newTime - this.props.time)/1000,
          relative: true
        });
      }
    };
  }

  onInput(what) {
    const setterFunc = `setUTC${what}`;
    const interpretFunc = Interpretors[what] || Number.parseFloat;

    return (event) => {
      const newTime = new Date(this.props.time);
      const { value } = event.currentTarget;
      const param = interpretFunc(value);
      if (isNaN(param)) {
        return;
      }
      newTime[setterFunc](param);

      if (this.hasCallback) {
        this.props.onChange({
          time: newTime,
          interpolate: false,
          delta: (newTime - this.props.time)/1000,
          relative: false
        });
      }
    };
  }

  get fullYear() {
    const { time } = this.props;
    const month = this.shouldInclude(Elements.Month);
    return this.wrap(`${Time.zeroPad(time.getUTCFullYear())}`, 'FullYear', month && ':');
  }

  get month() {
    const { time } = this.props;
    const date = this.shouldInclude(Elements.Date);

    let month = Months[time.getUTCMonth()];
    if (!month) {
      month = Months[0];
    }
    month = month.substring(0, 3);

    return this.wrap(month, 'Month', date && ':');
  }

  get date() {
    const { time } = this.props;
    const hours = this.shouldInclude(Elements.Hours);
    return this.wrap(`${Time.zeroPad(time.getUTCDate())}`, 'Date', hours && ':');
  }

  get hours() {
    const { time } = this.props;
    const minutes = this.shouldInclude(Elements.Minutes);
    return this.wrap(`${Time.zeroPad(time.getUTCHours())}`, 'Hours', minutes && ':');
  }

  get minutes() {
    const { time } = this.props;
    const seconds = this.shouldInclude(Elements.Seconds);
    return this.wrap(`${Time.zeroPad(time.getUTCMinutes())}`, 'Minutes', seconds && ':');
  }

  get seconds() {
    const { time } = this.props;
    const milliseconds = this.shouldInclude(Elements.Milliseconds);
    return this.wrap(`${Time.zeroPad(time.getUTCSeconds())}`, 'Seconds', milliseconds && '.');
  }

  get milliseconds() {
    const { time } = this.props;
    return this.wrap(time.getUTCMilliseconds(), 'Milliseconds');
  }

  get hasCallback() {
    return this.props.onChange !== null;
  }

  shouldInclude(what) {
    return this.props.elements.includes(what);
  }

  /**
   * wrap the time component with the needed elements
   * @param inner - the time itself
   * @param what - what element is this? hours? seconds?
   * @param after
   * @returns {XML}
   */
  wrap(inner, what, after = '') {
    // make it editable with input and such?
    if (this.hasCallback) {
      const width = (what === 'Milliseconds' || what === 'Month') ? 3 : 2;
      const type = (what === 'Month') ? "text" : "number";

      return (
        <div key={what} className={styles.element}>
          <Button nopadding transparent onClick={this.onClick(what, 1)}>
            <Icon icon="expand_less" />
          </Button>
          <span>
            <InlineInput
              value={inner}
              size={width}
              className={styles.textInput}
              onEnter={this.onInput(what)}
              type={type}
              noExtraWidth
            />
          </span>
          <Button nopadding transparent onClick={this.onClick(what, -1)}>
            <Icon icon="expand_more" />
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

  render() {
    return (
      <div className={styles.clock}>
      {
        this.props.elements.map((getterName, n) => {
          const value = this[getterName];
          if (!value) {
            return <div key={n} className={styles.padding}></div>
          }
          return value;
        })
      }
      </div>
    );
  }
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
