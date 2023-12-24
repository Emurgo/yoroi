import {CNSMetadata, CNSUserRecord} from './types'
import {hexToString} from './utils'
import {fetchData, handleApiError, isLeft} from '@yoroi/common'
import {AxiosRequestConfig} from 'axios'

export const getAssetAddress = async (
  assetHex: string,
  baseUrl: string,
  fetcherConfig: AxiosRequestConfig,
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
    return response.value.data[0]
  }
}

export const getMetadata = async (
  policyID: string,
  assetName: string,
  baseUrl: string,
  fetcherConfig: AxiosRequestConfig,
): Promise<CNSMetadata> => {
  const assetNameString = hexToString(assetName)
  const key = `${policyID}.${assetNameString}`

  const response = await fetchData<CNSMetadata>(
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
    // @ts-ignore
    return response.value.data[key][0].metadata[policyID][assetNameString]
  }
}

export const getAssetInlineDatum = async (
  addresses: Array<string>,
  assetHex: string,
  baseUrl: string,
  fetcherConfig: AxiosRequestConfig,
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
