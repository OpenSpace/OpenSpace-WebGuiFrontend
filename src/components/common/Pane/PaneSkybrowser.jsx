import React, {Component} from 'react';
import PropTypes from 'prop-types';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import { Resizable } from 're-resizable';
import styles from './PaneSkybrowser.scss';
import Pane from '../../Sidebar/Pane';
import Button from '../Input/Button/Button';
import { excludeKeys } from '../../../utils/helpers';
import { size } from 'lodash';


class PaneSkybrowser extends Component {

  render() {
    const { children, title, closeCallback, setAsAttached, setAsDetached } = this.props;

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
          width: '350px',
          height: '100%'
        }}
        minWidth={250}
        handleClasses={{left: styles.leftHandle}}
        onResizeStop={this.onResizeStop}
        >
          <header>
            <div className={styles.title}>
              { title }
            </div>
            { closeCallback && (
              <div>
              {
              <Button onClick={setAsDetached} transparent small>
                <MaterialIcon icon="filter_none" />
              </Button>
              }
              {
              <Button onClick={setAsAttached} transparent small>
                <MaterialIcon icon="open_in_browser" />
              </Button>
              }
              {
              <Button onClick={closeCallback} transparent small>
                <MaterialIcon icon="close" />
              </Button>
              }
            </div>) }
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
