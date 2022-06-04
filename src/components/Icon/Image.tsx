import React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export const Image = ({size = 36, color = 'black'}: Props) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.5 6C7.11929 6 6 7.11929 6 8.5C6 9.88071 7.11929 11 8.5 11C9.88071 11 11 9.88071 11 8.5C11 7.11929 9.88071 6 8.5 6ZM8 8.5C8 8.22386 8.22386 8 8.5 8C8.77614 8 9 8.22386 9 8.5C9 8.77614 8.77614 9 8.5 9C8.22386 9 8 8.77614 8 8.5Z"
      fill={color}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22 19C22 20.6569 20.6569 22 19 22H4.9988C3.3425 21.9994 2 20.6565 2 19V5C2 3.34315 3.34315 2 5 2H19C20.6569 2 22 3.34315 22 5V19ZM5 4C4.44772 4 4 4.44772 4 5V19C4 19.4288 4.2699 19.7946 4.64909 19.9367L15.2929 9.29289C15.6834 8.90237 16.3166 8.90237 16.7071 9.29289L20 12.5858V5C20 4.44772 19.5523 4 19 4H5ZM20 19V15.4142L16 11.4142L7.41421 20H19C19.5523 20 20 19.5523 20 19Z"
      fill={color}
    />
  </Svg>
)
