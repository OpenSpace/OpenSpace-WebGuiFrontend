import React from 'react';
import { MdClose, MdOutlineFilterNone } from 'react-icons/md';
import PropTypes from 'prop-types';

import Button from '../Input/Button/Button';
import Window from '../Window/Window';

import styles from './Popover.scss';

const findStyles = (arr) => arr.split(' ')
  .map((style) => styles[style] || style)
  .join(' ');

function Popover({
  attached, className, title, headerButton, detachable, closeCallback, children, ...props
}) {
  const [isDetached, setIsDetached] = React.useState(!attached);

  function arrowStyle() {
    return findStyles('arrow bottom center');
  }

  function getStyles() {
    return findStyles(className);
  }

  function toggleDetach() {
    setIsDetached((oldState) => !oldState);
  }

  function topBar() {
    return (
      title && (
        <header className={styles.header}>
          <div className={styles.title}>
            { title }
          </div>

          <div style={{ display: 'flex' }}>
            { headerButton && headerButton }
            { detachable && (
              <Button onClick={toggleDetach} transparent small>
                <MdOutlineFilterNone />
              </Button>
            )}
            { closeCallback && (
              <Button onClick={closeCallback} transparent small>
                <MdClose className="small" />
              </Button>
            )}
          </div>
        </header>
      )
    );
  }

  function asPopup() {
    return (
      <section
        {...props}
        className={`${styles.popover} ${arrowStyle()} ${getStyles()}`}
      >
        { topBar() }
        { children }
      </section>
    );
  }

  function asWindow() {
    return (
      <Window
        {...props}
        className={`${getStyles()}`}
        title={title}
        closeCallback={closeCallback}
        headerButton={headerButton}
      >
        {children}
      </Window>
    );
  }

  return isDetached ? asWindow() : asPopup();
}

Popover.propTypes = {
  attached: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  closeCallback: PropTypes.func,
  detachable: PropTypes.bool,
  headerButton: PropTypes.element,
  title: PropTypes.string
};

Popover.defaultProps = {
  attached: true,
  className: '',
  closeCallback: null,
  detachable: false,
  headerButton: undefined,
  title: null
};

Popover.styles = styles;

export default Popover;
