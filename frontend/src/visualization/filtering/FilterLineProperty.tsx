import { makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import {
  createStyles,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import React, { useEffect } from 'react';
import useService from '../../dependency-injection/useService';
import FilterStateStore from '../../stores/filterState/FilterStateStore';
import { FilterModelEntry } from '../../shared/filter';

const useStyles = makeStyles(() =>
  createStyles({
    select: {
      width: 500,
    },
  })
);

const FilterLineProperty = (props: {
  filterModelEntry: FilterModelEntry;
  filterLineType: string;
  entity: 'node' | 'edge';
  applyFilter: boolean;
  setApplyFilter: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element => {
  const classes = useStyles();
  const {
    filterModelEntry,
    filterLineType,
    entity,
    applyFilter,
    setApplyFilter,
  } = props;

  const filterStateStore = useService<FilterStateStore>(FilterStateStore);

  const [selectedValues, setSelectedValues] = React.useState<string[]>(
    filterStateStore.getPropertyStateValues(
      filterLineType,
      filterModelEntry.key,
      entity
    ) ?? []
  );

  // update filterStateStore here because selectedValues will first be updated in the next render
  useEffect(() => {
    if (applyFilter) {
      filterStateStore.addFilterPropertyState(
        {
          name: filterModelEntry.key,
          values: selectedValues,
        },
        filterLineType,
        entity
      );
      setApplyFilter(false);
    }
  }, [selectedValues, applyFilter]);

  // utils from material ui multiselect https://material-ui.com/components/selects/#select
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  function getStyles(name: string, pName: string[], styles: Theme) {
    return {
      fontWeight:
        pName.indexOf(name) === -1
          ? styles.typography.fontWeightRegular
          : styles.typography.fontWeightMedium,
    };
  }

  const theme = useTheme();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedValues(event.target.value as string[]);
  };

  return (
    <div className="FilterSelect">
      <FormControl className={classes.select}>
        <InputLabel>{filterModelEntry.key}</InputLabel>
        <Select
          multiple
          value={(selectedValues ?? []) as string[]}
          onChange={handleChange}
          input={<Input />}
          MenuProps={MenuProps}
        >
          {filterModelEntry.values.map((name) => (
            <MenuItem
              key={typeof name === 'string' ? name : 'Error: No string'}
              value={typeof name === 'string' ? name : 'Error: No string'}
              style={getStyles(
                typeof name === 'string' ? name : 'Error: No string',
                filterModelEntry.values as string[],
                theme
              )}
            >
              {typeof name === 'string' ? name : 'Error: No string'}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default FilterLineProperty;