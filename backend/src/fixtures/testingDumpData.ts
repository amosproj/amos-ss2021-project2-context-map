import { Node } from '../entities/Node';
import { Edge } from '../entities/Edge';
import { LimitQuery } from '../entities/queries/LimitQuery';
import { QueryResult } from '../entities/queries/QueryResult';

export const queryAllDummies: {
  limitQuery: LimitQuery;
  queryResult: QueryResult;
} = {
  limitQuery: { limit: { nodes: 3, edges: 4 } },
  queryResult: {
    nodes: [{ id: 0 }, { id: 1 }, { id: 2 }],
    edges: [
      { id: 0, from: 0, to: 1 },
      { id: 0, from: 1, to: 0 },
      { id: 1, from: 0, to: 2 },
      { id: 1, from: 2, to: 0 },
    ],
  },
};

export const getNodesByIdDummies: { ids: number[]; nodes: Node[] } = {
  ids: [1, 2, 3],
  nodes: [
    {
      id: 1,
      labels: ['Person'],
      properties: { born: 1964, name: 'Keanu Reeves' },
    },
    {
      id: 2,
      labels: ['Person'],
      properties: { born: 1967, name: 'Carrie-Anne Moss' },
    },
    {
      id: 3,
      labels: ['Person'],
      properties: { born: 1965, name: 'Lana Wachowski' },
    },
  ],
};

export const getEdgesByIdDummies: { ids: number[]; edges: Edge[] } = {
  ids: [1, 2],
  edges: [
    {
      id: 1,
      from: 0,
      to: 2,
      properties: { roles: ['Trinity'] },
      type: 'ACTED_IN',
    },
    {
      id: 1,
      from: 2,
      to: 0,
      properties: { roles: ['Trinity'] },
      type: 'ACTED_IN',
    },
    { id: 2, from: 0, to: 3, properties: {}, type: 'DIRECTED' },
    { id: 2, from: 3, to: 0, properties: {}, type: 'DIRECTED' },
  ],
};