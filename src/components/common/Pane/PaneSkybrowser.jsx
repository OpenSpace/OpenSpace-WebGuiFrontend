import React, {Component} from 'react';
import PropTypes from 'prop-types';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import { Resizable } from 're-resizable';
import styles from './PaneSkybrowser.scss';
import Pane from '../../Sidebar/Pane';
import { excludeKeys } from '../../../utils/helpers';


class PaneSkybrowser extends Component {
 
  render() {
    const { children, title, closeCallback } = this.props;

    return (
      <section className={styles.pane}>
        <Resizable
        enable={{
            top: false,
            right: false,
            bottom: false,
            left: true,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
        }}
        defaultSize={{
          width:360,
          height: '100%'
        }}
        minWidth={300}
        handleClasses={{left: styles.leftHandle}}
        onResizeStop={this.onResizeStop}
        >
          <header>
            <div className={styles.title}>
              { title }
            </div>
            { closeCallback && (
              <button onClick={closeCallback} className={styles.close}>
                <MaterialIcon icon="close" className="small" />
              </button>
            ) }
          </header>
          <div className={styles.content}>
            { children }
          </div>   
        </Resizable>
      </section>
    );
  }
}

PaneSkybrowser.propTypes = {
  children: PropTypes.node,
  closeCallback: PropTypes.func,
  title: PropTypes.node,
};

PaneSkybrowser.defaultProps = {
  children: [],
  closeCallback: null,
  title: null,
};

PaneSkybrowser.styles = styles;

export default PaneSkybrowser;
