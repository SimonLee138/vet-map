import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width } = useWindowDimensions();
  return { width, isWide: width >= 768 };
}
