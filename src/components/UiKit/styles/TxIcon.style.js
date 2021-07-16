// @flow

import {StyleSheet} from 'react-native'

type Props = {|
  size: number,
  color: string,
|}

const styles = ({size, color}: Props) =>
  StyleSheet.create({
    container: {
      display: 'flex',
      height: size,
      width: size,
      borderRadius: size / 2,
      backgroundColor: color,
    },
  })

export default styles
