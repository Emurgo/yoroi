// @flow

import React, {useState, useEffect} from 'react'
// TODO: in the future, prefer SafeAreaView from react-native-safe-area-context,
// current version however doesn't work well on iOS
import {View, SafeAreaView, FlatList} from 'react-native'
import {injectIntl, intlShape, defineMessages} from 'react-intl'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import {Text, StatusBar} from '../../UiKit'
import WalletNameForm from '../WalletNameForm'
import {
  createWalletWithBip44Account,
  handleGeneralError,
} from '../../../actions'
import {generateShelleyPlateFromKey} from '../../../crypto/shelley/plate'
import {WALLET_ROOT_ROUTES} from '../../../RoutesList'
import {CONFIG} from '../../../config/config'
import assert from '../../../utils/assert'
import WalletAddress from './WalletAddress'
import WalletAccountIcon from '../../Common/WalletAccountIcon'
import {Logger} from '../../../utils/logging'

import styles from './styles/SaveReadOnlyWalletScreen.style'

import type {ComponentType} from 'react'
import type {Navigation} from '../../../types/navigation'

const messages = defineMessages({
  defaultWalletName: {
    id: 'components.walletinit.savereadonlywalletscreen.defaultWalletName',
    defaultMessage: '!!!My read-only wallet',
  },
  checksumLabel: {
    id: 'components.walletinit.verifyrestoredwallet.checksumLabel',
    defaultMessage: '!!!Chacksum label',
  },
  walletAddressLabel: {
    id: 'components.walletinit.verifyrestoredwallet.walletAddressLabel',
    defaultMessage: '!!!Wallet Address(es):',
  },
})

const CheckSumView = ({icon, checksum}) => (
  <View style={styles.checkSumView}>
    <WalletAccountIcon iconSeed={icon} />
    <Text style={styles.checksumText}>{checksum}</Text>
  </View>
)

const SaveReadOnlyWalletScreen = ({onSubmit, navigation, route, intl}) => {
  const [plate, setPlate] = useState({
    accountPlate: {
      ImagePart: '',
      TextPart: '',
    },
    addresses: [],
  })

  const {formatMessage} = intl
  const {publicKeyHex} = route.params

  const generatePlates = async () => {
    const {addresses, accountPlate} = await generateShelleyPlateFromKey(
      publicKeyHex,
      1,
    )
    setPlate({addresses, accountPlate})
  }

  useEffect(() => {
    generatePlates()
  }, [])

  return (
    <>
      <SafeAreaView style={styles.safeAreaView}>
        <StatusBar type="dark" />
        <Text>{formatMessage(messages.checksumLabel)}</Text>
        {!!plate.accountPlate.ImagePart && (
          <CheckSumView
            icon={plate.accountPlate.ImagePart}
            checksum={plate.accountPlate.TextPart}
          />
        )}

        <View style={styles.addressesContainer}>
          <Text>{formatMessage(messages.walletAddressLabel)}</Text>
          <FlatList
            data={plate.addresses}
            keyExtractor={(item) => item}
            renderItem={({item}) => (
              <WalletAddress
                addressHash={item}
                networkId={CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID}
              />
            )}
          />
        </View>
      </SafeAreaView>

      <WalletNameForm
        onSubmit={onSubmit}
        navigation={navigation}
        defaultWalletName={intl.formatMessage(messages.defaultWalletName)}
      />
    </>
  )
}

type ExternalProps = {|
  intl: intlShape,
  navigation: Navigation,
  route: Object, // TODO(navigation): type
|}

export default injectIntl(
  (compose(
    connect(
      (_state) => ({}),
      {
        createWalletWithBip44Account,
      },
    ),
    withHandlers({
      onSubmit: ({
        createWalletWithBip44Account,
        navigation,
        intl,
        route,
      }) => async ({name}) => {
        try {
          const {publicKeyHex} = route.params
          assert.assert(
            publicKeyHex != null,
            'SaveReadOnlyWalletScreen::onPress publicKeyHex',
          )
          await createWalletWithBip44Account(
            name,
            publicKeyHex,
            CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
            CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
            null,
            true, // important: read-only flag
          )
          navigation.navigate(WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES)
        } catch (e) {
          Logger.error('SaveReadOnlyWalletScreen::onSubmit', e)
          await handleGeneralError(e.message, e, intl)
        }
      },
    }),
  )(SaveReadOnlyWalletScreen): ComponentType<ExternalProps>),
)
