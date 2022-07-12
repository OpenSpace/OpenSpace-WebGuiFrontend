import React, { useEffect, useState } from 'react';
import { instructionImage } from '../../../../api/resources';
import Icon from '../../../common/MaterialIcon/MaterialIcon';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';
import styles from '../style/UtilitiesButtons.scss';

function HelpButton(props) {
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (showInstructions) {
      const timeout = setTimeout(() => {
        setShowInstructions(false);
      }, 9500); // match with animation-delay in UtilitiesButtons.scss
      return () => { clearTimeout(timeout); };
    }
  }, [showInstructions]);

  return (
    <div
      className={`${styles.UtilitiesButton}
      ${showInstructions && styles.active}`}
      onClick={() => setShowInstructions(!showInstructions)}
      role="button"
      tabIndex="0"
    >
      <Icon icon="help_outline" className={styles.Icon} />
      { showInstructions && <img src={instructionImage} className={styles.Instructions} alt="instructions" />}
      <SmallLabel>Help</SmallLabel>
    </div>
  );
}

export default HelpButton;
