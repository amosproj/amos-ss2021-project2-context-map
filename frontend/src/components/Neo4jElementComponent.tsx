import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    boxShadow: 'none',
    textTransform: 'none',
    fontSize: 16,
    padding: '6px 12px',
    border: '1px solid',
    lineHeight: 1.5,
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
      'Apple Color Emoji',
      'Segoe UI Emoji',
      'Segoe UI Symbol',
    ].join(','),
    '&:hover': {
      boxShadow: 'none',
    },
    '&:focus': {
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
    },
  },
});

const Neo4jElementComponent = (props: {
  backgroundColor: string;
  content: string;
}) => {
  const { backgroundColor, content } = props;
  const classes = useStyles();
  return (
    <Button
      style={{ backgroundColor }}
      variant="contained"
      color="primary"
      disableRipple
      className={classes.root}
    >
      {content}
    </Button>
  );
};

export default Neo4jElementComponent;
