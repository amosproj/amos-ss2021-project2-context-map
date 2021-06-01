import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j/dist';
import MiniSearch from 'minisearch';
import { SearchResult } from '../shared/search';
import { AsyncLazy } from '../shared/utils';
import { NodeDescriptor, EdgeDescriptor } from '../shared/entities';
import { NodeTypeDescriptor, EdgeTypeDescriptor } from '../shared/schema';
import { SearchServiceBase } from './search.service.base';
import { RestoredIndexEntry, SearchIndexBuilder } from './SearchIndexBuilder';

@Injectable()
export class SearchService implements SearchServiceBase {
  private readonly index: AsyncLazy<MiniSearch>;

  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly searchIndexBuilder: SearchIndexBuilder
  ) {
    this.index = new AsyncLazy<MiniSearch>(() =>
      searchIndexBuilder.buildIndex()
    );
  }

  /**
   * Searches through all entities and entity types and returns those, that
   * match the searchString. It only returns those value with the prefix of
   * searchStrings.
   * Values with n spaces are considered as n+1 single values.
   *
   * @example
   * 'Keanu' returns 'Keanu Reeves'
   * @example
   * 'kean' returns 'Keanu Reeves'
   * @example
   * 'reev' returns 'Keanu Reeves'
   * @example
   * 'name' returns 'Keanu Reeves' (since this node has the attribute 'name')
   */
  public async search(searchString: string): Promise<SearchResult> {
    const index = await this.index.value;

    // TODO: We could add additional functionality, like special syntax to search in a specified field.
    //       This would allow search-strings, like 'ghostbusters entity:node type:!movie genre:~mystery'
    //       Where
    //        ! means 'exact match' and
    //        ~ means 'does not include'
    const searchResults = index
      .search(searchString, { prefix: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((result) => (result as any) as RestoredIndexEntry);

    const nodes: NodeDescriptor[] = [];
    const edges: EdgeDescriptor[] = [];
    const nodeTypes: NodeTypeDescriptor[] = [];
    const edgeTypes: EdgeTypeDescriptor[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const searchResult of searchResults) {
      if (
        searchResult.entityType === 'node' &&
        typeof searchResult.id === 'number'
      ) {
        nodes.push({ id: searchResult.id });
      } else if (
        searchResult.entityType === 'edge' &&
        typeof searchResult.id === 'number' &&
        typeof searchResult.from === 'number' &&
        typeof searchResult.to === 'number'
      ) {
        edges.push({
          id: searchResult.id,
          from: searchResult.from,
          to: searchResult.to,
        });
      } else if (
        searchResult.entityType === 'node-type' &&
        typeof searchResult.id === 'string'
      ) {
        nodeTypes.push({
          name: searchResult.id,
        });
      } else if (
        searchResult.entityType === 'edge-type' &&
        typeof searchResult.id === 'string'
      ) {
        edgeTypes.push({
          name: searchResult.id,
        });
      }
    }

    return { nodes, edges, nodeTypes, edgeTypes };
  }

  public async getAutoSuggestions(searchString: string): Promise<string[]> {
    const index = await this.index.value;

    // TODO: We could add additional functionality, like special syntax to search in a specified field.
    //       This would allow search-strings, like 'ghostbusters entity:node type:!movie genre:~mystery'
    //       Where
    //        ! means 'exact match' and
    //        ~ means 'does not include'
    return index
      .autoSuggest(searchString)
      .map((suggestion) => suggestion.suggestion);
  }
}
