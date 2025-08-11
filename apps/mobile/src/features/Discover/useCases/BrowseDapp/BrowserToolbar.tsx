import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Icon} from '~/ui/Icon'
import {getDomainFromUrl} from '../../common/helpers'
import {useNavigateTo} from '../../common/useNavigateTo'

type Props = {
  uri: string
}
export const BrowserToolbar = ({uri}: Props) => {
  const {palette: p} = useTheme()
  const navigateTo = useNavigateTo()
  const {track} = useMetrics()

  const {isSecure, domainName} = getDomainFromUrl(uri)

  const handleCloseBrowser = () => {
    track.discoverWebViewCloseClicked()
    navigateTo.selectDappFromList()
  }

  const handleEditUrl = () => {
    navigateTo.searchDappInBrowser()
  }

  return (
    <View style={[styles.container, {backgroundColor: p.bg_color_max}]}>
      <View style={[styles.urlContainer, {backgroundColor: p.gray_50}]}>
        <TouchableOpacity onPress={handleEditUrl} style={styles.urlButton}>
          {isSecure && <Icon.LockFilled color={p.el_gray_medium} />}

          <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
            {domainName}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleCloseBrowser}>
        <Icon.Close size={24} color={p.el_gray_medium} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  urlContainer: {
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    paddingVertical: 13,
    paddingHorizontal: 12,
    flex: 1,
  },
  urlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
})
