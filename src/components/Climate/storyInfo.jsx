
import React, { Component, useState } from 'react';

import styles from './Button.scss';


export default function showInfo(storyInfo){

    const [showMore, setShowMore] = useState(false)

    return(
    <div className = {styles.confirm_selection}>
    <p>
      {showMore ? storyInfo : `${soryInfo.substring(0, 250)}`}
      <button className="btn" onClick={() => setShowMore(!showMore)}>
        {showMore ? "Show less" : "Show more"}

      </button>
    </p>
</div>
);
}
