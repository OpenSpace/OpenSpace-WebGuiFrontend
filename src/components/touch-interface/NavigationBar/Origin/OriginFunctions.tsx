import React from 'react';
import SvgIcon from '../../../../components/common/SvgIcon/SvgIcon';
// import Anchor from 'svg-react-loader?name=Anchor!../../../../icons/anchor.svg';
// import Aim from 'svg-react-loader?name=Aim!../../../../icons/aim.svg';

import { IoTelescopeOutline } from 'react-icons/io5';
import { MdAirplanemodeInactive, MdFlight, MdOutlineAnchor } from 'react-icons/md';
import { RiFocus3Line } from 'react-icons/ri';

import styles from './OriginPicker.scss';
import LoadingString from '../../../../components/common/LoadingString/LoadingString';

interface AnchorAndAimPickerProps {
  anchorName?: string;
  aimName?: string;
}

interface CameraPathPickerProps {
  pathTargetNodeName: string;
  remainingTimeForPath: number;
  anchorName: string;
  onCancelFlight: () => void;
}

interface FocusPickerProps {
  anchorName?: string;
}

// AnchorAndAimPicker component
function AnchorAndAimPicker({ anchorName, aimName }: AnchorAndAimPickerProps) {
  const cappedAnchorName = anchorName?.substring(0, 20);
  const cappedAimName = aimName?.substring(0, 20);

  return (
    <div className={styles.Grid}>
      <div className={styles.Icon}>
        <MdOutlineAnchor />
      </div>
      <div className={styles.Title}>
        <span className={styles.Name}>
          <LoadingString loading={!anchorName}>{cappedAnchorName}</LoadingString>
        </span>
        <div className={styles.smallLabel}>Anchor</div>
      </div>
      <SvgIcon style={{ marginLeft: 10 }} className={styles.Icon}>
        <IoTelescopeOutline />
      </SvgIcon>
      <div className={styles.Title}>
        <span className={styles.Name}>
          <LoadingString loading={!aimName}>{cappedAimName}</LoadingString>
        </span>
        <div className={styles.smallLabel}>Aim</div>
      </div>
    </div>
  );
}

// CameraPathPicker component
function CameraPathPicker({
  pathTargetNodeName,
  remainingTimeForPath,
  anchorName,
  onCancelFlight
}: CameraPathPickerProps) {
  const cappedAnchorName = anchorName.substring(0, 20);
  const pathTargetNodeNameCapped = pathTargetNodeName.substring(0, 20);

  return (
    <>
      <div
        className={styles.grid}
        onClick={onCancelFlight}
        onKeyPress={onCancelFlight}
        role='button'
        tabIndex={0}
      >
        <div className={styles.cancelButton} onClick={onCancelFlight} onKeyPress={onCancelFlight}>
          <div className={styles.cancelButtonTitle}>
            <MdAirplanemodeInactive className={styles.smallPickerIcon} />
            {' Cancel'}
          </div>
          <div className={styles.cancelButtonLabel}>
            {' ('}
            <div className={styles.smallPickerIcon}>
              <MdOutlineAnchor />
            </div>
            <span className={styles.cancelButtonAnchorLabelText}>{cappedAnchorName}</span>
            {') '}
          </div>
        </div>
      </div>
      <div className={`${styles.grid} ${styles.blink}`}>
        <MdFlight className={styles.icon} />
        <div className={styles.title}>
          <span className={`${styles.name} ${styles.cancelButtonLabel}`}>
            {pathTargetNodeNameCapped}
          </span>
          <div className={styles.smallLabel}>
            {remainingTimeForPath}
            {'s'}
          </div>
        </div>
      </div>
    </>
  );
}

// FocusPicker component
function FocusPicker({ anchorName }: FocusPickerProps) {
  const cappedAnchorName = anchorName?.substring(0, 20);

  return (
    <div className={styles.Grid}>
      <div className={styles.Icon}>
        <RiFocus3Line />
      </div>
      <div className={styles.Title}>
        <span className={styles.Name}>
          <LoadingString loading={!anchorName}>{cappedAnchorName}</LoadingString>
        </span>
        <div className={styles.label}>Focus</div>
      </div>
    </div>
  );
}

export { AnchorAndAimPicker, CameraPathPicker, FocusPicker };
