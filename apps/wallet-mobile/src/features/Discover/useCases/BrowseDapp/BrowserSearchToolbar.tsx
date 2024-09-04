import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TextInput, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import {Icon} from '../../../../components'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'

type Props = {
  searchValue: string
  onBack: () => void
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
}
export const BrowserSearchToolbar = ({onBack, onSearchChange, onSearchSubmit, searchValue}: Props) => {
  const {styles} = useStyles()
  const {track} = useMetrics()
  const {isDark} = useTheme()

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
    <View style={styles.root}>
      <View style={styles.boxURI}>
        <BackButton onPress={onBack} />

        <TextInput
          autoFocus
          selectTextOnFocus
          value={searchValue}
          placeholder=""
          onChangeText={(search) => onSearchChange(search)}
          autoCapitalize="none"
          style={styles.searchInputStyle}
          onSubmitEditing={onSearchSubmit}
          enablesReturnKeyAutomatically={searchValue.length === 0}
          keyboardAppearance={isDark ? 'dark' : 'light'}
        />
      </View>
    </View>
  )
}

const BackButton = (props: TouchableOpacityProps) => {
  const {color} = useTheme()

  return (
    <TouchableOpacity testID="buttonBack" {...props}>
      <Icon.Chevron direction="left" size={24} color={color.gray_max} />
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.px_md,
    },
    boxURI: {
      minHeight: 64,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_lg,
    },
    searchInputStyle: {
      color: color.text_gray_max,
      minHeight: 36,
      ...atoms.body_1_lg_regular,
      ...atoms.flex_1,
      ...atoms.pb_md,
    },
  })

  return {styles} as const
}
