import { injectable } from 'inversify';
import 'reflect-metadata';
import { LimitQuery } from '../shared/queries/LimitQuery';
import { QueryResult } from '../shared/queries/QueryResult';
import CancellationError from '../utils/CancellationError';
import { CancellationToken } from '../utils/CancellationToken';
import nop from '../utils/nop';
import QueryService from './QueryService';
import { QueryServiceOptions } from './QueryServiceOptions';

function buildOptions(
  options: Partial<QueryServiceOptions>
): QueryServiceOptions {
  let { backendBaseUri } = options;

  if (!backendBaseUri) {
    const { location } = window;
    backendBaseUri = `${location.protocol}//${location.host}/${
      location.pathname.split('/')[1]
    }`;
  }

  return { backendBaseUri };
}

@injectable()
export default class QueryServiceImpl extends QueryService {
  private readonly options: QueryServiceOptions;

  public constructor(options: Partial<QueryServiceOptions> = {}) {
    super();

    this.options = buildOptions(options);
  }

  public queryAll(
    query?: LimitQuery,
    cancellation?: CancellationToken
  ): Promise<QueryResult> {
    const url = `${this.options.backendBaseUri}/queryAll`;

    return new Promise<QueryResult>((resolve, reject) => {
      if (cancellation?.isCancellationRequested) {
        reject(new CancellationError());
      }

      const request = new XMLHttpRequest();
      request.open('post', url, true);
      request.setRequestHeader('Content-Type', 'application/json');

      let cancellationUnsubscribe = nop;

      if (cancellation) {
        cancellationUnsubscribe = cancellation.subscribe(() => request.abort());
      }

      request.onload = () => {
        cancellationUnsubscribe();
        if (request.status >= 200 && request.status <= 299) {
          resolve(JSON.parse(request.response)); // TODO: Validate the response?
        } else {
          reject(Error(request.statusText));
        }
      };

      request.onerror = () => {
        cancellationUnsubscribe();
        if (cancellation?.isCancellationRequested) {
          reject(new CancellationError());
        } else {
          reject(Error('A network error occured.'));
        }
      };

      request.onabort = () => {
        cancellationUnsubscribe();
        reject(new CancellationError());
      };

      request.send(JSON.stringify(query ?? {}));
    });
  }
}
