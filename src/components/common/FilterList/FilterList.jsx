import PropTypes from 'prop-types';
import React from 'react';
import {
  ObjectWordBeginningSubstring,
  WordBeginningSubstring,
} from '../../../utils/StringMatchers';
import CenteredLabel from '../CenteredLabel/CenteredLabel';
import Input from '../Input/Input/Input';
import ScrollOverlay from '../ScrollOverlay/ScrollOverlay';
import styles from './FilterList.scss';

function filterChildren({ matcher, searchString, ignorePropsFilter, children }) {
  // Filter the children on their props
  // Most matcher functions are case sensitive, hence toLowerCase
  const childArray = React.Children.toArray(children);
  const filteredChildren = childArray.filter(child => {
    let matcherFunc;
    if (typeof child.props === 'object') {
      matcherFunc = ObjectWordBeginningSubstring;
    }
    else {
      matcherFunc = WordBeginningSubstring;
    }
    const finalMatcher = matcher || matcherFunc;
    let searchableChild = child.props ? { ...child.props } : child.toLowerCase();
    ignorePropsFilter.map(key => delete searchableChild[key]);
    const isMatching = finalMatcher(searchableChild, searchString.toLowerCase());
    // Keep the virtual scroll for virtual lists
    return isMatching || child.type.displayName === "FilterListVirtualScroll";
  });

  if (filteredChildren.length > 0) {
    return filteredChildren;
  }
  else {
    return <CenteredLabel>Nothing found. Try another search!</CenteredLabel>;
  }
}

function FilterListFavorites({ className, children }) {
  return (
    <ScrollOverlay className={`${className}`}>
      {children}
    </ScrollOverlay>
  );
}

FilterListFavorites.displayName = 'FilterListFavorites';

function FilterListData({ matcher, searchString, ignorePropsFilter, className, children }) {
  const content = filterChildren({ matcher, searchString, ignorePropsFilter, children });
  return (
    <ScrollOverlay className={`${className}`}>
      {content}
    </ScrollOverlay>
  );
}

FilterListData.displayName = 'FilterListData';

function FilterListInputButton({key, children, className, ...props}) {
  return <div key={key} className={`${styles.favoritesButton} ${className}`} {...props}>
    {children}
  </div>;
}

FilterListInputButton.displayName = 'FilterListInputButton';

function FilterListShowMoreButton({ key, toggleShowDataInstead, showDataInstead }) {
  // Create "Less" and "More" toggle button
  return (
    <FilterListInputButton key={key} onClick={toggleShowDataInstead}>
      {showDataInstead ? "Less" : "More"}
    </FilterListInputButton>
  );
}

FilterListShowMoreButton.displayName = 'FilterListShowMoreButton';

function FilterList({ matcher, ignorePropsFilter, searchText, height, className, searchAutoFocus, children}) {
  const [searchString, setSearchString] = React.useState("");
  const [showDataInstead, setShowDataInstead] = React.useState(false);
  const isSearching = searchString !== "";

  function toggleShowDataInstead() {
    setShowDataInstead(current => !current);
  }

  if(!children) {
    console.error("FilterList has no children");
    return <></>;
  }

  // See if children has favorites
  const hasFavorites = Boolean(React.Children.toArray(children).find(child => {
    return child.type.displayName === "FilterListFavorites";
  }));

  let showFavorites = !isSearching && hasFavorites && !showDataInstead;
  let buttons = [];

  // Collect children, either favorites section or data section
  const filteredChildren = React.Children.map(children, child => {
    if (showFavorites && child.type.displayName === "FilterListFavorites") {
      return child;
    }
    else if (!showFavorites && child.type.displayName === "FilterListData") {
      return React.cloneElement(child, { matcher, searchString, ignorePropsFilter })
    }
    else if (child.type.displayName === "FilterListShowMoreButton") {
      if (hasFavorites && !isSearching) {
        const key = "FilterListShowMoreButton";
        buttons.push(React.cloneElement(child, { key, toggleShowDataInstead, showDataInstead }));
      }
    }
    else if (child.type.displayName === "FilterListInputButton") {
      buttons.push(child);
    }
  });

  return <div className={`${styles.filterList} ${className}`} style={{ height: height }}>
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
  </div>;
}

FilterList.propTypes = {
  /**
   * Class name to apply to the list
   */
  className: PropTypes.string,
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
  ignorePropsFilter: PropTypes.array,
};

FilterList.defaultProps = {
  className: '',
  matcher: undefined,
  searchText: 'Search...',
  searchAutoFocus: true,
  ignorePropsFilter: ['active', 'onSelect'],
};

export {FilterList, FilterListData, FilterListInputButton, FilterListFavorites, FilterListShowMoreButton};
