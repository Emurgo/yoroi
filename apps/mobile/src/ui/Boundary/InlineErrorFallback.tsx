import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'

import {Text, TouchableOpacity, View} from 'react-native'

import {useTranslatedError} from '~/hooks/useTranslatedError'
import {ErrorFallbackProps} from './types'

export const InlineErrorFallback = ({
  error,
  resetErrorBoundary,
  reset,
  debug,
}: ErrorFallbackProps) => {
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
      <TouchableOpacity
        onLongPress={() => {
          resetErrorBoundary()
        }}
        style={[a.align_center, a.justify_center]}
        disabled={reset === false}
      >
        <Text style={[ta.text_gray_max, a.body_1_lg_medium]}>
          {translatedError}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
