import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { Node } from '../../shared/src/entities/Node';
import { Edge } from '../../shared/src/entities/Edge';
import { ParseIntArrayPipe } from './pipes/ParseIntArrayPipe';
import { AppService } from './app.service';
import { LimitQuery } from '../../shared/src/queries/LimitQuery';
import { QueryResult } from '../../shared/src/queries/QueryResult';

/**
 * Main App Controller.
 * ATM there are no only a few endpoints, so only one controller is used.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Returns QueryResult for given LimitQuery from appService
   *
   * @param query  sets limits for number of nodes and edges to be send to appService
   * @return QueryResult for given limitQuery
   */
  @Post('queryAll')
  @HttpCode(200)
  async queryAll(@Body() query?: LimitQuery): Promise<QueryResult> {
    return this.appService.queryAll(query);
  }

  /**
   * Returns array of nodes for given array of node-ids
   *
   * @param ids  node-ids that are being given to appService; string to number conversion is done by ParseIntArrayPipe
   * @return array of nodes having the input-ids as id ordered by id
   */
  @Get('getNodesById')
  async getNodesById(
    @Query('ids', ParseIntArrayPipe) ids: number[]
  ): Promise<Node[]> {
    return this.appService.getNodesById(ids);
  }

  /**
   * Returns array of edges for given array of node-ids
   *
   * @param ids  edge-ids that are being given to appService; string to number conversion is done by ParseIntArrayPipe
   * @return array of edges having the input-ids as id ordered by id
   */
  @Get('getEdgesById')
  async getEdgesById(
    @Query('ids', ParseIntArrayPipe) ids: number[]
  ): Promise<Edge[]> {
    return this.appService.getEdgesById(ids);
  }
}
