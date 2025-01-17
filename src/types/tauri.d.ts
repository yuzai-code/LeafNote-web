declare module '@tauri-apps/api' {
  export namespace core {
    function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T>;
  }
} 