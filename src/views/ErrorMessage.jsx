import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import Error from '../components/common/Error/Error';
import Button from '../components/common/Input/Button/Button';
import Overlay from '../components/common/Overlay/Overlay';

export default function ErrorMessage() {
  const connectionLost = useSelector((state) => state.connection.connectionLost);
  const location = useLocation();

  const header = "Houston, we've had a...";
  const line1 = '...disconnection between the user interface and OpenSpace.';
  const line2 = 'Trying to reconnect automatically, but you may want to...';
  const line3 = 'Reload the user interface';

  function reloadGui() {
    if (location.reload) {
      location.reload();
    }
  }

  return (connectionLost && (
    <Overlay>
      <Error>
        <h2>{header}</h2>
        <p>{line1}</p>
        <p>{line2}</p>
        <Button className={Error.styles.errorButton} onClick={reloadGui}>
          {line3}
        </Button>
      </Error>
    </Overlay>
  )
  );
}
