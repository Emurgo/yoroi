import React, {useEffect} from 'react'
import {StyleSheet, TextInput as RNTextInput, TouchableOpacity, View, ViewProps} from 'react-native'

import {Button, Icon, Spacer, Text, TextInput} from '../../../../components'
import {AmountItem} from '../../../../components/AmountItem/AmountItem'
import {BottomSheetModal} from '../../../../components/BottomSheet'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useStrings} from '../../common/strings'

export const ConfirmationOrderScreen = () => {
  const spendingPasswordRef = React.useRef<RNTextInput>(null)
  const [bottomSheetState, setBottomSheetSate] = React.useState<{
    isOpen: boolean
    title: string
    content?: string | React.ReactNode
  }>({
    isOpen: false,
    title: '',
    content: '',
  })

  const [spendingPassword, setSpendingPassword] = React.useState('')
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const orderInfo = [
    {
      label: 'Min ADA',
      value: '2 ADA', // TODO add real value
      info: strings.swapMinAda,
    },
    {
      label: 'Min Received',
      value: '2.99 USDA', // TODO add real value
      info: strings.swapMinReceived,
    },
    {
      label: 'Fees',
      value: '2 ADA', // TODO add real value
      info: strings.swapFees,
    },
  ]

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.card}>
          <Text style={styles.cardText}>Total</Text>

          <View>
            <Text style={[styles.cardText, styles.cardTextValue]}>11 ADA</Text>

            <Spacer height={6} />

            <Text style={styles.cardTextUSD}>3.75 USD</Text>
          </View>
        </View>

        <Spacer height={24} />

        {orderInfo.map((item, index) => {
          return (
            <View key={item.label}>
              <Spacer height={8} />

              <View key={index} style={styles.flexBetween}>
                <View style={styles.flex}>
                  <Text style={[styles.text, styles.gray]}>{item.label}</Text>

                  <Spacer width={8} />

                  <TouchableOpacity
                    onPress={() => {
                      setBottomSheetSate({
                        isOpen: true,
                        title: item.label,
                        content: item?.info,
                      })
                    }}
                  >
                    <Icon.Info size={24} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.text}>{item.value}</Text>
              </View>
            </View>
          )
        })}

        <Spacer height={24} />

        <Text style={styles.amountItemLabel}>{strings.swapFrom}</Text>

        <AmountItem wallet={wallet} amount={{tokenId: '', quantity: '222'}} />

        <Spacer height={16} />

        <Text style={styles.amountItemLabel}>{strings.swapTo}</Text>

        <AmountItem wallet={wallet} amount={{tokenId: '', quantity: '222'}} />
      </View>

      <Actions>
        <Button
          testID="swapButton"
          shelleyTheme
          title={strings.confirm}
          onPress={() => {
            setBottomSheetSate({
              isOpen: true,
              title: strings.signTransaction,
              content: (
                <View style={styles.modalContent}>
                  <View>
                    <Text style={styles.modalText}>{strings.enterSpendingPassword}</Text>

                    <TextInput
                      secureTextEntry
                      ref={spendingPasswordRef}
                      enablesReturnKeyAutomatically
                      label={strings.spendingPassword}
                      value={spendingPassword}
                      onChangeText={setSpendingPassword}
                      autoComplete="off"
                    />
                  </View>

                  <Button testID="swapButton" shelleyTheme title={strings.sign} />
                </View>
              ),
            })
          }}
        />
      </Actions>

      <BottomSheetModal
        isOpen={bottomSheetState.isOpen}
        title={bottomSheetState.title}
        content={<Text style={styles.text}>{bottomSheetState.content}</Text>}
        onClose={() => {
          setBottomSheetSate({isOpen: false, title: '', content: ''})
        }}
      />
    </View>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'space-between',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: COLORS.SHELLEY_BLUE,
    padding: 16,
    borderRadius: 8,
  },
  cardText: {
    fontSize: 18,
    color: COLORS.WHITE,
  },
  cardTextValue: {
    fontWeight: '500',
  },
  cardTextUSD: {
    fontSize: 14,
    color: COLORS.WHITE,
    opacity: 0.5,
  },
  flexBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
  gray: {
    color: COLORS.GRAY,
  },
  amountItemLabel: {
    fontSize: 12,
    color: '#242838',
    paddingBottom: 8,
  },
  actions: {
    paddingVertical: 16,
  },
  modalContent: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 300,
  },
  modalText: {
    paddingHorizontal: 70,
    textAlign: 'center',
    paddingBottom: 8,
  },
})
