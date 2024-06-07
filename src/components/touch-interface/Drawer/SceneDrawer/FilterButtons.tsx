import React, { Dispatch, SetStateAction } from 'react';
import Button from '../../common/Button/Button';

import styles from './FilterButtons.scss';
import { IoCheckmark } from 'react-icons/io5';

export interface FilterButtonsProps {
  filterStrings: string[];
  setFilter: Dispatch<SetStateAction<string>>;
  filter: string;
}
export const FilterButtons = ({ filterStrings, setFilter, filter }: FilterButtonsProps) => {
  return (
    <div className={styles.buttonsContainer}>
      <div className={styles.scrollContainer}>
        {filterStrings.map((filterString) => (
          <button
            key={filterString}
            className={`${styles.button} ${filterString === filter ? styles.active : ''}`}
            onClick={() =>
              setFilter((prevFilter) => (prevFilter === filterString ? '' : filterString))
            }
          >
            {filterString === filter && <IoCheckmark size={18} />}
            <span>{filterString}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
