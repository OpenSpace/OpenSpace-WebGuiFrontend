import React from 'react';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

import Picker from '../../../BottomBar/Picker';
import Button from '../../../common/Input/Button/Button';
import Popover from '../../../common/Popover/Popover';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';

import styles from '../style/SightsController.scss';
import buttonStyle from '../style/UtilitiesButtons.scss';

function SightsController({ onChangeSight, sightsList }) {
  const [showPopover, setShowPopover] = React.useState(false);

  function togglePopover() {
    setShowPopover(!showPopover);
  }

  function selectSight(e) {
    togglePopover();
    const selectedSight = sightsList.find((sight) => sight.info === e.target.id);
    onChangeSight(selectedSight);
  }

  function sightsButtons() {
    return (sightsList.map((sight) => (
      <Button
        className={styles.sightsLabel}
        key={sight.info}
        smalltext
        block
        onClick={selectSight}
        id={sight.info}
      >
        <SmallLabel id={sight.info}>
          {sight.planet}
          ,
          {sight.info}
        </SmallLabel>
      </Button>
    )));
  }

  function popover() {
    return (
      <Popover
        className={`${Picker.Popover} ${styles.popover}`}
        title="Select sight"
        closeCallback={togglePopover}
      >
        {sightsButtons()}
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      <Picker
        onClick={togglePopover}
        className={`${styles.sightsController} ${showPopover && styles.active}
        ${showPopover && Picker.Active}`}
      >
        <Icon icon="material-symbols:place" className={buttonStyle.Icon} />
        <SmallLabel>Select sight</SmallLabel>
      </Picker>
      { showPopover && popover() }
    </div>
  );
}

SightsController.propTypes = {
  onChangeSight: PropTypes.func,
  sightsList: PropTypes.arrayOf(
    PropTypes.shape({
      place: PropTypes.string,
      planet: PropTypes.string,
      location: PropTypes.object
    }),
  )
};

SightsController.defaultProps = {
  onChangeSight: () => {},
  sightsList: []
};

export default SightsController;
