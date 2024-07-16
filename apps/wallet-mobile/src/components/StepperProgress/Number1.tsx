import * as React from 'react'
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg'

export const Number1 = () => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_21640_15126)">
        <Rect width={24} height={24} rx={12} fill="#3154CB" />

        <Path
          d="M12.638 17a.341.341 0 01-.252-.098.353.353 0 01-.084-.238V9.412l-2.128 1.638a.373.373 0 01-.252.07.393.393 0 01-.224-.154l-.588-.756a.397.397 0 01-.07-.266.342.342 0 01.154-.224l3.136-2.422a.357.357 0 01.168-.084c.056-.01.116-.014.182-.014h1.232c.093 0 .172.033.238.098a.324.324 0 01.098.238v9.128a.324.324 0 01-.098.238.324.324 0 01-.238.098h-1.274z"
          fill="#E4E8F7"
        />
      </G>

      <Defs>
        <ClipPath id="clip0_21640_15126">
          <Rect width={24} height={24} rx={12} fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
