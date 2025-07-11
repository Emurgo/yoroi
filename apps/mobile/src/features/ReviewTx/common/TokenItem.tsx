import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native'

import {useModal} from '../../../ui/Modal/ModalContext'
import {useStrings} from './hooks/useStrings'
import {TokenDetails} from '../../../ui/TokenDetails/TokenDetails'

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
  const {color} = useTheme()

  const handleShowTokenDetails = () => {
    openModal({
      title: strings.tokenDetailsTitle,
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
          styles.receivedTokenItem,
          !isPrimaryToken && styles.notPrimaryReceivedTokenItem,
          !isPrimaryToken && {backgroundColor: color.secondary_100},
        ]}
        disabled={isPrimaryToken}
      >
        <Text
          style={[
            styles.tokenReceivedItemText,
            !isPrimaryToken && styles.notPrimaryReceivedTokenItemText,
            !isPrimaryToken && {color: color.secondary_700},
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
        styles.sentTokenItem,
        !isPrimaryToken && styles.notPrimarySentTokenItem,
        !isPrimaryToken && {backgroundColor: color.primary_100},
      ]}
      disabled={isPrimaryToken}
    >
      <Text
        style={[
          styles.tokenSentItemText,
          !isPrimaryToken && styles.notPrimarySentTokenItemText,
          !isPrimaryToken && {color: color.text_primary_medium},
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  sentTokenItem: {
    ...a.flex,
    ...a.flex_row,
    ...a.align_center,
    ...a.py_xs,
    ...a.px_md,
    borderRadius: 8,
    backgroundColor: color.primary_500,
  },
  receivedTokenItem: {
    ...a.flex,
    ...a.flex_row,
    ...a.align_center,
    ...a.py_xs,
    ...a.px_md,
    borderRadius: 8,
    backgroundColor: color.secondary_300,
  },
  tokenSentItemText: {
    ...a.body_2_md_regular,
    color: color.white_static,
  },
  tokenReceivedItemText: {
    ...a.body_2_md_regular,
    color: color.text_gray_max,
  },
  notPrimarySentTokenItem: {},
  notPrimaryReceivedTokenItem: {},
  notPrimarySentTokenItemText: {},
  notPrimaryReceivedTokenItemText: {},
})