import { useEffect } from 'react';
import {
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  useAnimatedStyle,
  WithTimingConfig,
  WithSpringConfig,
} from 'react-native-reanimated';

/**
 * Fade in animation hook
 * @param delay Optional delay in milliseconds before animation starts
 * @param duration Animation duration in milliseconds (default: 300)
 * @returns Shared value for opacity
 */
export const useFadeIn = (delay = 0, duration = 300) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    const config: WithTimingConfig = { duration };
    opacity.value = withDelay(delay, withTiming(1, config));
  }, [delay, duration]);

  return opacity;
};

/**
 * Slide up animation hook
 * @param delay Optional delay in milliseconds before animation starts
 * @param distance Distance to slide in pixels (default: 20)
 * @returns Shared value for translateY
 */
export const useSlideUp = (delay = 0, distance = 20) => {
  const translateY = useSharedValue(distance);

  useEffect(() => {
    const config: WithSpringConfig = { damping: 15, stiffness: 150 };
    translateY.value = withDelay(delay, withSpring(0, config));
  }, [delay, distance]);

  return translateY;
};

/**
 * Scale on press animation hook
 * Provides scale value and event handlers for press interactions
 * @param scaleDown Scale factor when pressed (default: 0.96)
 * @returns Object with scale value and press handlers
 */
export const useScalePress = (scaleDown = 0.96) => {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withTiming(scaleDown, { duration: 100 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  return { scale, onPressIn, onPressOut };
};

/**
 * Combined fade in + slide up animation
 * @param delay Optional delay in milliseconds before animation starts
 * @param duration Animation duration in milliseconds (default: 300)
 * @param distance Distance to slide in pixels (default: 20)
 * @returns Animated style object
 */
export const useFadeSlideIn = (delay = 0, duration = 300, distance = 20) => {
  const opacity = useFadeIn(delay, duration);
  const translateY = useSlideUp(delay, distance);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
};

/**
 * Scale animation hook with auto-trigger
 * @param delay Optional delay in milliseconds before animation starts
 * @param fromScale Starting scale (default: 0.3)
 * @param toScale Ending scale (default: 1)
 * @returns Shared value for scale
 */
export const useScaleIn = (delay = 0, fromScale = 0.3, toScale = 1) => {
  const scale = useSharedValue(fromScale);

  useEffect(() => {
    const config: WithSpringConfig = { damping: 12, stiffness: 150 };
    scale.value = withDelay(delay, withSpring(toScale, config));
  }, [delay, fromScale, toScale]);

  return scale;
};

/**
 * Pulse animation hook (single pulse)
 * @param delay Optional delay in milliseconds before animation starts
 * @param pulseScale Scale factor for pulse (default: 1.1)
 * @returns Shared value for scale
 */
export const usePulse = (delay = 0, pulseScale = 1.1) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(pulseScale, { damping: 10 }, () => {
        scale.value = withSpring(1, { damping: 12 });
      })
    );
  }, [delay, pulseScale]);

  return scale;
};

/**
 * Rotation animation hook
 * @param delay Optional delay in milliseconds before animation starts
 * @param fromDegrees Starting rotation in degrees (default: 0)
 * @param toDegrees Ending rotation in degrees (default: 360)
 * @param duration Animation duration in milliseconds (default: 400)
 * @returns Shared value for rotation
 */
export const useRotate = (delay = 0, fromDegrees = 0, toDegrees = 360, duration = 400) => {
  const rotation = useSharedValue(fromDegrees);

  useEffect(() => {
    const config: WithTimingConfig = { duration };
    rotation.value = withDelay(delay, withTiming(toDegrees, config));
  }, [delay, fromDegrees, toDegrees, duration]);

  return rotation;
};
