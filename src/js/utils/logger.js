/**
 * ロギングと例外処理のためのユーティリティモジュール
 */
const Logger = (function() {
  // ログレベルの定義
  const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
  };
  
  // 現在のログレベル（デフォルトはINFO）
  let currentLogLevel = LOG_LEVELS.INFO;
  
  // ログ履歴の保存先
  const logHistory = [];
  const MAX_LOG_HISTORY = 100;
  
  // デバッグモード
  let isDebugMode = false;
  
  /**
   * ログレベルを設定
   * @param {string|number} level - 設定するログレベル
   */
  function setLogLevel(level) {
    if (typeof level === 'string') {
      level = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
    }
    currentLogLevel = level;
    debug(`ログレベルを ${getLogLevelName(level)} に設定しました`);
  }
  
  /**
   * デバッグモードの設定
   * @param {boolean} enabled - 有効にするかどうか
   */
  function setDebugMode(enabled) {
    isDebugMode = enabled;
    debug(`デバッグモードを ${enabled ? '有効' : '無効'} にしました`);
  }
  
  /**
   * ログレベル名を取得
   * @param {number} level - ログレベル番号
   * @returns {string} ログレベル名
   */
  function getLogLevelName(level) {
    for (const key in LOG_LEVELS) {
      if (LOG_LEVELS[key] === level) {
        return key;
      }
    }
    return 'UNKNOWN';
  }
  
  /**
   * ログを記録
   * @param {string} message - ログメッセージ
   * @param {number} level - ログレベル
   * @param {Object} [data] - 追加データ
   * @private
   */
  function _log(message, level, data = null) {
    if (level < currentLogLevel) return;
    
    const timestamp = new Date().toISOString();
    const levelName = getLogLevelName(level);
    
    // ログエントリを作成
    const logEntry = {
      timestamp,
      level: levelName,
      message,
      data
    };
    
    // コンソールに出力
    const consoleMethod = level === LOG_LEVELS.ERROR ? 'error' : 
                         level === LOG_LEVELS.WARN ? 'warn' :
                         level === LOG_LEVELS.INFO ? 'info' : 'log';
    
    if (data) {
      console[consoleMethod](`[${timestamp}] [${levelName}] ${message}`, data);
    } else {
      console[consoleMethod](`[${timestamp}] [${levelName}] ${message}`);
    }
    
    // ログ履歴に追加
    logHistory.push(logEntry);
    if (logHistory.length > MAX_LOG_HISTORY) {
      logHistory.shift();
    }
    
    // セッションストレージにもログを保存（デバッグモードの場合のみ）
    if (isDebugMode && typeof sessionStorage !== 'undefined') {
      try {
        const storedLogs = JSON.parse(sessionStorage.getItem('appLogs') || '[]');
        storedLogs.push(logEntry);
        if (storedLogs.length > MAX_LOG_HISTORY) {
          storedLogs.shift();
        }
        sessionStorage.setItem('appLogs', JSON.stringify(storedLogs));
      } catch (e) {
        console.error('ログの保存に失敗しました:', e);
      }
    }
  }
  
  /**
   * デバッグレベルのログを記録
   * @param {string} message - ログメッセージ
   * @param {Object} [data] - 追加データ
   */
  function debug(message, data) {
    _log(message, LOG_LEVELS.DEBUG, data);
  }
  
  /**
   * 情報レベルのログを記録
   * @param {string} message - ログメッセージ
   * @param {Object} [data] - 追加データ
   */
  function info(message, data) {
    _log(message, LOG_LEVELS.INFO, data);
  }
  
  /**
   * 警告レベルのログを記録
   * @param {string} message - ログメッセージ
   * @param {Object} [data] - 追加データ
   */
  function warn(message, data) {
    _log(message, LOG_LEVELS.WARN, data);
  }
  
  /**
   * エラーレベルのログを記録
   * @param {string} message - エラーメッセージ
   * @param {Error|Object} [error] - エラーオブジェクトまたは追加データ
   */
  function error(message, error) {
    let errorData = null;
    
    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      };
    } else if (error) {
      errorData = error;
    }
    
    _log(message, LOG_LEVELS.ERROR, errorData);
  }
  
  /**
   * ログ履歴を取得
   * @returns {Array} ログ履歴の配列
   */
  function getLogHistory() {
    return [...logHistory];
  }
  
  /**
   * ログ履歴をクリア
   */
  function clearLogHistory() {
    logHistory.length = 0;
    if (isDebugMode && typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('appLogs');
    }
    debug('ログ履歴をクリアしました');
  }
  
  /**
   * エラー処理
   * @param {Error} error - 処理するエラー
   * @param {string} [context] - エラーが発生したコンテキスト
   * @param {boolean} [showToast=true] - エラートーストを表示するかどうか
   * @returns {Error} 元のエラー
   */
  function handleError(error, context = '', showToast = true) {
    // エラーログ記録
    const errorMessage = context 
      ? `${context}で${error.message || 'エラーが発生しました'}`
      : error.message || 'エラーが発生しました';
    
    this.error(errorMessage, error);
    
    // UIにエラー通知を表示
    if (showToast && typeof Helpers !== 'undefined' && Helpers.showError) {
      Helpers.showError(errorMessage);
    }
    
    // エラーサマリーをコンソールに表示（詳細なスタックトレースを含む）
    console.groupCollapsed(`エラー詳細: ${errorMessage}`);
    console.error(error);
    if (error.stack) {
      console.error('スタックトレース:', error.stack);
    }
    console.groupEnd();
    
    return error; // 元のエラーを返すことで、呼び出し元でさらに処理可能
  }
  
  /**
   * アプリケーション起動時に実行する初期設定
   */
  function initErrorHandling() {
    // グローバルのエラーハンドラーを登録
    window.addEventListener('error', function(event) {
      handleError(event.error || new Error(event.message), 'グローバル例外ハンドラー');
      // デフォルトの処理は継続（falseを返さない）
    });
    
    // Promiseエラーのハンドラーを登録
    window.addEventListener('unhandledrejection', function(event) {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      handleError(error, 'Promiseの未処理エラー');
    });
    
    info('グローバルエラーハンドリングを初期化しました');
    
    // デバッグモードの自動検出
    if (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.search.includes('debug=true')
    ) {
      setDebugMode(true);
      setLogLevel('DEBUG');
    }
  }
  
  /**
   * エラーデータからユーザーフレンドリーなメッセージを生成
   * @param {Error|Object} error - エラーオブジェクト
   * @returns {string} ユーザーフレンドリーなエラーメッセージ
   */
  function getUserFriendlyErrorMessage(error) {
    // エラーコードがあればそれに応じたメッセージを返す
    if (error.code) {
      switch (error.code) {
        case 'NETWORK_ERROR':
          return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
        case 'API_ERROR':
          return '天気情報の取得に失敗しました。しばらくしてからもう一度お試しください。';
        case 'WOFF_INIT_ERROR':
          return 'LINE WORKS接続に問題が発生しました。アプリを再起動してください。';
        case 'AUTH_ERROR':
          return '認証エラーが発生しました。再度ログインしてください。';
        default:
          // 不明なエラーコード
          break;
      }
    }
    
    // エラーの種類に応じたデフォルトメッセージ
    if (error instanceof TypeError) {
      return 'データ形式に問題があります。開発者にお問い合わせください。';
    } else if (error instanceof SyntaxError) {
      return 'データの解析に失敗しました。開発者にお問い合わせください。';
    } else if (error instanceof ReferenceError || error instanceof EvalError) {
      return 'アプリケーションエラーが発生しました。開発者にお問い合わせください。';
    } else if (error.message && typeof error.message === 'string') {
      return error.message;
    }
    
    // デフォルトのエラーメッセージ
    return 'エラーが発生しました。しばらくしてからもう一度お試しください。';
  }
  
  // 公開API
  return {
    LOG_LEVELS,
    setLogLevel,
    setDebugMode,
    debug,
    info,
    warn,
    error,
    getLogHistory,
    clearLogHistory,
    handleError,
    initErrorHandling,
    getUserFriendlyErrorMessage
  };
})();

// 自動初期化
document.addEventListener('DOMContentLoaded', function() {
  Logger.initErrorHandling();
  Logger.info('ロガーが初期化されました');
}); 