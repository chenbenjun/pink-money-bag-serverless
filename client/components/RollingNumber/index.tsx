import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface RollingNumberProps {
  value: string;
  style?: any;
  visible?: boolean;
  onAnimationComplete?: () => void;
  rollingHeight?: number;
  duration?: number;
  digitWidth?: number;
  dotWidth?: number;
}

// 单个数字滚动组件
const RollingDigit: React.FC<{
  digit: string;
  height: number;
  duration: number;
  width: number;
  delay: number;
  style?: any;
}> = ({ digit, height, duration, width, delay, style }) => {
  const translateY = React.useMemo(() => new Animated.Value(0), []);
  const targetDigit = parseInt(digit, 10);

  useEffect(() => {
    // 倒序 digits 是 9-8-7-6-5-4-3-2-1-0 循环
    // 目标数字 D 在第 2 圈的位置索引 = 20 + (9 - D) = 29 - D
    // 目标位置 = -(29 - D) * height = (D - 29) * height
    const targetPosition = (targetDigit - 29) * height;
    
    // 从显示 9 的位置开始（索引 0）
    translateY.setValue(0);
    
    // 开始滚动动画 - 从上往下滚动
    Animated.sequence([
      // 延迟
      Animated.delay(delay),
      // 滚动动画 - 从 9 滚动到目标数字
      Animated.timing(translateY, {
        toValue: targetPosition,
        duration: duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [digit, height, duration, delay, targetDigit]);

  // 生成倒序数字序列 9-0，并复制3次以实现从上往下滚动效果
  const digits = '987654321098765432109876543210';

  return (
    <View style={[styles.digitContainer, { height, width }]}>
      <Animated.View
        style={[
          styles.digitWrapper,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {digits.split('').map((d, index) => (
          <ThemedText key={index} style={[style, { height, lineHeight: height }]}>
            {d}
          </ThemedText>
        ))}
      </Animated.View>
    </View>
  );
};

// 静态小数点
const StaticDot: React.FC<{ style?: any; width: number }> = ({ style, width }) => (
  <View style={[styles.dotContainer, { width }]}>
    <ThemedText style={[style, styles.dot]}>.</ThemedText>
  </View>
);

export const RollingNumber: React.FC<RollingNumberProps> = ({
  value,
  style,
  visible = true,
  onAnimationComplete,
  rollingHeight = 56,
  duration = 1500,
  digitWidth = 30,
  dotWidth = 12,
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [displayValue, setDisplayValue] = useState('0.00');

  useEffect(() => {
    if (!visible) {
      setDisplayValue('****');
      return;
    }

    // 解析数值，保留两位小数
    const numValue = parseFloat(value || '0');
    const formattedValue = numValue.toFixed(2);
    
    // 设置显示值并开始动画
    setDisplayValue(formattedValue);
    setIsAnimating(true);

    // 动画结束后回调
    const timer = setTimeout(() => {
      setIsAnimating(false);
      onAnimationComplete?.();
    }, duration + 200); // 稍微多等一下确保动画完成

    return () => clearTimeout(timer);
  }, [value, visible, duration, onAnimationComplete]);

  // 隐藏状态直接返回****
  if (!visible) {
    return (
      <ThemedText style={style}>****</ThemedText>
    );
  }

  // 动画结束后直接显示最终数字
  if (!isAnimating) {
    return (
      <ThemedText style={style}>{displayValue}</ThemedText>
    );
  }

  // 渲染滚动数字
  const renderDigits = () => {
    const parts = displayValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '00';

    const elements: React.ReactNode[] = [];
    let delay = 0;

    // 整数部分
    for (let i = 0; i < integerPart.length; i++) {
      elements.push(
        <RollingDigit
          key={`int-${i}`}
          digit={integerPart[i]}
          height={rollingHeight}
          width={digitWidth}
          duration={duration}
          delay={delay}
          style={style}
        />
      );
      delay += 80; // 每个数字间隔80ms开始动画
    }

    // 小数点
    elements.push(
      <StaticDot key="dot" style={style} width={dotWidth} />
    );

    // 小数部分
    for (let i = 0; i < decimalPart.length; i++) {
      elements.push(
        <RollingDigit
          key={`dec-${i}`}
          digit={decimalPart[i]}
          height={rollingHeight}
          width={digitWidth}
          duration={duration}
          delay={delay}
          style={style}
        />
      );
      delay += 80;
    }

    return elements;
  };

  return (
    <View style={styles.container}>
      {renderDigits()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  digitContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
  },
  digitWrapper: {
    flexDirection: 'column',
  },
  dotContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
  },
  dot: {
    fontSize: 36,
    fontWeight: '600',
  },
});

export default RollingNumber;
