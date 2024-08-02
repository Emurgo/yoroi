import {useTheme} from '@yoroi/theme'
import {Image} from 'expo-image'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Icon, Spacer, useModal} from '../../../components'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {getDappFallbackLogo} from './helpers'
import {useStrings} from './useStrings'

type Props = {
  name: string
  website: string
  logo: string
  onConfirm: () => void
}

export const confirmConnectionModalHeight = 400

export const useOpenConfirmConnectionModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const {track} = useMetrics()
  const open = React.useCallback(
    (props: Props & {onClose: () => void}) => {
      openModal(
        strings.confirmConnectionModalTitle,
        <ConfirmConnectionModal
          name={props.name}
          website={props.website}
          logo={props.logo}
          onConfirm={() => {
            track.discoverWebViewBottomSheetConnectClicked()
            props.onConfirm()
            closeModal()
          }}
        />,
        confirmConnectionModalHeight,
        props.onClose,
      )
    },
    [openModal, strings.confirmConnectionModalTitle, track, closeModal],
  )
  return {openConfirmConnectionModal: open, closeModal}
}

export const ConfirmConnectionModal = ({name, website, onConfirm, logo}: Props) => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const imageUri = logo.length === 0 ? getDappFallbackLogo(website) : logo

  return (
    <View style={styles.root}>
      <View style={styles.imagesLine}>
        <Icon.YoroiApp size={48} />

        <Icon.Connection size={20} color={colors.icon} />

        <Image source={{uri: imageUri}} style={styles.image} key={imageUri} />
      </View>

      <Spacer height={8} />

      <View style={styles.line}>
        <Text style={styles.text}>{strings.confirmConnectionModalConnectTo}</Text>

        <Text style={styles.bold}>{name}</Text>
      </View>

      <Spacer height={8} />

      <View style={styles.line}>
        <Text style={styles.text}>{website}</Text>
      </View>

      <Spacer height={16} />

      <Text style={styles.text}>{strings.confirmConnectionModalAllowThisDAppTo}</Text>

      <View style={styles.boxDesAllowConnectDApp}>
        <Text style={styles.text}>{`\u2022 ${strings.confirmConnectionModalPermission1}`}</Text>

        <Text style={styles.text}>{`\u2022 ${strings.confirmConnectionModalPermission2}`}</Text>
      </View>

      <Spacer height={46} />

      <Button title={strings.confirmConnectionModalConnect} shelleyTheme onPress={onConfirm} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const colors = {icon: color.el_gray_high}
  const styles = StyleSheet.create({
    imagesLine: {
      ...atoms.flex,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.justify_center,
      ...atoms.gap_xl,
    },
    image: {
      width: 48,
      height: 48,
    },
    line: {
      ...atoms.flex,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.justify_center,
      ...atoms.gap_xs,
    },
    text: {
      color: color.text_gray_normal,
      ...atoms.body_1_lg_regular,
    },
    bold: {
      color: color.text_gray_normal,
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
    },
    boxDesAllowConnectDApp: {
      ...atoms.pl_sm,
    },
    root: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
  })
  return {styles, colors} as const
}
