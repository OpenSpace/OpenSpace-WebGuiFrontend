import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setShowAbout } from '../../api/Actions';
import api from '../../api/api';
import environment from '../../api/Environment';
import subStateToProps from '../../utils/subStateToProps';
import Button from '../common/Input/Button/Button';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Popover from '../common/Popover/Popover';
import Picker from './Picker';
import styles from  './StreamingMenu.scss';

import { hostSession, joinSession} from '../../streamingThesis/setupCall';


class StreamingMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopover: false,
    }
    this.togglePopover = this.togglePopover.bind(this);
  }

  togglePopover() {
    this.setState({showPopover: !this.state.showPopover})
  }

  get popover() {
    return (
      <Popover
      className={Picker.Popover}
      title="Remote Streaming"
      closeCallback={this.togglePopover}
      detachable
      attached={true}
      >
      <div className={Popover.styles.content}>
      <Row>
      <Input value={this.state.slideName}
                   label={slideNameLabel}
                   placeholder={"Slide name..."}
                   onChange={evt => this.updateSlideName(evt)} />
     </Row>
     </div>
     </Popover>
      );
  }


  // Render function
  render() {
    const { showPopover } = this.state;
    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover}>
          <div>
              <MaterialIcon className={styles.streamIcon} icon="screen_share"/>
          </div>
          {showPopover && 
            <Popover 
              className={Picker.Popover}
              title="Streaming options"
            >
            <div className={Popover.styles.content}>
            <Button
              block
              smalltext
              onClick={() => {joinSession()}}
              className={styles.actionButton}
            >
              <p>Host session</p>
            </Button>


            <Button
              block
              smalltext
              onClick={() => {hostSession()}}
              className={styles.actionButton}
            >
                <p>Join session</p>
            </Button>

            </div>
          </Popover>}
        </Picker>
      </div>
    )
  }
}

export default StreamingMenu;
