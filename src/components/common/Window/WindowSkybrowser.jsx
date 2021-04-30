import React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import styles from './WindowSkybrowser.scss';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import Button from '../Input/Button/Button';
import { excludeKeys } from '../../../utils/helpers';
import { Resizable } from 're-resizable';

const onResizeStop = (e, direction, ref, delta) => {
};


const WindowSkybrowser = (props) => {

  const { children, title, closeCallback, size, position } = props;

  return (

    <Draggable 
    defaultPosition={position} 
    handle=".header"
    >      
      <section
        className={styles.window}
        style={{
          width: size.width,
          height: size.height,
        }}
        {...excludeKeys(props, 'children title callback className closeCallback')}
      >         
        <Resizable
        enable={{
          top: false,
          right: true,
          left: false,
          bottom: true,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        defaultSize={{
          width:300,
          height:400,
        }}
        
        minWidth={300}
        minHeight={300}
        handleClasses={{
          top: styles.topHandle,
          right: styles.rightHandle,
          left: styles.leftHandle,
          bottom: styles.bottomHandle,
        }}
     
        onResizeStop={onResizeStop}
        >
          <header className="header">
          <div className={styles.title}>
            { title }
          </div>
          { closeCallback && (
            <Button onClick={closeCallback} transparent small>
              <MaterialIcon icon="close" className="small" />
            </Button>
          )}
          </header>     
          <section className={styles.filler}>
          { children }
          </section>
        </Resizable>
      </section>
    </Draggable>
  );
}

WindowSkybrowser.propTypes = {
  children: PropTypes.node,
  closeCallback: PropTypes.func,
  className: PropTypes.string,
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  size: PropTypes.shape({
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  title: PropTypes.string,
};

WindowSkybrowser.defaultProps = {
  children: '',
  closeCallback: null,
  className: '',
  position: { x: -50, y: -470 }, // position: { x: 10, y: 10 }, 
  size: { height: 'auto', width: 'auto' },
  title: 'WindowSkybrowser',
};

export default WindowSkybrowser;
