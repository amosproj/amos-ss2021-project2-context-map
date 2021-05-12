import { Record as Neo4jRecord } from 'neo4j-driver';
import { EntityType } from '../shared/graph-information/EntityType';
import { EntityTypeAttribute } from '../shared/graph-information/EntityTypeAttribute';

/**
 * Converts result from neo4j-query 'CALL db.schema.nodeTypeProperties'
 * or 'CALL db.schema.relTypeProperties' to generic list of
 * {@link EntityType}.
 *
 * @param result query-result from neo4j
 * @param type is result about nodes oder edges/rels?
 *
 * @throws Error
 * if was result does not stem from 'CALL db.schema.nodeTypeProperties'
 * or 'CALL db.schema.nodeTypeProperties'
 */
export function parseNeo4jEntityInfo(
  result: Neo4jRecord[],
  type: 'rel' | 'node'
): EntityType[] {
  // Entities stored in Map for direct access
  const types: Map<string, EntityType> = new Map();

  // eslint-disable-next-line no-restricted-syntax
  for (const record of result) {
    // Parse properties
    const attr: EntityTypeAttribute = {
      name: record.get('propertyName'),
      types: record.get('propertyTypes'),
      mandatory: record.get('mandatory'),
    };

    // example: split ":`Me`:`User`"
    const nodeNames = (record.get(`${type}Type`) as string)
      .substring(1)
      .split(':');

    // eslint-disable-next-line no-restricted-syntax
    for (let nodeName of nodeNames) {
      // example: map "`User`" to "User"
      nodeName = nodeName.slice(1, -1);

      // Put nodes in Map if missing
      let entityType = types.get(nodeName);
      if (!entityType) {
        entityType = { name: nodeName, attributes: [] };
        types.set(nodeName, entityType);
      }

      // Only push iff name is set
      if (attr.name !== null) {
        entityType.attributes.push(attr);
      }
    }
  }

  return Array.from(types.values());
}
