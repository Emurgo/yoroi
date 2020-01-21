// @flow

import React from 'react'
import type {Node} from 'react'
import {View} from 'react-native'

import Text from './Text'
import styles from './styles/TitledCard.style'

type ExternalProps = {|
  title?: string,
  children: Node,
  variant?: string,
|};

const TitledCard = ({
  title,
  children,
  variant,
}: ExternalProps) => (
  <View style={styles.wrapper}>
    {title !== undefined &&
      <Text style={styles.title}>
        {title}
      </Text>
    }
    <View style={[styles.content, variant === 'poolInfo' ? styles.poolInfoContent : undefined]}>
      {children}
    </View>
  </View>
)

export default TitledCard
