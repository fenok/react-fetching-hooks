import { NonUndefined, Cache, CacheRequestState, UpdateStateOpts } from '../types';

interface CacheState<D extends NonUndefined = null> {
    data: D;
    requestStates: { [id: string]: { loading: string[]; error: Error | undefined } | undefined };
}

export class TestCache<D extends NonUndefined> implements Cache<D> {
    private _state: CacheState<D>;
    private subscribers: (() => void)[] = [];
    private emptyData: D;

    constructor(opts: { initialData: D; emptyData: D }) {
        this.emptyData = opts.emptyData;

        this._state = {
            data: opts.initialData,
            requestStates: {},
        };
    }

    private set state(newState: CacheState<D>) {
        this._state = newState;
        this.subscribers.forEach(subscriber => subscriber());
    }

    private get state() {
        return this._state;
    }

    public getCacheData() {
        return this.state.data;
    }

    public getRequestState(requestId: string): CacheRequestState {
        return this.state.requestStates[requestId] ?? { error: undefined, loading: [] };
    }

    public subscribe(callback: () => void) {
        this.subscribers.push(callback);

        return () => {
            this.subscribers = this.subscribers.filter(subscriber => subscriber !== callback);
        };
    }

    public purge() {
        this.state = {
            data: this.emptyData,
            requestStates: {},
        };
    }

    public updateState({ updateCacheData, updateRequestState }: UpdateStateOpts<D>) {
        this.state = {
            requestStates: updateRequestState
                ? {
                      ...this.state.requestStates,
                      [updateRequestState.requestId]: updateRequestState.update(
                          this.getRequestState(updateRequestState.requestId),
                      ),
                  }
                : this.state.requestStates,
            data: updateCacheData ? updateCacheData(this.state.data) : this.state.data,
        };
    }
}