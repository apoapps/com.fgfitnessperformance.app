import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface SwipeBackGestureProps {
  children: React.ReactNode;
  canGoBack: boolean;
  onSwipeBack: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const EDGE_WIDTH = 25;
const COMMIT_THRESHOLD = SCREEN_WIDTH * 0.35;
const VELOCITY_THRESHOLD = 500;

const SPRING_COMMIT = { damping: 22, stiffness: 180 };
const SPRING_CANCEL = { damping: 24, stiffness: 300 };

export function SwipeBackGesture({ children, canGoBack, onSwipeBack }: SwipeBackGestureProps) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([10, 50])
    .failOffsetY([-15, 15])
    .hitSlop({ left: 0, right: -(SCREEN_WIDTH - EDGE_WIDTH), top: 0, bottom: 0 })
    .enabled(canGoBack)
    .onUpdate((event) => {
      translateX.value = Math.max(0, event.translationX);
    })
    .onEnd((event) => {
      const shouldCommit =
        event.translationX > COMMIT_THRESHOLD ||
        event.velocityX > VELOCITY_THRESHOLD;

      if (shouldCommit) {
        translateX.value = withSpring(SCREEN_WIDTH, SPRING_COMMIT, (finished) => {
          if (finished) {
            runOnJS(onSwipeBack)();
            translateX.value = 0;
          }
        });
      } else {
        translateX.value = withSpring(0, SPRING_CANCEL);
      }
    });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: (translateX.value / SCREEN_WIDTH) * 0.4,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={styles.container}>
        <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none" />
        <Animated.View style={[styles.content, contentStyle]}>
          {children}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
});
