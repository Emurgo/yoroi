import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import Icon from '../../../assets/img/copy.png'
import {Button, Spacer} from '../../../components'
import {useCopy} from '../../../legacy/useCopy'
import {AddressDetailCard} from '../common/AddressDetailCard/AddressDetailCard'
import {mocks as mockReceives, mocks} from '../common/mocks'
import {SkeletonAdressDetail} from '../common/SkeletonAddressDetail/SkeletonAddressDetail'
import {useNavigateTo} from '../common/useNavigateTo'
import {useStrings} from '../common/useStrings'

export const SingleAddressScreen = () => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const navigate = useNavigateTo()

  const [isCopying, copy] = useCopy()

  const currentAddress = mocks.address

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <ScrollView style={{flex: 1}}>
        <View style={styles.address}>
          {currentAddress !== null ? (
            <AddressDetailCard
              address={mockReceives.address}
              title={strings.addresscardTitle}
              addressDetails={{
                spendingHash: mockReceives.spendinghash,
                stakingHash: mockReceives.stakinghash,
              }}
            />
          ) : (
            <SkeletonAdressDetail />
          )}
        </View>
      </ScrollView>

      <Button
        outline
        title={strings.requestSpecificAmountButton}
        textStyles={{
          color: colors.buttonBackgroundBlue,
        }}
        onPress={() => navigate.specificAmount()}
        disabled={currentAddress === null}
      />

      <Spacer height={6} />

      <Button
        shelleyTheme
        onPress={() => {
          copy(currentAddress)
        }}
        disabled={currentAddress === null}
        title={strings.copyAddressButton}
        iconImage={Icon}
        isCopying={isCopying}
        copiedText={strings.addressCopiedMsg}
        style={styles.button}
      />

      <Spacer height={6} />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color.gray.min,
      padding: 16,
    },
    address: {
      flex: 1,
      alignItems: 'center',
    },
    button: {
      backgroundColor: theme.color.primary[500],
    },
  })

  const colors = {
    buttonBackgroundBlue: theme.color.primary[600],
  }

  return {styles, colors} as const
}