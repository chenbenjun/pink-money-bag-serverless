// 简单的事件总线，用于跨组件通信
class EventEmitter {
  private listeners: { [key: string]: Array<(data?: any) => void> } = {};

  on(event: string, callback: (data?: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // 返回取消订阅函数
    return () => {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    };
  }

  emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }
}

// 全局单例
export const dataChangedEmitter = new EventEmitter();

// 挂载到 global，方便设置页面访问
// @ts-ignore
if (typeof global !== 'undefined') {
  // @ts-ignore
  global.dataChangedEmitter = dataChangedEmitter;
}
