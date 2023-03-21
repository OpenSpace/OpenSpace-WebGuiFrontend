import React from 'react';
import Error from '../components/common/Error/Error';
import Overlay from '../components/common/Overlay/Overlay';

const NotFound = () => (
  <Overlay>
    <Error>
      <h1>404</h1>
      <p>
        Snap! Something went wrong here.
      </p>
    </Error>
  </Overlay>
);

export default NotFound;
