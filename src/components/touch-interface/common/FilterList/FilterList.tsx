import React from 'react';
import {
  ObjectWordBeginningSubstring,
  WordBeginningSubstring
} from '../../../../utils/StringMatchers';
import CenteredLabel from '../../../common/CenteredLabel/CenteredLabel';
// import Input from '../../../common/Input/Input/Input'; //old jsx file path
import Input from '../Input/Input';
import ScrollOverlay from '../../common/ScrollOverlay/ScrollOverlay';
import { MdMoreHoriz } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';

import styles from './FilterList.scss';

type MatcherFunc = (input: any, searchString: string) => boolean;

interface FilterChildrenProps {
  matcher?: MatcherFunc;
  searchString: string;
  ignorePropsFilter: string[];
  children: React.ReactNode;
}

function filterChildren({
  matcher,
  searchString = '',
  ignorePropsFilter,
  children
}: FilterChildrenProps) {
  const childArray = React.Children.toArray(children);

  const filteredChildren = childArray.filter((child) => {
    let matcherFunc: MatcherFunc;
    if (React.isValidElement(child) && typeof child.props === 'object') {
      matcherFunc = ObjectWordBeginningSubstring;
    } else {
      matcherFunc = WordBeginningSubstring;
    }

    const finalMatcher = matcher || matcherFunc;
    let searchableChild: Record<string, any> | string;

    if (React.isValidElement(child)) {
      searchableChild = { ...(child.props as Record<string, any>) };
      ignorePropsFilter.forEach((key) => {
        if (searchableChild && typeof searchableChild === 'object') {
          delete searchableChild[key];
        }
      });
    } else {
      searchableChild = String(child).toLowerCase();
    }

    const isMatching = finalMatcher(searchableChild, searchString.toLowerCase());
    return (
      isMatching ||
      (React.isValidElement(child) &&
        (child.type as React.ComponentType).displayName === 'FilterListVirtualScroll')
    );
  });

  if (filteredChildren.length > 0) {
    return filteredChildren;
  }

  return <div className={styles.center}>Nothing found. Try another search!</div>;
}

interface FilterListFavoritesProps {
  className?: string;
  children: React.ReactNode;
}

function FilterListFavorites({ className = '', children }: FilterListFavoritesProps) {
  const nonNullChildren = React.Children.toArray(children).filter(Boolean);

  return <div className={`${className}`}>{nonNullChildren}</div>;
}

FilterListFavorites.displayName = 'FilterListFavorites';

interface FilterListDataProps {
  matcher?: MatcherFunc;
  searchString?: string;
  ignorePropsFilter?: string[];
  height?: string | number;
  className?: string;
  searchAutoFocus?: boolean;
  children: React.ReactNode;
}

function FilterListData({
  matcher,
  searchString = '',
  ignorePropsFilter = [],
  className = '',
  children
}: FilterListDataProps) {
  const content = filterChildren({
    matcher,
    searchString,
    ignorePropsFilter,
    children
  });
  return <div className={`${className}`}>{content}</div>;
}

FilterListData.displayName = 'FilterListData';

interface FilterListInputButtonProps {
  onClick: () => void;
  key: string;
  className?: string;
  children?: React.ReactNode;
}

function FilterListInputButton({ key, children, className, ...props }: FilterListInputButtonProps) {
  return (
    <div key={key} className={`${styles.favoritesButton} ${className}`} {...props}>
      {children}
    </div>
  );
}

FilterListInputButton.displayName = 'FilterListInputButton';

interface FilterListShowMoreButtonProps {
  id: string;
  toggleShowDataInstead: () => void;
  showDataInstead: boolean;
}

function FilterListShowMoreButton({
  id,
  toggleShowDataInstead,
  showDataInstead
}: FilterListShowMoreButtonProps) {
  return (
    <FilterListInputButton key={id} onClick={toggleShowDataInstead} className=''>
      {showDataInstead ? <IoMdClose /> : <MdMoreHoriz />}
    </FilterListInputButton>
  );
}

FilterListShowMoreButton.displayName = 'FilterListShowMoreButton';

interface FilterListProps {
  matcher?: MatcherFunc;
  ignorePropsFilter?: string[];
  searchText: string;
  height?: string | number;
  className?: string;
  searchAutoFocus?: boolean;
  children: React.ReactNode;
}

function FilterList({
  matcher,
  ignorePropsFilter = ['active', 'onSelect'],
  searchText,
  height,
  className = '',
  searchAutoFocus = false,
  children
}: FilterListProps) {
  const [searchString, setSearchString] = React.useState('');
  const [showDataInstead, setShowDataInstead] = React.useState(false);
  const isSearching = searchString !== '';

  function toggleShowDataInstead() {
    setShowDataInstead((current) => !current);
  }

  if (!children) {
    console.error('FilterList has no children');
    return null;
  }

  const hasFavorites = Boolean(
    React.Children.toArray(children).find(
      (child) =>
        React.isValidElement(child) &&
        typeof child.type !== 'string' &&
        'displayName' in child.type &&
        child.type.displayName === 'FilterListFavorites'
    )
  );

  const showFavorites = !isSearching && hasFavorites && !showDataInstead;
  const buttons: React.ReactNode[] = [];

  const filteredChildren = React.Children.map(children, (child) => {
    if (
      showFavorites &&
      React.isValidElement(child) &&
      (child.type as React.ComponentType).displayName === 'FilterListFavorites'
    ) {
      return child;
    }

    if (
      !showFavorites &&
      React.isValidElement(child) &&
      (child.type as React.ComponentType).displayName === 'FilterListData'
    ) {
      return React.cloneElement(child, {
        matcher,
        searchString,
        ignorePropsFilter
      } as FilterListDataProps);
    }

    if (
      React.isValidElement(child) &&
      (child.type as React.ComponentType).displayName === 'FilterListShowMoreButton'
    ) {
      if (hasFavorites && !isSearching) {
        const key = 'FilterListShowMoreButton';
        buttons.push(
          React.cloneElement(child as React.ReactElement, {
            key,
            toggleShowDataInstead,
            showDataInstead
          })
        );
      }
    } else if (
      React.isValidElement(child) &&
      (child.type as React.ComponentType).displayName === 'FilterListInputButton'
    ) {
      buttons.push(child);
    }

    return null;
  });

  return (
    <div className={`${styles.filterList} ${className}`} style={{ height }}>
      <div className={styles.searchBar}>
        <Input
          value={searchString}
          placeholder={searchText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchString(e.target.value)}
          clearable
          autoFocus={searchAutoFocus}
          wide
        >
          {buttons}
        </Input>
      </div>
      {filteredChildren}
    </div>
  );
}

export {
  FilterList,
  FilterListData,
  FilterListFavorites,
  FilterListInputButton,
  FilterListShowMoreButton
};
