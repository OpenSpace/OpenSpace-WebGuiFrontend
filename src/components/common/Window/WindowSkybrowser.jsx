import React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import styles from './WindowSkybrowser.scss';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import Button from '../Input/Button/Button';
import { excludeKeys } from '../../../utils/helpers';
import { Resizable } from 're-resizable';
import SkybrowserTabs from '../../common/Tabs/SkybrowserTabs';


const WindowSkybrowser = (props) => {

  const { children, title, closeCallback, setAsPane, setAsAttached, size, position, onResizeStop} = props;

  return (

    <Draggable
    defaultPosition={position}
    handle=".header">
      <section
      className={styles.window}
      {...excludeKeys(props, 'children title callback className closeCallback onResizeStop')}>
        <Resizable
        enable={{ right: true,bottom: true,}}
        defaultSize={{width: size.width, height: size.height }}
        minWidth={280}
        minHeight={280}
        handleClasses={{ right: styles.rightHandle, bottom: styles.bottomHandle }}
        onResizeStop={onResizeStop}>
          <header className="header">
          <div className={styles.title}>
            { title }
          </div>
          { closeCallback && (
            <div>
              {
                <Button onClick={setAsAttached} transparent small>
                  <MaterialIcon icon="open_in_browser" />
                </Button>
              }
               {
                <Button onClick={setAsPane} transparent small>
                  <MaterialIcon icon="exit_to_app" />
                </Button>
              }
              {
                <Button onClick={closeCallback} transparent small>
                  <MaterialIcon icon="close" className="small" />
                </Button>
              }
            </div>
          )}
          </header>
          <div className={styles.content}>
          <section className={styles.imageContent}>
            { children }
          </section>
          </div>
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
  position: { x: 10, y: -600 },
  size: { height: 'auto', width: 'auto' },
  title: 'WindowSkybrowser',
};

export default WindowSkybrowser;
