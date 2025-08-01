import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {Text, TouchableOpacity, useWindowDimensions} from 'react-native'

import {useModal} from '~/ui/Modal/ModalContext'
import {TokenDetails} from '~/ui/TokenDetails/TokenDetails'
import {useStrings} from '~/kernel/i18n/useStrings'

export const TokenItem = ({
  tokenInfo,
  isPrimaryToken = true,
  isSent = true,
  label,
}: {
  tokenInfo: Portfolio.Token.Info
  isPrimaryToken?: boolean
  isSent?: boolean
  label: string
}) => {
  const strings = useStrings()
  const {openModal} = useModal()
  const {height: windowHeight} = useWindowDimensions()
  const {palette: p} = useTheme()

  const handleShowTokenDetails = () => {
    openModal({
      title: strings.txReview.tokenDetailsTitle,
      content: <TokenDetails tokenInfo={tokenInfo} />,
      height: windowHeight * 0.8,
    })
  }

  if (!isSent)
    return (
      <TouchableOpacity
        onPress={handleShowTokenDetails}
        activeOpacity={0.5}
        style={[
          a.flex,
          a.flex_row,
          a.align_center,
          a.py_xs,
          a.px_md,
          {borderRadius: 8},
          {backgroundColor: p.secondary_300},
          !isPrimaryToken && {backgroundColor: p.secondary_100},
        ]}
        disabled={isPrimaryToken}
      >
        <Text
          style={[
            a.body_2_md_regular,
            {color: p.text_gray_max},
            !isPrimaryToken && {color: p.secondary_700},
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    )

  return (
    <TouchableOpacity
      onPress={handleShowTokenDetails}
      activeOpacity={0.5}
      style={[
        a.flex,
        a.flex_row,
        a.align_center,
        a.py_xs,
        a.px_md,
        {borderRadius: 8},
        {backgroundColor: p.primary_500},
        !isPrimaryToken && {backgroundColor: p.primary_100},
      ]}
      disabled={isPrimaryToken}
    >
      <Text
        style={[
          a.body_2_md_regular,
          {color: p.white_static},
          !isPrimaryToken && {color: p.text_primary_medium},
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}
