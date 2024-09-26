import React from 'react'
import Svg, {Circle, G, Path} from 'react-native-svg'

import {IconProps} from '.'

export const TotalAda = ({size = 44, color = 'black'}: IconProps) => (
  <Svg viewBox="0 0 44 44" width={size} height={size}>
    <G id="icon/total-ada.inline" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <G id="icon/bg-for-icon" fill="#F0F3F5">
        <Circle id="Oval-Copy-4" cx="22" cy="22" r="22" />
      </G>

      <G id="icon/transaction" transform="translate(7.333333, 7.333333)">
        <G id="icon/price-copy">
          <Path
            d="M14.2222397,8.15833676 C14.4425853,8.16024176 14.6358078,8.27046334 14.7417486,8.44969929 L14.7816327,8.53062548 L16.5,12.7911667 L17.8433436,12.792075 C18.1532609,12.792075 18.407416,13.0229849 18.4400373,13.318596 L18.4430119,13.4090541 C18.4298482,13.697997 18.1922241,13.927633 17.9001348,13.9669971 L17.8110441,13.9729672 L16.97575,13.97275 L17.3341667,14.8591667 L18.8204047,14.8598666 C19.1216871,14.8598666 19.3855038,15.0632351 19.4418596,15.339007 L19.4516667,15.4229167 C19.4657165,15.7306862 19.240948,15.9894794 18.9438408,16.0339979 L18.8527042,16.0407588 L17.8099167,16.04075 L19.1861869,19.4497708 C19.2974267,19.7258598 19.1825586,20.034989 18.9293788,20.1787081 L18.8493633,20.2166631 C18.7777894,20.2445769 18.7038716,20.2583333 18.6284709,20.2583333 C18.4154055,20.2583333 18.2186455,20.1467721 18.1111581,19.9662598 L18.0707705,19.8848001 L16.51925,16.04075 L12.012,16.04075 L10.5215377,19.8510268 C10.4427204,20.0521686 10.2614308,20.1908048 10.052601,20.222321 L9.96163484,20.2291395 C9.88867238,20.2291395 9.81638108,20.2162304 9.74720883,20.1902904 C9.46534795,20.0836763 9.31176011,19.791749 9.37586326,19.5103222 L9.40171435,19.426405 L10.7259167,16.04075 L9.67466585,16.0407588 C9.36203064,16.0407588 9.10625159,15.8058248 9.07764956,15.5069547 L9.07560946,15.4239879 C9.08811154,15.135124 9.32651695,14.9052513 9.61900921,14.8658435 L9.70820768,14.8598666 L11.1879167,14.8591667 L11.5353333,13.97275 L10.6598018,13.9729672 C10.3470662,13.9729672 10.0913792,13.7379431 10.0627858,13.4386551 L10.0607458,13.355566 C10.0732633,13.0670053 10.3114151,12.8374054 10.6040799,12.7980447 L10.6933436,12.792075 L11.99825,12.7911667 L13.6646808,8.53575111 C13.7426337,8.33732064 13.9215848,8.19774311 14.1308866,8.16546141 L14.2222397,8.15833676 Z M15.6850833,13.97275 L12.8214167,13.97275 L12.4749167,14.8591667 L16.0435,14.8591667 L15.6850833,13.97275 Z M14.2321667,10.3684167 L13.2843333,12.7911667 L15.2093333,12.7911667 L14.2321667,10.3684167 Z"
            id="Fill-1"
            fill={color}
            fill-rule="nonzero"
          />

          <G id="continuous" transform="translate(2.750000, 3.666667)" fill={color}>
            <Path
              d="M23.0419276,11.0380723 L21.8689921,11.0380723 L21.8689373,10.8089605 C21.868887,10.5990276 21.8627484,10.3869693 21.8506799,10.1787811 C21.7547641,8.52736926 21.2705656,6.90085662 20.4508003,5.47604645 C19.6515239,4.08685672 18.5310453,2.88125067 17.2112698,1.99028629 C15.8699076,1.08471329 14.3165371,0.50224141 12.7200143,0.306125907 C10.945225,0.0880735674 9.14019254,0.335502989 7.50036923,1.02145822 C5.89201288,1.6942283 4.46083894,2.77963068 3.36214904,4.16010298 C3.17317892,4.39747486 3.20950439,4.74674639 3.44251255,4.93830911 C3.67345978,5.12808209 4.01093841,5.09183286 4.19817159,4.8566063 C4.25469831,4.78557111 4.31417744,4.71325807 4.37791097,4.63788232 C5.3380253,3.5031392 6.55334322,2.60939295 7.908347,2.04258199 C9.37906441,1.42740185 10.9984569,1.20570587 12.5915204,1.40139814 C14.0231818,1.57726556 15.4149876,2.0991849 16.617479,2.91103809 C17.8012849,3.71028656 18.805237,4.79043968 19.5216577,6.0356306 C20.2554809,7.31104657 20.6885512,8.76602034 20.774401,10.244233 C20.7798181,10.3375526 20.7839259,10.4322049 20.7867253,10.5277467 C20.7894126,10.6201798 20.7907637,10.7139806 20.7908169,10.8088291 L20.7909456,11.0381244 L19.617929,11.0381244 C19.4682422,11.0381244 19.3910582,11.2274882 19.5000411,11.3382162 L21.212066,13.0780112 C21.2776227,13.1446312 21.3823364,13.1446312 21.4478931,13.0780112 L23.1598687,11.3382663 C23.2687971,11.2275032 23.1915721,11.0380723 23.0419276,11.0380723 Z"
              id="Path"
            />

            <Path
              d="M20.0048642,19.6368417 L18.8319287,19.6368417 L18.8318739,19.4077299 C18.8318236,19.197797 18.825685,18.9857386 18.8136165,18.7775505 C18.7177007,17.1261386 18.2335022,15.499626 17.4137369,14.0748158 C16.6144605,12.6856261 15.4939819,11.4800201 14.1742064,10.5890557 C12.8328443,9.68348267 11.2794737,9.1010108 9.68295094,8.90489529 C7.90816161,8.68684295 6.10312915,8.93427237 4.46330583,9.62022761 C2.85494949,10.2929977 1.42377555,11.3784001 0.325085648,12.7588724 C0.136115522,12.9962442 0.172440993,13.3455158 0.405449153,13.5370785 C0.636396382,13.7268515 0.973875018,13.6906022 1.16110819,13.4553757 C1.21763492,13.3843405 1.27711404,13.3120275 1.34084758,13.2366517 C2.3009619,12.1019086 3.51627982,11.2081623 4.87128361,10.6413514 C6.34200101,10.0261712 7.9613935,9.80447525 9.55445702,10.0001675 C10.9861184,10.1760349 12.3779242,10.6979543 13.5804156,11.5098075 C14.7642215,12.3090559 15.7681736,13.3892091 16.4845943,14.6344 C17.2184175,15.909816 17.6514878,17.3647897 17.7373376,18.8430023 C17.7427547,18.936322 17.7468625,19.0309743 17.7496619,19.1265161 C17.7523492,19.2189492 17.7537003,19.31275 17.7537535,19.4075984 L17.7538822,19.6368938 L16.5808656,19.6368938 C16.4311788,19.6368938 16.3539948,19.8262575 16.4629777,19.9369856 L18.1750026,21.6767805 C18.2405593,21.7434006 18.345273,21.7434006 18.4108297,21.6767805 L20.1228053,19.9370357 C20.2317337,19.8262725 20.1545087,19.6368417 20.0048642,19.6368417 Z"
              id="Path-Copy"
              transform="translate(10.188969, 15.277341) rotate(-180.000000) translate(-10.188969, -15.277341) "
            />
          </G>
        </G>
      </G>
    </G>
  </Svg>
)
