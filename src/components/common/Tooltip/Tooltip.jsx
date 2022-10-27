import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom'
import { excludeKeys } from '../../../utils/helpers';
import styles from './Tooltip.scss';

const Tooltip = (props) => {
  const { children, placement, fixed } = props;

  const [domReady, setDomReady] = React.useState(false)
  React.useEffect(() => {
    setDomReady(true)
  })

  // @TODO (emmbr, 2022-10-27): Refactor tooltip class to always use the 'fixed' positioning

  // Render tooltips independent from their stacking contexts, by drawing it at root level.
  // Fixes all problems with positioning, as long as "fixed" positioning (in relation 
  // to viewport) is used
  return domReady && ReactDom.createPortal(
    <div
      {...excludeKeys(props, 'placement fixed')}
      className={`${styles.tooltip} ${styles[placement]} ${fixed && styles.fixed}`}
    >
      { children }
    </div>,
    document.getElementById('root')
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  placement: PropTypes.oneOf('top right bottom left'.split(' ')),
  fixed: PropTypes.bool,
};

Tooltip.defaultProps = {
  placement: 'top',
  fixed: false,
};

export default Tooltip;
