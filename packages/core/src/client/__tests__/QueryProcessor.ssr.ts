/**
 * @jest-environment node
 */

import {
    getQueryProcessor,
    getFirstItemRequest,
    FIRST_ITEM,
    getFailingFirstItemRequest,
    getNetworkError,
} from './utils/request-helpers';

it('does not return promise if there is error in cache', async () => {
    const queryProcessor = getQueryProcessor();

    const firstItemRequest = getFailingFirstItemRequest();

    const queryResult = queryProcessor.query(firstItemRequest);

    await expect(queryResult.request).rejects.toEqual(getNetworkError());

    const dataFromCache = queryProcessor.readQuery(firstItemRequest);
    expect(dataFromCache).toMatchObject({ data: undefined, error: getNetworkError() });

    const nextQueryResult = queryProcessor.query(firstItemRequest);

    const postQueryDataFromCache = queryProcessor.readQuery(firstItemRequest);
    expect(postQueryDataFromCache).toMatchObject({ data: undefined, error: getNetworkError() });

    expect(nextQueryResult.request).toEqual(undefined);

    const nextDataFromCache = queryProcessor.readQuery(firstItemRequest);

    expect(nextDataFromCache).toMatchObject({ data: undefined, error: getNetworkError() });
});

it('does not return promise if there is data in cache', async () => {
    const queryProcessor = getQueryProcessor();

    const firstItemRequest = getFirstItemRequest();

    const queryResult = queryProcessor.query(firstItemRequest);

    await expect(queryResult.request).resolves.toEqual(FIRST_ITEM);

    const dataFromCache = queryProcessor.readQuery(firstItemRequest);

    expect(dataFromCache).toMatchObject({ data: FIRST_ITEM, error: undefined });

    const nextQueryResult = queryProcessor.query(firstItemRequest);

    expect(nextQueryResult.request).toEqual(undefined);

    const nextDataFromCache = queryProcessor.readQuery(firstItemRequest);

    expect(nextDataFromCache).toMatchObject({ data: FIRST_ITEM, error: undefined });
});

it('can opt-out from returning the promise', () => {
    const queryProcessor = getQueryProcessor();

    const firstItemRequest = getFirstItemRequest();

    const queryResult = queryProcessor.query({ ...firstItemRequest, disableSsr: true });
    expect(queryResult.request).toEqual(undefined);

    const dataFromCache = queryProcessor.readQuery(firstItemRequest);
    expect(dataFromCache).toMatchObject({ data: undefined, error: undefined });
});
