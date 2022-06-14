import React, { useState, useCallback } from 'react'
import { useSelector, useDispatch } from "react-redux";

import Button from "../../common/Input/Button/Button";
import Input from "../../common/Input/Input/Input";
import ToggleContent from "../../common/ToggleContent/ToggleContent";
import MaterialIcon from "../../common/MaterialIcon/MaterialIcon";
import InfoBox from "../../common/InfoBox/InfoBox";
import Row from "../../common/Row/Row";
import { setPropertyTreeExpansion } from '../../../api/Actions';

import styles from './SoftwareIntegrationSession.scss';
import toggleHeaderStyles from '../../common/ToggleContent/ToggleHeader.scss';

const useIsSessionNameValid = () => {
  const rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
  const rg2 = /^(con|prn|aux|nul|com\d|lpt\d)$/i; // reserved on windows
  return useCallback((fname) => rg1.test(fname) && !rg2.test(fname), []);
};

const SaveSession = () => {
  const dispatch = useDispatch();
  const luaApi = useSelector((state) => state.luaApi);
  const expanded = useSelector((state) => state.local.propertyTreeExpansion["SoftwareIntegrationSessionHandlingUi"]);
  const isSessionNameValid = useIsSessionNameValid();

  const [sessionName, setSessionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSavedButNotChanged, setHasSavedButNotChanged] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const setExpanded = useCallback((expanded) => {
    if (!dispatch) return;
    dispatch(setPropertyTreeExpansion({
      identifier: "SoftwareIntegrationSessionHandlingUi",
      expanded,
    }));
  }, [dispatch]);

  const onSessionNameChange = (event) => {
    if (!event?.target) return;
    setHasSavedButNotChanged(false);
    setErrorMessage("");
    const value = event.target.value;
    setSessionName(value);
  };

  const onSave = async () => {
    if (!isSessionNameValid(sessionName)) {
      setErrorMessage('Invalid session name. It cannot include the characters "\ / : * ? " < > |."');
      return;
    }
    setLoading(true);

    try {
      // Tell OpenSpace to save the asset with the given filename
      let msg = await luaApi.softwareintegration.saveSession(sessionName);

      if (typeof msg === "object") {
        msg = msg[1];
      }

      switch (msg) {
        case "Success":
          setHasSavedButNotChanged(true);
          break;
        default:
          console.log(msg);
          setErrorMessage(msg);
          break;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToggleContent
      expanded={expanded}
      setExpanded={setExpanded}
      title="Save Session"
      header={(
        <header
          className={toggleHeaderStyles.toggle}
          onClick={() => setExpanded(!expanded)}
          role="button"
        >
          <MaterialIcon
            icon={expanded ? 'expand_more' : 'chevron_right'}
            className={toggleHeaderStyles.icon}
          />
          <span className={toggleHeaderStyles.title} >
            Save Session
          </span>
          <InfoBox
            className={styles.HeaderInfoBox}
            text={`Save the current state of the software integration module.
            The session will be saved as an asset and placed in the user asset folder.`}
          />
        </header>
      )}
    >
      <div
        className={
          `${styles.SaveSession} ${errorMessage ? styles.SaveSessionError : ""} ${hasSavedButNotChanged ? styles.SaveSessionDone : ""}
        `}
      >
        {errorMessage ? (
          <p className={styles.SaveSessionErrorMessage}>
            Could not save the session. {errorMessage}
          </p>
        ) : null}
        <Row className={styles.SaveSessionInputRow}>
          <Input
            onChange={onSessionNameChange}
            value={sessionName}
            placeholder="Session name..."
          />
          <Button
            onClick={onSave}
            title={`${loading ? "Saving" : hasSavedButNotChanged ? "Saved" : "Save"} session`}
            disabled={!sessionName || errorMessage || loading || hasSavedButNotChanged}
          >
            {loading ?
              <div class={styles.LoadingSpinner}>
                <div /><div /><div /><div />
              </div>
              :
              <MaterialIcon icon={hasSavedButNotChanged ? "check" : "save"} />
            }
          </Button>
        </Row>
      </div> 
      <div />
    </ToggleContent>
  )
};

export default SaveSession;