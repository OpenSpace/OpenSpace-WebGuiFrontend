import React from 'react';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

import Picker from '../../../BottomBar/Picker';
import Popover from '../../../common/Popover/Popover';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';

import buttonStyle from '../style/UtilitiesButtons.scss';

function InfoButton({ storyInfo, storyTitle }) {
  const [showPopover, setShowPopover] = React.useState(false);

  function togglePopover() {
    setShowPopover(!showPopover);
  }

  function popover() {
    return (
      <Popover
        className={Picker.Popover}
        title={storyTitle}
        closeCallback={togglePopover}
      >
        <p>
          {storyInfo}
        </p>
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      <Picker
        onClick={togglePopover}
        className={`${buttonStyle.UtilitiesButton}
        ${showPopover && buttonStyle.active} ${showPopover && Picker.Active}`}
      >
        <Icon icon="material-symbols:info-outline" className={buttonStyle.Icon} />
        <SmallLabel>Info</SmallLabel>
      </Picker>
      { showPopover && popover() }
    </div>
  );
}

InfoButton.propTypes = {
  storyTitle: PropTypes.string.isRequired,
  storyInfo: PropTypes.string.isRequired
};

export default InfoButton;
