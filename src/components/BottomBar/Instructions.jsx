import React, { useEffect, useState } from 'react';
import { instructionImage } from '../../api/resources';
import Icon from '../common/MaterialIcon/MaterialIcon';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import styles from './Instructions.scss';
import imagescroll from '../../../images/scrollclick.png'
import imageright from '../../../images/rightclick.png'
import imagesleft from '../../../images/leftclick.png'
const Instructions = props => {
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
    <Icon icon="help_outline" className={styles.Icon} />
      { showInstructions &&
        <div className = {styles.Background}>
          <div className = {styles.Instructions}>
            <div className = {styles.Row}>
              <img src = {imagesleft} alt = "imagesleft" />
              <div className = {styles.Text}><p>: Spin around Earth</p></div>
            </div>
            <div className = {styles.Row}>
              <img src = {imageright} alt = "imageright" />
              <div className = {styles.Text}><p>: Zoom In and Out</p></div>
            </div>
            <div className = {styles.Row}>
              <img src = {imagescroll} alt="imagescroll" />
              <div className = {styles.Text}><p>: Rotate the Camera</p></div>
            </div>
            <div className = {styles.Row}>
              <div className = {styles.Text}> <p> CTRL key + </p></div>
              <img src = {imagesleft} alt="imagesleft" />
              <div className = {styles.Text}>: Yaw or Pitch the Camera</div>
            </div>
          </div>
        </div>
      }
      <SmallLabel>Help</SmallLabel>
    </div>
  );

}

export default Instructions;
