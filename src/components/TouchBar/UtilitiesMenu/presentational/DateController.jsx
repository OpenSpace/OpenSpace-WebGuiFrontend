import React from 'react';
import { MdDateRange } from 'react-icons/md';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import * as timeHelpers from '../../../../utils/timeHelpers';
import Picker from '../../../BottomBar/Picker';
import Button from '../../../common/Input/Button/Button';
import Popover from '../../../common/Popover/Popover';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';

import styles from '../style/DateController.scss';
import buttonStyle from '../style/UtilitiesButtons.scss';

function DateController({ dateList, onChangeSight }) {
  const [showPopover, setShowPopover] = React.useState(false);

  const luaApi = useSelector((state) => state.luaApi);

  function togglePopover() {
    setShowPopover(!showPopover);
  }

  function pickDate(e) {
    togglePopover();
    const timeString = timeHelpers.DateStringWithTimeZone(e.target.id);
    timeHelpers.setDate(luaApi, new Date(timeString));
    const selectedDate = dateList.find((date) => date.date === e.target.id);
    onChangeSight(selectedDate);
  }

  function dateButtons() {
    timeHelpers.sortDates(dateList);
    return (dateList.map((date) => (
      <Button
        className={styles.dateButton}
        id={date.date}
        key={date.date}
        smalltext
        block
        onClick={pickDate}
      >
        <span className={styles.date} id={date.date}>
          {new Date(date.date).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}
        </span>
        <SmallLabel className={styles.label} id={date.date}>
          {`${date.planet},${date.info}`}
        </SmallLabel>
      </Button>
    )));
  }

  function popover() {
    return (
      <Popover
        className={Picker.Popover}
        title="Select event"
        closeCallback={togglePopover}
      >
        <div>
          {dateButtons()}
        </div>
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      <Picker
        onClick={togglePopover}
        className={`${styles.dateController}
        ${showPopover && styles.active} ${showPopover && Picker.Active}`}
      >
        <MdDateRange className={buttonStyle.Icon} />
        <SmallLabel>Select event</SmallLabel>
      </Picker>
      { showPopover && popover() }
    </div>
  );
}

DateController.propTypes = {
  onChangeSight: PropTypes.func,
  dateList: PropTypes.arrayOf(
    PropTypes.shape({
      place: PropTypes.string,
      planet: PropTypes.string,
      location: PropTypes.object
    }),
  )
};

DateController.defaultProps = {
  onChangeSight: () => {},
  dateList: []
};

export default DateController;
