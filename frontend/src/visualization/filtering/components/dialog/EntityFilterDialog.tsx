import Button from '@material-ui/core/Button';
import React from 'react';
import {
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import EntityPropertySelect from './EntityPropertySelect';
import { FilterModelEntry } from '../../../../shared/filter';
import {
  FilterCondition,
  MatchAllCondition,
  MatchAnyCondition,
  MatchPropertyCondition,
} from '../../../../shared/queries';
import useArrayState from '../useArrayState';
import FilterPropertyModel from '../../FilterPropertyModel';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    form: {
      display: 'flex',
      flexDirection: 'column',
      margin: 'auto',
      width: 'fit-content',
    },
    dialog: {
      marginTop: theme.spacing(2),
      minWidth: 300,
    },
  })
);

const EntityFilterDialog = (props: {
  filterOpen: boolean;
  handleCloseFilter: () => void;
  filterModelEntries: FilterModelEntry[];
  setFilterQuery: (condition: MatchAllCondition | null) => void; // TODO: Please rename me!
}): JSX.Element => {
  const classes = useStyles();

  const { filterOpen, handleCloseFilter, filterModelEntries, setFilterQuery } =
    props;

  const [selectedEntries, setSelectedEntries] =
    useArrayState<FilterPropertyModel>(
      filterModelEntries.map(
        (entry) => ({ ...entry, selectedValues: null } as FilterPropertyModel)
      )
    );

  const entitySelects = filterModelEntries.map((type, index) => (
    <EntityPropertySelect
      entityType={type}
      filterModelEntry={selectedEntries[index]}
      setFilterModelEntry={setSelectedEntries[index]}
    />
  ));

  const handleApplyFilter = () => {
    const filterConditions: FilterCondition[] = [];

    for (const entry of selectedEntries) {
      // There is a filter specified for the property
      if (entry.selectedValues !== null && entry.selectedValues.length > 0) {
        // If only a single value is specified in the filter, add this directly
        // Example: name=Peter
        if (entry.selectedValues.length === 1) {
          filterConditions.push(
            MatchPropertyCondition(entry.key, entry.selectedValues[0])
          );
        } else {
          // There are multiple alternative filters specified for the property
          // Example: name=Peter|William|Chris
          // Combine these via MatchAny conditions.
          filterConditions.push(
            MatchAnyCondition(
              ...entry.selectedValues.map((value) =>
                MatchPropertyCondition(entry.key, value)
              )
            )
          );
        }
      }
    }

    if (filterConditions.length > 0) {
      setFilterQuery(MatchAllCondition(...filterConditions));
    } else {
      setFilterQuery(null);
    }

    handleCloseFilter();
  };

  return (
    <div>
      <Dialog open={filterOpen} onClose={handleCloseFilter} scroll="paper">
        <form className={classes.form}>
          <FormControl className={classes.dialog}>
            <DialogTitle>Filter Entity</DialogTitle>
            <DialogContent>{entitySelects}</DialogContent>
            <DialogActions>
              <Button onClick={handleCloseFilter} color="primary">
                Cancel
              </Button>
              <Button onClick={handleApplyFilter} color="primary">
                Apply Filter
              </Button>
            </DialogActions>
          </FormControl>
        </form>
      </Dialog>
    </div>
  );
};

export default EntityFilterDialog;
