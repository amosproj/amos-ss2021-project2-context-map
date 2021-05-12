import React, { useRef } from 'react';
import VisGraph, { GraphData } from 'react-graph-vis';
import * as vis from 'vis-network';
import { AsyncProps, useAsync } from 'react-async';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Divider,
} from '@material-ui/core';
import useService from '../dependency-injection/useService';
import { EdgeDescriptor } from '../shared/entities/EdgeDescriptor';
import { NodeDescriptor } from '../shared/entities/NodeDescriptor';
import { QueryResult } from '../shared/queries/QueryResult';
import QueryService from '../services/QueryService';
import {
  CancellationToken,
  CancellationTokenSource,
} from '../utils/CancellationToken';
import { useSize } from '../utils/useSize';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
    backdropContent: {
      marginTop: theme.spacing(3),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    backdropCancel: {
      marginTop: theme.spacing(3),
    },
    sizeMeasureContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      visibility: 'hidden',
      pointerEvents: 'none',
    },
    contentContainer: {
      padding: theme.spacing(3),
    },
    graphPage: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      flexDirection: 'column',
    },
    graphContainer: {
      position: 'relative',
      flexGrow: 1,
      overflowY: 'hidden',
      overflowX: 'hidden',
    },
  })
);

function convertNode(node: NodeDescriptor): vis.Node {
  return {
    id: node.id,
    label: node.id.toString(),
    // Advanced stuff, like styling nodes with different labels differently...
  };
}

function convertNodes(nodes: NodeDescriptor[]): vis.Node[] {
  return nodes.map((node) => convertNode(node));
}

function convertEdge(edge: EdgeDescriptor): vis.Edge {
  return {
    id: edge.id,
    from: edge.from,
    to: edge.to,
    // Advanced stuff, like styling edges with different labels differently...
  };
}

function convertEdges(edges: EdgeDescriptor[]): vis.Edge[] {
  return edges.map((edge) => convertEdge(edge));
}

function convertQueryResult(queryResult: QueryResult): GraphData {
  return {
    nodes: convertNodes(queryResult.nodes),
    edges: convertEdges(queryResult.edges),
  };
}

/**
 * Builds the graph options passed to react-graph-vis.
 * @param width The width of the graph.
 * @param height The height of the graph.
 * @returns The react-graph-vis options.
 */
function buildOptions(width: number, height: number) {
  return {
    layout: {
      hierarchical: false,
    },
    edges: {
      color: '#000000',
    },
    width: `${width}px`,
    height: `${height}px`,
  };
}

/**
 * A function that wraps the call to the query-service to be usable with react-async.
 * @param props The props that contains our paramter in an untyped way.
 * @returns A {@link Promise} representing the asynchronous operation. When evaluated, the promise result contains the query result.
 */
function executeQuery(props: AsyncProps<QueryResult>): Promise<QueryResult> {
  const queryService = props.queryService as QueryService;
  const cancellation = props.cancellation as CancellationToken;
  return queryService.queryAll(
    { limit: { nodes: 200, edges: undefined } },
    cancellation
  );
}

function Graph(): JSX.Element {
  const classes = useStyles();

  // A React ref to the container that is used to measure the available space for the graph.
  const sizeMeasureContainerRef = useRef<HTMLDivElement>(null);

  // The size of the container that is used to measure the available space for the graph.
  const containerSize = useSize(sizeMeasureContainerRef);

  // The query service injected from DI.
  const queryService = useService(QueryService, null);

  // The component state that contains the cancellation token source used to cancel the query operation.
  const [loadingCancellationSource] = React.useState(
    new CancellationTokenSource()
  );

  // The state, as returned by react-async. Data is the query-result, when available.
  const { data, error, isLoading } = useAsync({
    promiseFn: executeQuery,
    queryService,
    cancellation: loadingCancellationSource.token,
  });

  // A function that must be here (unless you want React to explode) that cancels the query operation.
  const cancelLoading = () => {
    loadingCancellationSource.cancel();
  };

  // Display a waiting screen with a cancel options, while the query is in progress.
  if (isLoading) {
    return (
      <>
        <div
          className={classes.sizeMeasureContainer}
          ref={sizeMeasureContainerRef}
        />
        <Backdrop className={classes.backdrop} open>
          <div className={classes.backdropContent}>
            <CircularProgress color="inherit" />
            <Button
              variant="outlined"
              color="default"
              onClick={cancelLoading}
              className={classes.backdropCancel}
            >
              <CloseIcon />
              Cancel
            </Button>
          </div>
        </Backdrop>
      </>
    );
  }

  // Display the raw error message if an error occurred.
  // See https://github.com/amosproj/amos-ss2021-project2-context-map/issues/77
  if (error) {
    return (
      <div className={classes.contentContainer}>
        Something went wrong: {error.message}
      </div>
    );
  }

  // Display an error message if something went wrong. This should not happen normally.
  // See https://github.com/amosproj/amos-ss2021-project2-context-map/issues/77
  if (!data) {
    return <div className={classes.contentContainer}>Something went wrong</div>;
  }

  // Convert the query result to an object, react-graph-vis understands.
  const graphData = convertQueryResult(data);

  // Build the react-graph-vis graph options.
  const options = buildOptions(containerSize.width, containerSize.height);

  return (
    <>
      <div className={classes.graphPage}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            Filter
          </AccordionSummary>
          <AccordionDetails>TODO</AccordionDetails>
          <Divider />
          <AccordionActions>
            <Button size="small">Reset</Button>
            <Button size="small" color="primary">
              Apply
            </Button>
          </AccordionActions>
        </Accordion>
        <div className={classes.graphContainer}>
          <div
            className={classes.sizeMeasureContainer}
            ref={sizeMeasureContainerRef}
          />
          <VisGraph graph={graphData} options={options} />
        </div>
      </div>
    </>
  );
}

export default Graph;