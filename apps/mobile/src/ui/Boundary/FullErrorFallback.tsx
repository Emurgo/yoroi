import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'

import {Text, View} from 'react-native'

import {useTranslatedError} from '../../hooks/useTranslatedError'
import {Button} from '../Button/Button'
import {ErrorFallbackProps} from './types'
import {useStrings} from './useStrings'

export const FullErrorFallback = ({
  error,
  resetErrorBoundary,
  reset = true,
  debug,
}: ErrorFallbackProps) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const translatedError = useTranslatedError(error)

  return (
    <View
      style={[
        a.h_full,
        a.w_full,
        a.p_lg,
        a.flex_1,
        a.align_center,
        a.gap_lg,
        ta.bg_color_max,
        debug && a.debug,
      ]}
    >
      <View style={[a.align_center, a.justify_center]}>
        <Text style={[ta.text_gray_max, a.body_1_lg_medium]}>
          {translatedError}
        </Text>
      </View>

      {/* // TODO: add image for no fallback error */}
      {/* <Image source={image} /> */}

      {reset && (
        <Button
          title={strings.tryAgain}
          onPress={() => {
            resetErrorBoundary()
          }}
        />
      )}
    </View>
  )
}
