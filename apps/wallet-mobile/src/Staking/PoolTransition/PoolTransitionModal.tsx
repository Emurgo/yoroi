import {PoolTransition} from '@emurgo/yoroi-lib'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Image, StyleSheet, Text, View, ViewProps} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button, Icon, useModal} from '../../components'
import {ScrollView, useScrollView} from '../../components/ScrollView/ScrollView'
import {Space} from '../../components/Space/Space'
import {formatTimeSpan} from '../../yoroi-wallets/utils'
import {useStrings} from './usePoolTransition'

export const PoolTransitionModal = ({
  poolTransition,
  onContinue,
}: {
  poolTransition: PoolTransition
  onContinue: () => Promise<void> | void
}) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const strings = useStrings()
  const {isScrollBarShown, scrollViewRef, setIsScrollBarShown} = useScrollView()
  const {styles, colors} = useStyles()

  const {closeModal} = useModal()

  const handleOnSkip = () => {
    closeModal()
  }

  const handleOnUpdate = async () => {
    try {
      setIsLoading(true)
      await onContinue()
    } finally {
      setIsLoading(false)
      closeModal()
    }
  }

  const timeSpan = poolTransition.deadlineMilliseconds - Date.now()
  const isActive = timeSpan > 0

  return (
    <View style={styles.modal}>
      <ScrollView style={styles.scroll} ref={scrollViewRef} onScrollBarChange={setIsScrollBarShown}>
        <View style={styles.modal}>
          <Text style={styles.details}>{isActive ? strings.warning : strings.finalWarning}</Text>

          <Space height="l" />

          <View style={[styles.card, isActive ? styles.border : styles.warningBorder]}>
            <Row>
              <Text style={styles.label}>{strings.currentPool}</Text>

              <View style={styles.poolTicker}>
                {poolTransition.current.pic != null && (
                  <Image source={{uri: poolTransition.current.pic}} style={styles.pic} />
                )}

                <Text
                  style={styles.poolTickerText}
                >{`[${poolTransition.current.ticker}] ${poolTransition.current.name}`}</Text>
              </View>
            </Row>

            <Row>
              <Text style={styles.label}>{strings.estimatedRoa}</Text>

              <Text style={styles.currentValue}>{poolTransition.current.roa} %</Text>
            </Row>

            <Row>
              <Text style={styles.label}>{strings.fee}</Text>

              <Text style={styles.currentValue}>{formatFee(poolTransition.current.taxRatio)} %</Text>
            </Row>

            <Text style={styles.warning}>
              <Text style={styles.warningText}>{isActive ? strings.poolWillStopRewards : strings.poolNoRewards}</Text>

              {isActive && (
                <Text style={styles.warningTimer}>
                  {'\n'}

                  {formatTimeSpan(timeSpan)}
                </Text>
              )}
            </Text>
          </View>

          <Space height="s" />

          <Icon.ArrowDown size={17} />

          <Space height="s" />

          <View style={styles.card}>
            <LinearGradient
              style={[StyleSheet.absoluteFill, {opacity: 1, borderRadius: 8}]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0.5}}
              colors={colors.backgroundGradientCard}
            />

            <Row>
              <Text style={styles.label}>{strings.newPool}</Text>

              <View style={styles.poolTicker}>
                {poolTransition.suggested.pic != null && (
                  <Image source={{uri: poolTransition.suggested.pic}} style={styles.pic} />
                )}

                <Text
                  style={styles.poolTickerText}
                >{`[${poolTransition.suggested.ticker}] ${poolTransition.suggested.name}`}</Text>
              </View>
            </Row>

            <Row>
              <Text style={styles.label}>{strings.estimatedRoa}</Text>

              <Text style={styles.suggestedValue}>{poolTransition.suggested.roa} %</Text>
            </Row>

            <Row>
              <Text style={styles.label}>{strings.fee}</Text>

              <Text style={styles.suggestedValue}>{formatFee(poolTransition.suggested.taxRatio)} %</Text>
            </Row>

            <Text style={styles.currentValue}>{strings.poolGeneratesRewards}</Text>
          </View>

          <Space height="xl" />
        </View>
      </ScrollView>

      {isScrollBarShown && <View style={styles.line} />}

      <Actions>
        <Button outline title={strings.skipNoRewards} textStyles={styles.outlineButton} onPress={handleOnSkip} />

        <Button
          shelleyTheme
          title={strings.updateKeepEarning}
          onPress={handleOnUpdate}
          textStyles={styles.button}
          disabled={isLoading}
        />
      </Actions>

      <Space height="xl" />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    modal: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'flex-end',
    },
    scroll: {
      width: '100%',
    },
    card: {
      borderRadius: 8,
      gap: 8,
      ...theme.padding.l,
      width: '100%',
      overflow: 'hidden',
    },
    border: {
      borderWidth: 1,
      borderColor: theme.color.gray['300'],
    },
    warningBorder: {
      borderWidth: 1,
      borderColor: theme.color.magenta['500'],
    },
    poolTicker: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    poolTickerText: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.primary[600],
    },
    pic: {
      width: 24,
      height: 24,
      borderRadius: 100,
    },
    label: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray['600'],
    },
    currentValue: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray['max'],
    },
    suggestedValue: {
      ...theme.typography['body-1-l-medium'],
      color: theme.color.gray['max'],
    },
    warning: {
      color: theme.color.magenta['500'],
    },
    warningText: {
      ...theme.typography['body-1-l-regular'],
    },
    warningTimer: {
      ...theme.typography['body-1-l-medium'],
    },
    row: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      height: 24,
      alignItems: 'center',
    },
    line: {width: '120%', height: StyleSheet.hairlineWidth, backgroundColor: theme.color.gray[200]},
    actions: {
      alignSelf: 'stretch',
      backgroundColor: theme.color.gray.min,
      gap: 4,
    },
    details: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray['900'],
      width: '100%',
    },
    outlineButton: {
      color: theme.color.gray[900],
      ...theme.typography['button-2-m'],
    },
    button: {
      ...theme.typography['button-1-l'],
    },
  })

  const colors = {
    backgroundGradientCard: theme.color.gradients['blue-green'],
  }

  return {styles, colors} as const
}

const Actions = (props: ViewProps) => {
  const {styles} = useStyles()
  return <View {...props} style={styles.actions} />
}

const Row = (props: ViewProps) => {
  const {styles} = useStyles()
  return <View {...props} style={styles.row} />
}

const formatFee = (fee: string) => Number((Number(fee) * 100).toFixed(2))