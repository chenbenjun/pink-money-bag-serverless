import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// 音效开关（用户可以设置中开启/关闭）
let soundEnabled = true;
let audioModeConfigured = false;

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const getSoundEnabled = () => soundEnabled;

// 配置音频模式（移动端需要）
const configureAudioMode = async () => {
  if (audioModeConfigured || Platform.OS === 'web') return;
  
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true, // iOS 静音模式下也播放
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    audioModeConfigured = true;
  } catch (error) {
    console.log('配置音频模式失败:', error);
  }
};

// 微信收钱音效对象（缓存）
let wechatSound: Audio.Sound | null = null;
let wechatSoundAsset: Asset | null = null;

// 银子音效对象（缓存）
let coinSound: Audio.Sound | null = null;
let coinSoundAsset: Asset | null = null;

// 预加载音效资源
export const preloadWechatSound = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return true;
  if (wechatSound) return true;
  
  try {
    // 先配置音频模式
    await configureAudioMode();
    
    // 加载资源
    const asset = Asset.fromModule(require('@/assets/income_sound.mp3'));
    await asset.downloadAsync();
    wechatSoundAsset = asset;
    
    console.log('音效资源已加载:', asset.localUri || asset.uri);
    
    // 创建音效对象
    const { sound } = await Audio.Sound.createAsync(
      { uri: asset.localUri || asset.uri },
      { 
        shouldPlay: false, 
        isLooping: false,
        volume: 1.0,
      }
    );
    wechatSound = sound;
    console.log('音效对象创建成功');
    return true;
  } catch (error) {
    console.log('预加载微信音效失败:', error);
    return false;
  }
};

// 预加载银子音效资源
export const preloadCoinSound = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return true;
  
  // 如果已经加载，先检查状态
  if (coinSound) {
    try {
      const status = await coinSound.getStatusAsync();
      if (status.isLoaded) {
        console.log('银子音效已加载且有效');
        return true;
      }
      // 如果未加载，重新创建
      console.log('银子音效对象未加载，重新创建');
      coinSound = null;
    } catch (error) {
      console.log('银子音效状态检查失败，重新创建:', error);
      coinSound = null;
    }
  }
  
  try {
    // 先配置音频模式
    await configureAudioMode();
    
    // 加载资源
    const asset = Asset.fromModule(require('@/assets/coin_sound.mp3'));
    await asset.downloadAsync();
    coinSoundAsset = asset;
    
    console.log('银子音效资源已加载:', asset.localUri || asset.uri);
    
    // 创建音效对象 - 预加载到内存
    const { sound } = await Audio.Sound.createAsync(
      { uri: asset.localUri || asset.uri },
      { 
        shouldPlay: false, 
        isLooping: false,
        volume: 0.6,
        progressUpdateIntervalMillis: 50,
      },
      null, // 不需要进度回调
      true  // 预下载到本地
    );
    coinSound = sound;
    console.log('银子音效对象创建成功');
    return true;
  } catch (error) {
    console.log('预加载银子音效失败:', error);
    coinSound = null;
    return false;
  }
};

// 初始化微信音效（兼容旧接口）
const initWechatSound = async (): Promise<Audio.Sound | null> => {
  if (wechatSound) return wechatSound;
  const success = await preloadWechatSound();
  return success ? wechatSound : null;
};

// 简单的音效播放函数
const playSound = async (frequency: number, duration: number, type: 'coin' | 'tick' | 'success' | 'wechat' = 'coin') => {
  if (!soundEnabled) return;

  try {
    // 使用触觉反馈增强体验
    if (Platform.OS !== 'web') {
      if (type === 'coin' || type === 'wechat') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'tick') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }

    // Web 平台使用 Web Audio API
    if (Platform.OS === 'web') {
      playWebSound(frequency, duration, type);
    }
  } catch (error) {
    console.log('音效播放失败:', error);
  }
};

// Web 平台使用 Web Audio API 生成音效
const playWebSound = (frequency: number, duration: number, type: 'coin' | 'tick' | 'success' | 'wechat') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'coin') {
      // 银子落袋音效：高频快速衰减
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } else if (type === 'tick') {
      // 滴答声：短促高频
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } else if (type === 'success') {
      // 成功音效：双音调
      oscillator.frequency.setValueAtTime(523, ctx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } else if (type === 'wechat') {
      // 微信收钱音效：清脆的"叮-咚"双音
      const oscillator2 = ctx.createOscillator();
      const gainNode2 = ctx.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(ctx.destination);

      // 第一个音：清脆的"叮"（高频金属感）
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime); // 高频
      oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.08);
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      // 第二个音：低沉的"咚"（低频，轻微延迟）
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(400, ctx.currentTime + 0.08);
      oscillator2.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.18);
      gainNode2.gain.setValueAtTime(0.35, ctx.currentTime + 0.08);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      oscillator.start(ctx.currentTime);
      oscillator2.start(ctx.currentTime + 0.08);
      oscillator.stop(ctx.currentTime + 0.15);
      oscillator2.stop(ctx.currentTime + 0.25);
    }
  } catch (error) {
    console.log('Web 音效播放失败:', error);
  }
};

