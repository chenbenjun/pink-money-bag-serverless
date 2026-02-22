import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Logo } from '@/components/Logo';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useSafeRouter();
  
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const sloganTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo动画
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 宣传语动画
    const fadeInOut = () => {
      Animated.sequence([
        Animated.timing(sloganOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(sloganOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.delay(400),
      ]).start(() => fadeInOut());
    };

    const floatAnimation = () => {
      Animated.sequence([
        Animated.timing(sloganTranslateY, {
          toValue: -5,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sloganTranslateY, {
          toValue: 5,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => floatAnimation());
    };

    setTimeout(() => {
      fadeInOut();
      floatAnimation();
    }, 800);

    setTimeout(() => {
      router.replace('/login');
    }, 4000);
  }, []);

  return (
    <View style={styles.container}>
      {/* 背景 */}
      <View style={styles.background} />
      
      {/* LOGO - SVG绘制，已包含应用名称 */}
      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }}
      >
        <Logo size={160} showText={true} />
      </Animated.View>
      
      {/* 宣传语 */}
      <Animated.Text
        style={[
          styles.slogan,
          {
            opacity: sloganOpacity,
            transform: [{ translateY: sloganTranslateY }],
          },
        ]}
      >
        记录每一笔，攒下小幸福
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: '#FFE6EC',
  },
  slogan: {
    position: 'absolute',
    bottom: 80,
    fontSize: 18,
    fontWeight: '500',
    color: '#D94868',
    letterSpacing: 4,
    textAlign: 'center',
  },
});
