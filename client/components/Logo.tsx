import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Line, Circle, Text } from 'react-native-svg';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function Logo({ size = 182, showText = true }: LogoProps) {
  const scale = size / 182;
  
  return (
    <View style={[styles.container, { width: size, height: showText ? size + 30 : size }]}>
      <Svg width={size} height={showText ? size + 30 : size} viewBox="0 0 182 229">
        {/* 1. 钱袋主体 */}
        <Path
          d="M91 15C115 15 135 35 135 60C135 85 160 110 160 140C160 170 130 195 91 195C52 195 22 170 22 140C22 110 47 85 47 60C47 35 67 15 91 15Z"
          fill="#FFB6C1"
          stroke="#D94868"
          strokeWidth="3"
        />
        
        {/* 钱袋顶部褶皱 */}
        <Path
          d="M60 15L91 30L122 15"
          fill="none"
          stroke="#D94868"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Rect
          x="75"
          y="15"
          width="32"
          height="10"
          rx="3"
          fill="#FFB6C1"
          stroke="#D94868"
          strokeWidth="2"
        />

        {/* 2. 记事本 */}
        <Rect
          x="65"
          y="70"
          width="52"
          height="70"
          rx="5"
          fill="#FFE6EC"
          stroke="#D94868"
          strokeWidth="2"
        />
        
        {/* 记事本上的横线 */}
        <Line x1="72" y1="90" x2="110" y2="90" stroke="#D94868" strokeWidth="1.5" />
        <Line x1="72" y1="105" x2="110" y2="105" stroke="#D94868" strokeWidth="1.5" />
        <Line x1="72" y1="120" x2="110" y2="120" stroke="#D94868" strokeWidth="1.5" />

        {/* 3. 笔 */}
        {/* 笔杆 */}
        <Path
          d="M115 115L140 90"
          stroke="#D94868"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* 笔尖 */}
        <Path
          d="M140 90L148 82L140 74Z"
          fill="#D94868"
        />
        {/* 笔帽 */}
        <Circle cx="115" cy="115" r="5" fill="#D94868" />

        {/* 4. 应用名称 */}
        {showText && (
          <>
            <Rect
              x="45"
              y="200"
              width="92"
              height="24"
              rx="12"
              fill="#D94868"
            />
            <Text
              x="91"
              y="217"
              fontFamily="PingFang SC, Microsoft YaHei, sans-serif"
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
              fill="#FFE6EC"
            >
              粉红小钱袋
            </Text>
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
