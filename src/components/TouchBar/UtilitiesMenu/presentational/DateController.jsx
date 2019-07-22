import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';
import Icon from '../../../common/MaterialIcon/MaterialIcon';
import Popover from '../../../common/Popover/Popover';
import Picker from '../../../BottomBar/Picker';
import Button from '../../../common/Input/Button/Button';
import * as timeHelpers from '../../../../utils/timeHelpers';

import buttonStyle from './../style/UtilitiesButtons.scss';
import styles from './../style/DateController.scss';

class DateController extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showPopover: false,
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
    timeHelpers.sortDates(this.props.dateList);
    return (this.props.dateList.map(date => (
      <Button
        className={styles.dateButton}
        id={date.date}
        key={date.date}
        smalltext
        block
        onClick={this.pickDate}
      >
        <span className={styles.date} id={date.date}>
          {new Date(date.date).toLocaleDateString('en-US', {year: 'numeric', month: 'numeric', day: 'numeric' })}
        </span>
        <SmallLabel className={styles.label} id={date.date}>
          {date.planet},{date.info}
        </SmallLabel>
      </Button>
    ))
    );
  }

  pickDate(e) {
    this.togglePopover();
    const timeString = timeHelpers.DateStringWithTimeZone(e.target.id);
    timeHelpers.setDate(this.props.luaApi, new Date(timeString));
    const selectedDate = this.props.dateList.find(date => date.date === e.target.id);
    this.props.onChangeSight(selectedDate);
  }

  togglePopover() {
    this.setState({ showPopover: !this.state.showPopover });
  }

  render() {
    return (
      <div className={Picker.Wrapper}>
        <Picker
          onClick={this.togglePopover}
          className={`${styles.dateController}
          ${this.state.showPopover && styles.active} ${this.state.showPopover && Picker.Active}`}
        >
          <Icon icon="date_range" className={buttonStyle.Icon} />
          <SmallLabel>Select event</SmallLabel>
        </Picker>
        { this.state.showPopover && this.popover }
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
      location: PropTypes.object,
    }),
  ),
};

DateController.defaultProps = {
  onChangeSight: () => {},
  dateList: [],
};

const mapStateToProps = (state) => {
  return {
    luaApi: state.luaApi
  };
};

DateController = connect(mapStateToProps)(DateController);

export default DateController;