/**
 * 银子落袋音效 - 用于记收入/支出
 */
export const playCoinSound = async () => {
  await playSound(1200, 150, 'coin');
};

/**
 * 滴答音效 - 用于数字滚动
 */
export const playTickSound = async () => {
  await playSound(800, 50, 'tick');
};

/**
 * 成功音效 - 用于操作成功
 */
export const playSuccessSound = async () => {
  await playSound(523, 300, 'success');
};

/**
 * 微信收钱音效 - 用于记收入
 * 使用真实的 MP3 音频文件
 */
export const playWechatSound = async () => {
  if (!soundEnabled) return;

  try {
    // 触觉反馈
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // 移动端播放真实 MP3
    if (Platform.OS !== 'web') {
      // 如果还没有预加载，先预加载
      if (!wechatSound) {
        const success = await preloadWechatSound();
        if (!success) {
          console.log('音效预加载失败，使用合成音效');
          await playSound(1200, 250, 'wechat');
          return;
        }
      }
      
      if (wechatSound) {
        // 重置播放位置并播放
        await wechatSound.setPositionAsync(0);
        await wechatSound.playAsync();
        console.log('播放微信音效成功');
      } else {
        // 如果加载失败，回退到合成音效
        await playSound(1200, 250, 'wechat');
      }
    } else {
      // Web 平台使用合成音效
      await playSound(1200, 250, 'wechat');
    }
  } catch (error) {
    console.log('微信音效播放失败:', error);
    // 出错时回退到合成音效
    await playSound(1200, 250, 'wechat');
  }
};

/**
 * 连续滴答音效 - 用于余额数字滚动时的连续音效
 * 使用真实的银子 MP3 文件
 */
let tickInterval: NodeJS.Timeout | null = null;
let isTicking = false;
let tickStartTime = 0;

export const startTickingSound = async (duration: number = 1000) => {
  if (!soundEnabled) return;
  
  // 防止短时间内重复触发（300ms 内不重复）
  const now = Date.now();
  if (isTicking && now - tickStartTime < 300) {
    console.log('音效正在播放中，跳过重复触发');
    return;
  }
  
  // 先停止之前的音效
  stopTickingSound();
  isTicking = true;
  tickStartTime = now;
  
  console.log('开始播放银子音效，持续时间:', duration);
  
  // 移动端使用真实 MP3
  if (Platform.OS !== 'web') {
    // 预加载银子音效
    if (!coinSound) {
      const loaded = await preloadCoinSound();
      if (!loaded) {
        console.log('银子音效预加载失败');
        isTicking = false;
        return;
      }
    }
    
    if (coinSound) {
      try {
        // 先停止当前播放
        await coinSound.stopAsync();
        await coinSound.setPositionAsync(0);
        
        // 设置循环播放模式，这样更流畅
        await coinSound.setIsLoopingAsync(true);
        
        // 开始播放
        await coinSound.playAsync();
        console.log('银子音效开始循环播放');
        
        // 在指定时间后停止
        setTimeout(async () => {
          if (coinSound && isTicking) {
            try {
              await coinSound.stopAsync();
              await coinSound.setIsLoopingAsync(false);
              console.log('银子音效循环播放停止');
            } catch (e) {
              console.log('停止音效失败:', e);
            }
          }
          isTicking = false;
        }, duration);
        
        return;
      } catch (error) {
        console.log('银子音效循环播放失败:', error);
        // 回退到原来的方式
      }
    }
  }
  
  // Web 平台或加载失败时使用合成音效
  let count = 0;
  const maxTicks = Math.floor(duration / 80);
  
  tickInterval = setInterval(() => {
    if (count >= maxTicks || !isTicking) {
      stopTickingSound();
      return;
    }
    playTickSound();
    count++;
  }, 80);
  
  // 设置超时自动停止
  setTimeout(() => {
    if (isTicking) {
      stopTickingSound();
    }
  }, duration + 500);
};

export const stopTickingSound = async () => {
  if (!isTicking && !tickInterval) return; // 已经在停止了
  
  console.log('停止银子音效');
  isTicking = false;
  tickStartTime = 0;
  
  // 停止循环播放
  if (coinSound) {
    try {
      await coinSound.stopAsync();
      await coinSound.setIsLoopingAsync(false);
    } catch (e) {
      // 忽略停止错误
    }
  }
  
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
};
