/* eslint-disable @typescript-eslint/no-explicit-any */
import {Resolution} from '@unstoppabledomains/resolution'
import {resolveAddress} from '@yoroi/resolver'
import React from 'react'
import {Text, View, ViewProps} from 'react-native'
import {useQuery, UseQueryOptions} from 'react-query'

import * as components from '../../../../../components'
import {getNetworkConfigById} from '../../../../../yoroi-wallets/cardano/networks'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {normalizeToAddress} from '../../../../../yoroi-wallets/cardano/utils'
import {NetworkId} from '../../../../../yoroi-wallets/types'
import {useStrings} from '../../../common/strings'
import {InputReceiver} from './InputReceiver'

type ReceiverProps = ViewProps & {
  receiver: string
  address: string
  errorMessage: string
  isLoading: boolean
  onChangeReceiver: (receiver: string) => void
}
export const ResolveAddress = ({
  isLoading,
  address,
  receiver,
  errorMessage,
  onChangeReceiver,
  style,
  ...props
}: ReceiverProps) => {
  const strings = useStrings()
  const isResolved = !isLoading && isDomain(receiver) && !receiver.includes(address)
  const isError = errorMessage.length > 0

  return (
    <View style={style} {...props}>
      <InputReceiver
        value={receiver}
        onChangeText={onChangeReceiver}
        error={isError}
        errorText={errorMessage}
        isLoading={isLoading}
        autoComplete="off"
      />

      <components.HelperText type={isError ? 'error' : 'info'}>
        {isLoading ? <Text>{strings.pleaseWait}</Text> : <Text>{errorMessage}</Text>}
      </components.HelperText>

      {isResolved && (
        <Text ellipsizeMode="middle" numberOfLines={1}>
          {`${strings.resolvesTo}: ${address}`}
        </Text>
      )}
    </View>
  )
}

export const useReceiver = (
  {wallet, receiver}: {wallet: YoroiWallet; receiver: string},
  options?: UseQueryOptions<string, Error, string, ['receiver', string]>,
) => {
  const query = useQuery({
    queryKey: ['receiver', receiver],
    queryFn: () => resolveAndCheckAddress(receiver, wallet.networkId),
    ...options,
  })

  return {
    ...query,
    address: query.data ?? '',
  }
}

const resolveAndCheckAddress = async (receiver: string, networkId: NetworkId) => {
  let address = receiver
  let resolvedAddress: {
    error: string | null
    address: string | null
  } = {
    error: null,
    address: null,
  }

  if (isDomain(receiver)) {
    address = await getUnstoppableDomainAddress(receiver)
  } else if (isHandle(receiver)) {
    console.log('test', receiver)
    resolvedAddress = await getResolvedAddress(address.substring(1))

    if (typeof resolvedAddress.error === 'string') throw new Error(resolvedAddress.error)
    if (resolvedAddress.address === null) throw new Error('Unknown error')

    address = resolvedAddress.address
  }

  await isReceiverAddressValid(address, networkId)
  return address
}

const getResolvedAddress = async (receiver) => {
  const {
    handle: {address, error},
  } = await resolveAddress(receiver)
  return {address, error}
}

export const getAddressErrorMessage = (error: Error & {code?: string}, strings: ReturnType<typeof useStrings>) => {
  switch (error?.code) {
    case 'UnsupportedDomain':
      return strings.domainUnsupportedError
    case 'RecordNotFound':
      return strings.domainRecordNotFoundError
    case 'UnregisteredDomain':
      return strings.domainNotRegisteredError
    default:
      return strings.addressInputErrorInvalidAddress
  }
}

const getUnstoppableDomainAddress = (receiver: string) => {
  const resolution = new Resolution()
  return resolution.addr(receiver, 'ADA')
}

const isReceiverAddressValid = async (resolvedAddress: string, walletNetworkId: NetworkId): Promise<void> => {
  if (resolvedAddress.length === 0) return Promise.resolve()

  const address = await normalizeToAddress(resolvedAddress)
  if (!address) return Promise.reject(new Error('Invalid address'))

  try {
    const networkConfig: any = getNetworkConfigById(walletNetworkId)
    const configNetworkId = Number(networkConfig.CHAIN_NETWORK_ID)
    const addressNetworkId = await address.networkId()
    if (addressNetworkId !== configNetworkId && !isNaN(configNetworkId)) {
      return Promise.reject(new Error('Invalid address'))
    }
  } catch (e) {
    return Promise.reject(new Error('Should not happen'))
  }
}

const isDomain = (receiver: string) => /.+\..+/.test(receiver)
const isHandle = (receiver: string) => /^\$[a-zA-Z]+$/.test(receiver)
