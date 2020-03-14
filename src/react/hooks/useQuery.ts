import * as React from 'react';
import { RequestState } from '../../core/cache';
import { MultiAbortController } from '../../core/promise';
import { BC, PPC, QPC, RC, SDC, EC } from '../../core/request/types';
import { ClientContext, SsrPromisesManagerContext } from '../Provider';
import { PartialRequestData } from '../../core/request';
import { ensureClient } from './ensureClient';
import { getRequestId } from './getRequestId';
import { useComponentId } from './useComponentId';
import { useSubscription } from './useSubscription';

interface QueryOptions<C extends SDC, R extends RC, E extends EC, P extends PPC, Q extends QPC, B extends BC> {
    getPartialRequestId?(request: PartialRequestData<C, R, E, P, Q, B>): string | number;
}

export function useQuery<C extends SDC, R extends RC, E extends EC, P extends PPC, Q extends QPC, B extends BC>(
    request: PartialRequestData<C, R, E, P, Q, B>,
    { getPartialRequestId }: QueryOptions<C, R, E, P, Q, B> = {},
) {
    const componentId = useComponentId();

    const client = React.useContext(ClientContext);
    const ssrPromisesManager = React.useContext(SsrPromisesManagerContext);

    ensureClient(client);

    const requestId = getRequestId(request, client, getPartialRequestId);

    const subscription = React.useMemo(
        () => ({
            getCurrentValue: () => client.getState(request, componentId),
            subscribe: (callback: (state: RequestState<R, E>) => void) => {
                return client.subscribe(request, componentId, callback);
            },
        }),

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [client, requestId, componentId],
    );

    const multiAbortControllerRef = React.useRef<MultiAbortController>();

    if (typeof window === 'undefined') {
        const ssrPromise = client.getSsrPromise(request, componentId);
        ssrPromise && ssrPromisesManager?.addPromise(ssrPromise);
    }

    const query = React.useCallback(
        (forceUpdate?: boolean) => {
            if (!multiAbortControllerRef.current || multiAbortControllerRef.current.signal.aborted) {
                multiAbortControllerRef.current = new MultiAbortController();
            }

            return client.query(request, {
                callerId: componentId,
                forceNetworkRequest: !!forceUpdate,
                multiAbortSignal: multiAbortControllerRef.current.signal,
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [client, requestId, componentId],
    );

    const refetch = React.useCallback(() => {
        return query(true);
    }, [query]);

    const abort = React.useCallback((multi?: boolean) => {
        if (multiAbortControllerRef.current) {
            multiAbortControllerRef.current.abort(multi);
        }
    }, []);

    React.useEffect(() => {
        query();

        return () => {
            abort();
        };
    }, [query, abort]);

    /**
     * Ordering is crucial. Subscription effect must run after query effect, which guarantees that request state is
     * updated AFTER this component's query.
     */
    const requestState = useSubscription(subscription);

    return { ...requestState, refetch, abort };
}
