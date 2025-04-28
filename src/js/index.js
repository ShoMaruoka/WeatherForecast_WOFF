/**
 * 天気予報WOFF アプリケーション
 */
(function() {
  // import文を削除 - これがエラーの原因です

  // 状態管理変数
  let weatherData = null;
  let isSending = false;
  
  // WOFF IDの設定
  const WOFF_ID = 'DXwa5Y8_qG-qRGko8omaAQ'; // ここに実際のWOFF IDを設定
  
  // デフォルトの都市
  const DEFAULT_CITY = 'Tokyo';
  
  // 現在の天気データとフォーキャストデータ
  let currentWeatherData = null;
  let forecastData = null;

  // DOMが読み込まれた後に実行
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Weather Forecast App initialized');
    
    // WOFF初期化を確認
    if (typeof woff !== 'undefined') {
      // アプリの初期化
      init();
    } else {
      console.error('WOFF SDKが読み込まれていません');
      // エラーメッセージ表示
      const loaderElement = document.getElementById('loader');
      if (loaderElement) {
        loaderElement.textContent = 'WOFF SDKの読み込みに失敗しました';
      }
    }
  });

  /**
   * アプリケーションの初期化
   */
  function init() {
    console.log('Initializing WOFF app...');
    
    // WOFFの初期化
    woff.init({
      woffId: WOFF_ID
    })
    .then(() => {
      console.log('WOFF initialized successfully');
      
      // 天気データの読み込み
      loadWeatherData();
      
      // イベントリスナーの設定
      setupEventListeners();
      
      // 環境情報の表示
      updateEnvironmentInfo();
    })
    .catch(err => {
      console.error('WOFF initialization failed:', err);
      Helpers.showError(`WOFF初期化エラー: ${err.message}`);
    });
  }

  /**
   * 実行環境の情報を表示
   */
  function updateEnvironmentInfo() {
    // WOFFクライアント内で実行されているか確認
    const isInWOFFClient = woff.isInClient();
    
    // 環境情報の要素を取得
    const envInfoElement = document.getElementById('environment-info');
    if (!envInfoElement) return;
    
    // 環境情報を表示
    envInfoElement.innerHTML = `
      <span class="env-badge ${isInWOFFClient ? 'env-badge-success' : 'env-badge-warning'}">
        ${isInWOFFClient ? 'LINE WORKS内' : 'ブラウザ'}で実行中
      </span>
    `;
    
    // スタイルの追加
    const style = document.createElement('style');
    style.textContent = `
      .env-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 12px;
      }
      .env-badge-success {
        background-color: rgba(76, 175, 80, 0.2);
        color: #4caf50;
      }
      .env-badge-warning {
        background-color: rgba(255, 152, 0, 0.2);
        color: #ff9800;
      }
    `;
    document.head.appendChild(style);
    
    // 送信ボタンの状態を更新
    updateSendButtonState(isInWOFFClient);
  }
  
  /**
   * 送信ボタンの状態を更新
   * @param {boolean} isInWOFFClient - WOFFクライアント内で実行されているか
   */
  function updateSendButtonState(isInWOFFClient) {
    const sendButton = document.getElementById('send-to-talk');
    if (!sendButton) return;
    
    if (!isInWOFFClient) {
      // LINE WORKS外で実行されている場合
      sendButton.classList.add('btn-disabled');
      sendButton.setAttribute('disabled', 'disabled');
      sendButton.setAttribute('title', 'この機能はLINE WORKS内でのみ利用可能です');
      
      // 補足情報を追加
      const infoText = document.createElement('div');
      infoText.className = 'info-text';
      infoText.textContent = 'この機能はLINE WORKS内でのみ利用可能です';
      infoText.style.fontSize = '12px';
      infoText.style.color = 'var(--text-light)';
      infoText.style.marginTop = '8px';
      
      const actionsSection = document.querySelector('.actions');
      if (actionsSection && !actionsSection.querySelector('.info-text')) {
        actionsSection.appendChild(infoText);
      }
    }
  }
  
  /**
   * 天気データの読み込み
   */
  async function loadWeatherData() {
    try {
      WeatherView.displayLoading();
      
      // 現在の天気を取得
      const currentWeatherResponse = await WeatherAPI.getCurrentWeather(DEFAULT_CITY);
      currentWeatherData = WeatherAPI.formatCurrentWeather(currentWeatherResponse);
      
      // 週間予報を取得
      const forecastResponse = await WeatherAPI.getForecast(DEFAULT_CITY);
      forecastData = WeatherAPI.formatForecast(forecastResponse);
      
      // UIに表示
      WeatherView.displayCurrentWeather(currentWeatherData);
      WeatherView.displayForecast(forecastData);
      
      // データの更新時刻を表示
      updateLastUpdatedTime();
      
    } catch (error) {
      console.error('Failed to load weather data:', error);
      WeatherView.displayError(error);
    }
  }
  
  /**
   * データの最終更新時刻を表示
   */
  function updateLastUpdatedTime() {
    if (!currentWeatherData) return;
    
    const lastUpdatedElem = document.getElementById('last-updated');
    if (lastUpdatedElem) {
      const relativeTime = Helpers.getRelativeTime(currentWeatherData.timestamp);
      lastUpdatedElem.textContent = `最終更新: ${relativeTime}`;
    }
  }
  
  /**
   * イベントリスナーの設定
   */
  function setupEventListeners() {
    // トークに送信ボタンのイベントリスナー
    const sendToTalkButton = document.getElementById('send-to-talk');
    if (sendToTalkButton) {
      sendToTalkButton.addEventListener('click', handleSendWeatherToTalk);
    }
    
    // 更新ボタンのイベントリスナー
    const refreshButton = document.getElementById('refresh-weather');
    if (refreshButton) {
      refreshButton.addEventListener('click', handleRefreshWeather);
    }
  }
  
  /**
   * 天気データの更新処理
   */
  function handleRefreshWeather() {
    loadWeatherData();
    
    // ボタンにアニメーション効果を追加
    const refreshButton = document.getElementById('refresh-weather');
    if (refreshButton) {
      refreshButton.classList.add('rotating');
      setTimeout(() => {
        refreshButton.classList.remove('rotating');
      }, 1000);
    }
  }
  
  /**
   * 送信ボタンクリック時の処理
   */
  async function handleSendWeatherToTalk() {
    // すでに送信中の場合は処理しない
    if (isSending) return;
    
    // WOFFクライアント内で実行されているか確認
    if (!woff.isInClient()) {
      Helpers.showError('この機能はLINE WORKS内でのみ利用可能です');
      return;
    }
    
    // 天気データがロードされていることを確認
    if (!currentWeatherData || !forecastData) {
      Helpers.showError('天気データがロードされていません。再度お試しください');
      return;
    }
    
    try {
      // 送信状態を更新
      isSending = true;
      updateSendButtonToLoading(true);
      
      // FlexMessageの作成
      const flexMessage = WeatherView.createWeatherFlexMessage(currentWeatherData, forecastData);
      
      // トークルームにメッセージを送信
      await woff.sendFlexMessage({
        flex: flexMessage
      });
      
      // 成功通知
      showSuccessToast('トークルームに天気情報を送信しました');
      
    } catch (error) {
      console.error('Failed to send message:', error);
      Helpers.showError(`メッセージ送信エラー: ${error.message}`);
    } finally {
      // 送信状態をリセット
      isSending = false;
      updateSendButtonToLoading(false);
    }
  }
  
  /**
   * 送信ボタンの表示状態を更新
   * @param {boolean} isLoading - 読み込み中かどうか
   */
  function updateSendButtonToLoading(isLoading) {
    const sendButton = document.getElementById('send-to-talk');
    if (!sendButton) return;
    
    if (isLoading) {
      // 元のテキストを保存
      sendButton.setAttribute('data-original-text', sendButton.textContent);
      sendButton.innerHTML = '<span class="btn-loader"></span> 送信中...';
      sendButton.classList.add('btn-loading');
    } else {
      // 元のテキストを復元
      const originalText = sendButton.getAttribute('data-original-text') || 'トークに送信';
      sendButton.textContent = originalText;
      sendButton.classList.remove('btn-loading');
    }
  }
  
  /**
   * 成功トーストを表示
   * @param {string} message - 表示するメッセージ
   */
  function showSuccessToast(message) {
    // 既存のトーストがあれば削除
    const existingToast = document.querySelector('.success-toast');
    if (existingToast) {
      document.body.removeChild(existingToast);
    }
    
    // トースト要素を作成
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
      <div class="toast-icon">✓</div>
      <div class="toast-message">${message}</div>
    `;
    
    // スタイルを設定
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(76, 175, 80, 0.9)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: '1000',
      display: 'flex',
      alignItems: 'center',
      maxWidth: '90%',
      opacity: '0',
      transition: 'opacity 0.3s ease-in-out'
    });
    
    // アイコンのスタイル
    const icon = toast.querySelector('.toast-icon');
    Object.assign(icon.style, {
      marginRight: '12px',
      fontWeight: 'bold'
    });
    
    // body要素に追加
    document.body.appendChild(toast);
    
    // トーストを表示
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 10);
    
    // 3秒後に自動的に消える
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
})(); 