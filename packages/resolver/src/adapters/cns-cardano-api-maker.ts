import {CNSMetadata, CNSUserRecord} from './cns-types'
import {hexToString} from './cns-utils'
import {FetchData, fetchData, handleApiError, isLeft} from '@yoroi/common'
import {AxiosRequestConfig} from 'axios'
import {z} from 'zod'

export const makeCnsCardanoApi = (
  baseUrl: string,
  fetcherConfig?: AxiosRequestConfig,
  request: FetchData = fetchData,
) => {
  const getAssetAddress = async (
    assetHex: string,
  ): Promise<string | undefined> => {
    const policyId = assetHex.slice(0, 56)
    const assetName = assetHex.slice(56)

    const response = await request<string>(
      {
        url: `${baseUrl}/api/asset/accounts?policy=${policyId}&asset=${assetName}`,
      },
      fetcherConfig,
    )

    if (isLeft(response)) {
      handleApiError(response.error)
    } else {
      const parsedResponse = getAssetAddressSchema.parse(response.value.data)
      return parsedResponse[0]
    }
  }

  const getMetadata = async (
    policyID: string,
    assetName: string,
  ): Promise<CNSMetadata | null> => {
    const assetNameString = hexToString(assetName)
    const key = `${policyID}.${assetNameString}`

    const response = await request<CNSMetadata | null>(
      {
        url: `${baseUrl}/api/multiAsset/metadata`,
        method: 'post',
        data: {assets: [{nameHex: assetName, policy: policyID}]},
      },
      fetcherConfig,
    )

    if (isLeft(response)) {
      handleApiError(response.error)
    } else {
      const parsedResponse = getMetadataSchema.parse(response.value.data)

      if (Object.keys(parsedResponse).length === 0) return null

      // @ts-ignore
      return parsedResponse[key][0].metadata[policyID][assetNameString] ?? null
    }
  }

  const getAssetInlineDatum = async (
    assetHex: string,
    addresses: Array<string>,
  ): Promise<CNSUserRecord> => {
    const policyId = assetHex.slice(0, 56)
    const assetName = assetHex.slice(56)

    const response = await request(
      {
        url: `${baseUrl}/api/txs/utxoForAddresses`,
        method: 'post',
        data: {addresses, asset: {policy: policyId, name: assetName}},
      },
      fetcherConfig,
    )

    if (isLeft(response)) {
      handleApiError(response.error)
    } else {
      // @ts-ignore
      return response.value.data[0].inline_datum.plutus_data
    }
  }

  return {
    getAssetAddress,
    getMetadata,
    getAssetInlineDatum,
  } as const
}

export type CnsCardanoApi = ReturnType<typeof makeCnsCardanoApi>

const getAssetAddressSchema = z.array(z.string())

const getMetadataSchema = z.record(
  z.string(),
  z.array(
    z.object({
      metadata: z.object({version: z.number()}).catchall(
        z.record(
          z.string(),
          z.object({
            cnsType: z.string(),
            description: z.string(),
            expiry: z.number(),
            image: z.string(),
            mediaType: z.string(),
            name: z.string(),
            origin: z.string(),
            virtualSubdomainEnabled: z.union([
              z.literal('Enabled'),
              z.literal('Disabled'),
            ]),
            virtualSubdomainLimits: z.number(),
          }),
        ),
      ),
    }),
  ),
)
