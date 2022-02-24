import * as React from 'react'
import Svg, {G, Path, Polygon} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
  backgroundColor?: string
}

export const TrashCan = ({size = 40, color = 'black', backgroundColor = 'transparent'}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 18 18">
    <G id="translate" transform="translate(-3.000000, -3.000000)">
      <Polygon id="background" points="0 0 24 0 24 24 0 24" fill={backgroundColor} />
      <Path
        id="trashcan"
        d="M14.8188148,3 C15.5253333,3 16.100037,3.54558984 16.100037,4.21619531 L16.100037,4.21619531 L16.100037,5.797 L20.2001852,5.7973125 C20.592151,5.7973125 20.9155724,6.14060389 20.9630102,6.58440796 L20.969,6.6973125 C20.969,7.19442191 20.6248519,7.5973125 20.2002222,7.5973125 L20.2002222,7.5973125 L19.079037,7.597 L17.9423333,19.8964102 C17.8808716,20.4775852 17.3879195,20.9352495 16.7928474,20.9936884 L16.6638889,21 L7.33614815,21 C6.68448148,21 6.12351852,20.5188516 6.05874074,19.9051641 L6.05874074,19.9051641 L4.92003704,7.597 L3.79981481,7.5973125 C3.407849,7.5973125 3.08445913,7.25402111 3.03702616,6.81021704 L3.03103704,6.6973125 C3.03103704,6.20020309 3.37518519,5.7973125 3.79981481,5.7973125 L3.79981481,5.7973125 L7.89903704,5.797 L7.89988889,4.21623047 C7.89988889,3.58750488 8.40506467,3.06868721 9.05036496,3.00629096 L9.18118519,3 Z M17.535037,7.597 L6.46403704,7.597 L7.5682963,19.5405586 L16.4317037,19.5405586 L17.535037,7.597 Z M9.79229808,9.73377037 C10.2887262,9.70775367 10.709076,10.0303445 10.7312994,10.4543922 L10.7312994,10.4543922 L11.0662689,16.8459911 C11.0884923,17.2700388 10.7041671,17.6348379 10.207739,17.6608546 C9.71131082,17.6868713 9.29096106,17.3642805 9.26873766,16.9402328 L9.26873766,16.9402328 L8.93376622,10.5485969 C8.91154282,10.1245492 9.29586994,9.75978707 9.79229808,9.73377037 Z M14.207739,9.73377037 C14.7041671,9.75978707 15.0884942,10.1245492 15.0662708,10.5485969 L15.0662708,10.5485969 L14.7313013,16.9401958 C14.7090779,17.3642435 14.2887262,17.6868713 13.7922981,17.6608546 C13.2958699,17.6348379 12.9115428,17.2700758 12.9337662,16.8460281 L12.9337662,16.8460281 L13.2687377,10.4543922 C13.2909611,10.0303445 13.7113108,9.70775367 14.207739,9.73377037 Z M14.5625185,4.45944141 L9.43740741,4.45944141 L9.43703704,5.797 L14.562037,5.797 L14.5625185,4.45944141 Z"
        fill={color}
      />
    </G>
  </Svg>
)
