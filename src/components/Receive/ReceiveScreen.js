// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'
import _ from 'lodash'
import {withState, withHandlers} from 'recompose'

import Screen from '../../components/Screen'
import {Text, Button} from '../UiKit'
import AddressDetail from './AddressDetail'
import AddressesList from './AddressesList'
import {generateNewReceiveAddress, updateReceiveAddresses} from '../../actions'
import {receiveAddressesSelector} from '../../selectors'
import {onDidMount} from '../../utils/renderUtils'

import styles from './styles/ReceiveScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.receiveScreen.description

type Props = {
  receiveAddresses: Array<{address: string, isUsed: boolean}>,
  generateNewReceiveAddress: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
  addressLimitReached: boolean,
}

const NO_ADDRESS = {address: 'IT IS A BUG TO SEE THIS TEXT', isUsed: false}

const ReceiveScreen = ({
  receiveAddresses,
  generateNewReceiveAddress,
  translations,
  addressLimitReached,
}: Props) => {
  const currentAddress = _.last(receiveAddresses) || NO_ADDRESS
  return (
    <View style={styles.root}>
      <Screen scroll>
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>{translations.line1}</Text>
          <Text style={styles.warningText}>{translations.line2}</Text>
          <Text style={styles.warningText}>{translations.line3}</Text>
        </View>
        <AddressDetail
          address={currentAddress.address}
          isUsed={currentAddress.isUsed}
        />
        <View>
          {addressLimitReached && (
            <Text>
              l10n You have to use some of your addresses before generating new
              one
            </Text>
          )}
          <Button onPress={generateNewReceiveAddress} title="l10n GENERATE" />
        </View>
        <AddressesList addresses={receiveAddresses} />
      </Screen>
    </View>
  )
}

export default compose(
  connect(
    (state) => ({
      translations: getTranslations(state),
      receiveAddresses: receiveAddressesSelector(state),
    }),
    {
      generateNewReceiveAddress,
      updateReceiveAddresses,
    },
  ),
  withState('addressLimitReached', 'setAddressLimitReached', false),
  withHandlers({
    generateNewReceiveAddress: ({
      generateNewReceiveAddress,
      setAddressLimitReached,
    }) => () => {
      const success = generateNewReceiveAddress()
      setAddressLimitReached(!success)
    },
  }),
  // TODO(ppershing): this should be handled better
  onDidMount(({updateReceiveAddresses}) => updateReceiveAddresses()),
)(ReceiveScreen)
