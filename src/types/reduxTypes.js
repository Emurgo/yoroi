// @flow
import type {State} from '../state'

export type Path = Array<string>

export type SegmentReducer<Segment, Payload> = (
  state: Segment,
  payload: Payload,
) => Segment

export type GenericAction<Segment, Payload> = {
  +type: string,
  +path?: Path,
  +payload?: Payload,
  +reducer: SegmentReducer<Segment, Payload>,
  +doNotLog?: boolean,
}

export type GetState = () => State
// eslint-disable-next-line
export type Dispatch = (action: GenericAction<*, *> | Thunk) => null
export type ThunkExtra = {
  logger: {
    log: (args: any) => null,
  },
}
export type Thunk = (
  dispatch: Dispatch,
  getState: GetState,
  extra: ThunkExtra,
) => Promise<void> | void
