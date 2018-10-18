// @flow
import type {State} from '../state'
export type SubTranslation<Fn: (state: State) => mixed> = $Call<Fn, State>
