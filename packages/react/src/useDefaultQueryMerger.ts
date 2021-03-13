import { mergeDeepNonUndefined } from '@fetcher/utils';
import { NonUndefined, BaseQuery } from '@fetcher/react-core';
import { DefaultRequest, DefaultRequestContext } from './DefaultRequestProvider';
import { DefaultQuery, DefaultQueryContext } from './DefaultQueryProvider';
import { useContext } from 'react';

export function useDefaultQueryMerger<C extends NonUndefined, D extends NonUndefined, E extends Error, R>(
    query: Partial<BaseQuery<C, D, E, R>>,
): BaseQuery<C, D, E, R> {
    const defaultRequest = useContext<DefaultRequest<C, D, E, R>>(DefaultRequestContext);
    const defaultQuery = useContext<DefaultQuery<C, D, E, R>>(DefaultQueryContext);

    return {
        ...defaultRequest,
        ...defaultQuery,
        ...query,
        requestParams: mergeDeepNonUndefined(
            {},
            defaultRequest.requestParams,
            defaultQuery.requestParams,
            query.requestParams,
        ),
    };
}
