import {freeze} from 'immer'

export const trustedApps: Readonly<Map<string, {name: string; vkey: string}>> = freeze(
  new Map(__DEV__ ? [['yoroi', {name: 'Yoroi Test', vkey: 'w1'}]] : []),
  true,
)
