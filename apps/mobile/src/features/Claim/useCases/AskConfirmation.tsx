import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Platform, StyleSheet, Text, View} from 'react-native'

import {useModal} from '../../../ui/Modal/ModalContext'

import {Button, ButtonType} from '../../../ui/Button/Button'
import {Space} from '../../../ui/Space/Space'
import {useStrings} from '../common/useStrings'

type Props = {
  address: string
  url: string
  code: string
}
export const AskConfirmation = ({address, url, code}: Props) => {
  const strings = useStrings()
  const domain = getDomain(url)
  const {color} = useTheme()

  return (
    <View style={styles.root}>
      <Text style={[styles.warning, {color: color.text_gray_medium}]}>{strings.addressSharingWarning}</Text>

      <Space.Height.xl />

      <Text style={[styles.monospace, {color: color.text_gray_max}]}>{address}</Text>

      <Space.Height.lg fill />

      <Item label={strings.domain} value={domain} />

      <Space.Height.lg />

      <Item label={strings.code} value={code} />

      <Space.Height.lg fill />
    </View>
  )
}

const Item = ({label, value}: {label: string; value: string}) => {
  const {color} = useTheme()
  return (
    <View style={styles.item}>
      <Text style={[styles.rowLabel, {color: color.text_gray_medium}]}>{label}</Text>

      <Text ellipsizeMode="middle" numberOfLines={1} style={[styles.rowValue, {color: color.text_gray_max}]}>
        {value}
      </Text>
    </View>
  )
}

export const AskConfirmationActions = ({
  onContinue,
}: {
  onContinue: () => void
}) => {
  const strings = useStrings()
  const {closeModal, isLoading} = useModal()

  return (
    <View style={styles.actions}>
      <Button
        size="S"
        type={ButtonType.Secondary}
        title={strings.cancel}
        onPress={closeModal}
        disabled={isLoading}
      />

      <Button
        size="S"
        title={strings.continue}
        onPress={onContinue}
        disabled={isLoading}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...a.flex_1,
    ...a.px_lg,
  },
  actions: {
    ...a.flex_row,
    ...a.pb_lg,
    ...a.gap_lg,
  },
  item: {
    ...a.self_stretch,
    ...a.flex_row,
    ...a.justify_between,
  },
  warning: {
    ...a.font_normal,
    ...a.text_center,
    ...a.body_1_lg_regular,
  },
  rowLabel: {
    ...a.font_normal,
    ...a.pr_sm,
    ...a.body_1_lg_regular,
  },
  rowValue: {
    maxWidth: 240,
    ...a.font_normal,
    ...a.body_1_lg_regular,
  },
  monospace: {
    ...Platform.select({
      ios: {fontFamily: 'Menlo'},
      android: {fontFamily: 'monospace'},
    }),
  },
})

function getDomain(url: string) {
  try {
    const domain = new URL(url).hostname
    return domain
  } catch (error) {
    return ''
  }
}