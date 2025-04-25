/**
 * WOFF SDKエラーハンドリングのためのユーティリティモジュール
 */
const WoffErrorHandler = (function() {
  // WOFF SDKエラーコード定義
  const WOFF_ERROR_CODES = {
    INIT_FAILED: '初期化に失敗しました。再度実行してください。',
    NOT_INITIALIZED: 'WOFFが初期化されていません。',
    USER_CANCELED: 'ユーザーにより操作がキャンセルされました。',
    NOT_SUPPORTED: 'この機能はサポートされていません。',
    NETWORK_ERROR: 'ネットワークエラーが発生しました。',
    INVALID_PARAMETER: 'パラメータが不正です。',
    PERMISSION_DENIED: '許可されていない操作です。',
    NOT_IN_CLIENT: 'WOFF クライアント外で実行されています。',
    TIMEOUT_ERROR: 'タイムアウトが発生しました。',
    UNKNOWN_ERROR: '不明なエラーが発生しました。'
  };
  
  /**
   * WOFFエラーを処理する
   * @param {Error} error - 処理するエラー
   * @param {string} [operation='WOFF操作'] - 実行中の操作名
   * @returns {Object} 処理後のエラー情報
   */
  function handleWoffError(error, operation = 'WOFF操作') {
    // エラーオブジェクトの作成または変換
    const woffError = {
      originalError: error,
      code: 'WOFF_ERROR',
      message: WOFF_ERROR_CODES.UNKNOWN_ERROR,
      operation,
      timestamp: new Date().toISOString()
    };
    
    // エラーコードが存在する場合は適切なメッセージに変換
    if (error && error.code) {
      woffError.code = `WOFF_${error.code}`;
      woffError.message = WOFF_ERROR_CODES[error.code] || error.message || WOFF_ERROR_CODES.UNKNOWN_ERROR;
    }
    
    // ユーザーへの表示用メッセージを設定
    woffError.userMessage = getUserFriendlyMessage(woffError);
    
    // ロギング
    if (typeof Logger !== 'undefined') {
      Logger.error(`WOFF SDK エラー (${operation}): ${woffError.message}`, error);
    } else {
      console.error(`WOFF SDK エラー (${operation}):`, error);
    }
    
    return woffError;
  }
  
  /**
   * WOFFクライアント環境かどうかをチェック
   * @returns {boolean} WOFFクライアント内であればtrue
   */
  function isInWoffClient() {
    try {
      return typeof woff !== 'undefined' && typeof woff.isInClient === 'function' && woff.isInClient();
    } catch (error) {
      if (typeof Logger !== 'undefined') {
        Logger.warn('WOFF環境チェックエラー', error);
      } else {
        console.warn('WOFF環境チェックエラー:', error);
      }
      return false;
    }
  }
  
  /**
   * WOFFエラーからユーザーフレンドリーなメッセージを生成
   * @param {Object} woffError - WOFFエラーオブジェクト
   * @returns {string} ユーザーフレンドリーなメッセージ
   */
  function getUserFriendlyMessage(woffError) {
    const error = woffError.originalError || woffError;
    
    // エラーコードに基づいたカスタムメッセージを返す
    switch (error.code) {
      case 'USER_CANCELED':
        return '操作はキャンセルされました。';
      
      case 'NOT_SUPPORTED':
        return 'この機能はお使いの環境ではサポートされていません。';
      
      case 'NETWORK_ERROR':
        return 'ネットワーク接続に問題があります。接続を確認してください。';
      
      case 'INIT_FAILED':
        return 'アプリの初期化に失敗しました。アプリを再起動してください。';
      
      case 'NOT_INITIALIZED':
        return 'アプリが正しく初期化されていません。更新してやり直してください。';
      
      case 'PERMISSION_DENIED':
        return 'この操作を実行する権限がありません。';
      
      case 'NOT_IN_CLIENT':
        return 'この機能はLINE WORKSクライアント内でのみ利用できます。';
      
      default:
        return '予期せぬエラーが発生しました。しばらくしてから再度お試しください。';
    }
  }
  
  /**
   * WOFFメッセージ送信のエラーを処理する
   * @param {Error} error - 処理するエラー
   * @returns {Object} 処理後のエラー情報
   */
  function handleMessageSendError(error) {
    return handleWoffError(error, 'メッセージ送信');
  }
  
  /**
   * WOFF初期化のエラーを処理する
   * @param {Error} error - 処理するエラー
   * @returns {Object} 処理後のエラー情報
   */
  function handleInitializationError(error) {
    return handleWoffError(error, 'WOFF初期化');
  }
  
  /**
   * メッセージ送信に必要な権限を持っているか確認
   * @returns {boolean} 権限が有効であればtrue
   */
  function checkMessagePermission() {
    // WOFFクライアント内でないなら権限なし
    if (!isInWoffClient()) return false;
    
    try {
      // 権限チェックロジックをここに追加
      // この例では簡易的に実装
      const hasPermission = typeof woff.sendMessage === 'function';
      
      if (!hasPermission && typeof Logger !== 'undefined') {
        Logger.warn('トークルームへのメッセージ送信権限がありません');
      }
      
      return hasPermission;
    } catch (error) {
      if (typeof Logger !== 'undefined') {
        Logger.error('権限チェック中にエラーが発生しました', error);
      } else {
        console.error('権限チェックエラー:', error);
      }
      return false;
    }
  }
  
  /**
   * メッセージ送信前のバリデーション
   * @param {Object} message - 送信するメッセージオブジェクト
   * @returns {boolean} 有効なメッセージであればtrue
   */
  function validateMessage(message) {
    if (!message) {
      if (typeof Logger !== 'undefined') {
        Logger.error('メッセージが未定義です');
      }
      return false;
    }
    
    if (typeof message !== 'object') {
      if (typeof Logger !== 'undefined') {
        Logger.error('メッセージがオブジェクト形式ではありません');
      }
      return false;
    }
    
    // 簡易的なバリデーション
    const isFlexMessage = message.flex || message.contentType === 'flex';
    const isTextMessage = message.content || message.contentType === 'text';
    
    if (!isFlexMessage && !isTextMessage) {
      if (typeof Logger !== 'undefined') {
        Logger.error('有効なメッセージ形式ではありません');
      }
      return false;
    }
    
    return true;
  }
  
  /**
   * WOFF SDKの状態をログに記録
   */
  function logWoffStatus() {
    if (typeof woff === 'undefined') {
      if (typeof Logger !== 'undefined') {
        Logger.warn('WOFF SDKが利用できません');
      }
      return;
    }
    
    try {
      const status = {
        isInClient: typeof woff.isInClient === 'function' ? woff.isInClient() : 'unknown',
        os: typeof woff.getOS === 'function' ? woff.getOS() : 'unknown',
        version: typeof woff.getVersion === 'function' ? woff.getVersion() : 'unknown',
        worksVersion: typeof woff.getWorksVersion === 'function' ? woff.getWorksVersion() : 'unknown',
        language: typeof woff.getLanguage === 'function' ? woff.getLanguage() : 'unknown'
      };
      
      if (typeof Logger !== 'undefined') {
        Logger.info('WOFF環境の情報', status);
      } else {
        console.info('WOFF環境の情報:', status);
      }
    } catch (error) {
      if (typeof Logger !== 'undefined') {
        Logger.error('WOFF状態取得中にエラーが発生しました', error);
      } else {
        console.error('WOFF状態取得エラー:', error);
      }
    }
  }
  
  // 公開API
  return {
    handleWoffError,
    handleMessageSendError,
    handleInitializationError,
    isInWoffClient,
    checkMessagePermission,
    validateMessage,
    logWoffStatus,
    WOFF_ERROR_CODES
  };
})(); 