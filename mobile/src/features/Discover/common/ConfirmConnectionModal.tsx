import {atoms as a, useTheme} from '@yoroi/theme'

import {Image} from 'expo-image'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'

import {getDappFallbackLogo} from './helpers'

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
  const open = React.useCallback(
    (props: OpenModalProps) => {
      const modalHeight = props.showSingleAddressWarning
        ? confirmConnectionModalWithWarningHeight
        : confirmConnectionModalHeight

      openModal({
        title: strings.discover.confirmConnectionModalTitle,
        content: (
          <Modal.Content>
            <ConfirmConnectionModal
              name={props.name}
              website={props.website}
              logo={props.logo}
              showSingleAddressWarning={props.showSingleAddressWarning}
            />
          </Modal.Content>
        ),
        footer: (
          <Modal.Footer>
            <Button
              title={strings.discover.confirmConnectionModalConnect}
              onPress={() => {
                props.onConfirm()
                closeModal()
              }}
            />
          </Modal.Footer>
        ),
        height: modalHeight,
        onClose: props.onClose,
        canDiscard: false,
      })
    },
    [
      openModal,
      closeModal,
      strings.discover.confirmConnectionModalTitle,
      strings.discover.confirmConnectionModalConnect,
    ],
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
    <View style={[a.flex_1]}>
      <View
        style={[a.flex, a.flex_row, a.align_center, a.justify_center, a.gap_xl]}
      >
        <Icon.YoroiApp size={48} />

        <Icon.Connection size={20} color={p.el_gray_max} />

        <Image
          source={{uri: imageUri}}
          style={{width: 48, height: 48}}
          key={imageUri}
        />
      </View>

      <Space.Height.sm />

      <View
        style={[a.flex, a.flex_row, a.align_center, a.justify_center, a.gap_xs]}
      >
        <Text style={[{color: p.text_gray_medium}, a.body_1_lg_regular]}>
          {strings.discover.confirmConnectionModalConnectTo}
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
        {strings.discover.confirmConnectionModalAllowThisDAppTo}
      </Text>

      <View style={[a.pl_sm]}>
        <Text
          style={[{color: p.text_gray_medium}, a.body_1_lg_regular]}
        >{`\u2022 ${strings.discover.confirmConnectionModalPermission1}`}</Text>

        <Text
          style={[{color: p.text_gray_medium}, a.body_1_lg_regular]}
        >{`\u2022 ${strings.discover.confirmConnectionModalPermission2}`}</Text>
      </View>
    </View>
  )
}

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
