import _ from 'lodash'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {generateNewReceiveAddress, generateNewReceiveAddressIfNeeded} from '../../legacy/actions'
import {Banner, Button, Modal, OfflineBanner, Spacer, StatusBar} from '../../legacy/components/UiKit'
import {UI_V2} from '../../legacy/config/config'
import {
  canGenerateNewReceiveAddressSelector,
  isUsedAddressIndexSelector,
  receiveAddressesSelector,
} from '../../legacy/selectors'
import {COLORS} from '../../legacy/styles/config'
import {Icon} from '../components'
import {AddressDetail} from './AddressDetail'
import {UnusedAddresses, UsedAddresses} from './Addresses'
import {useReceiveContextInfoModal} from './Context'

export const ReceiveScreen = () => {
  const strings = useStrings()
  const receiveAddresses = useSelector(receiveAddressesSelector)
  const addressLimitReached = !useSelector(canGenerateNewReceiveAddressSelector)

  const currentAddress = _.last(receiveAddresses)

  const dispatch = useDispatch()
  React.useEffect(() => {
    dispatch(generateNewReceiveAddressIfNeeded())
  }, [dispatch])

  // This is here just so that we can properly monitor changes and fire
  // generateNewReceiveAddressIfNeeded()
  const isUsedAddressIndex = useSelector(isUsedAddressIndexSelector)
  React.useEffect(() => {
    dispatch(generateNewReceiveAddressIfNeeded())
  }, [dispatch, isUsedAddressIndex])

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeAreaView}>
      <StatusBar type={UI_V2 ? 'light' : 'dark'} />
      <OfflineBanner />

      <ScrollView>
        {!UI_V2 ? <Banner text={strings.infoText} /> : <InfoModal />}
        {UI_V2 && <Spacer height={24} />}

        <Content>
          <View style={styles.address}>
            {currentAddress ? (
              <AddressDetail address={currentAddress} />
            ) : (
              <ActivityIndicator size={'large'} color={'black'} />
            )}
          </View>

          <Spacer height={24} />

          <Button
            outlineOnLight
            onPress={() => dispatch(generateNewReceiveAddress())}
            disabled={addressLimitReached}
            title={!addressLimitReached ? strings.generateButton : strings.cannotGenerate}
          />

          <Spacer height={24} />

          <UnusedAddresses />
          <Spacer height={24} />
          <UsedAddresses />
        </Content>
      </ScrollView>
    </SafeAreaView>
  )
}

const InfoModal = () => {
  const strings = useStrings()
  const {isInfoModalOpen, hideInfoModal} = useReceiveContextInfoModal()

  return (
    <Modal visible={isInfoModalOpen} showCloseIcon onRequestClose={hideInfoModal} title={strings.infoTitle}>
      <Spacer height={16} />

      <Icon.Info size={45} color={COLORS.ACTION_GRAY} style={styles.infoIcon} />

      <Spacer height={32} />
      <Text style={styles.infoText}>{strings.infoText}</Text>
    </Modal>
  )
}

const Content = (props) => <View {...props} style={styles.content} />

const messages = defineMessages({
  infoTitle: {
    id: 'global.info',
    defaultMessage: '!!!Info',
  },
  infoText: {
    id: 'components.receive.receivescreen.infoText',
    defaultMessage:
      '!!!Share this address to receive payments. ' +
      'To protect your privacy, new addresses are ' +
      'generated automatically once you use them.',
  },
  generateButton: {
    id: 'components.receive.receivescreen.generateButton',
    defaultMessage: '!!!Generate another address',
  },
  cannotGenerate: {
    id: 'components.receive.receivescreen.cannotGenerate',
    defaultMessage: '!!!You have to use some of your addresses',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    infoTitle: intl.formatMessage(messages.infoTitle),
    infoText: intl.formatMessage(messages.infoText),
    generateButton: intl.formatMessage(messages.generateButton),
    cannotGenerate: intl.formatMessage(messages.cannotGenerate),
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    paddingHorizontal: 16,
  },
  address: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  infoText: {
    lineHeight: 24,
    fontSize: 16,
  },
  infoIcon: {
    alignSelf: 'center',
    padding: 2,
  },
})
