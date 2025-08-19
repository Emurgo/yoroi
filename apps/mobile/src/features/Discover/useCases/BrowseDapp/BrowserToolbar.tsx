import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'
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
    <View
      style={[
        a.flex_row,
        a.align_center,
        a.gap_md,
        a.py_sm,
        a.px_md,
        {backgroundColor: p.bg_color_max},
      ]}
    >
      <View
        style={[
          a.flex_1,
          a.rounded_md,
          {backgroundColor: p.gray_50},
          a.py_sm,
          a.px_sm,
        ]}
      >
        <TouchableOpacity
          onPress={handleEditUrl}
          style={[a.flex_row, a.align_center, a.gap_xs]}
        >
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
