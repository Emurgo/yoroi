import {useTheme} from '@yoroi/theme'
import {Image} from 'expo-image'
import * as React from 'react'
import {Linking, StyleSheet, Text, View} from 'react-native'

import {Button, Icon, Spacer, useModal} from '../../../components'
import {Space} from '../../../components/Space/Space'
import {Warning} from '../../../components/Warning'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {getDappFallbackLogo} from './helpers'
import {useStrings} from './useStrings'

type Props = {
  name: string
  website: string
  logo: string
  onConfirm: () => void
  showSingleAddressWarning: boolean
}

type OpenModalProps = {
  onClose: () => void
} & Props

const confirmConnectionModalHeight = 400
const confirmConnectionModalWithWarningHeight = 530

export const useOpenConfirmConnectionModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const {track} = useMetrics()

  const open = React.useCallback(
    (props: OpenModalProps) => {
      const modalHeight = props.showSingleAddressWarning
        ? confirmConnectionModalWithWarningHeight
        : confirmConnectionModalHeight

      openModal(
        strings.confirmConnectionModalTitle,
        <ConfirmConnectionModal
          name={props.name}
          website={props.website}
          logo={props.logo}
          showSingleAddressWarning={props.showSingleAddressWarning}
          onConfirm={() => {
            track.discoverWebViewBottomSheetConnectClicked()
            props.onConfirm()
            closeModal()
          }}
        />,
        modalHeight,
        props.onClose,
      )
    },
    [openModal, strings.confirmConnectionModalTitle, track, closeModal],
  )
  return {openConfirmConnectionModal: open, closeModal}
}

export const ConfirmConnectionModal = ({name, website, onConfirm, logo, showSingleAddressWarning}: Props) => {
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

      <Space height="sm" />

      <View style={styles.line}>
        <Text style={styles.text}>{strings.confirmConnectionModalConnectTo}</Text>

        <Text style={styles.bold}>{name}</Text>
      </View>

      <Space height="sm" />

      <View style={styles.line}>
        <Text style={styles.text}>{website}</Text>
      </View>

      {showSingleAddressWarning && (
        <>
          <Space height="lg" />

          <SingleAddressDAppWarning />
        </>
      )}

      <Space height="lg" />

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

const walletsCompatibilityLink =
  'https://emurgohelpdesk.zendesk.com/hc/en-us/articles/10413017088527-DApps-and-HD-wallets-compatability'

const SingleAddressDAppWarning = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  const handleOnPress = () => {
    Linking.openURL(walletsCompatibilityLink)
  }

  return (
    <Warning
      content={
        <>
          <Text style={styles.warningText}>{`${strings.singleAddressWarning} `}</Text>

          <Text style={[styles.warningText, styles.link]} onPress={handleOnPress}>
            {strings.learnMore}
          </Text>
        </>
      }
      iconSize={20}
    />
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const colors = {icon: color.el_gray_max}
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
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
    },
    bold: {
      color: color.text_gray_medium,
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
    warningText: {
      ...atoms.body_2_md_regular,
      color: color.gray_max,
    },
    link: {
      color: color.sys_cyan_500,
    },
  })
  return {styles, colors} as const
}
