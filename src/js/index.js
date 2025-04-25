/**
 * 天気予報WOFF アプリケーション
 */
(function() {
  import { getWeatherData } from './weather.js';
  import { formatWeatherData } from './format.js';
  import { renderWeatherCard } from './ui.js';

  // 状態管理変数
  let weatherData = null;
  let isSending = false;

  // DOMが読み込まれた後に実行
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Weather Forecast App initialized');
    
    // 環境情報を更新
    updateEnvironmentInfo();
    
    // 天気データを読み込む
    loadWeatherData();
    
    // 更新ボタンのイベントリスナーを設定
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
      refreshButton.addEventListener('click', handleRefresh);
    }
    
    // 送信ボタンのイベントリスナーを設定
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
      sendButton.addEventListener('click', handleSendWeatherToTalk);
    }
  });

  /**
   * 環境情報を更新し、UIに表示する
   */
  function updateEnvironmentInfo() {
    const infoContainer = document.createElement('div');
    infoContainer.className = 'environment-info';
    
    const environmentBadge = document.createElement('span');
    environmentBadge.className = 'badge';
    
    // LINE WORKSクライアント内で実行されているか確認
    const isInLINEWORKS = typeof woff !== 'undefined';
    
    if (isInLINEWORKS) {
      environmentBadge.textContent = 'LINE WORKS';
      environmentBadge.classList.add('badge-success');
    } else {
      environmentBadge.textContent = 'ブラウザ';
      environmentBadge.classList.add('badge-warning');
    }
    
    infoContainer.appendChild(environmentBadge);
    
    // 送信ボタンの状態を更新
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
      if (!isInLINEWORKS) {
        sendButton.classList.add('btn-disabled');
        sendButton.title = 'LINE WORKSクライアント内でのみ利用できます';
      } else {
        sendButton.classList.remove('btn-disabled');
        sendButton.title = '天気情報をトークルームに送信';
      }
    }
    
    // 既存のステータスバーに追加
    const statusBar = document.querySelector('.status-bar');
    if (statusBar) {
      // 既存の環境情報を削除
      const existingInfo = statusBar.querySelector('.environment-info');
      if (existingInfo) {
        existingInfo.remove();
      }
      statusBar.appendChild(infoContainer);
    } else {
      // ステータスバーがなければ作成
      const newStatusBar = document.createElement('div');
      newStatusBar.className = 'status-bar';
      newStatusBar.appendChild(infoContainer);
      
      const container = document.querySelector('.container');
      const weatherCard = document.querySelector('.weather-card');
      if (container && weatherCard) {
        container.insertBefore(newStatusBar, weatherCard);
      }
    }
  }

  /**
   * 天気データを読み込み、UIを更新する
   */
  async function loadWeatherData() {
    try {
      // ローディング表示
      const weatherCard = document.querySelector('.weather-card');
      if (weatherCard) {
        weatherCard.classList.add('loading');
      }
      
      // 天気データを取得
      weatherData = await getWeatherData();
      console.log('Weather data loaded:', weatherData);
      
      // フォーマットして表示
      const formattedData = formatWeatherData(weatherData);
      renderWeatherCard(formattedData);
      
      // 最終更新時間を更新
      updateLastUpdatedTime();
      
      // ローディング表示を削除
      if (weatherCard) {
        weatherCard.classList.remove('loading');
      }
    } catch (error) {
      console.error('Failed to load weather data:', error);
      
      // エラーメッセージを表示
      const errorElement = document.getElementById('error-message');
      if (errorElement) {
        errorElement.textContent = '天気データの読み込みに失敗しました。';
        errorElement.style.display = 'block';
      }
      
      // ローディング表示を削除
      const weatherCard = document.querySelector('.weather-card');
      if (weatherCard) {
        weatherCard.classList.remove('loading');
      }
    }
  }

  /**
   * 最終更新時間を更新する
   */
  function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ja-JP');
    
    let lastUpdatedElement = document.querySelector('.last-updated');
    
    if (!lastUpdatedElement) {
      // 最終更新時間の要素がなければ作成
      lastUpdatedElement = document.createElement('div');
      lastUpdatedElement.className = 'last-updated';
      
      // ステータスバーに追加
      const statusBar = document.querySelector('.status-bar');
      if (statusBar) {
        statusBar.prepend(lastUpdatedElement);
      } else {
        // ステータスバーがなければ作成
        const newStatusBar = document.createElement('div');
        newStatusBar.className = 'status-bar';
        newStatusBar.appendChild(lastUpdatedElement);
        
        const container = document.querySelector('.container');
        const weatherCard = document.querySelector('.weather-card');
        if (container && weatherCard) {
          container.insertBefore(newStatusBar, weatherCard);
        }
      }
    }
    
    lastUpdatedElement.textContent = `最終更新: ${timeString}`;
  }

  /**
   * 更新ボタンのクリックハンドラ
   */
  function handleRefresh() {
    const refreshButton = document.getElementById('refresh-button');
    
    // ボタンに回転アニメーションを追加
    if (refreshButton) {
      refreshButton.classList.add('rotating');
      
      // アニメーション終了後にクラスを削除
      setTimeout(() => {
        refreshButton.classList.remove('rotating');
      }, 1000);
    }
    
    // 天気データを再読み込み
    loadWeatherData();
  }

  /**
   * トークルームへの送信ボタンのクリックハンドラ
   */
  async function handleSendWeatherToTalk() {
    // 送信中または非LINE WORKS環境の場合は何もしない
    if (isSending || typeof woff === 'undefined') {
      return;
    }
    
    const sendButton = document.getElementById('send-button');
    
    try {
      // 送信中の状態にする
      isSending = true;
      
      if (sendButton) {
        sendButton.classList.add('btn-loading');
        sendButton.innerHTML = '<span class="btn-loader"></span>送信中...';
      }
      
      // 天気データがない場合は取得
      if (!weatherData) {
        await loadWeatherData();
      }
      
      // フォーマットされた天気データを取得
      const formattedData = formatWeatherData(weatherData);
      
      // WOFF SDKを使ってトークルームにメッセージを送信
      const message = createWeatherMessage(formattedData);
      
      // LINE WORKS SDKを使った送信処理
      await sendMessageToTalk(message);
      
      // 成功メッセージを表示
      showSuccessToast('天気情報をトークルームに送信しました');
      
    } catch (error) {
      console.error('Failed to send weather data to talk:', error);
      
      // エラーメッセージを表示
      showErrorToast('送信に失敗しました: ' + error.message);
      
    } finally {
      // 送信状態を解除
      isSending = false;
      
      if (sendButton) {
        sendButton.classList.remove('btn-loading');
        sendButton.textContent = 'トークに送信';
      }
    }
  }

  /**
   * 天気データからメッセージを作成
   * @param {Object} formattedWeather - フォーマットされた天気データ
   * @returns {Object} - LINE WORKSのメッセージオブジェクト
   */
  function createWeatherMessage(formattedWeather) {
    // 天気アイコンのURL
    const iconUrl = formattedWeather.iconUrl || './images/weather/unknown.png';
    
    // 現在地と日付
    const locationDate = `${formattedWeather.cityName} - ${formattedWeather.date}`;
    
    // 天気情報のテキスト
    const weatherText = [
      `${formattedWeather.description}`,
      `🌡️ 気温: ${formattedWeather.temperature}°C (体感: ${formattedWeather.feelsLike}°C)`,
      `💧 湿度: ${formattedWeather.humidity}%`,
      `🌬️ 風: ${formattedWeather.windSpeed}m/s (${formattedWeather.windDirection})`,
      `☁️ 雲量: ${formattedWeather.clouds}%`,
      `👁️ 視界: ${formattedWeather.visibility}km`
    ].join('\n');
    
    // LINE WORKSのFlexメッセージ形式のオブジェクトを作成
    const message = {
      contentType: 'flex',
      contentValue: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '天気予報',
              weight: 'bold',
              size: 'xl',
              color: '#ffffff'
            },
            {
              type: 'text',
              text: locationDate,
              size: 'sm',
              color: '#ffffff',
              margin: 'md'
            }
          ],
          backgroundColor: '#5c6bc0'
        },
        hero: {
          type: 'image',
          url: iconUrl,
          size: 'lg',
          aspectRatio: '1:1',
          aspectMode: 'fit'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: weatherText,
              wrap: true,
              size: 'md'
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '※ OpenWeatherMapのデータを元に作成',
              size: 'xs',
              color: '#aaaaaa',
              align: 'center'
            }
          ]
        }
      }
    };
    
    return message;
  }

  /**
   * LINE WORKS SDKを使ってトークルームにメッセージを送信
   * @param {Object} message - 送信するメッセージオブジェクト
   * @returns {Promise} - 送信結果のPromise
   */
  async function sendMessageToTalk(message) {
    return new Promise((resolve, reject) => {
      try {
  // WOFF IDの設定
  const WOFF_ID = 'YOUR_WOFF_ID'; // ここに実際のWOFF IDを設定
  
  // デフォルトの都市
  const DEFAULT_CITY = 'Tokyo';
  
  // 現在の天気データとフォーキャストデータ
  let currentWeatherData = null;
  let forecastData = null;
  
  // 送信状態の管理
  let isSending = false;
  
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
  
  // DOMContentLoaded イベントでアプリを初期化
  document.addEventListener('DOMContentLoaded', init);
})(); 