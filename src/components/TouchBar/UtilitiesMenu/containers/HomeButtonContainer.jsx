import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { resetStoryTree } from '../../../../api/Actions';
import HomeButton from '../presentational/HomeButton';

function HomeButtonContainer({ resetStory }) {
  const dispatch = useDispatch();

  function goToMenu() {
    dispatch(resetStoryTree(true));
    resetStory();
  }
  return (
    <HomeButton handleClick={goToMenu} />
  );
}

HomeButtonContainer.propTypes = {
  resetStory: PropTypes.func.isRequired
};

export default HomeButtonContainer;
