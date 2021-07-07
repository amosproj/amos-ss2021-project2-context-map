import React, { useRef, useEffect } from 'react';
import VisGraph, { EventParameters, GraphEvents } from 'react-graph-vis';
import { uuid } from 'uuidv4';
import { map, tap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { useSnackbar } from 'notistack';
import useStylesVisualization from './useStylesVisualization';
import visGraphBuildOptions from './visGraphBuildOptions';
import useService from '../../dependency-injection/useService';
import { ContainerSize } from '../../utils/useSize';
import { createSelectionInfo } from '../../stores/colors';
import QueryResultStore from '../../stores/QueryResultStore';
import SearchSelectionStore from '../../stores/SearchSelectionStore';
import useObservable from '../../utils/useObservable';
import { isEntitySelected } from '../../stores/colors/EntityStyleProviderImpl';
import convertQueryResult from '../shared-ops/convertQueryResult';
import EntityStyleStore from '../../stores/colors/EntityStyleStore';
import GraphDetails from './GraphDetails';
import { EntityDetailsStateStore } from '../../stores/details/EntityDetailsStateStore';
import { EntityDetailsStore } from '../../stores/details/EntityDetailsStore';

/**
 * Keys for the snackbar notifications.
 * These keys are not readonly.
 */
const SNACKBAR_KEYS = {
  SHORTEST_PATH_NOT_FOUND: 'shortest-path-not-found',
  SEARCH_NOT_FOUND: 'search-not-found',
};

type GraphProps = {
  layout?: string;
  containerSize: ContainerSize;
};

function Graph(props: GraphProps): JSX.Element {
  const { layout, containerSize } = props;
  const classes = useStylesVisualization();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const detailsStateStore = useService(EntityDetailsStateStore);
  const queryResultStore = useService(QueryResultStore);
  const entityColorStore = useService(EntityStyleStore);
  const searchSelectionStore = useService(SearchSelectionStore);

  const graphData = useObservable(
    // When one emits, the whole observable emits with the last emitted value from the other inputs
    // Example: New query result comes in => emits it with the most recent values from entityColorStore
    combineLatest([
      queryResultStore.getState(),
      entityColorStore.getState(),
    ]).pipe(
      tap(([queryResult]) => {
        closeSnackbar(SNACKBAR_KEYS.SHORTEST_PATH_NOT_FOUND);
        if (queryResult.containsShortestPath === false) {
          // assign new random id to avoid strange ui glitches
          SNACKBAR_KEYS.SHORTEST_PATH_NOT_FOUND = uuid();
          enqueueSnackbar(
            'No shortest path found, please adjust filter settings or ignore edge directions',
            {
              variant: 'warning',
              key: SNACKBAR_KEYS.SHORTEST_PATH_NOT_FOUND,
            }
          );
        }
      }),
      map(([queryResult, styleProvider]) =>
        convertQueryResult(queryResult, styleProvider)
      )
    ),
    { edges: [], nodes: [] }
  );

  const detailsStore = useService(EntityDetailsStore);

  const details = useObservable(
    detailsStore.getState(),
    detailsStore.getValue()
  );

  const events: GraphEvents = {
    select: (params: EventParameters) => {
      const { nodes, edges } = params;

      if (Array.isArray(nodes) && nodes.length !== 0) {
        let node = nodes[0];

        if (typeof node === 'string') {
          node = Number.parseFloat(node);
        }

        detailsStateStore.showNode(node);
      } else if (Array.isArray(edges) && edges.length !== 0) {
        let edge = edges[0];

        if (typeof edge === 'string') {
          edge = Number.parseFloat(edge);
        }

        detailsStateStore.showEdge(edge);
      } else {
        detailsStateStore.clear();
      }
    },
  };

  const graphRef = useRef<HTMLDivElement | null>(null);

  // When either the query result or the selected entity changes => check if
  // selection is in query result.
  useObservable(
    combineLatest([
      queryResultStore.getState(),
      searchSelectionStore.getState(),
    ]).pipe(
      tap(([queryResult, selection]) => {
        closeSnackbar(SNACKBAR_KEYS.SEARCH_NOT_FOUND);
        if (selection === undefined) return;
        const selectionInfo = createSelectionInfo(selection);
        const entityFound =
          queryResult.edges.some((e) => isEntitySelected(e, selectionInfo)) ||
          queryResult.nodes.some((n) => isEntitySelected(n, selectionInfo));
        if (!entityFound) {
          // assign new random id to avoid strange ui glitches
          SNACKBAR_KEYS.SEARCH_NOT_FOUND = uuid();
          enqueueSnackbar('Selected entity not found in the displayed graph', {
            variant: 'warning',
            key: SNACKBAR_KEYS.SEARCH_NOT_FOUND,
          });
        }
      })
    )
  );

  // on unmount: clear search
  useEffect(() => () => searchSelectionStore.setState(undefined), []);

  return (
    <>
      <GraphDetails />
      <div className={classes.graphContainer} ref={graphRef}>
        <VisGraph
          graph={graphData}
          options={visGraphBuildOptions(
            containerSize.width,
            containerSize.height,
            layout
          )}
          events={events}
          key={uuid()}
          getNetwork={(network) => {
            network.unselectAll();
            if (details !== null) {
              if (details.entityType === 'node') {
                if (graphData.nodes.some((node) => node.id === details.id)) {
                  network.selectNodes([details.id], true);
                }
              } else if (
                graphData.edges.some((edge) => edge.id === details.id)
              ) {
                network.selectEdges([details.id]);
              }
            }
          }}
        />
      </div>
    </>
  );
}

Graph.defaultProps = {
  layout: undefined,
};

export default Graph;
