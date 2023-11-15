import {createTypeGuardFromSchema} from '@yoroi/common'
import {z} from 'zod'

import {BackendConfig, YoroiNftModerationStatus} from '../../types'
import fetchDefault from './fetch'

export const getNFTModerationStatus = async (
  fingerprint: string,
  config: BackendConfig & {mainnet: boolean},
): Promise<YoroiNftModerationStatus> => {
  return fetchDefault(
    'multiAsset/validateNFT/' + fingerprint,
    config.mainnet ? {envName: 'prod'} : {},
    config,
    'POST',
    {
      checkResponse: async (response): Promise<YoroiNftModerationStatus> => {
        if (response.status === 202) {
          return 'pending'
        }
        const json = await response.json()
        const status = json?.status
        const parsedStatus = parseModerationStatus(status)
        if (parsedStatus) {
          return parsedStatus
        }
        throw new Error(`Invalid server response "${status}"`)
      },
    },
  )
}

export const parseModerationStatus = (status: unknown): YoroiNftModerationStatus | undefined => {
  if (isModerationStatus(status)) {
    return statusMap[status]
  }
  return undefined
}

const statusMap = {
  RED: 'blocked',
  YELLOW: 'consent',
  GREEN: 'approved',
  PENDING: 'pending',
  MANUAL_REVIEW: 'manual_review',
} as const

const isModerationStatus = createTypeGuardFromSchema<'RED' | 'GREEN' | 'YELLOW' | 'PENDING' | 'MANUAL_REVIEW'>(
  z.union([
    z.literal('RED'),
    z.literal('YELLOW'),
    z.literal('GREEN'),
    z.literal('PENDING'),
    z.literal('MANUAL_REVIEW'),
  ]),
)
