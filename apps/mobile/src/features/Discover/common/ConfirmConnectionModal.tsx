import {atoms as a, useTheme} from '@yoroi/theme'
import {Image} from 'expo-image'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {Icon} from '../../../ui/Icon'
import {useModal} from '../../../ui/Modal/ModalContext'
import {Space} from '../../../ui/Space/Space'
import {getDappFallbackLogo} from './helpers'
import {useStrings} from './useStrings'

type Props = {
  name: string
  website: string
  logo: string
  showSingleAddressWarning: boolean
}

type OpenModalProps = {
  onClose: () => void
  onConfirm: () => void
} & Props

const confirmConnectionModalHeight = 420
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

      openModal({
        // title: strings.confirmConnectionModalTitle,
        content: (
          <ConfirmConnectionModal
            name={props.name}
            website={props.website}
            logo={props.logo}
            showSingleAddressWarning={props.showSingleAddressWarning}
          />
        ),
        /* footer: (
          <Button
            title={strings.confirmConnectionModalConnect}
            onPress={() => {
              track.discoverWebViewBottomSheetConnectClicked()
              props.onConfirm()
              closeModal()
            }}
          />
        ), */
        // height: modalHeight,
        // onClose: props.onClose,
      })
    },
    [openModal],
  )
  return {openConfirmConnectionModal: open, closeModal}
}

export const ConfirmConnectionModal = ({
  name,
  website,
  logo,
  showSingleAddressWarning,
}: Props) => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const imageUri = logo.length === 0 ? getDappFallbackLogo(website) : logo

  return (
    <View style={[a.flex_1, a.px_lg]}>
      <View
        style={[a.flex, a.flex_row, a.align_center, a.justify_center, a.gap_xl]}
      >
        <Icon.YoroiApp size={48} />

        <Icon.Connection size={20} color={p.el_gray_max} />

        <Image
          source={{uri: imageUri}}
          style={[{width: 48, height: 48}]}
          key={imageUri}
        />
      </View>

      <Space.Height.sm />

      <View
        style={[a.flex, a.flex_row, a.align_center, a.justify_center, a.gap_xs]}
      >
        <Text style={[{color: p.text_gray_medium}, a.body_1_lg_regular]}>
          {strings.confirmConnectionModalConnectTo}
        </Text>

        <Text
          style={[
            {color: p.text_gray_medium},
            a.body_1_lg_medium,
            a.font_semibold,
          ]}
        >
          {name}
        </Text>
      </View>

      <Space.Height.sm />

      <View
        style={[a.flex, a.flex_row, a.align_center, a.justify_center, a.gap_xs]}
      >
        <Text style={[{color: p.text_gray_medium}, a.body_1_lg_regular]}>
          {website}
        </Text>
      </View>

      {showSingleAddressWarning && (
        <>
          <Space.Height.lg />

          {/* <SingleAddressDAppWarning /> */}
        </>
      )}

      <Space.Height.lg />

      <Text style={[{color: p.text_gray_medium}, a.body_1_lg_regular]}>
        {strings.confirmConnectionModalAllowThisDAppTo}
      </Text>

      <View style={[a.pl_sm]}>
        <Text
          style={[{color: p.text_gray_medium}, a.body_1_lg_regular]}
        >{`\u2022 ${strings.confirmConnectionModalPermission1}`}</Text>

        <Text
          style={[{color: p.text_gray_medium}, a.body_1_lg_regular]}
        >{`\u2022 ${strings.confirmConnectionModalPermission2}`}</Text>
      </View>
    </View>
  )
}

const walletsCompatibilityLink =
  'https://emurgohelpdesk.zendesk.com/hc/en-us/articles/10413017088527-DApps-and-HD-wallets-compatability'

/* const SingleAddressDAppWarning = () => {
  const {atoms: a, palette: p} = useTheme()
  const strings = useStrings()

  const handleOnPress = () => {
    Linking.openURL(walletsCompatibilityLink)
  }

  return (
    <WarningBanner
      content={
        <>
          <Text
            style={[a.body_2_md_regular, {color: p.gray_max}]}
          >{`${strings.singleAddressWarning} `}</Text>

          <Text
            style={[
              a.body_2_md_regular,
              {color: p.gray_max},
              {color: p.sys_cyan_500},
            ]}
            onPress={handleOnPress}
          >
            {strings.learnMore}
          </Text>
        </>
      }
      iconSize={20}
    />
  )
} */
