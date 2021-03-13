import { NonUndefined, BaseQuery } from '@fetcher/core';
import { useContext, useReducer, useRef } from 'react';
import { QueryProcessor } from './QueryProcessor';
import { useClient } from '../ClientProvider';
import { SsrPromisesManagerContext } from '../ssr';

export interface UseBaseQueryOptions<C extends NonUndefined, R extends NonUndefined, E extends Error, I> {
    getQueryHash(query: BaseQuery<C, R, E, I>): string | number;
}

export function useBaseQuery<C extends NonUndefined, R extends NonUndefined, E extends Error, I>(
    query: BaseQuery<C, R, E, I>,
    { getQueryHash }: UseBaseQueryOptions<C, R, E, I>,
) {
    const ssrPromisesManager = useContext(SsrPromisesManagerContext);
    const client = useClient<C>();

    const [, forceUpdate] = useReducer((i: number) => i + 1, 0);

    const queryProcessor = useRef<QueryProcessor<C, R, E, I>>();
    queryProcessor.current = queryProcessor.current || new QueryProcessor({ forceUpdate });

    const { loading, data, error, refetch, abort } = queryProcessor.current.onRender(
        query,
        getQueryHash(query),
        client,
        ssrPromisesManager,
    );

    return { loading, data, error, refetch, abort };
}
