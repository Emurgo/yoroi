import {DomainService, useResolver} from '@yoroi/resolver'
import React from 'react'
import {StyleSheet, Text, View, ViewProps} from 'react-native'

import {HelperText, Spacer} from '../../../../../components'
import {isEmptyString} from '../../../../../utils'
import {InputReceiver} from './InputReceiver'

export const Service = {
  [DomainService.Cns]: 'CNS',
  [DomainService.Unstoppable]: 'Unstoppable Domains',
  [DomainService.Handle]: 'ADA Handle',
}

type ReceiverProps = ViewProps & {
  receiver: string
  errorMessage: string
  isLoading: boolean
  isValid: boolean
  onChangeReceiver: (receiver: string) => void
}
export const ResolveAddress = ({
  isLoading,
  receiver,
  errorMessage,
  isValid,
  onChangeReceiver,
  style,
  ...props
}: ReceiverProps) => {
  const {resolvedAddressSelected} = useResolver()
  const isError = errorMessage.length > 0
  const selectedAddress = resolvedAddressSelected?.address ?? ''
  const selectedSevice = resolvedAddressSelected?.service ?? ''
  const isResolved = !isLoading && !isEmptyString(selectedAddress) && !isEmptyString(selectedSevice)

  return (
    <View style={style} {...props}>
      <InputReceiver
        value={receiver}
        onChangeText={onChangeReceiver}
        error={isError}
        errorText={errorMessage}
        isLoading={isLoading}
        isValid={isValid}
        autoComplete="off"
      />

      {!isEmptyString(errorMessage) && (
        <HelperText type="error">
          <Text>{errorMessage}</Text>
        </HelperText>
      )}

      {isResolved && <ResolvedAddress address={selectedAddress} service={selectedSevice} />}
    </View>
  )
}

const ResolvedAddress = ({address, service}: {address: string; service: string}) => {
  const {firstHalf, secondHalf} = React.useMemo(() => {
    const firstHalf = address.substring(0, 8)
    const secondHalf = address.substring(address.length - 8)

    return {
      firstHalf,
      secondHalf,
    }
  }, [address])
  return (
    <>
      <Spacer height={4} />

      <View style={styles.resolvedAddressContainer}>
        <Text style={styles.resolvedAddressService} numberOfLines={1}>{`${Service[service ?? ''] ?? ''}`}</Text>

        <Text style={styles.resolvedAddress} numberOfLines={1}>{`${firstHalf}...${secondHalf}`}</Text>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  resolvedAddressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resolvedAddressService: {
    fontFamily: 'Rubik',
    fontSize: 12,
    fontWeight: '400',
    color: '#4A5065',
  },
  resolvedAddress: {
    fontFamily: 'Rubik',
    fontSize: 12,
    fontWeight: '400',
    color: '#8A92A3',
  },
})
