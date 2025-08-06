import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, Text, View} from 'react-native'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation/hooks'
import {Hr} from '~/ui/Hr/Hr'
import {Space} from '~/ui/Space/Space'

export const WalletSettingsScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {wallet, meta} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const {resetToWalletSelection} = useWalletNavigation()
  const {track} = useMetrics()

  // const onToggleEasyConfirmation = () => {
  //   // TODO: implement
  //   track.walletSettingsEasyConfirmationToggled()
  // }

  // const onSwitchWallet = () => {
  //   resetToWalletSelection()
  // }

  // const onLogout = () => {
  //   Alert.alert(
  //     strings.settings.walletSettings.logout,
  //     strings.settings.walletSettings.logout,
  //     [
  //       {
  //         text: strings.settings.walletSettings.logout,
  //         onPress: () => {
  //           walletManager.logout(wallet.id)
  //           resetToWalletSelection()
  //         },
  //       },
  //       {
  //         text: strings.settings.walletSettings.cancel,
  //         style: 'cancel',
  //       },
  //     ],
  //   )
  // }

  return (
    <ScrollView style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <View style={[a.p_lg, a.gap_lg]}>
        <View style={[a.gap_md]}>
          <Text style={[a.heading_3_medium]}>
            {strings.settings.walletSettings.general}
          </Text>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>
              {strings.settings.walletSettings.walletName}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {meta.name}
            </Text>
          </View>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>
              {strings.settings.walletSettings.network}
            </Text>
            {/* <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>{meta.networkId}</Text> */}
          </View>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>
              {strings.settings.walletSettings.walletType}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {/* {getWalletType(meta.implementation)} */}
            </Text>
          </View>
        </View>

        <Hr />

        <View style={[a.gap_md]}>
          <Text style={[a.heading_3_medium]}>
            {strings.settings.walletSettings.security}
          </Text>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>
              {strings.settings.walletSettings.changePassword}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.walletSettings.changePassword}
            </Text>
          </View>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>
              {strings.settings.walletSettings.easyConfirmation}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.walletSettings.easyConfirmationInfo}
            </Text>
          </View>
        </View>

        <Hr />

        <View style={[a.gap_md]}>
          <Text style={[a.heading_3_medium]}>
            {strings.settings.walletSettings.actions}
          </Text>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>
              {strings.settings.walletSettings.switchWallet}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.walletSettings.switchWallet}
            </Text>
          </View>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>
              {strings.settings.walletSettings.removeWallet}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.walletSettings.removeWallet}
            </Text>
          </View>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>
              {strings.settings.walletSettings.about}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.walletSettings.about}
            </Text>
          </View>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>
              {strings.settings.walletSettings.resync}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.walletSettings.resync}
            </Text>
          </View>
        </View>

        <Hr />

        <View style={[a.gap_md]}>
          <Text style={[a.heading_3_medium]}>
            {strings.settings.walletSettings.notifications}
          </Text>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>
              {strings.settings.walletSettings.inAppNotifications}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.walletSettings.allowNotifications}
            </Text>
          </View>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>
              {strings.settings.walletSettings.displayDuration}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.walletSettings.displayDuration}
            </Text>
          </View>
        </View>

        <Hr />

        <View style={[a.gap_md]}>
          <Text style={[a.heading_3_medium]}>
            {strings.settings.walletSettings.collateral}
          </Text>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>
              {strings.settings.walletSettings.multipleAddresses}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.walletSettings.multipleAddressesInfo}
            </Text>
          </View>

          <View style={[a.gap_sm]}>
            <Text style={[a.body_1_lg_regular]}>
              {strings.settings.walletSettings.singleAddress}
            </Text>
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              {strings.settings.walletSettings.singleAddress}
            </Text>
          </View>
        </View>

        <Space.Height.lg />

        {/* <Button title={strings.settings.walletSettings.logout} onPress={onLogout} /> */}
      </View>
    </ScrollView>
  )
}

// const getWalletType = (
//   implementation: Wallet.Implementation,
// ): string => {
//   switch (implementation) {
//     case 'byron':
//       return strings.settings.walletSettings.byronWallet
//     case 'shelley':
//       return strings.settings.walletSettings.shelleyWallet
//     default:
//       return strings.settings.walletSettings.unknownWalletType
//   }
// }

// const ResyncButton = () => {
//   const strings = useStrings()
//   const {track} = useMetrics()

//   const onResync = async () => {
//     // TODO: implement resync
//     track.walletSettingsResyncClicked()
//   }

//   return (
//     <Button
//       title={strings.settings.walletSettings.resync}
//       onPress={onResync}
//     />
//   )
// }

// const AddressModeSwitcher = (props: {isSingle: boolean}) => {
//   const strings = useStrings()

//   const handleOnSwitchAddressMode = () => {
//     // TODO: implement address mode switching
//   }

//   return (
//     <View style={[a.flex_row, a.gap_sm]}>
//       <Text style={[a.body_1_lg_regular]}>
//         {props.isSingle ? strings.settings.walletSettings.singleAddress : strings.settings.walletSettings.multipleAddresses}
//       </Text>
//       <Button
//         title={strings.settings.walletSettings.switchWallet}
//         onPress={handleOnSwitchAddressMode}
//       />
//     </View>
//   )
// }

// const useLogout = () => {
//   const strings = useStrings()
//   const {walletManager} = useWalletManager()
//   const {resetToWalletSelection} = useWalletNavigation()

//   const logout = () => {
//     Alert.alert(
//       strings.settings.walletSettings.logout,
//       strings.settings.walletSettings.logout,
//       [
//         {
//           text: strings.settings.walletSettings.logout,
//           onPress: () => {
//             // TODO: implement logout
//             resetToWalletSelection()
//           },
//         },
//         {
//           text: strings.settings.walletSettings.cancel,
//           style: 'cancel',
//         },
//       ],
//     )
//   }

//   return {logout}
// }
