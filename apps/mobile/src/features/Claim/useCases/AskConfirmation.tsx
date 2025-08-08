import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Platform, Text, View} from 'react-native'

import {useModal} from '~/ui/Modal/ModalContext'

import {Button, ButtonType} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {useStrings} from '~/kernel/i18n/useStrings'

type Props = {
  address: string
  url: string
  code: string
}
export const AskConfirmation = ({address, url, code}: Props) => {
  const strings = useStrings()
  const domain = getDomain(url)
  const {palette: p} = useTheme()

  return (
    <View style={[a.flex_1, a.px_lg]}>
      <Text
        style={[
          a.font_normal,
          a.text_center,
          a.body_1_lg_regular,
          {color: p.text_gray_medium},
        ]}
      >
        {strings.addressSharingWarning}
      </Text>

      <Space.Height.xl />

      <Text
        style={[
          {fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'})},
          {color: p.text_gray_max},
        ]}
      >
        {address}
      </Text>

      <Space.Height.lg fill />

      <Item label={strings.domain} value={domain} />

      <Space.Height.lg />

      <Item label={strings.code} value={code} />

      <Space.Height.lg fill />
    </View>
  )
}

const Item = ({label, value}: {label: string; value: string}) => {
  const {palette: p} = useTheme()
  return (
    <View style={[a.self_stretch, a.flex_row, a.justify_between]}>
      <Text
        style={[
          a.font_normal,
          a.pr_sm,
          a.body_1_lg_regular,
          {color: p.text_gray_medium},
        ]}
      >
        {label}
      </Text>

      <Text
        ellipsizeMode="middle"
        numberOfLines={1}
        style={[
          {maxWidth: 240},
          a.font_normal,
          a.body_1_lg_regular,
          {color: p.text_gray_max},
        ]}
      >
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
    <View style={[a.flex_row, a.pb_lg, a.gap_lg]}>
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

function getDomain(url: string) {
  try {
    const domain = new URL(url).hostname
    return domain
  } catch (error) {
    return ''
  }
}
