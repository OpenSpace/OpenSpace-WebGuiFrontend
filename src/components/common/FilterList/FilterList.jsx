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

function FilterListFavorites({ className, children }) {
  return (
    <ScrollOverlay className={`${className}`}>
      {children}
    </ScrollOverlay>
  );
}

FilterListFavorites.displayName = 'FilterListFavorites';

function FilterListData({matcher, searchString, ignorePropsFilter, className, children}) {
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
    let searchableChild = child.props ? {...child.props} : child.toLowerCase();
    ignorePropsFilter.map(key => delete searchableChild[key]);
    return finalMatcher(searchableChild, searchString.toLowerCase());
  });
  let content = undefined;
  if (filteredChildren.length > 0) {
    content = filteredChildren;
  }
  else {
    content = <CenteredLabel>Nothing found. Try another search!</CenteredLabel>;
  }
  return (
      <ScrollOverlay className={`${className}`}>
        { content }
      </ScrollOverlay>
    );
}

FilterListData.displayName = 'FilterListData';

function InputButton({children, ...props}) {
  return <div className={styles.favoritesButton} {...props}>
    {children}
  </div>;
}

function FilterList({showMoreButton = false, matcher, ignorePropsFilter, searchText, height, className, searchAutoFocus, children}) {
  const [searchString, setSearchString] = React.useState("");
  const [showDataInstead, setShowDataInstead] = React.useState(false);
  const isSearching = searchString !== "";
  const showDataInsteadOfFavorites = showMoreButton ? showDataInstead : false;

  if(!children) {
    console.error("FilterList has no children");
    return <></>;
  }
  // See if children has favorites
  const hasFavorites = Boolean(React.Children.toArray(children).find(child => {  
    return child.type.displayName === "FilterListFavorites";
  }));

  let showFavorites = !isSearching && hasFavorites && !showDataInsteadOfFavorites;

  // Collect children, either favorites section or data section
  const filteredChildren = React.Children.map(children, child => {
    if(showFavorites && child.type.displayName === "FilterListFavorites") {
      return child;
    }
    else if(!showFavorites && child.type.displayName === "FilterListData") {
      return React.cloneElement(child, { matcher, searchString, ignorePropsFilter })
    }
  })

  // Create "Less" and "More" toggle button
  let lessMoreToggle = null;
  if (hasFavorites && showMoreButton && !isSearching) {
      lessMoreToggle = <InputButton onClick={() => setShowDataInstead(!showDataInstead)}>
      {showDataInstead ? "Less" : "More"}
      </InputButton>;
  }

  return <div className={`${styles.filterList} ${className}`} style={{ height: height }}>
    <Input
      value={searchString}
      placeholder={searchText}
      onChange={(e) => setSearchString(e.target.value)}
      clearable
      autoFocus={searchAutoFocus}
    >
      {lessMoreToggle}
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
   * 
   */
  ignorePropsFilter: PropTypes.array
};

FilterList.defaultProps = {
  className: '',
  matcher: undefined,
  searchText: 'Search...',
  searchAutoFocus: true,
  ignorePropsFilter: ['active', 'onSelect']
};

export {FilterList, FilterListData, FilterListFavorites};
