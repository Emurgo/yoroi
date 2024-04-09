import React from 'react'
import Svg, {G, Path} from 'react-native-svg'

type Props = {
  width: number
  height: number
  color?: string
}

export const Cardano = ({width, height, color}: Props) => (
  <Svg viewBox="0 0 2000 1848" {...{width, height}}>
    <G fill={color != null ? color : '#000000'}>
      <Path d="M975.46 5.46c43.59-22.73 96.8 30 73.64 73.55-13.45 35.5-64.45 44.94-90.5 17.88C931 70.92 940 19.59 975.46 5.46M506.61 56c26.48-10.9 60 13.36 57.3 42.22 2.81 31.33-35.5 54.39-62.49 39.5-35.76-13.85-31.67-71.9 5.19-81.72M1466.87 138.6c-41.38-5-47.93-70.06-8.09-83.16 30.9-15.07 59.25 13.19 63.77 42.48-6.48 25.01-27.42 47.91-55.68 40.68M613.29 255.55c44.27-28 107.44 13.7 100.63 65.12-2.3 51.92-71.26 82-110.17 46.9-37.62-27.57-31.92-90.82 9.54-112.02M1289.1 285.26c19.75-50.9 99.78-52.44 122.26-2.89 22.22 38.56-5.11 86.31-44.7 99.42-52.44 9.79-102.25-46.9-77.56-96.53M919 378.9c-.43-43.75 39.42-76.35 81-79.33 27.58 5.53 57.64 17.28 69.47 45.11 22.05 38.39 2.47 91.25-37.37 108.87-18.22 10.21-39.76 6.38-59.6 5.19-30.33-14.89-55.87-44.09-53.5-79.84M221.75 442.65c40.44-24.86 95 20.51 79.69 64.44-8.43 38-59.51 53.46-88.71 29.2-31.17-22.73-26.23-77.38 9.02-93.64M1719 442.57c34.31-26.64 90.93 3.92 86.84 47.24 2.3 39.5-46.65 69.29-80.71 48.95-37.51-16.86-41.34-74.57-6.13-96.19M1115.08 521.22c56.62-20.34 123.87 4 156.14 54.48 42.57 61.71 19.92 155.69-46.14 191.1-68.45 41.88-168.4 6.38-193.68-70.06-28.7-68.43 13.11-154.07 83.68-175.52M782.88 527.95c62.75-29.62 147.2-4.77 177.51 59.42 35.67 62.48 8.09 149.48-55.68 181.74-63.85 36.26-153.93 8.77-184.83-58.31-34.65-64.87-3.88-152.98 63-182.85M450.25 641.67c4.77-40.43 42.91-66.74 81.39-69.46 41.46 5 74.58 37.2 79.09 79.16-2.72 41.54-34.82 82.14-78.84 81.89-48.43 4.17-90.89-44.01-81.64-91.59M1432.73 581c49.72-28.94 118.76 13.19 116.55 70.31 3.41 60.52-73 103.17-122.51 67.67-51.43-29.56-47.42-112.81 5.96-137.98M647.69 794.3c58.15-16 124.64 11.41 153.16 64.86 31.24 53.8 18.47 128.54-30.05 168-62.23 57.88-177 34.64-210.12-44.35-38.06-72.41 8.17-169.45 87.01-188.51M1277.78 794c56.53-16.17 122.94 5.62 153.33 57.12 40.18 58.9 21 146.75-38.82 184.72-62.66 44.09-159.72 20.94-194.2-48-41.8-71.31.26-172.09 79.69-193.84M273.68 861.2c50.23-19 105.91 36.43 85.56 86.23-12.43 45.37-76.37 62.14-109.4 28.69-38.65-31.41-24.34-101.3 23.84-114.92M1635.18 933.47c-1.45-41.62 29-78.48 71.68-80.78 34.4 5.45 67.85 33.2 65.13 70.65 3.15 49.46-56.45 83.08-98.59 59.84-19.75-10.04-29.88-30.3-38.22-49.71M26.7 885.63c30.22-13.19 67.6 13 60.7 46.56-1.62 38-57.72 52.61-78.33 20.86C-9.14 931 1.76 897 26.7 885.63zM1932.13 884.87c21.28-15.15 55.42-4.26 63.85 20.6 14.3 27.15-11.92 64.35-42.48 59.76-42.9 3.91-56.78-61.47-21.37-80.36M811.83 1067.28c79.52-20.68 165 45.63 165.5 127.51 5.19 82.74-79 156.11-160.4 137-62.92-10.13-112.29-70.74-110.25-134.32-.17-60.81 45.72-117.33 105.15-130.19M1126.75 1067.11c80.71-22.56 168.74 44.94 167.46 128.71 4.26 81.21-77.3 152.11-157 136-75-9.7-130.34-92.1-109.4-164.88 10.57-48.5 51.09-87.94 98.94-99.83M519.56 1117.51c55.85-9.53 108.21 52.78 85.56 105.81-16.52 56.51-98.76 71.84-135.12 25.68-42.65-44.33-10.81-125.37 49.56-131.49M1443.11 1120c49.8-20.86 110.93 22.22 107.1 76.27 2 59.5-73.47 100.53-122.17 65.8-55.16-31.18-45.12-122.94 15.07-142.07M1701.25 1378.92c-19.5-36.35 15.92-84.53 56.28-77.8 20.09-.34 34.14 15.49 47 28.77 2.64 21.54 7.07 47.24-10.81 63.84-24.28 30.73-79.28 21.96-92.47-14.81M221.58 1311.24c37.72-25.11 92 12.34 83.52 56.44-4.51 39-53.64 61.29-86 39.16-34.73-20.09-33.45-77.29 2.48-95.6M966.78 1392.88c49.38-21.79 112.29 21.2 107.61 75.59 3.66 60.1-74.15 101.72-122.43 65.63-53.63-30.99-44.69-122.16 14.82-141.22M621.63 1473.4c42.06-22.13 98.5 16.09 94.67 63.16 1.28 38.65-36.44 71.59-74.58 65.88-31.59-.68-52.19-29-62.32-55.93.52-29.35 12.6-62.04 42.23-73.11M1320.77 1474.08c43.25-26.73 104.72 11.66 100.63 62 1.11 52.61-68.36 86.31-108.63 51.75-38.99-27.09-34.23-92.21 8-113.75M1442.35 1774.65c-19.24-29.11 3.41-64.18 34.65-70.82 25.12 5.11 51.68 24 46.4 53.12-3.66 39.41-61.3 51.5-81.05 17.7M477.24 1749.37c7.66-23.07 26.22-46 53.38-40 39.59 2.81 51.34 62.48 16.69 80.87-31.16 21.01-67.31-7.76-70.07-40.87M942.85 1775.84c7.58-34.13 51.76-50.73 80.88-32.6 19.24 8.26 24.86 29.79 29.8 48.09-2.64 9.53-5 19.07-7.32 28.6-11.92 14.13-27.24 28.26-47.08 27.75-36.87 4.32-70.13-37.36-56.28-71.84" />
    </G>
  </Svg>
)
