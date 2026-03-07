import { Platform } from 'react-native';

// On Android, same hex values often render brighter/more saturated than on iOS (different color
// handling and screens). We use slightly toned-down values on Android so colors look closer to iOS.
const isAndroid = Platform.OS === 'android';

export const Colors = {
    primary: isAndroid ? '#F06090' : '#FF6B9D', // Main pink
    secondary: isAndroid ? '#8B65D9' : '#9D71E8', // Purple
    tertiary: isAndroid ? '#52A8C4' : '#5BBFDD', // Light blue
    background: '#FFFFFF',
    lightBackground: isAndroid ? '#FFF0F5' : '#FFF5F9',
    text: '#333333',
    lightText: '#777777',
    border: '#EEEEEE',
    success: isAndroid ? '#43A047' : '#4CAF50',
    warning: isAndroid ? '#F0B000' : '#FFC107',
    error: isAndroid ? '#E53935' : '#F44336',

    // Cycle phase colors
    period: isAndroid ? '#F06090' : '#FF6B9D',
    fertile: isAndroid ? '#8B65D9' : '#9D71E8',
    ovulation: isAndroid ? '#52A8C4' : '#5BBFDD',
    safe: isAndroid ? '#43A047' : '#4CAF50',

    // Pregnancy colors
    trimester1: '#FFB6C1',
    trimester2: '#B19CD9',
    trimester3: '#87CEEB',
  };

  export default Colors;