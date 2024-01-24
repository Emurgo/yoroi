import React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export const MultipleWallets = ({size = 36, color = 'black'}: Props) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.6 9C4.40463 9 4 9.23941 4 9.86191V18.1381C4 18.7606 4.40463 19 4.6 19H15.4C15.5913 19 16 18.7578 16 18.1381V9.86191C16 9.24218 15.5913 9 15.4 9H4.6ZM2 9.86191C2 8.43631 3.02097 7 4.6 7H15.4C16.9703 7 18 8.43354 18 9.86191V18.1381C18 19.5665 16.9703 21 15.4 21H4.6C3.02097 21 2 19.5637 2 18.1381V9.86191Z"
      fill={color}
    />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.71429 5C7.39496 5 7 5.30773 7 5.86191H5C5 4.36799 6.13247 3 7.71429 3H19.2857C20.8582 3 22 4.36529 22 5.86191V14.1381C22 15.6347 20.8582 17 19.2857 17V15C19.6007 15 20 14.6896 20 14.1381V5.86191C20 5.31043 19.6007 5 19.2857 5H7.71429Z"
      fill={color}
    />
  </Svg>
)
