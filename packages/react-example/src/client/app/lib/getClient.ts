import { Client, NonUndefined } from '@fetcher/react';
import { InMemoryCache } from '@fetcher/in-memory-cache';
import { CacheData } from './CacheData';
import {
    getRequestFactory,
    getRequestId,
    GlobalStaticRequestParams,
    processResponseJson,
    ResponseError,
} from '@fetcher/typed-fetch-request';
import { mergeDeepNonUndefined, objectHash } from '@fetcher/utils';
import { ErrorResponse } from './ErrorResponse';

export const EMPTY_DATA: CacheData = {
    users: {},
    emails: {},
};

export interface GetClientOptions {
    fetch?: typeof fetch;
}

export type AppClient = Client<
    CacheData,
    InMemoryCache<CacheData>,
    NonUndefined,
    ResponseError<ErrorResponse>,
    GlobalStaticRequestParams
>;

export function getClient({ fetch }: GetClientOptions): AppClient {
    const defaultRequest = {
        getRequestFactory: getRequestFactory({ fetch, processResponse: processResponseJson }),
        getRequestId: getRequestId({ hash: objectHash }),
    };

    return new Client({
        cache: new InMemoryCache({
            initialState: typeof window !== 'undefined' ? window.FETCHER_STATE : undefined,
            emptyData: EMPTY_DATA,
            enableDevTools: true,
        }),
        defaultQuery: {
            ...defaultRequest,
            preventExcessRequestOnHydrate: true,
            fetchPolicy: 'cache-and-network',
        },
        defaultMutation: defaultRequest,
        hash: objectHash,
        merge: mergeDeepNonUndefined,
    });
}
