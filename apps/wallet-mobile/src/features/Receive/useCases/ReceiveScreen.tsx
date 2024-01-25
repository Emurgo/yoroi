import { useFocusEffect } from '@react-navigation/native'
import _ from 'lodash'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { Button, Spacer, StatusBar } from '../../../components'
import { useCopy } from '../../../legacy/useCopy'
import { useMetrics } from '../../../metrics/metricsManager'
import { useSelectedWallet } from '../../../SelectedWallet'
import { COLORS, colors } from '../../../theme'
import { useHideBottomTabBar, useReceiveAddresses } from '../../../yoroi-wallets/hooks'
import { AddressDetailCard } from '../common/AddressDetailCard/AddressDetailCard'
import { mocks as mockReceives } from '../common/mocks'
import { SkeletonAdressDetail } from '../common/SkeletonAddressDetail/SkeletonAddressDetail'
import { useNavigateTo } from '../common/useNavigateTo'
import { useStrings } from '../common/useStrings'


export const ReceiveScreen = () => {
    useHideBottomTabBar()
    const strings = useStrings()
    const wallet = useSelectedWallet()
    const receiveAddresses = useReceiveAddresses(wallet)
    const navigate = useNavigateTo()

    const [isCopying, copy] = useCopy()
    

    const currentAddress = _.last(receiveAddresses)

    React.useEffect(() => {
        wallet.generateNewReceiveAddressIfNeeded()
    }, [wallet])

    const { track } = useMetrics()

    useFocusEffect(
        React.useCallback(() => {
            track.receivePageViewed()
        }, [track]),
    )

    const onRequestSpecificAmount = () => {
        navigate.specificAmount()
    }

    return (
        <View style={styles.root}>
            <StatusBar type="dark" />

            <Content>
                <ScrollView style={{ flex: 1 }}>
                    <View style={styles.address}>
                        {currentAddress !== null ? (
                            <AddressDetailCard
                                address={currentAddress}
                                title={strings.addresscardTitle}
                                addressDetails={{
                                    address: currentAddress!,
                                    spendingHash: mockReceives.spendinghash,
                                    stakingHash: mockReceives.stakinghash
                                }}
                            />
                        ) : (
                            <SkeletonAdressDetail />
                        )}
                    </View>

                    <Spacer height={100} />

                    <Button
                        outline
                        title={strings.requestSpecificAmountButton}
                        textStyles={{
                            color: colors.buttonBackgroundBlue
                        }}
                        onPress={onRequestSpecificAmount}
                        disabled={currentAddress === null}
                    />
                </ScrollView>

                <Spacer height={6} />

                <Button
                    shelleyTheme
                    onPress={() => {
                        copy(currentAddress!)
                    }}
                    disabled={currentAddress === null}
                    testID="copyReceiveAddressButton"
                    title={strings.copyAddressButton}
                    iconImage={require('../../../assets/img/copy.png')}
                    isCopying={isCopying}
                    copiedTxt={strings.addressCopiedMsg}
                />

                <Spacer height={6} />

            </Content>
        </View>
    )
}

const Content = (props) => <View {...props} style={styles.content} />

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    content: {
        padding: 16,
        flex: 1
    },
    address: {
        alignItems: 'center',
        minHeight: 180,
        maxHeight: 458,
    },
})
