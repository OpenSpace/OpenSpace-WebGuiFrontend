import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  ObjectWordBeginningSubstring,
  WordBeginningSubstring,
} from '../../../utils/StringMatchers';
import CenteredLabel from '../CenteredLabel/CenteredLabel';
import Input from '../Input/Input/Input';
import ScrollOverlay from '../ScrollOverlay/ScrollOverlay';
import styles from './FilterList.scss';

class FilterList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      search: '',
    };

    this.changeSearch = this.changeSearch.bind(this);
  }

  get filtered() {
    const {
      favorites, showFavorites, data, matcher,
    } = this.props;

    let { search } = this.state;
    if (search === '' && showFavorites) {
      return favorites || data;
    }

    let defaultMatcher = WordBeginningSubstring;
    if (data.length > 0 && typeof data[0] === 'object') {
      defaultMatcher = ObjectWordBeginningSubstring;
    }

    // most matcher functions are case sensitive
    search = search.toLowerCase();
    const matcherFunc = matcher || defaultMatcher;

    return data.filter(entry => matcherFunc(entry, search));
  }

  changeSearch({ currentTarget }) {
    this.setState({ search: currentTarget.value });
  }

  render() {
    const {
      active,
      className,
      onSelect,
      searchAutoFocus,
      searchText,
      showFavorites,
      viewComponent,
    } = this.props;
    const { search } = this.state;
    const entries = this.filtered;

    const EntryComponent = viewComponent;

    let inputChildren = null;

    if (this.props.setShowFavorites && search === '') {
      if (showFavorites) {
        inputChildren = (
          <div
            className={styles.favoritesButton}
            onClick={() => this.props.setShowFavorites(false)}
          >
            More
          </div>
        );
      } else {
        inputChildren = (
          <div className={styles.favoritesButton} onClick={() => this.props.setShowFavorites(true)}>
            Less
          </div>
        );
      }
    }

    return (
      <div className={`${className} ${styles.filterList}`} style={{ height: this.props.height }}>
        <Input
          value={search}
          placeholder={searchText}
          onChange={this.changeSearch}
          clearable
          autoFocus={searchAutoFocus}
        >
          {inputChildren}
        </Input>

        <ScrollOverlay>
          {entries.length === 0 && (
            <CenteredLabel>Nothing found. Try another search!</CenteredLabel>
          )}
          <ul>
            {entries.map((entry, index) => (
              <EntryComponent
                {...entry}
                {...this.props.viewComponentProps}
                key={entry.key || index}
                onSelect={onSelect}
                active={active}
              />
            ))}
          </ul>
        </ScrollOverlay>
      </div>
    );
  }
}

FilterList.propTypes = {
  /**
   * the currently active entry, if any. Should be compared strict in viewComponent
   */
  // eslint-disable-next-line react/forbid-prop-types
  active: PropTypes.any,
  /**
   * Class name to apply to the list
   */
  className: PropTypes.string,
  /**
   * the data to display
   */
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.array.isRequired,
  /**
   * Optional: data to display when there is no search term
   * Defaults to the same as `data`
   */
  favorites: PropTypes.array,
  /**
   * Show favorites
   */
  showFavorites: PropTypes.bool,
  /**
   * Optional: set show favorites.
   * Takes one bool specifying if only the favorites should
   * be shown when the search field is empty.
   */
  setShowFavorites: PropTypes.func,
  /**
   * the function used to filter the list
   */
  matcher: PropTypes.func,
  /**
   * callback method for selecting an option
   */
  onSelect: PropTypes.func,
  /**
   * Placeholder and label text for the search box
   */
  searchText: PropTypes.string,
  /**
   * Whether the search input field should gain focus automatically
   */
  searchAutoFocus: PropTypes.bool,
  /**
   * the component used to display entries
   */
  viewComponent: PropTypes.elementType,

  /**
   * props to pass to the view component
   */
  viewComponentProps: PropTypes.object,
};

FilterList.defaultProps = {
  active: null,
  className: '',
  favorites: undefined,
  matcher: undefined,
  onSelect: () => {},
  showFavorites: true,
  setShowFavorites: undefined,
  searchText: 'Search...',
  searchAutoFocus: false,
  viewComponent: props => <li>{JSON.stringify(props)}</li>,
  viewComponentProps: {},
};

export default FilterList;
