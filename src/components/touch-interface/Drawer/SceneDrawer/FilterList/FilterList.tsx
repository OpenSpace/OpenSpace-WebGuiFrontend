import React from 'react';
import { Entry, Favorite } from '../SceneDrawer';
import Group from '../../../../Sidebar/Group';
import ContextSection from '../../../../Sidebar/ContextSection';
import PropertyOwner from '../../../../Sidebar/Properties/PropertyOwner';
import Input from '../../../../common/Input/Input/Input';
import { FilterButtons } from '../FilterButtons';

interface FilterListProps {
  matcher: any;
  ignorePropsFilter: string[];
  favorites: Favorite[];
  entries: Entry[];
  showOnlyEnabled: boolean;
}

const defaultMatcher = (item: any, searchString: string): boolean => {
  if (typeof item === 'object') {
    return Object.values(item).some((value: any) =>
      value.toString().toLowerCase().includes(searchString.toLowerCase())
    );
  }
  return item.toString().toLowerCase().includes(searchString.toLowerCase());
};

export const FilterList: React.FC<FilterListProps> = ({
  matcher = defaultMatcher,
  ignorePropsFilter = ['active', 'onSelect'],
  favorites,
  entries,
  showOnlyEnabled
}) => {
  const [filter, setFilter] = React.useState('');
  const [searchString, setSearchString] = React.useState('');

  const filteredEntries = entries.filter((entry) => {
    let filteredProps = { ...entry };
    ignorePropsFilter.forEach((key) => delete filteredProps[key as keyof typeof filteredProps]);

    const matchesSearchString = matcher(filteredProps, searchString.toLowerCase());
    const matchesFilter = !filter || matcher(filteredProps, filter.toLowerCase());

    return matchesSearchString && matchesFilter;
  });

  const filtersArray = ['Label', 'Trail', 'Glare'];

  // Determine whether to show favorites or entries
  const showFavorites = searchString === '' && filter === '';

  return (
    <>
      <FilterButtons filterStrings={filtersArray} setFilter={setFilter} filter={filter} />
      <Input
        value={searchString}
        placeholder={'Search nodes'}
        onChange={(e: { target: { value: string } }) => setSearchString(e.target.value)}
        clearable
        autoFocus={false}
        children={undefined}
        className={undefined}
        label={undefined}
        loading={undefined}
        onEnter={undefined}
        wide={undefined}
        step={undefined}
      />
      {showFavorites && (
        <div>
          <ContextSection expansionIdentifier='context' />
          {favorites.map((favorite) => (
            <Group {...favorite} showOnlyEnabled={showOnlyEnabled} key={favorite.key} />
          ))}
        </div>
      )}

      {!showFavorites && (
        <div>
          {filteredEntries.map((entry) => (
            <PropertyOwner {...entry} key={entry.key} />
          ))}
        </div>
      )}
    </>
  );
};
