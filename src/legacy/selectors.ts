import type {State} from '../legacy/state'

export const installationIdSelector = (state: State) => state.appSettings.installationId
export const isMaintenanceSelector = (state: State): boolean => state.serverStatus.isMaintenance

export const isTosAcceptedSelector = (state: State): boolean => state.appSettings.acceptedTos
