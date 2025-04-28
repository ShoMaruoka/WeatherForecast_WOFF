/**
 * 天気予報APIを扱うモジュール
 */
const WeatherAPI = (function() {
  // OpenWeatherMap APIの設定
  const API_KEY = 'afd02e0c51a74925577807b99eca2149'; // ここに実際のAPIキーを設定してください
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';
  
  // APIリクエストタイムアウト設定（ミリ秒）
  const REQUEST_TIMEOUT = 10000;
  
  // リトライ設定
  const MAX_RETRY_COUNT = 2;
  const RETRY_DELAY = 1000;
  
  /**
   * API呼び出しをラップした関数（タイムアウトとリトライ機能付き）
   * @param {string} url - リクエストURL
   * @param {Object} options - fetchオプション
   * @returns {Promise} レスポンスを含むPromiseオブジェクト
   * @private
   */
  async function _fetchWithTimeout(url, options = {}) {
    // リクエストのタイムアウト処理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // APIエラーを作成
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `API error: ${response.status}`);
        error.status = response.status;
        error.statusText = response.statusText;
        error.code = 'API_ERROR';
        error.data = errorData;
        throw error;
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        const timeoutError = new Error('APIリクエストがタイムアウトしました');
        timeoutError.code = 'TIMEOUT_ERROR';
        throw timeoutError;
      }
      
      if (!error.code) {
        error.code = 'NETWORK_ERROR';
      }
      
      throw error;
    }
  }
  
  /**
   * リトライ機能付きAPI呼び出し
   * @param {string} url - リクエストURL
   * @param {Object} options - fetchオプション
   * @returns {Promise} レスポンスを含むPromiseオブジェクト
   * @private
   */
  async function _fetchWithRetry(url, options = {}) {
    let lastError;
    
    for (let attempt = 0; attempt <= MAX_RETRY_COUNT; attempt++) {
      try {
        if (attempt > 0) {
          // リトライの場合はログに記録
          if (typeof Logger !== 'undefined') {
            Logger.warn(`APIリクエストを再試行しています (${attempt}/${MAX_RETRY_COUNT}): ${url}`);
          } else {
            console.warn(`APIリクエストを再試行しています (${attempt}/${MAX_RETRY_COUNT}): ${url}`);
          }
          
          // リトライ間隔を設定
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
        
        // リクエスト実行
        const response = await _fetchWithTimeout(url, options);
        return response;
      } catch (error) {
        lastError = error;
        
        // 特定のエラーの場合はリトライしない
        if (
          error.status === 401 || // 認証エラー
          error.status === 403 || // 権限エラー
          error.status === 404 || // リソースが見つからない
          error.code === 'VALIDATION_ERROR' // バリデーションエラー
        ) {
          break;
        }
      }
    }
    
    // すべてのリトライが失敗した場合
    throw lastError;
  }
  
  /**
   * 指定された都市の現在の天気情報を取得
   * @param {string} city - 都市名（例：'Tokyo'）
   * @returns {Promise} 天気データを含むPromiseオブジェクト
   */
  async function getCurrentWeather(city = 'Tokyo') {
    try {
      // リクエスト開始ログ
      if (typeof Logger !== 'undefined') {
        Logger.info(`現在の天気を取得しています: ${city}`);
      }
      
      const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&lang=ja&appid=${API_KEY}`;
      const response = await _fetchWithRetry(url);
      const data = await response.json();
      
      // 成功ログ
      if (typeof Logger !== 'undefined') {
        Logger.debug('天気データを取得しました', { city, data });
      }
      
      return data;
    } catch (error) {
      // エラーログ
      if (typeof Logger !== 'undefined') {
        Logger.error(`天気データの取得に失敗しました: ${city}`, error);
      } else {
        console.error('Weather API error:', error);
      }
      
      // エラーにコンテキスト情報を追加
      error.context = 'getCurrentWeather';
      error.params = { city };
      
      throw error;
    }
  }
  
  /**
   * 指定された都市の5日間予報を取得
   * @param {string} city - 都市名（例：'Tokyo'）
   * @returns {Promise} 予報データを含むPromiseオブジェクト
   */
  async function getForecast(city = 'Tokyo') {
    try {
      // リクエスト開始ログ
      if (typeof Logger !== 'undefined') {
        Logger.info(`5日間予報を取得しています: ${city}`);
      }
      
      const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&lang=ja&appid=${API_KEY}`;
      const response = await _fetchWithRetry(url);
      const data = await response.json();
      
      // 成功ログ
      if (typeof Logger !== 'undefined') {
        Logger.debug('予報データを取得しました', { 
          city, 
          forecastCount: data.list ? data.list.length : 0 
        });
      }
      
      return data;
    } catch (error) {
      // エラーログ
      if (typeof Logger !== 'undefined') {
        Logger.error(`予報データの取得に失敗しました: ${city}`, error);
      } else {
        console.error('Weather API error:', error);
      }
      
      // エラーにコンテキスト情報を追加
      error.context = 'getForecast';
      error.params = { city };
      
      throw error;
    }
  }
  
  /**
   * 天気データを整形して返す
   * @param {Object} data - API から取得した天気データ
   * @returns {Object} 整形された天気データ
   */
  function formatCurrentWeather(data) {
    try {
      const formatted = {
        location: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // m/s から km/h に変換
        timestamp: new Date(data.dt * 1000)
      };
      
      return formatted;
    } catch (error) {
      if (typeof Logger !== 'undefined') {
        Logger.error('天気データの整形に失敗しました', error);
      } else {
        console.error('Error formatting weather data:', error);
      }
      
      // 型エラーの場合は専用エラーを投げる
      if (error instanceof TypeError) {
        const formattingError = new Error('天気データのフォーマットが不正です');
        formattingError.code = 'FORMATTING_ERROR';
        formattingError.originalError = error;
        throw formattingError;
      }
      
      throw error;
    }
  }
  
  /**
   * 5日間予報データを日ごとに整形して返す
   * @param {Object} data - API から取得した予報データ
   * @returns {Array} 日ごとの予報データの配列
   */
  function formatForecast(data) {
    try {
      // 3時間ごとの予報から、日ごとの予報に変換
      const dailyForecasts = {};
      
      // 現在の日付を取得
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      // 日本時間に調整
      const japanTime = new Date(currentDate.getTime() + (9 * 60 * 60 * 1000));
      const today = japanTime.getDate();
      
      if (!data.list || !Array.isArray(data.list)) {
        throw new TypeError('予報データリストが不正です');
      }
      
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.getDate();
        
        // 今日を除いた将来の予報のみ処理
        if (day > today) {
          const dayKey = date.toISOString().split('T')[0];
          
          if (!dailyForecasts[dayKey]) {
            dailyForecasts[dayKey] = {
              date: date,
              temps: [],
              icons: [],
              conditions: []
            };
          }
          
          dailyForecasts[dayKey].temps.push(item.main.temp);
          dailyForecasts[dayKey].icons.push(item.weather[0].icon);
          dailyForecasts[dayKey].conditions.push(item.weather[0].description);
        }
      });
      
      // 各日の平均値や最頻値を計算
      return Object.values(dailyForecasts).map(day => {
        const temps = day.temps;
        const icons = day.icons;
        
        // 最も頻度の高いアイコンを取得
        const iconCounts = icons.reduce((acc, icon) => {
          acc[icon] = (acc[icon] || 0) + 1;
          return acc;
        }, {});
        
        const mostFrequentIcon = Object.keys(iconCounts).reduce((a, b) => 
          iconCounts[a] > iconCounts[b] ? a : b
        );
        
        return {
          date: day.date,
          avgTemp: Math.round(temps.reduce((sum, temp) => sum + temp, 0) / temps.length),
          icon: mostFrequentIcon
        };
      }).slice(0, 5); // 最大5日間のデータを返す
    } catch (error) {
      if (typeof Logger !== 'undefined') {
        Logger.error('予報データの整形に失敗しました', error);
      } else {
        console.error('Error formatting forecast data:', error);
      }
      
      // 型エラーの場合は専用エラーを投げる
      if (error instanceof TypeError) {
        const formattingError = new Error('予報データのフォーマットが不正です');
        formattingError.code = 'FORMATTING_ERROR';
        formattingError.originalError = error;
        throw formattingError;
      }
      
      throw error;
    }
  }
  
  /**
   * 都市名のバリデーション
   * @param {string} city - 検証する都市名
   * @returns {boolean} 有効な都市名かどうか
   */
  function validateCity(city) {
    if (!city || typeof city !== 'string') {
      return false;
    }
    
    // 基本的な文字列チェック（最低2文字以上、文字と空白のみ）
    return /^[A-Za-z\s\-,.]{2,}$/.test(city);
  }
  
  // 公開API
  return {
    getCurrentWeather,
    getForecast,
    formatCurrentWeather,
    formatForecast,
    validateCity
  };
})(); 