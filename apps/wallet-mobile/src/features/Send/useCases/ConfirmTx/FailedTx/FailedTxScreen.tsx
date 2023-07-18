import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {useBlockGoBack} from '../../../../../navigation'
import {COLORS} from '../../../../../theme'
import {useStrings} from '../../../common/strings'
import {FailedTxImage} from './FailedTxImage'

export const FailedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()

  const resetAndGoToStart = useResetAndGoToStartTx()

  return (
    <View style={styles.container}>
      <FailedTxImage />

      <Text style={styles.title}>{strings.failedTxTitle}</Text>

      <Text style={styles.text}>{strings.failedTxText}</Text>

      <Spacer height={22} />

      <Button onPress={resetAndGoToStart} title={strings.failedTxButton} style={styles.button} shelleyTheme />
    </View>
  )
}

const useResetAndGoToStartTx = () => {
  const navigation = useNavigation()
  const resetAndGoToStart = () =>
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'app-root',
          state: {
            routes: [
              {name: 'wallet-selection'},
              {
                name: 'main-wallet-routes',
                state: {
                  routes: [
                    {
                      name: 'history',
                      state: {
                        routes: [{name: 'send-start-tx'}],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    })

  return resetAndGoToStart
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    color: COLORS.BLACK,
    fontWeight: 'bold',
    fontSize: 20,
    padding: 4,
    textAlign: 'center',
    lineHeight: 30,
  },
  text: {
    color: COLORS.TEXT_INPUT,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 330,
  },
  button: {
    paddingHorizontal: 20,
  },
})
