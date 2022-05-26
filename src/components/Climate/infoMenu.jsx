import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './infoMenu.scss';
import Popover from '../common/Popover/Popover';
import Picker from '../BottomBar/Picker';
import Icon from '../common/MaterialIcon/MaterialIcon';
import buttonStyle from '../TouchBar/UtilitiesMenu/style/UtilitiesButtons.scss';
import SmallLabel from '../common/SmallLabel/SmallLabel';

class InfoMenu extends Component{


  constructor(props) {
    super(props);

    this.state = {
      showPopover: false,
    };

    this.togglePopover = this.togglePopover.bind(this);
  }


  handleOnClick() {
    const { property } = this.props;
    this.toggleChecked();
    if (property.group) {
      this.props.handleGroup(this.props);
    }
  }
  get popover() {
    return (

      <Popover
        className = {Picker.Popover}
        title = {this.props.pickedStory.title}
        closeCallback = {this.togglePopover}
      >

        <p>
          {this.props.storyInfo}
        </p>
      </Popover>
    );
  }

  togglePopover() {
    this.setState({ showPopover: !this.state.showPopover });
  }
  render() {
    return (
      <div className={Picker.Wrapper}>
        <Picker
          onClick={this.togglePopover}
          className={`${buttonStyle.Test}
          ${this.state.showPopover && buttonStyle.active} ${this.state.showPopover && Picker.Active}`}
        >
          <Icon icon="face" className={buttonStyle.Icon} />
          <SmallLabel>Info</SmallLabel>
        </Picker>
        { this.state.showPopover && this.popover }
      </div>
    );
  }





}

InfoMenu.propTypes = {
  story: PropTypes.objectOf(PropTypes.shape({
    storyTitle: PropTypes.string,
    storyInfo: PropTypes.string,
  })),
};


export default InfoMenu;
