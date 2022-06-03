import React, { useEffect, useState } from 'react';
import { instructionImage } from '../../api/resources';
import Icon from '../common/MaterialIcon/MaterialIcon';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import styles from './Instructions.scss';
//import OnClimateGui from '../../views/OnClimateGUI';

const StartClimateStory = props => {
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if(showInstructions){
      const timeout = setTimeout(() => {
          setShowInstructions(false)
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
    <Icon icon="thermometer" className={styles.Icon} />
      { showInstructions &&
        <div className = {styles.Row}>
          <div className = {styles.Text}><p>: Spin around Earth</p></div>
        </div>
      }
      <SmallLabel>Start Story</SmallLabel>
    </div>
  );

}

export default StartClimateStory;
