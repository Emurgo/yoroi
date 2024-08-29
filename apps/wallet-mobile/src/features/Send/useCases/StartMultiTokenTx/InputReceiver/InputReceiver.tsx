import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ActivityIndicator, StyleSheet, Text, TextInput as RNTextInput} from 'react-native'

import {Icon, TextInput, TextInputProps} from '../../../../../components'
import {useNavigateTo} from '../../../common/navigation'
import {ScannerButton} from '../../../common/ScannerButton'
import {useStrings} from '../../../common/strings'
import {ShowResolvedAddressSelected} from './ShowResolvedAddressSelected'

export const InputReceiver = React.forwardRef(
  (
    {isLoading, isValid, ...props}: {isLoading?: boolean; isValid?: boolean} & TextInputProps,
    ref: React.ForwardedRef<RNTextInput>,
  ) => {
    const strings = useStrings()
    const {styles, colors} = useStyles()
    const navigateTo = useNavigateTo()
    const rightAdornment = isLoading ? (
      <ActivityIndicator size={25} color={colors.indicatorColor} />
    ) : isValid ? (
      <Icon.Check size={25} color={colors.iconColor} />
    ) : (
      <ScannerButton onPress={navigateTo.reader} />
    )

    return (
      <TextInput
        right={rightAdornment}
        label={<Text style={styles.label}>{strings.addressInputLabel}</Text>}
        testID="receiverInput"
        autoCorrect={false}
        focusable
        errorOnMount
        showErrorOnBlur
        multiline
        blurOnSubmit
        helper={<ShowResolvedAddressSelected />}
        renderComponentStyle={{
          minHeight: 120,
        }}
        ref={ref}
        {...props}
      />
    )
  },
)

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    label: {
      fontSize: 15,
    },
  })
  const colors = {
    indicatorColor: color.primary_600,
    iconColor: color.secondary_500,
  }
  return {styles, colors}
}
