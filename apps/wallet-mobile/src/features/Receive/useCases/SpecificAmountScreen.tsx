import { useFocusEffect } from '@react-navigation/native'
import _ from 'lodash'
import React, { useState } from 'react'
import { Keyboard, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native'

import { Button, KeyboardAvoidingView, Spacer, StatusBar, TextInput } from '../../../components'
import { ModalScreenWrapper } from '../../../components/ModalScreenWrapper/ModalScreenWrapper'
import { useCopy } from '../../../legacy/useCopy'
import { useMetrics } from '../../../metrics/metricsManager'
import { useSelectedWallet } from '../../../SelectedWallet'
import { COLORS } from '../../../theme'
import { useHideBottomTabBar, useReceiveAddresses } from '../../../yoroi-wallets/hooks'
import { AddressDetailCard } from '../common/AddressDetailCard/AddressDetailCard'
import { mocks } from '../common/mocks'
import { SkeletonAdressDetail } from '../common/SkeletonAddressDetail/SkeletonAddressDetail'
import { useStrings } from '../common/useStrings'

export const SpecificAmountScreen = () => {
    useHideBottomTabBar()
    const strings = useStrings()
    const wallet = useSelectedWallet()
    const receiveAddresses = useReceiveAddresses(wallet)

    const HEIGHT_SCREEN = useWindowDimensions().height
    const HEIGHT_MODAL = (HEIGHT_SCREEN / 100) * 80

    const [amount, setAmount] = useState<string>('')

    const [isModalVisible, setIsModalVisible] = useState(false)

    const [isCopying, copy] = useCopy()

    const { colors, styles } = useStyles()

    const currentAddress = _.last(receiveAddresses)

    const generateLink = () => {
        Keyboard.dismiss()
        setIsModalVisible(true)
    }

    React.useEffect(() => {
        wallet.generateNewReceiveAddressIfNeeded()
    }, [wallet])

    const { track } = useMetrics()

    useFocusEffect(
        React.useCallback(() => {
            track.receivePageViewed()
        }, [track]),
    )

    return (
        <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <KeyboardAvoidingView style={styles.root} >

                    <StatusBar type="dark" />

                    <Spacer height={24} />

                    <View style={styles.content}>

                        <View style={styles.screen}>
                            <Text style={styles.textAddressDetails}>
                                {strings.specificAmountDescription}
                            </Text>

                            <TextInput
                                label={strings.ADALabel}
                                keyboardType='numeric'
                                onChangeText={setAmount}
                            />

                            <View style={styles.textSection}>
                                <Text style={[styles.textAddressDetails, { color: colors.gray }]}>{strings.address}</Text>


                                <Text style={styles.textAddressDetails}>{currentAddress}</Text>

                            </View>

                        </View>

                        <Button
                            shelleyTheme
                            onPress={generateLink}
                            disabled={amount === '' ? true : false}
                            title={strings.generateLink}
                        />

                        <Spacer height={24} />

                    </View>


                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>

            {
                isModalVisible &&
                (
                    <ModalScreenWrapper
                        title={strings.multipleAdress}
                        height={HEIGHT_MODAL}
                        onClose={() => {
                            setIsModalVisible(false)
                        }}
                    >
                        <View style={styles.root}>
                            <ScrollView>
                                {
                                    mocks.specificAddressAmount !== null ?
                                        <AddressDetailCard
                                            address={mocks.specificAddressAmount}
                                            title={`${amount} ADA`}
                                        />
                                        :
                                        <View style={styles.root}>
                                            <SkeletonAdressDetail />
                                        </View>
                                }

                                <Spacer height={32} />

                                <Button
                                    shelleyTheme
                                    onPress={() => {
                                        copy(mocks.specificAddressAmount)
                                    }}
                                    disabled={amount === '' ? true : false}
                                    title={strings.copyLinkBtn}
                                    iconImage={require('../../../assets/img/copy.png')}
                                    isCopying={isCopying}
                                    copiedTxt={strings.copyLinkMsg}
                                />

                                <Spacer height={64} />
                            </ScrollView>
                        </View>
                    </ModalScreenWrapper>
                )
            }

        </View >
    )
}

const useStyles = () => {

    const styles = StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: COLORS.WHITE,
        },
        content: {
            paddingHorizontal: 16,
            flex: 1,
        },
        textAddressDetails: {
            fontWeight: '400',
            fontSize: 16,
            lineHeight: 24,
            fontFamily: 'Rubik'
        },
        textSection: {
            gap: 4,
            width: '100%'
        },
        screen: {
            gap: 16,
            flex: 2
        }
    })

    const colors = {
        gray: COLORS.GRAY
    }

    return { styles, colors } as const

}