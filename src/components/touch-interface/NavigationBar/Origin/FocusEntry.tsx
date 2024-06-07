import React from 'react';
import { MdCenterFocusStrong, MdFlashOn, MdFlight, MdMoreVert } from 'react-icons/md';
import { RiFocus3Line } from 'react-icons/ri';

import { useSelector } from 'react-redux';

// eslint-disable-next-line import/no-webpack-loader-syntax

import { useContextRefs } from '../../../GettingStartedTour/GettingStartedContext';

import styles from './FocusEntry.scss';

interface RootState {
  luaApi: {
    pathnavigation: {
      flyTo: (identifier: string, speed?: number) => void;
      createPath: (config: any) => void;
    };
    setPropertyValueSingle: (
      property: string,
      value: number,
      duration: number,
      easeType: string
    ) => void;
  };
}

interface FocusEntryProps {
  name?: string;
  identifier: string;
  onSelect?: (identifier: string, event: React.MouseEvent | React.KeyboardEvent) => void;
  active?: string;
  showNavigationButtons?: boolean;
}

function FocusEntry({
  name,
  identifier,
  onSelect,
  active,
  showNavigationButtons
}: FocusEntryProps) {
  const luaApi = useSelector((state: RootState) => state.luaApi);
  function isActive() {
    return identifier === active;
  }

  function select(evt: React.MouseEvent) {
    if (onSelect) {
      onSelect(identifier, evt);
    }
  }

  function keyboardSelect(evt: React.KeyboardEvent) {
    if (evt.key === 'Enter' && onSelect) {
      onSelect(identifier, evt);
    }
  }

  const flyTo = (event: React.MouseEvent) => {
    if (event.shiftKey) {
      luaApi.pathnavigation.flyTo(identifier, 0.0);
    } else {
      luaApi.pathnavigation.flyTo(identifier);
    }
    event.stopPropagation();
  };

  const zoomToFocus = (event: React.MouseEvent) => {
    if (event.shiftKey) {
      luaApi.pathnavigation.createPath({
        TargetType: 'Node',
        Target: identifier,
        Duration: 0,
        PathType: 'Linear'
      });
    } else {
      luaApi.pathnavigation.createPath({
        TargetType: 'Node',
        Target: identifier,
        PathType: 'Linear'
      });
    }

    event.stopPropagation();
  };

  // Jump to?
  const fadeTo = async (event: React.MouseEvent) => {
    event.stopPropagation();

    const fadeTime = 1;
    const promise = new Promise((resolve) => {
      luaApi.setPropertyValueSingle('RenderEngine.BlackoutFactor', 0, fadeTime, 'QuadraticEaseOut');
      setTimeout(() => resolve('done!'), fadeTime * 1000);
    });
    await promise;
    luaApi.pathnavigation.flyTo(identifier, 0.0);
    luaApi.setPropertyValueSingle('RenderEngine.BlackoutFactor', 1, fadeTime, 'QuadraticEaseIn');
  };

  const refs = useContextRefs();

  return (
    <div
      className={`${styles.entry} ${isActive() ? styles.active : ''}`}
      onClick={select}
      onKeyPress={keyboardSelect}
      key={name}
      role='button'
      ref={(el) => {
        // Use if name is not null
        if (name) {
          refs.current[name] = el;
        }
      }}
      tabIndex={0}
    >
      <div className={styles.buttonTitleContainer}>
        <div className={styles.focusButton} onClick={select} title='Focus'>
          <RiFocus3Line className={styles.buttonIcon} />
        </div>
        <span className={styles.titleContainer}>{name || identifier}</span>
      </div>

      <div>
        {showNavigationButtons && (
          <div className={styles.buttonContainer}>
            <div className={styles.flyToButton} onClick={zoomToFocus} title='Zoom to'>
              <MdCenterFocusStrong className={styles.buttonIcon} />
            </div>

            <div className={styles.flyToButton} onClick={flyTo} title='Fly to'>
              <MdFlight className={styles.buttonIcon} />
            </div>

            <div className={styles.flyToButton} onClick={fadeTo} title='Fade to'>
              <MdFlashOn className={styles.buttonIcon} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FocusEntry;
