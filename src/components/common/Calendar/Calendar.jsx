import React from 'react';
import { MdChevronLeft, MdChevronRight, MdToday } from 'react-icons/md';
import PropTypes from 'prop-types';

import { rotate } from '../../../utils/helpers';
import Button from '../Input/Button/Button';

import styles from './Calendar.scss';

const Days = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};
Object.freeze(Days);

const Months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
Object.freeze(Months);

// how many days of previous month to get depending on weekday
const DaysInWeekBefore = [7, 1, 2, 3, 4, 5, 6];
// always display 6 weeks
const ExpectedDaysInCalendar = 6 * 7;

const WeekStartsOn = Days.Monday;
const DayHeaders = 'M T W T F S S'.split(' ');

function Calendar({
  currentTime = new Date(),
  onChange = () => {},
  todayButton = false
}) {
  const [viewedMonth, setViewedMonth] = React.useState(currentTime);
  const [viewFreeCoupled, setViewFreeCoupled] = React.useState(false);

  let monthNumber = 0;
  try {
    monthNumber = viewedMonth.getMonth();
  } catch { /* empty */ }

  let fullYear = 0;
  try {
    fullYear = currentTime.getFullYear();
  } catch { /* empty */ }

  React.useEffect(() => {
    // update calendar focus (unless user has moved away from previously given active month)
    const isCurrentTimeViewed = Calendar.isSameDay(
      Calendar.toStartOfMonth(currentTime),
      Calendar.toStartOfMonth(viewedMonth)
    );
    if (!isCurrentTimeViewed && !viewFreeCoupled) {
      setViewedMonth(Calendar.toStartOfMonth(currentTime));
    }
  }, [currentTime]);

  function onSelect(e, day) {
    const shift = e.getModifierState('Shift');
    onChange({
      time: day,
      interpolate: !shift,
      relative: false
    });
  }

  function dayHeader() {
    return DayHeaders.map((day, index) => ({ day, index }));
  }

  function month(add = 0) {
    if (add === 0) {
      return viewedMonth;
    }
    let newDate = new Date();
    try {
      newDate = new Date(viewedMonth.getTime());
    } catch { /* empty */ }
    return newDate;
  }

  function daysToDisplay() {
    try {
      const prevMonth = month(-1);
      const thisMonth = month();
      const nextMonth = month(1);
      const days = Calendar.daysOfMonth(Calendar.toStartOfMonth(thisMonth));
      const prev = Calendar.daysOfMonth(Calendar.toStartOfMonth(prevMonth));
      const next = Calendar.daysOfMonth(Calendar.toStartOfMonth(nextMonth));

      const rotatedDays = rotate(DaysInWeekBefore, 7 - WeekStartsOn);
      const daysFromPrevMonth = rotatedDays[thisMonth.getDay()];

      days.unshift(...prev.slice(-1 * daysFromPrevMonth));
      const daysFromNextMonth = ExpectedDaysInCalendar - days.length;
      days.push(...next.slice(0, daysFromNextMonth));

      return days;
    } catch {
      return [];
    }
  }

  function setCurrentMonth() {
    setViewedMonth(Calendar.toStartOfMonth(currentTime));
    setViewFreeCoupled(false);
  }

  function isThisMonth(day) {
    return day.getMonth() === month().getMonth();
  }

  function isSelected(day) {
    if (!currentTime) {
      return false;
    }

    return Calendar.isSameDay(day, currentTime);
  }

  function stepViewMonth(direction) {
    setViewFreeCoupled(true);
    setViewedMonth(month(direction));
  }

  function extraClasses(day) {
    let classes = '';

    if (!isThisMonth(day)) {
      classes += `${styles.faint} `;
    }

    if (isSelected(day)) {
      classes += `${styles.selected} `;
    }

    if (Calendar.isSameDay(day, new Date())) {
      classes += `${styles.today} `;
    }

    return classes;
  }

  return (
    <section>
      <header className={styles.header}>
        <Button transparent small onClick={() => stepViewMonth(-1)}>
          <MdChevronLeft />
        </Button>
        <span>
          { todayButton && (
            <Button onClick={setCurrentMonth} title="Today" small transparent>
              <MdToday />
            </Button>
          )}
          {`${Months[monthNumber]} ${fullYear}`}
        </span>
        <Button regular transparent small onClick={() => stepViewMonth(1)}>
          <MdChevronRight />
        </Button>
      </header>

      <section className={styles.calendar}>
        <header className={styles.weekdays}>
          { dayHeader().map((d) => (
            <div key={`${d.day} ${d.index}`} className={styles.weekday}>
              { d.day }
            </div>
          ))}
        </header>

        <section className={styles.month}>
          { daysToDisplay().map((day) => (
            <Button
              key={`${day.getMonth()}-${day.getDate()}-${day.getFullYear()}-${viewedMonth}`}
              className={`${styles.day} ${extraClasses(day)}`}
              onClick={(e) => onSelect(e, day)}
              regular
            >
              { day.getDate() }
            </Button>
          ))}
        </section>
      </section>
    </section>
  );
}

// Static functions
Calendar.daysOfMonth = (month) => {
  try {
    const iterator = new Date(month.getTime());
    const days = [];
    while (iterator.getMonth() === month.getMonth()) {
      days.push(Calendar.copy(iterator));
      iterator.setDate(iterator.getDate() + 1);
    }
    return days;
  } catch {
    return [];
  }
};

Calendar.isSameDay = (a, b) => {
  try {
    return (a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate());
  } catch {
    return false;
  }
};
/**
 * set the date component to 1
 * @param day - remains unchanged
 * @returns {Date}
 */
Calendar.toStartOfMonth = (day) => {
  try {
    const newDay = Calendar.copy(day);
    newDay.setDate(1);
    return newDay;
  } catch {
    return '1';
  }
};

/**
 * copy date
 * @param date
 */
Calendar.copy = (date) => {
  try {
    return new Date(date.getTime());
  } catch {
    return date;
  }
};

Calendar.propTypes = {
  currentTime: PropTypes.instanceOf(Date),
  onChange: PropTypes.func,
  todayButton: PropTypes.bool
};

export default Calendar;
