import {useNavigation} from '@react-navigation/native'
import {cardanoConfig, derivationConfig} from '@yoroi/blockchains'
import {useAsyncStorage} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {Api, Wallet} from '@yoroi/types'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {FlatList, InteractionManager, ScrollView, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {walletChecksum} from '@emurgo/cip4-js'
import {useSuspenseQuery} from '@tanstack/react-query'
import {parseWalletMeta} from '~/features/WalletManager/common/validators/wallet-meta'
import {useCreateWalletXPub} from '~/features/WalletManager/hooks/useCreateWalletXPub'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/global-messages'
import {logger} from '~/kernel/logger/logger'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Boundary} from '~/ui/Boundary/Boundary'
import {Icon} from '~/ui/Icon'
import {Line} from '~/ui/Line/Line'
import {Text} from '~/ui/Text/Text'
import {deriveAddressFromXPub} from '~/wallets/cardano/account-manager/derive-address-from-xpub'
import {isEmptyString} from '~/wallets/utils/string'
import {WalletAddress} from '../WalletAddress/WalletAddress'
import {WalletNameForm} from '../WalletNameForm/WalletNameForm'

// when ro, later will be part of the onboarding
const addressMode: Wallet.AddressMode = 'single'
export const SaveReadOnlyWalletScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const storage = useAsyncStorage()
  const navigation = useNavigation<any>()
  const {track} = useMetrics()

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

  const {createWallet, isPending} = useCreateWalletXPub({
    onSuccess: async (wallet) => {
      walletIdChanged(wallet.id)
      const walletStorage = storage.join('wallet/')
      const walletMeta = await walletStorage.getItem(wallet.id, parseWalletMeta)

      if (!walletMeta) {
        const error = new Error(
          'WalletDetailsScreen: wallet meta is invalid, reached an invalid state.',
        )
        logger.error(error)
        throw error
      }

      track.restoreWalletDetailsSettled()

      navigation.navigate('setup-wallet-preparing-wallet')
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof Api.Errors.Network
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {
              message: error.message,
            })
      })
    },
  })

  const onSubmit = React.useCallback(
    ({name}: {name: string}) => {
      createWallet({
        name,
        implementation: walletImplementation,
        bip44AccountPublic: publicKeyHex,
        readOnly: true,
        addressMode,
        hwDeviceInfo: null,
        accountVisual,
      })
    },
    [createWallet, publicKeyHex, walletImplementation, accountVisual],
  )

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[{flex: 1, paddingHorizontal: 16}]}
      testID="saveReadOnlyWalletContainer"
    >
      <WalletNameForm
        onSubmit={onSubmit}
        defaultWalletName={strings.defaultWalletName}
        // containerStyle={[{paddingTop: 0, paddingHorizontal: 0}]}
        bottomContent={
          <Boundary>
            <WalletInfoView
              normalizedPath={normalizedPath}
              publicKeyHex={publicKeyHex}
            />
          </Boundary>
        }
        isWaiting={isPending}
      />
    </SafeAreaView>
  )
}

const SECTION_MARGIN = 22
const LABEL_MARGIN = 6

const messages = defineMessages({
  defaultWalletName: {
    id: 'components.walletinit.savereadonlywalletscreen.defaultWalletName',
    defaultMessage: '!!!My read-only wallet',
  },
  checksumLabel: {
    id: 'components.walletinit.verifyrestoredwallet.checksumLabel',
    defaultMessage: '!!!Checksum label',
  },
  walletAddressLabel: {
    id: 'components.walletinit.verifyrestoredwallet.walletAddressLabel',
    defaultMessage: '!!!Wallet Address(es):',
  },
  key: {
    id: 'components.walletinit.savereadonlywalletscreen.key',
    defaultMessage: '!!!Key:',
  },
  derivationPath: {
    id: 'components.walletinit.savereadonlywalletscreen.derivationPath',
    defaultMessage: '!!!Derivation path:',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    defaultWalletName: intl.formatMessage(messages.defaultWalletName),
    checksumLabel: intl.formatMessage(messages.checksumLabel),
    walletAddressLabel: intl.formatMessage(messages.walletAddressLabel),
    key: intl.formatMessage(messages.key),
    derivationPath: intl.formatMessage(messages.derivationPath),
  }
}

const CheckSumView = ({icon, checksum}: {icon: string; checksum: string}) => (
  <View
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        borderColor: 'red',
        flexWrap: 'wrap',
      },
    ]}
  >
    <Icon.WalletAvatar image={new Blockies({seed: icon}).asBase64()} />

    <Text style={[{fontSize: 18, fontWeight: 'bold', paddingLeft: 12}]}>
      {checksum}
    </Text>
  </View>
)

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
    <View style={[{marginTop: SECTION_MARGIN}]}>
      <ScrollView style={[{paddingRight: 10}]}>
        <View style={[{marginBottom: SECTION_MARGIN}]}>
          <Text>{strings.checksumLabel}</Text>

          {!isEmptyString(plate.accountPlate.ImagePart) && (
            <CheckSumView
              icon={plate.accountPlate.ImagePart}
              checksum={plate.accountPlate.TextPart}
            />
          )}
        </View>

        <View style={[{marginBottom: SECTION_MARGIN}]}>
          <Text>{strings.walletAddressLabel}</Text>

          <FlatList
            data={plate.addresses}
            keyExtractor={(item) => item}
            renderItem={({item}) => <WalletAddress addressHash={item} />}
          />
        </View>

        <Line />

        <View style={[{marginTop: SECTION_MARGIN}]}>
          <Text style={[{marginBottom: LABEL_MARGIN}]}>{strings.key}</Text>

          <View style={[{padding: 4, marginBottom: 10}]}>
            <Text secondary monospace numberOfLines={1} ellipsizeMode="middle">
              {publicKeyHex}
            </Text>
          </View>

          <Text style={[{marginBottom: LABEL_MARGIN}]}>
            {strings.derivationPath}
          </Text>

          <Text secondary monospace>
            {`m/${normalizedPath[0]}'/${normalizedPath[1]}'/${normalizedPath[2]}`}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

// TODO: use the hook usePlate from hooks when is ready
export const usePlate = ({
  chainId,
  publicKeyHex,
  implementation,
}: {
  chainId: number
  publicKeyHex: string
  implementation: Wallet.Implementation
}) => {
  const implCfg = cardanoConfig.implementations[implementation]

  const {data} = useSuspenseQuery({
    queryKey: ['plate', chainId, publicKeyHex],
    queryFn: async () => {
      const addresses = await deriveAddressFromXPub({
        accountPubKeyHex: publicKeyHex,
        chainId,
        count: 1,
        implementation,
        role: implCfg.derivations.base.roles.external,
      })
      return {
        addresses,
        accountPlate: walletChecksum(publicKeyHex),
      }
    },
  })

  return data
}
