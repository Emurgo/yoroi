import {nameServerName} from '@yoroi/resolver'
import React from 'react'
import {StyleSheet, Text, View, ViewProps} from 'react-native'

import {HelperText, Spacer} from '../../../../../components'
import {isEmptyString} from '../../../../../utils'
import {useStrings} from '../../../common/strings'
import {InputReceiver} from './InputReceiver'

type ReceiverProps = ViewProps & {
  receiver: string
  errorMessage: string
  isLoading: boolean
  isValid: boolean
}
export const ResolveAddress = ({isLoading, receiver, errorMessage, isValid, style, ...props}: ReceiverProps) => {
  // const {resolvedAddressSelected} = useResolver()
  const isError = errorMessage.length > 0
  // const selectedAddress = resolvedAddressSelected?.address ?? ''
  // const selectedSevice = resolvedAddressSelected?.service ?? ''
  // const isResolved = !isLoading && !isEmptyString(selectedAddress) && !isEmptyString(selectedSevice)
  const _isResolved = false
  const [, setInputText] = React.useState(receiver)
  // const handleOnChangeText = (text: string) => {
    // setInputText(text)
  // }

  return (
    <View style={style} {...props}>
      <InputReceiver
        value={receiver}
        // onChangeText={handleOnChangeText}
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

      {/* {isResolved && <ResolvedAddress address={selectedAddress} service={selectedSevice} />} */}
    </View>
  )
}

const _ResolvedAddress = ({address, service}: {address: string; service: string}) => {
  const strings = useStrings()
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
        <Text style={styles.resolvedAddressService} numberOfLines={1}>{`${nameServerName[service]}`}</Text>

        <Text
          style={styles.resolvedAddress}
          numberOfLines={1}
        >{`${strings.resolvedAddress}: ${firstHalf}...${secondHalf}`}</Text>
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
