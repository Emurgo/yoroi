import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  TextInput,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'

import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Icon} from '~/ui/Icon'
import {useStrings} from '../../common/useStrings'

type Props = {
  searchValue: string
  onBack: () => void
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
}
export const BrowserSearchToolbar = ({
  onBack,
  onSearchChange,
  onSearchSubmit,
  searchValue,
}: Props) => {
  const {palette: p, isDark} = useTheme()
  const strings = useStrings()
  const {track} = useMetrics()

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined

    const sendMetrics = () => {
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        track.discoverWebViewToolbarSearchActivated({search_term: searchValue})
      }, 500) // 0.5s requirement
    }

    if (searchValue.length > 0) sendMetrics()

    return () => clearTimeout(timeout)
  }, [searchValue, track])

  return (
    <View style={[a.px_md]}>
      <View style={[a.flex_row, a.align_center, a.gap_lg, {minHeight: 64}]}>
        <BackButton onPress={onBack} />

        <TextInput
          autoFocus
          selectTextOnFocus
          value={searchValue}
          placeholder={strings.searchDApps}
          placeholderTextColor={p.text_gray_low}
          onChangeText={(search) => onSearchChange(search)}
          autoCapitalize="none"
          style={[
            {color: p.text_gray_max, minHeight: 36},
            a.body_1_lg_regular,
            a.flex_1,
            a.pb_md,
          ]}
          onSubmitEditing={onSearchSubmit}
          enablesReturnKeyAutomatically={searchValue.length === 0}
          keyboardAppearance={isDark ? 'dark' : 'light'}
        />
      </View>
    </View>
  )
}

const BackButton = (props: TouchableOpacityProps) => {
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity testID="buttonBack" {...props}>
      <Icon.Chevron direction="left" size={24} color={p.gray_max} />
    </TouchableOpacity>
  )
}
