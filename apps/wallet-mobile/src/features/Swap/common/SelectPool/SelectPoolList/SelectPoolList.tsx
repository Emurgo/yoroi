import React, {useState} from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Spacer} from '../../../../../components'
import {COLORS} from '../../../../../theme'

type CardInfo = {
  label: string
  value: string
}

type CardList = {
  icon: React.ReactNode
  label: string
  info: CardInfo[]
}

type Props = {
  data: CardList[]
}
export const SelectPoolList = ({data}: Props) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(0)

  const handleCardSelect = (index: number) => {
    setSelectedCardIndex(index)
  }

  return (
    <View style={styles.container}>
      {data.map((card, index) => (
        <View key={card.label}>
          <Spacer height={16} />

          <View style={[styles.shadowProp]}>
            <LinearGradient
              colors={index === selectedCardIndex ? ['#E4E8F7', '#C6F7F7'] : [COLORS.WHITE, COLORS.WHITE]}
              style={styles.linearGradient}
            >
              <TouchableOpacity key={index} onPress={() => handleCardSelect(index)} style={[styles.card]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.icon}>{card.icon}</Text>

                  <Text style={styles.label}>{card.label}</Text>
                </View>

                <View style={styles.infoContainer}>
                  {card.info.map((infoItem, infoIndex) => (
                    <View key={infoItem.label}>
                      <Spacer height={8} />

                      <View key={infoIndex} style={styles.info}>
                        <Text style={styles.infoLabel}>{infoItem.label}</Text>

                        <Text style={styles.infoValue}>{infoItem.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    flex: 1,
    marginBottom: 60,
  },
  linearGradient: {
    height: 200,
    borderRadius: 8,
  },
  card: {
    height: 200,
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 20,
  },
  shadowProp: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    fontWeight: '500',
    fontSize: '16',
  },
  icon: {
    marginRight: 8,
    fontSize: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'column',
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  infoLabel: {
    color: '#6B7384',
  },
  infoValue: {},
})
