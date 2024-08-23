import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Platform, ScrollView, StyleSheet, Text, View, ViewProps} from 'react-native'

import {Button} from '../../../components/Button/Button'
import {useModal} from '../../../components/Modal/ModalContext'
import {Spacer} from '../../../components/Spacer/Spacer'
import {useStrings} from '../common/useStrings'

type Props = {
  address: string
  url: string
  code: string
  onContinue: () => void
}
export const AskConfirmation = ({address, url, code, onContinue}: Props) => {
  const strings = useStrings()
  const {closeModal, isLoading} = useModal()
  const domain = getDomain(url)
  const styles = useStyles()

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{flex: 1}} bounces={false}>
        <Text style={styles.warning}>{strings.addressSharingWarning}</Text>

        <Spacer height={20} />

        <Text style={styles.monospace}>{address}</Text>

        <Spacer fill />

        <Item label={strings.domain} value={domain} />

        <Spacer height={16} />

        <Item label={strings.code} value={code} />

        <Spacer fill />
      </ScrollView>

      <Actions>
        <Button
          title={strings.cancel}
          onPress={closeModal}
          withoutBackground
          outlineShelley
          block
          disabled={isLoading}
        />

        <Spacer width={20} />

        <Button title={strings.continue} onPress={onContinue} shelleyTheme block disabled={isLoading} />
      </Actions>
    </View>
  )
}

const Actions = ({style, ...props}: ViewProps) => {
  const styles = useStyles()
  return <View style={[style, styles.actions]} {...props} />
}
const Item = ({label, value}: {label: string; value: string}) => {
  const styles = useStyles()
  return (
    <View style={styles.item}>
      <Text style={styles.rowLabel}>{label}</Text>

      <Text ellipsizeMode="middle" numberOfLines={1} style={styles.rowValue}>
        {value}
      </Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    actions: {
      ...atoms.flex_row,
      ...atoms.align_end,
      ...atoms.pb_lg,
      minHeight: 48,
      maxHeight: 54,
    },
    item: {
      ...atoms.self_stretch,
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    warning: {
      color: color.text_gray_normal,
      ...atoms.font_normal,
      ...atoms.text_center,
      ...atoms.body_1_lg_regular,
    },
    rowLabel: {
      color: color.text_gray_medium,
      ...atoms.font_normal,
      ...atoms.pr_sm,
      ...atoms.body_1_lg_regular,
    },
    rowValue: {
      maxWidth: 240,
      color: color.text_gray_max,
      ...atoms.font_normal,
      ...atoms.body_1_lg_regular,
    },
    monospace: {
      ...Platform.select({
        ios: {fontFamily: 'Menlo'},
        android: {fontFamily: 'monospace'},
      }),
      color: color.text_gray_max,
    },
  })

  return styles
}

function getDomain(url: string) {
  try {
    const domain = new URL(url).hostname
    return domain
  } catch (error) {
    return ''
  }
}
