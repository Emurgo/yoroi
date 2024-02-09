import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'

import {ModalScreenWrapper} from '../../../../src/components/ModalScreenWrapper/ModalScreenWrapper'
import {Button, Spacer, StatusBar} from '../../../components'
import {useHideBottomTabBar} from '../../../yoroi-wallets/hooks'
import {InfoCard} from '../common/InfoCard/InfoCard'
import {mocks} from '../common/mocks'
import {SmallAddressCard} from '../common/SmallAddressCard/SmallAddressCard'
import {useNavigateTo} from '../common/useNavigateTo'
import {useStrings} from '../common/useStrings'
import QRs from '../illustrations/QRs'

interface Item {
  isUsed: boolean
  loading: boolean
}

export function MultipleReceives() {
  useHideBottomTabBar()
  const strings = useStrings()
  const {styles, colors} = useStyles()

  const navigate = useNavigateTo()

  const HEIGHT_SCREEN = useWindowDimensions().height
  const HEIGHT_MODAL = (HEIGHT_SCREEN / 100) * 60

  const [isModalVisible, setIsModalVisible] = React.useState(true)

  const [data, setData] = React.useState(mocks.addressList)

  const onRequestAddress = () => {
    navigate.receiceDetails()
  }

  const renderItem = ({item}: {item: Item}) => (
    <SmallAddressCard
      address={mocks.address}
      isUsed={item.isUsed}
      date={mocks.usedAddressDate}
      onPress={onRequestAddress}
      loading={item.loading}
    />
  )

  const addMockData = () => {
    const novoDadoMockado = {isUsed: false, loading: false}
    setData([novoDadoMockado, ...data])
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.root}>
        <StatusBar type="light" />

        {data.length === 20 && <InfoCard onLimit={true} />}

        <Animated.FlatList
          data={data}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderItem}
          layout={Layout}
          showsVerticalScrollIndicator={false}
        />

        <Animated.View style={[styles.footer, {display: mocks.infoCardOnLimmit ? 'none' : 'flex'}]} layout={Layout}>
          <Button
            shelleyTheme
            title={strings.generateButton}
            disabled={data.length === 20 ? true : false}
            onPress={addMockData}
            style={styles.button}
          />
        </Animated.View>

        {isModalVisible && (
          <ModalScreenWrapper
            title={strings.multiplePresentation}
            height={HEIGHT_MODAL}
            onClose={() => {
              setIsModalVisible(false)
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalContent}>
                <QRs />

                <Text style={[styles.details, {color: colors.details}]}>
                  {strings.multiplePresentationDetails}

                  <Text style={[styles.details, {color: colors.learnMore}]}>{strings.learnAboutYoroi}</Text>
                </Text>

                <Spacer height={64} />
              </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <Button
                shelleyTheme
                title={strings.ok}
                disabled={mocks.isLoading}
                onPress={() => {
                  setIsModalVisible(false)
                }}
                style={styles.button}
              />
            </View>
          </ModalScreenWrapper>
        )}
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
      padding: 16,
    },
    modalContent: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
      justifyContent: 'center',
      alignItems: 'center',
    },
    footer: {
      backgroundColor: theme.color['white-static'],
      paddingTop: 16,
    },
    details: {
      fontFamily: 'Rubik-Regular',
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
    },
    buttonContainer: {
      width: '100%',
      backgroundColor: theme.color['white-static'],
      paddingTop: 10,
    },
    button: {
      backgroundColor: theme.color.primary[500],
    },
  })

  const colors = {
    buttonBackgroundBlue: theme.color.primary[600],
    learnMore: theme.color.primary[500],
    details: theme.color.gray[900],
  }

  return {styles, colors} as const
}
