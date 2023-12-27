import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer, useModal} from '../../../../../../components'
import {useTheme} from '../../../../../../theme'
import {Theme} from '../../../../../../theme/types'
import {useStrings} from '../../../../common/strings'

export interface Props {
  onContinue: () => void
}

export const WarnPriceImpact = ({onContinue}: Props) => {
  const strings = useStrings()
  const {closeModal} = useModal()

  const {theme} = useTheme()
  const styles = React.useMemo(() => getStyles({theme: theme}), [theme])

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.description}>
          <Text style={styles.bold}>{strings.priceImpactRiskHigh}</Text>

          <Text> {strings.priceimpactDescription}</Text>
        </Text>
      </View>

      <Spacer fill />

      <View style={styles.buttonsWrapper}>
        <Button outlineShelley title={strings.cancel} onPress={closeModal} containerStyle={styles.buttonContainer} />

        <Button
          title={strings.continue}
          onPress={onContinue}
          style={styles.buttonContinue}
          containerStyle={styles.buttonContainer}
        />
      </View>

      <Spacer height={23} />
    </View>
  )
}

const getStyles = (props: {theme: Theme}) => {
  const {theme} = props
  const styles = StyleSheet.create({
    buttonContainer: {
      flex: 1,
    },
    buttonContinue: {
      flex: 1,
      backgroundColor: theme.color.magenta[500],
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
    bold: {
      fontWeight: '500',
    },
  })
  return styles
}
