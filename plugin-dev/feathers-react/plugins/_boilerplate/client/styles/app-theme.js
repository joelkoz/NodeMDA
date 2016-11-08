
import { sansSerif } from './fonts';
import {
  red500,
  cyan700,
  grey600,
  pinkA100,
  pinkA200,
  pinkA400,
  grey900,
  fullWhite
} from 'material-ui/styles/colors';

import { fade } from 'material-ui/utils/colorManipulator';

export default {
  fontFamily: sansSerif,
  boxShadow: '1px -1px 5px rgba(0,0,0,0.3)',
  palette: {
    primary1Color: red500,
    primary2Color: cyan700,
    primary3Color: grey600,
    accent1Color: pinkA200,
    accent2Color: pinkA400,
    accent3Color: pinkA100,
    textColor: grey900,
    secondaryTextColor: (0, fade)(grey900, 0.7),
    alternateTextColor: fullWhite,
    canvasColor: fullWhite,
    borderColor: (0, fade)(grey900, 0.3),
    disabledColor: (0, fade)(grey900, 0.3),
    pickerHeaderColor: (0, fade)(grey900, 0.12),
    clockCircleColor: (0, fade)(grey900, 0.12),
  },
  appBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: 50,
    backgroundColor: red500,
    textColor: fullWhite,
  },
};