import {derivationConfig} from '@yoroi/blockchains'
import {useAsyncStorage} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Api} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {FlatList, InteractionManager, ScrollView, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {parseWalletMeta} from '~/features/WalletManager/common/validators/wallet-meta'
import {useCreateWalletXPub} from '~/features/WalletManager/hooks/useCreateWalletXPub'
import {usePlate} from '~/features/WalletManager/hooks/usePlate'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Boundary} from '~/ui/Boundary/Boundary'
import {Icon} from '~/ui/Icon'
import {Line} from '~/ui/Line/Line'
import {Text} from '~/ui/Text/Text'
import {throwLoggedError} from '~/kernel/logger/helpers/throw-logged-error'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {isEmptyString} from '~/wallets/utils/string'

import {WalletAddress} from '../WalletAddress/WalletAddress'
import {WalletNameForm} from '../WalletNameForm/WalletNameForm'

export const SaveReadOnlyWalletScreen = () => {
  const storage = useAsyncStorage()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const strings = useStrings()
  const {track} = useMetrics()
  const {atoms: ta} = useTheme()
  const {
    publicKeyHex,
    path,
    walletImplementation,
    accountVisual,
    walletIdChanged,
  } = useSetupWallet()

  const normalizedPath = path.map((i) => {
    if (i >= derivationConfig.hardStart) return i - derivationConfig.hardStart
    return i
  })

  const {createWallet} = useCreateWalletXPub({
    onSuccess: async (wallet) => {
      walletIdChanged(wallet.id)
      const walletStorage = storage.join('wallet/')
      const walletMeta = await walletStorage.getItem(wallet.id, parseWalletMeta)

      if (!walletMeta) {
        throwLoggedError(
          new Error(
            'SaveReadOnlyWalletScreen: wallet meta is invalid, reached an invalid state.',
          ),
        )
      }

      track.restoreWalletDetailsSettled()

      navigation.navigate('setup-wallet-preparing-wallet')
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof Api.Errors.Network
          ? showErrorDialog(errorMessages.networkError)
          : showErrorDialog(errorMessages.generalError, undefined, {
              message: error.message,
            })
      })
    },
  })

  const onSubmit = React.useCallback(
    ({name}: {name: string}) => {
      createWallet({
        name,
        accountVisual,
        implementation: walletImplementation,
        bip44AccountPublic: publicKeyHex,
        addressMode: 'single',
        hwDeviceInfo: null,
        readOnly: true,
      })
    },
    [createWallet, publicKeyHex, walletImplementation, accountVisual],
  )

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, a.px_md, ta.bg_color_max]}
    >
      <Boundary loading={{size: 'full'}}>
        <WalletNameForm
          onSubmit={onSubmit}
          defaultWalletName={strings.setupWallet.defaultWalletName}
          bottomContent={
            <WalletInfoView
              normalizedPath={normalizedPath}
              publicKeyHex={publicKeyHex}
            />
          }
        />
      </Boundary>
    </SafeAreaView>
  )
}

const CheckSumView = ({icon, checksum}: {icon: string; checksum: string}) => {
  const {palette: p} = useTheme()

  return (
    <View
      style={[
        a.flex_row,
        a.align_center,
        a.pt_sm,
        a.flex_wrap,
        {borderColor: p.sys_magenta_500},
      ]}
    >
      <Icon.WalletAvatar image={new Blockies({seed: icon}).asBase64()} />

      <Text style={[a.font_bold, a.pl_sm, a.heading_4_regular]}>
        {checksum}
      </Text>
    </View>
  )
}

type WalletInfoProps = {
  normalizedPath: Array<number>
  publicKeyHex: string
}

const WalletInfoView = ({normalizedPath, publicKeyHex}: WalletInfoProps) => {
  const strings = useStrings()
  const {walletImplementation} = useSetupWallet()
  const {
    networkManager: {chainId},
  } = useSelectedNetwork()
  const plate = usePlate({
    chainId,
    publicKeyHex,
    implementation: walletImplementation,
  })

  return (
    <View style={[a.pt_xl]}>
      <ScrollView style={[a.pr_sm]}>
        <View style={[a.pb_xl]}>
          <Text>{strings.setupWallet.checksumLabel}</Text>

          {!isEmptyString(plate.accountPlate.ImagePart) && (
            <CheckSumView
              icon={plate.accountPlate.ImagePart}
              checksum={plate.accountPlate.TextPart}
            />
          )}
        </View>

        <View style={[a.pb_xl]}>
          <Text>{strings.setupWallet.walletAddressLabel}</Text>

          <FlatList
            data={plate.addresses}
            keyExtractor={(item) => item}
            renderItem={({item}) => <WalletAddress addressHash={item} />}
          />
        </View>

        <Line />

        <View style={[a.pt_xl]}>
          <Text style={[a.pb_sm]}>{strings.setupWallet.key}</Text>

          <View style={[a.p_xs, a.pb_sm]}>
            <Text secondary monospace numberOfLines={1} ellipsizeMode="middle">
              {publicKeyHex}
            </Text>
          </View>

          <Text style={[a.pb_sm]}>{strings.setupWallet.derivationPath}</Text>

          <Text secondary monospace>
            {`m/${normalizedPath[0]}'/${normalizedPath[1]}'/${normalizedPath[2]}`}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
