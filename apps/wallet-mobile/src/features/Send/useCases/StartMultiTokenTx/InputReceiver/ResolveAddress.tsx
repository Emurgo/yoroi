import {DomainService} from '@yoroi/resolver'
import React from 'react'
import {Text, View, ViewProps} from 'react-native'

import {Spacer} from '../../../../../components'
import {useResolver} from '../../../../../features/Send/common/ResolverProvider'
import {InputReceiver} from './InputReceiver'

const Service = {
  [DomainService.Cns]: 'CNS',
  [DomainService.Unstoppable]: 'Unstoppable Domains',
  [DomainService.Handle]: 'ADA Handle',
}

type ReceiverProps = ViewProps & {
  receiver: string
  address: string
  errorMessage: string
  isLoading: boolean
  isValid: boolean
  onChangeReceiver: (receiver: string) => void
}
export const ResolveAddress = ({
  isLoading,
  address,
  receiver,
  errorMessage,
  isValid,
  onChangeReceiver,
  style,
  ...props
}: ReceiverProps) => {
  const {resolvedAddressSelected} = useResolver()
  const isResolved = !isLoading && !!resolvedAddressSelected
  const isError = errorMessage.length > 0

  const firstHalf = address.substring(0, 8)
  const secondHalf = address.substring(address.length - 8)

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

      {isResolved && (
        <>
          <Spacer height={4} />

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text
              style={{fontFamily: 'Rubik', fontSize: 12, fontWeight: '400', color: '#4A5065'}}
              numberOfLines={1}
            >{`${Service[resolvedAddressSelected?.service ?? '']}`}</Text>

            <Text
              style={{fontFamily: 'Rubik', fontSize: 12, fontWeight: '400', color: '#8A92A3'}}
              numberOfLines={1}
            >{`${firstHalf}...${secondHalf}`}</Text>
          </View>
        </>
      )}
    </View>
  )
}
