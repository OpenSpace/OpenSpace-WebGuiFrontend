import React from 'react';

import styles from './TourPopup.scss';

function KeyboardButton({ buttonText, ...props }) {
  return (
    <div className={`${styles.keyboardButton} ${styles.centerContent}`} {...props}>
      <p className={styles.keyboardButtonText}>{buttonText}</p>
    </div>
  );
}

function AnimatedArrows({ ...props }) {
  return (
    <div className={styles.arrows} {...props}>
      <div style={{ padding: '10px' }}>
        <span />
        <span />
      </div>
    </div>
  );
}

function AnimatedMouse({ button, ...props }) {
  let style = null;
  if (button === 'right') {
    style = {
      flexDirection: 'column',
      paddingTop: '0px',
      paddingBottom: '20px',
      marginRight: '20px'
    };
  }
  const rotation = button === 'right' ? [0, 180] : [-90, 90];
  return (
    <div className={`${styles.mouseContainer} ${styles.centerContent}`} style={style} {...props}>
      <AnimatedArrows style={{ transform: `rotate(${rotation[0]}deg)` }} />
      <div className={styles.mouse}>
        {button === 'left' && <div className={styles.leftButton} />}
        {button === 'right' && <div className={styles.rightButton} />}
        {button === 'scroll' && <div className={styles.mouseButton} />}
        <div className={styles.bar} />
        <div className={styles.verticalBar} />
      </div>
      <AnimatedArrows style={{ transform: `rotate(${rotation[1]}deg)` }} />
    </div>
  );
}

function MouseDescriptions({
  button, info, description, keyboardButton
}) {
  return (
    <div className={styles.mouseDescription}>
      <p className={`${styles.text} ${styles.mouseButtonText}`}>
        <i>{info}</i>
        {' '}
        <br />
        {' '}
        { description }
      </p>
      {keyboardButton && (
        <>
          <KeyboardButton buttonText={keyboardButton} />
          <p className={styles.plus}>+</p>
        </>
      )}
      <AnimatedMouse button={button} />
    </div>
  );
}

export default MouseDescriptions;
