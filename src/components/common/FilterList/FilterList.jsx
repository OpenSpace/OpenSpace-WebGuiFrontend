import React from 'react';
import PropTypes from 'prop-types';

import {
  ObjectWordBeginningSubstring,
  WordBeginningSubstring
} from '../../../utils/StringMatchers';
import CenteredLabel from '../CenteredLabel/CenteredLabel';
import Input from '../Input/Input/Input';
import ScrollOverlay from '../ScrollOverlay/ScrollOverlay';

import styles from './FilterList.scss';

function filterChildren({
  matcher, searchString, ignorePropsFilter, children
}) {
  // Filter the children on their props
  // Most matcher functions are case sensitive, hence toLowerCase
  const childArray = React.Children.toArray(children);
  const filteredChildren = childArray.filter((child) => {
    let matcherFunc;
    if (typeof child.props === 'object') {
      matcherFunc = ObjectWordBeginningSubstring;
    } else {
      matcherFunc = WordBeginningSubstring;
    }
    const finalMatcher = matcher || matcherFunc;
    const searchableChild = child.props ? { ...child.props } : child.toLowerCase();
    ignorePropsFilter.map((key) => delete searchableChild[key]);
    const isMatching = finalMatcher(searchableChild, searchString.toLowerCase());
    // Keep the virtual scroll for virtual lists
    return isMatching || child.type.displayName === 'FilterListVirtualScroll';
  });

  if (filteredChildren.length > 0) {
    return filteredChildren;
  }

  return <CenteredLabel>Nothing found. Try another search!</CenteredLabel>;
}

/**
 * FilterListFavorites
 */
function FilterListFavorites({ className = '', children = [] }) {
  return (
    <ScrollOverlay className={`${className}`}>
      {children}
    </ScrollOverlay>
  );
}

FilterListFavorites.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

FilterListFavorites.displayName = 'FilterListFavorites';

/**
 * FilterListData
 */
function FilterListData({
  matcher = undefined, searchString = '', ignorePropsFilter = [], className = '', children = []
}) {
  const content = filterChildren({
    matcher, searchString, ignorePropsFilter, children
  });
  return (
    <ScrollOverlay className={`${className}`}>
      {content}
    </ScrollOverlay>
  );
}

FilterListData.propTypes = {
  matcher: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  // A list of props that will be ignored in the search
  ignorePropsFilter: PropTypes.array,
  searchString: PropTypes.string
};

FilterListData.displayName = 'FilterListData';

/**
 * FilterListInputButton
 */
function FilterListInputButton({
  key = undefined, children = [], className = '', ...props
}) {
  return (
    <div key={key} className={`${styles.favoritesButton} ${className}`} {...props}>
      {children}
    </div>
  );
}

FilterListInputButton.propTypes = {
  key: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string
};

FilterListInputButton.displayName = 'FilterListInputButton';

/**
 * FilterListShowMoreButton
 */
function FilterListShowMoreButton({ key= '', toggleShowDataInstead = () => {}, showDataInstead = true}) {
  // Create "Less" and "More" toggle button
  return (
    <FilterListInputButton key={key} onClick={toggleShowDataInstead}>
      {showDataInstead ? 'Less' : 'More'}
    </FilterListInputButton>
  );
}

FilterListShowMoreButton.propTypes = {
  key: PropTypes.string,
  toggleShowDataInstead: PropTypes.func,
  showDataInstead: PropTypes.bool
};

FilterListShowMoreButton.displayName = 'FilterListShowMoreButton';

/**
 * FilterList
 */
function FilterList({
  children = [],
  className = '',
  height = undefined,
  ignorePropsFilter = ['active', 'onSelect'],
  matcher = undefined,
  searchAutoFocus = true,
  searchText = 'Search...'
}) {
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

  // See if children has favorites
  const hasFavorites = Boolean(React.Children.toArray(children).find((child) => child.type.displayName === 'FilterListFavorites'));

  const showFavorites = !isSearching && hasFavorites && !showDataInstead;
  const buttons = [];

  // Collect children, either favorites section or data section
  const filteredChildren = React.Children.map(children, (child) => {
    if (showFavorites && child.type.displayName === 'FilterListFavorites') {
      return child;
    }
    if (!showFavorites && child.type.displayName === 'FilterListData') {
      return React.cloneElement(child, { matcher, searchString, ignorePropsFilter });
    }
    if (child.type.displayName === 'FilterListShowMoreButton') {
      if (hasFavorites && !isSearching) {
        const key = 'FilterListShowMoreButton';
        buttons.push(React.cloneElement(child, { key, toggleShowDataInstead, showDataInstead }));
      }
    } else if (child.type.displayName === 'FilterListInputButton') {
      buttons.push(child);
    }
    return null;
  });

  return (
    <div className={`${styles.filterList} ${className}`} style={{ height }}>
      <Input
        value={searchString}
        placeholder={searchText}
        onChange={(e) => setSearchString(e.target.value)}
        clearable
        autoFocus={searchAutoFocus}
      >
        {buttons}
      </Input>
      {filteredChildren}
    </div>
  );
}

FilterList.propTypes = {
  /**
   * The child componetns of the list
   */
  children: PropTypes.node,
  /**
   * Class name to apply to the list
   */
  className: PropTypes.string,
  /**
   * An optional css height specification
   */
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  /**
   * the function used to filter the list
   */
  matcher: PropTypes.func,
  /**
   * Placeholder and label text for the search box
   */
  searchText: PropTypes.string,
  /**
   * Whether the search input field should gain focus automatically
   */
  searchAutoFocus: PropTypes.bool,
  /**
   * A list of props that will be ignored in the search
   */
  ignorePropsFilter: PropTypes.array
};

export {
  FilterList, FilterListData, FilterListFavorites, FilterListInputButton, FilterListShowMoreButton
};
