import PropTypes from 'prop-types';
import React, { Component } from 'react';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import styles from './Pane.scss';

class Pane extends Component {
  render() {
    const { children, title, closeCallback } = this.props;

    return (
      <section className={styles.Pane}>
        <header>
          <div className={styles.title}>
            { title }
          </div>

          { closeCallback && 
            <button onClick={closeCallback(false)} className={styles.close}>
              <MaterialIcon icon="close" className="small" />
            </button>
          }
        </header>
        <div className={styles.content}>
          { children }
        </div>
      </section>
    );
  }
}

Pane.propTypes = {
  children: PropTypes.node,
  closeCallback: PropTypes.func,
  title: PropTypes.node,
};

Pane.defaultProps = {
  children: [],
  closeCallback: null,
  title: null,
};

Pane.styles = styles;

export default Pane;
