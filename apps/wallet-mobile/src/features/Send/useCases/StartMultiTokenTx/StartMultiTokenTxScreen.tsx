import {useResolverCryptoAddresses} from '@yoroi/resolver'
import {Resolver} from '@yoroi/types'
import _ from 'lodash'
import React from 'react'
import {KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {useQuery, useQueryClient, UseQueryOptions} from 'react-query'

import {Button, Spacer} from '../../../../components'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {isEmptyString} from '../../../../utils'
import {debounceMaker} from '../../../../utils/debounceMaker'
import {getNetworkConfigById} from '../../../../yoroi-wallets/cardano/networks'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {normalizeToAddress} from '../../../../yoroi-wallets/cardano/utils'
import {useHasPendingTx, useIsOnline} from '../../../../yoroi-wallets/hooks'
import {NetworkId} from '../../../../yoroi-wallets/types'
import {Amounts} from '../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../common/navigation'
import {useSend} from '../../common/SendContext'
import {useStrings} from '../../common/strings'
import {InputMemo, maxMemoLength} from './InputMemo'
import {InputReceiver} from './InputReceiver/InputReceiver'
// import {ResolveAddress} from './InputReceiver/ResolveAddress'
import {MultiAddressResolutionNotice} from './MultiAddressResolutionNotice/MultiAddressResolutionNotice'
import {ShowErrors} from './ShowErrors'
import {ShowSupportedResolverServices} from './ShowSupportedResolverServices/ShowSupportedResolverServices'

export const StartMultiTokenTxScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const wallet = useSelectedWallet()
  const {track} = useMetrics()

  React.useEffect(() => {
    track.sendInitiated()
  }, [track])

  const hasPendingTx = useHasPendingTx(wallet)
  const isOnline = useIsOnline(wallet)

  const {targets, selectedTargetIndex, memo, memoChanged, receiverResolveChanged} = useSend()
  const {address, amounts} = targets[selectedTargetIndex].entry
  const shouldOpenAddToken = Amounts.toArray(amounts).length === 0
  const receiver = targets[selectedTargetIndex].receiver
  const {
    cryptoAddresses,
    refetch,
    isLoading: isResolvingAddressess,
  } = useResolverCryptoAddresses(
    {resolve: receiver.resolve},
    {
      enabled: false,
    },
  )
  console.log(cryptoAddresses)
  const debouncedRefetch = React.useMemo(() => debounceMaker(refetch, 300), [refetch])
  const queryClient = useQueryClient()
  const abortGetCryptoAddressess = React.useCallback(
    () => queryClient.cancelQueries({queryKey: ['useResolverCryptoAddresses']}),
    [queryClient],
  )
  React.useEffect(() => {
    if (receiver.as === 'domain') abortGetCryptoAddressess().then(() => debouncedRefetch.call())
    if (receiver.as === 'address') abortGetCryptoAddressess()
    return () => debouncedRefetch.clear()
  }, [receiver.as, refetch, receiver.resolve, debouncedRefetch, queryClient, abortGetCryptoAddressess])

  // const {resolvedAddressSelected, resolvedAddressSelectedChanged} = useResolver()

  // const handleOnChangeReceiver = (receiver: string) => {
  // }

  // const validatorEnabled = false
  // React.useMemo(
  //   () =>
  //     (!isEmptyString(resolvedAddressSelected?.address) || !isEmptyString(receiver)) &&
  //     succesfulResolvedAddresses.length < 2,
  //   [receiver, resolvedAddressSelected?.address, succesfulResolvedAddresses.length],
  // )

  // const {error: addressValidationError, isLoading: isValidationLoading} = useValidAddress(
  //   {wallet, receiver: receiver},
  //   {
  //     onSettled(address, error) {
  //       if (error) {
  //         addressChanged('')
  //       } else {
  //         addressChanged(address ?? '')
  //       }
  //     },
  //     enabled: validatorEnabled,
  //   },
  // )

  // const resolverEnabled = React.useMemo(
  //   () =>
  //     addressValidationError === null &&
  //     succesfulResolvedAddresses.length === 0 &&
  //     !isEmptyString(receiver) &&
  //     isDomain(receiver),
  //   [addressValidationError, receiver, succesfulResolvedAddresses.length],
  // )

  // const {isLoading: isResolutionLoading} = useResolverAddresses(
  //   {receiver},
  //   {
  //     onSettled(addresses) {
  //       const succesfulResolvedAddresses = addresses?.filter(({address}) => address !== null) ?? []

  //       if (succesfulResolvedAddresses?.length > 0) {
  //         resolvedAddressSelectedChanged(succesfulResolvedAddresses[0])
  //       }

  //       setSuccesfulResolvedAddresses(succesfulResolvedAddresses)
  //     },
  //     enabled: resolverEnabled,
  //   },
  // )

  // const addressErrorMessage = React.useMemo(
  //   () =>
  //     addressValidationError != null && succesfulResolvedAddresses.length < 2
  //       ? isDomain(receiver)
  //         ? strings.addressInputErrorInvalidDomain
  //         : strings.addressInputErrorInvalidAddress
  //       : '',
  //   [
  //     addressValidationError,
  //     receiver,
  //     strings.addressInputErrorInvalidAddress,
  //     strings.addressInputErrorInvalidDomain,
  //     succesfulResolvedAddresses.length,
  //   ],
  // )
  const isValid = React.useMemo(
    () =>
      isOnline &&
      !hasPendingTx &&
      // _.isEmpty(addressValidationError) &&
      memo.length <= maxMemoLength &&
      !isEmptyString(address),
    [address, hasPendingTx, isOnline, memo.length],
  )

  const onNext = () => {
    if (shouldOpenAddToken) {
      navigateTo.addToken()
    } else {
      navigateTo.selectedTokens()
    }
  }

  const handleOnChangeReceiver = (text: string) => receiverResolveChanged(text)

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={86}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView style={styles.flex} bounces={false}>
          <ShowErrors />

          <Spacer height={16} />

          <ShowSupportedResolverServices />

          {/* TODO: revisit */}
          {[].length > 1 && (
            <>
              <Spacer height={16} />

              <MultiAddressResolutionNotice />

              <ResolvedAddressesList list={[]} />
            </>
          )}

          <Spacer height={16} />

          <InputReceiver
            value={receiver.resolve}
            onChangeText={handleOnChangeReceiver}
            isLoading={isResolvingAddressess}
            isValid={false}
          />

          {/* <ResolveAddress
            receiver={receiver.resolve}
            errorMessage=""
            isLoading={false}
            isValid={!!isValid}
          /> */}

          <Spacer height={16} />

          <InputMemo memo={memo} onChangeText={memoChanged} />
        </ScrollView>

        <Actions>
          <NextButton onPress={onNext} title={strings.next} disabled={!isValid} testID="nextButton" shelleyTheme />
        </Actions>
      </KeyboardAvoidingView>
    </View>
  )
}

