import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../common/Icon/Icon';
import Resizable from 're-resizable';

import styles from './Pane.scss';

//TODO should work with 100%......
const SizeObj = {height: '96%'};

const HandleArrow = () => (
  <svg viewBox="0 0 32 32" 
    viewBox="0 0 32 32" 
    aria-hidden="true">
      <path d="M11.303 8l11.394 7.997L11.303 24z"/>
  </svg>
)

const CustomHandle = props => (
  <div
    style={{
      background: '#fff',
      borderRadius: '2px',
      border: '1px solid #ddd',
      height: '100%',
      width: '100%',
      padding: 0,
    }}
    className={'SomeCustomHandle'}
    {...props}
  />
)
const BottomRightHandle = () => (
  <CustomHandle className={styles.iconCaretRight}>
    <HandleArrow />
  </CustomHandle>
)

const Pane = ({ children, title, closeCallback }) => (
  <Resizable size={SizeObj} handleComponent={{bottomRight: BottomRightHandle}}>
    <section className={styles.Pane}>
      <header>
        <div className={styles.title}>
          { title }
        </div>

        { closeCallback && (
          <button onClick={closeCallback(false)} className={styles.close}>
            <Icon icon="close" className="small" />
          </button>
        ) }
      </header>
      <div className={styles.content}>
        { children }
      </div>
    </section>
  </Resizable>
);

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
