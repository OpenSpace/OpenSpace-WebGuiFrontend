import React from 'react';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

import styles from './Pane.scss';

function Pane({
  children, title, headerButton, closeCallback
}) {
  return (
    <section className={styles.Pane}>
      <header>
        <div className={styles.title}>
          { title }
        </div>
        { headerButton }
        { closeCallback && (
          <button type="button" onClick={closeCallback(false)} className={styles.close}>
            <Icon icon="material-symbols:close" className="small" />
          </button>
        )}
      </header>
      <div className={styles.content}>
        { children }
      </div>
    </section>
  );
}

Pane.propTypes = {
  children: PropTypes.node,
  closeCallback: PropTypes.func,
  title: PropTypes.node,
  headerButton: PropTypes.node
};

Pane.defaultProps = {
  children: [],
  closeCallback: null,
  title: null,
  headerButton: null
};

Pane.styles = styles;

export default Pane;
