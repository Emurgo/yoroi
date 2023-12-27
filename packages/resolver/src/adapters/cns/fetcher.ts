import {CNSMetadata, CNSUserRecord} from './types'
import {hexToString} from './utils'
import {fetchData, handleApiError, isLeft} from '@yoroi/common'
import {AxiosRequestConfig} from 'axios'
import {z} from 'zod'

export const getAssetAddress = async (
  assetHex: string,
  baseUrl: string,
  fetcherConfig?: AxiosRequestConfig,
): Promise<string | undefined> => {
  const policyId = assetHex.slice(0, 56)
  const assetName = assetHex.slice(56)

  const response = await fetchData<string>(
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

const getAssetAddressSchema = z.array(z.string())

export const getMetadata = async (
  policyID: string,
  assetName: string,
  baseUrl: string,
  fetcherConfig?: AxiosRequestConfig,
): Promise<CNSMetadata | null> => {
  const assetNameString = hexToString(assetName)
  const key = `${policyID}.${assetNameString}`

  const response = await fetchData<CNSMetadata | null>(
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

export const getAssetInlineDatum = async (
  addresses: Array<string>,
  assetHex: string,
  baseUrl: string,
  fetcherConfig?: AxiosRequestConfig,
): Promise<CNSUserRecord> => {
  const policyId = assetHex.slice(0, 56)
  const assetName = assetHex.slice(56)

  const response = await fetchData(
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
