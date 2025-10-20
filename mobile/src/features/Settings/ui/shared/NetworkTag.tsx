import {networkConfigs} from '@yoroi/blockchains'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'

import * as React from 'react'
import {
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native'

import {availableNetworks} from '~/features/WalletManager/common/constants'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

type Props = React.PropsWithChildren<{
  directChangeActive?: boolean
  style?: ViewStyle
  disabled?: boolean
  textStyle?: TextStyle
}>

export const NetworkTag = ({
  children,
  directChangeActive,
  style,
  disabled,
  textStyle,
}: Props) => {
  const {
    selected: {network: selectedNetwork},
    walletManager,
  } = useWalletManager()
  const {navigateToChangeNetwork} = useWalletNavigation()
  const {atoms: ta} = useTheme()
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const {track} = useMetrics()
  const width = useWindowDimensions().width - 120

  const Tag = selectedNetwork === Chain.Network.Preprod ? PreprodTag : null

  const onPress = () => {
    if (directChangeActive && selectedNetwork !== Chain.Network.Mainnet) {
      const nextNetwork =
        availableNetworks[
          (availableNetworks.indexOf(selectedNetwork) + 1) %
            availableNetworks.length
        ]

      if (nextNetwork === Chain.Network.Mainnet) {
        const onConfirm = () => {
          track.networkSelected({
            to_network: nextNetwork,
            from_network: selectedNetwork,
          })
          walletManager.setSelectedNetwork(nextNetwork)
          closeModal()
        }
        openModal({
          title: strings.settings.changeNetwork.networkTagModalTitle,
          content: (
            <Modal.Content>
              <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
                {strings.settings.changeNetwork.networkTagModalText}
              </Text>
            </Modal.Content>
          ),
          footer: (
            <Modal.Footer style={[a.flex_row, a.justify_end, a.gap_lg]}>
              <Button
                size="S"
                type={ButtonType.Secondary}
                title={strings.global.cancel}
                onPress={closeModal}
                style={[a.flex_1]}
              />

              <Button
                size="S"
                title={strings.global.switch}
                onPress={onConfirm}
                style={[a.flex_1]}
              />
            </Modal.Footer>
          ),
          height: 280,
        })

        return
      }

      track.networkSelected({
        to_network: nextNetwork!,
        from_network: selectedNetwork,
      })
      walletManager.setSelectedNetwork(nextNetwork!)
      return
    }

    if (!directChangeActive) navigateToChangeNetwork()
  }

  return (
    <View
      style={[
        {
          width,
        },
        a.flex_row,
        a.align_center,
        a.justify_center,
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        accessibilityRole="header"
        aria-level="1"
        ellipsizeMode="tail"
        style={[
          ta.text_gray_medium,
          a.body_1_lg_medium,
          a.flex_shrink,
          textStyle,
        ]}
      >
        {children}
      </Text>

      {Tag && (
        <View style={[a.pl_sm, {flexShrink: 0}]}>
          <Tag
            onPress={onPress}
            disabled={
              ((directChangeActive &&
                selectedNetwork === Chain.Network.Mainnet) ||
                disabled) ??
              false
            }
          />
        </View>
      )}
    </View>
  )
}

const PreprodTag = ({
  onPress,
  disabled,
}: {
  onPress: () => void
  disabled?: boolean
}) => {
  const {palette: p} = useTheme()

  const {name} = networkConfigs[Chain.Network.Preprod]

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {backgroundColor: p.sys_yellow_500},
        a.rounded_full,
        a.px_sm,
        a.py_xs,
      ]}
      disabled={disabled}
    >
      <Text>{name}</Text>
    </TouchableOpacity>
  )
}