const ResolvedAddressesList = ({list}: {list: Resolver.AddressesResponse}) => {
  // TODO: revisit
  // const {resolvedAddressSelected, resolvedAddressSelectedChanged} = useResolver()
  return (
    <>
      <Spacer height={16} />

      <View style={styles.list}>
        {list.map((address, index) => {
          return (
            <>
              {index !== 0 && <Spacer width={5} />}

              <Pressable
                onPress={() => console.log('update selected address')}
                style={[
                  styles.listButton,
                  {
                    // backgroundColor: address.service === resolvedAddressSelected?.service ? '#DCE0E9' : undefined,
                  },
                ]}
                key={address.nameServer}
              >
                {/* <Text style={styles.listButtonText}>{`${domainServiceName[address.service]}`}</Text> */}
              </Pressable>
            </>
          )
        })}
      </View>
    </>
  )
}
const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

export const useValidAddress = (
  {wallet, receiver}: {wallet: YoroiWallet; receiver: string},
  options?: UseQueryOptions<string, Error, string, ['receiver', string]>,
) => {
  const query = useQuery({
    queryKey: ['receiver', receiver],
    queryFn: () => checkAddress(receiver, wallet.networkId),
    ...options,
  })

  return {
    ...query,
    address: query.data ?? '',
  }
}

const checkAddress = async (receiver: string, networkId: NetworkId) => {
  await isReceiverAddressValid(receiver, networkId)
  return receiver
}

const isReceiverAddressValid = async (resolvedAddress: string, walletNetworkId: NetworkId): Promise<void> => {
  if (resolvedAddress.length === 0) return Promise.resolve()

  const address = await normalizeToAddress(resolvedAddress)
  if (!address) return Promise.reject(new Error('Invalid address'))

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
  actions: {
    paddingVertical: 16,
  },
  list: {
    flexDirection: 'row',
  },
  listButton: {
    padding: 8,
    borderRadius: 5,
  },
  // listButtonText: {
  //   fontFamily: 'Rubik-Medium',
  //   fontSize: 16,
  //   fontWeight: '500',
  // },
})

const NextButton = Button
