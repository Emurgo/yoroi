/**
 * @flow
 */

import React, {Component} from 'react'
import type {Node} from 'react'
import {StyleSheet, View, ScrollView} from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
})

type Props = {children?: Node, scroll: boolean}

class Screen extends Component<Props> {
  render() {
    const {children, scroll} = this.props

    const Container = scroll ? ScrollView : View

    return (
      <Container style={styles.container}>
        {children}
      </Container>
    )
  }
}

export default Screen
