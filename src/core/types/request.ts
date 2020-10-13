import { NonUndefined } from './helpers';
import { MultiAbortSignal } from '../promise/controllers';

export type FetchPolicy = 'cache-only' | 'cache-first' | 'cache-and-network';

export interface CommonCacheOptions<CD extends NonUndefined, I> {
    cacheData: CD;
    requestInit: I;
    requestId: string;
    requesterId: string;
}

export interface BaseRequest<CD extends NonUndefined, D extends NonUndefined, E extends Error, I> {
    requesterId: string;
    requestInit: I;
    abortSignal?: MultiAbortSignal | AbortSignal;
    getRequestFactory(requestInit: I): (abortSignal?: AbortSignal) => Promise<D | E>;
    getRequestId(requestInit: I): string;
    toCache(opts: CommonCacheOptions<CD, I> & { data: D }): CD;

    optimisticResponse?: {
        optimisticData: D;
        removeOptimisticData(opts: CommonCacheOptions<CD, I> & { data: D }): CD;
        isOptimisticData(opts: CommonCacheOptions<CD, I> & { data: D }): boolean;
    };
}

export interface Query<CD extends NonUndefined, D extends NonUndefined, E extends Error, I>
    extends BaseRequest<CD, D, E, I> {
    fetchPolicy: FetchPolicy;
    disableSsr?: boolean;
    preventExcessRequestOnHydrate?: boolean;
    rerunExistingRequest?: boolean;
    fromCache(opts: CommonCacheOptions<CD, I>): D | undefined;
}

export interface Mutation<CD extends NonUndefined, D extends NonUndefined, E extends Error, I>
    extends BaseRequest<CD, D, E, I> {
    refetchQueries?: Query<CD, any, any, any>[];
}
