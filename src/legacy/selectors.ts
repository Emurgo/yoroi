import type {State} from '../legacy/state'

export const installationIdSelector = (state: State) => state.appSettings.installationId
