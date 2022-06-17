import React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export const Tokens = ({size = 36, color = 'black'}: Props) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path
      d="M9.83203 6.4453C9.64657 6.1671 9.33434 6 8.99998 6C8.66563 6 8.3534 6.1671 8.16793 6.4453L6.16793 9.4453C5.86158 9.90483 5.98576 10.5257 6.44528 10.8321C6.90481 11.1384 7.52568 11.0142 7.83203 10.5547L8.99998 8.80278L10.1679 10.5547C10.4743 11.0142 11.0952 11.1384 11.5547 10.8321C12.0142 10.5257 12.1384 9.90483 11.832 9.4453L9.83203 6.4453Z"
      fill={color}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 9C2 5.13401 5.13401 2 9 2C12.866 2 16 5.13401 16 9C16 12.866 12.866 16 9 16C5.13401 16 2 12.866 2 9ZM9 4C6.23858 4 4 6.23858 4 9C4 11.7614 6.23858 14 9 14C11.7614 14 14 11.7614 14 9C14 6.23858 11.7614 4 9 4Z"
      fill={color}
    />
    <Path
      d="M16.9142 8.50072C17.1899 8.02219 17.8014 7.8578 18.2799 8.13354C19.2678 8.70275 20.1113 9.49167 20.7453 10.4392C21.3794 11.3868 21.7868 12.4675 21.9361 13.5978C22.0854 14.7281 21.9725 15.8776 21.6063 16.9572C21.24 18.0369 20.6302 19.0178 19.824 19.824C19.0179 20.6302 18.037 21.24 16.9573 21.6062C15.8776 21.9725 14.7282 22.0853 13.5979 21.936C12.4676 21.7867 11.3868 21.3793 10.4393 20.7453C9.49173 20.1113 8.70281 19.2677 8.1336 18.2799C7.85786 17.8013 8.02225 17.1899 8.50078 16.9141C8.97931 16.6384 9.59076 16.8028 9.8665 17.2813C10.2825 18.0032 10.859 18.6197 11.5515 19.0831C12.244 19.5464 13.0338 19.8441 13.8598 19.9532C14.6858 20.0623 15.5258 19.9799 16.3148 19.7122C17.1039 19.4446 17.8207 18.9989 18.4098 18.4098C18.999 17.8206 19.4446 17.1038 19.7123 16.3148C19.9799 15.5258 20.0624 14.6857 19.9533 13.8597C19.8442 13.0337 19.5464 12.2439 19.0831 11.5514C18.6198 10.859 18.0033 10.2824 17.2814 9.86643C16.8029 9.5907 16.6385 8.97925 16.9142 8.50072Z"
      fill={color}
    />
  </Svg>
)
