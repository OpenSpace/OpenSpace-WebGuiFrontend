import PropTypes from 'prop-types';
import React, { useState, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from "react-redux";

import Button from "../../common/Input/Button/Button";
import MaterialIcon from "../../common/MaterialIcon/MaterialIcon";
import { refreshGroups, removePropertyOwners } from '../../../api/Actions';

import styles from './RemoveSoftwareIntegrationSgn.scss';

const RemoveSoftwareIntegrationSceneGraphNode = ({ identifier }) => {
  const dispatch = useDispatch();
  const luaApi = useSelector((state) => state.luaApi);
  const propertyOwners = useSelector((state) => state.propertyTree.propertyOwners);

  useEffect(() => {
    console.log("propertyOwners: ", propertyOwners)
  }, [propertyOwners]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onClick = async () => {
    setLoading(true);

    try {
      // Tell OpenSpace to save the asset with the given filename
      let msg = await luaApi.softwareintegration.queueRemoveSceneGraphNodeScript(identifier);

      if (typeof msg === "object") {
        msg = msg[1];
      }

      if (msg != "Success") {
        setErrorMessage(msg);
        return;
      }

      let uriToRemove = ""
      for (const [uri, propertyOwner] of Object.entries(propertyOwners)) {
        if (propertyOwner.identifier === identifier) {
          uriToRemove = uri;
          break;
        }
      }

      if (uriToRemove !== "") {
        dispatch(removePropertyOwners(uriToRemove));
        dispatch(refreshGroups());
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className={styles.RemoveSceneGraphNode}>
      {errorMessage ? (
        <p className={styles.RemoveSceneGraphNodeErrorMessage}>
          Could not remove SceneGraphNode. {errorMessage}
        </p>
      ) : null}
      <Button
        onClick={onClick}
        title={`${loading ? "Removing" : "Remove"} SceneGraphNode`}
        disabled={errorMessage || loading}
        className={styles.RemoveSceneGraphNodeButton}
      >
        {loading ?
          <div className={styles.LoadingSpinner}>
            <div /><div /><div /><div />
          </div>
          :
          "Remove SceneGraphNode"
        }
      </Button>
    </div> 
  )
};

RemoveSoftwareIntegrationSceneGraphNode.propTypes = {
  identifier: PropTypes.string.isRequired
};

RemoveSoftwareIntegrationSceneGraphNode.defaultProps = {
};

export default RemoveSoftwareIntegrationSceneGraphNode;