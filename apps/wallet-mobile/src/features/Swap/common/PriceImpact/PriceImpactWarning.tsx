import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer, useModal} from '../../../../components'
import {useStrings} from '../strings'

export interface Props {
  onSubmit: () => void
  isLoading: boolean
}

export const PriceImpactWraning = ({onSubmit, isLoading}: Props) => {
  const strings = useStrings()
  const {closeModal} = useModal()

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.description}>{strings.priceimpactDescription}</Text>
      </View>

      <Spacer fill />

      <View style={styles.buttonsWrapper}>
        <Button outlineShelley title={strings.cancel} onPress={closeModal} containerStyle={styles.buttonContainer} />

        <Button
          title={strings.continue}
          onPress={onSubmit}
          style={styles.buttonContinue}
          containerStyle={styles.buttonContainer}
          disabled={isLoading}
        />
      </View>

      <Spacer height={23} />
    </View>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
  },
  buttonContinue: {
    flex: 1,
    backgroundColor: '#FF1351',
  },
  buttonsWrapper: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  description: {
    fontFamily: 'Rubik',
    fontSize: 16,
  },
})
