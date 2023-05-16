import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as timeHelpers from '../../../../utils/timeHelpers';
import Picker from '../../../BottomBar/Picker';
import Button from '../../../common/Input/Button/Button';
import Icon from '../../../common/MaterialIcon/MaterialIcon';
import Popover from '../../../common/Popover/Popover';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';
import styles from '../style/DateController.scss';
import buttonStyle from '../style/UtilitiesButtons.scss';

class DateController extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showPopover: false
    };

    this.togglePopover = this.togglePopover.bind(this);
    this.pickDate = this.pickDate.bind(this);
  }

  get popover() {
    return (
      <Popover
        className={Picker.Popover}
        title="Select event"
        closeCallback={this.togglePopover}
      >
        <div>
          {this.dateButtons}
        </div>
      </Popover>
    );
  }

  get dateButtons() {
    const { dateList } = this.props;
    timeHelpers.sortDates(dateList);
    return (dateList.map((date) => (
      <Button
        className={styles.dateButton}
        id={date.date}
        key={date.date}
        smalltext
        block
        onClick={this.pickDate}
      >
        <span className={styles.date} id={date.date}>
          {new Date(date.date).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}
        </span>
        <SmallLabel className={styles.label} id={date.date}>
          {`${date.planet},${date.info}`}
        </SmallLabel>
      </Button>
    ))
    );
  }

  pickDate(e) {
    const { dateList, luaApi, onChangeSight } = this.props;
    this.togglePopover();
    const timeString = timeHelpers.DateStringWithTimeZone(e.target.id);
    timeHelpers.setDate(luaApi, new Date(timeString));
    const selectedDate = dateList.find((date) => date.date === e.target.id);
    onChangeSight(selectedDate);
  }

  togglePopover() {
    const { showPopover } = this.state;
    this.setState({ showPopover: !showPopover });
  }

  render() {
    const { showPopover } = this.state;
    return (
      <div className={Picker.Wrapper}>
        <Picker
          onClick={this.togglePopover}
          className={`${styles.dateController}
          ${showPopover && styles.active} ${showPopover && Picker.Active}`}
        >
          <Icon icon="date_range" className={buttonStyle.Icon} />
          <SmallLabel>Select event</SmallLabel>
        </Picker>
        { showPopover && this.popover }
      </div>
    );
  }
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

const mapStateToProps = (state) => ({
  luaApi: state.luaApi
});

DateController = connect(mapStateToProps)(DateController);

export default DateController;
