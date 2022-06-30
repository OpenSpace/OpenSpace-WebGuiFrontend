import React, { useEffect, useState } from 'react';
import { instructionImage } from '../../../api/resources';
import Icon from '../../common/MaterialIcon/MaterialIcon';
import SmallLabel from '../../common/SmallLabel/SmallLabel';
import styles from './Instructions.scss';
import imagescroll from '../../../../images/scrollclick.png'
import imageright from '../../../../images/rightclick.png'
import imagesleft from '../../../../images/leftclick.png'
const Instructions = props => {
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if(showInstructions){
      const timeout = setTimeout(() => {
          setShowInstructions(false)
      }, 10100); // match with animation-delay in UtilitiesButtons.scss
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
    <Icon icon="info" className={styles.Icon} />
      { showInstructions &&
        <div className = {styles.Background}>
          <div className = {styles.Instructions}>
            <div className = {styles.Row}>
              <div className = {styles.Text}><h3>How to use OpenSpace:</h3></div>
            </div>
            <div className = {styles.Row}>
              <img src = {imagesleft} alt = "imagesleft" />
              <div className = {styles.Text}><p>: Orbit around Earth</p></div>
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
              <div className = {styles.TextCTRL}> <p> Ctrl </p> </div>
              <div className = {styles.Text}><p>+</p></div>
              <img src = {imagesleft} alt="imagesleft" />
              <div className = {styles.Text}>: Yaw or Pitch the Camera</div>
            </div>
          </div>
        </div>
      }
      <SmallLabel>Instructions</SmallLabel>
    </div>
  );
}

export default Instructions;
