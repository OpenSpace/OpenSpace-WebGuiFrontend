import React from 'react';
import PropTypes from 'prop-types';
import ToggleContent from '../common/ToggleContent/ToggleContent';

const Group = ({ path }) => (

  <ToggleContent
    title={path}
  >
    Content.
  </ToggleContent>
);

Group.propTypes = {
  path: PropTypes.string.isRequired,
};

Group.defaultProps = {
};

export default Group;