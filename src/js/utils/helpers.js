/**
 * アプリケーション共通のヘルパー関数モジュール
 */
const Helpers = (function() {
  /**
   * エラーメッセージをトースト表示する
   * @param {string} message - エラーメッセージ
   * @param {number} [duration=3000] - 表示時間（ミリ秒）
   */
  function showError(message, duration = 3000) {
    // 既存のトーストを削除
    const existingToast = document.querySelector('.error-toast');
    if (existingToast) {
      document.body.removeChild(existingToast);
    }
    
    // トースト要素を作成
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    
    // スタイル設定
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#f44336';
    toast.style.color = 'white';
    toast.style.padding = '15px 20px';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    toast.style.zIndex = '1000';
    
    // DOMに追加
    document.body.appendChild(toast);
    
    // 指定時間後に削除
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, duration);
  }
  
  /**
   * 指定したIDの要素のテキストを設定する
   * @param {string} elementId - 対象要素のID
   * @param {string} text - 設定するテキスト
   */
  function setText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
    }
  }
  
  /**
   * 指定したIDの要素の属性を設定する
   * @param {string} elementId - 対象要素のID
   * @param {string} attributeName - 属性名
   * @param {string} value - 属性値
   */
  function setAttribute(elementId, attributeName, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute(attributeName, value);
    }
  }
  
  /**
   * 指定したIDの要素の子要素をすべて削除する
   * @param {string} elementId - 対象要素のID
   */
  function clearChildren(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  }
  
  /**
   * 表示非表示を切り替える
   * @param {string} elementId - 対象要素のID
   * @param {boolean} show - 表示するかどうか
   */
  function toggleDisplay(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = show ? 'block' : 'none';
    }
  }
  
  /**
   * Unix timestampを日付文字列に変換
   * @param {number} timestamp - Unix timestamp（秒）
   * @param {boolean} [includeTime=false] - 時間も含めるかどうか
   * @returns {string} フォーマットされた日付文字列
   */
  function formatDate(timestamp, includeTime = false) {
    if (!timestamp) return '不明';
    
    const date = new Date(timestamp * 1000);
    
    // 曜日配列
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];
    
    if (includeTime) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month}月${day}日（${weekday}） ${hours}:${minutes}`;
    }
    
    return `${month}月${day}日（${weekday}）`;
  }
  
  /**
   * 日付から日本語の曜日を取得
   * @param {Date|number} date - 日付オブジェクトまたはUnixタイムスタンプ
   * @returns {string} 日本語の曜日
   */
  function getJapaneseDayOfWeek(date) {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    
    // Dateオブジェクトに変換
    const dateObj = date instanceof Date ? date : new Date(typeof date === 'number' ? date * 1000 : date);
    
    // 曜日を取得（0:日曜日、1:月曜日...）
    const dayIndex = dateObj.getDay();
    
    return weekdays[dayIndex];
  }
  
  /**
   * ケルビンを摂氏に変換
   * @param {number} kelvin - ケルビン温度
   * @returns {number} 摂氏温度（整数）
   */
  function kelvinToCelsius(kelvin) {
    if (typeof kelvin !== 'number') return null;
    return Math.round(kelvin - 273.15);
  }
  
  /**
   * 風向き（角度）を方角に変換
   * @param {number} degrees - 風向き（角度）
   * @returns {string} 方角（16方位）
   */
  function formatWindDirection(degrees) {
    if (typeof degrees !== 'number') return '不明';
    
    // 16方位の配列
    const directions = [
      '北', '北北東', '北東', '東北東', 
      '東', '東南東', '南東', '南南東',
      '南', '南南西', '南西', '西南西', 
      '西', '西北西', '北西', '北北西'
    ];
    
    // 角度を16方位にマッピング
    const index = Math.round(degrees / 22.5);
    return directions[index % 16];
  }
  
  /**
   * メートル単位の視界をキロメートルに変換
   * @param {number} meters - メートル単位の視界
   * @returns {string} キロメートル単位の視界（小数点1桁）
   */
  function formatVisibility(meters) {
    if (typeof meters !== 'number') return '不明';
    
    const kilometers = meters / 1000;
    return kilometers.toFixed(1);
  }
  
  /**
   * 風速を整形して表示用に変換
   * @param {number} speed - 風速（m/s）
   * @returns {string} 整形された風速
   */
  function formatWindSpeed(speed) {
    if (typeof speed !== 'number') return '不明';
    return `${speed.toFixed(1)}m/s`;
  }
  
  /**
   * 湿度を整形して表示用に変換
   * @param {number} humidity - 湿度（%）
   * @returns {string} 整形された湿度
   */
  function formatHumidity(humidity) {
    if (typeof humidity !== 'number') return '不明';
    return `${humidity}%`;
  }
  
  /**
   * 天気アイコンのURLを生成
   * @param {string} iconCode - OpenWeatherMapのアイコンコード
   * @param {boolean} [useCdn=false] - CDN URLを使用するかどうか
   * @returns {string} アイコンのURL
   */
  function getWeatherIconUrl(iconCode, useCdn = false) {
    if (!iconCode) return '';
    
    // アイコンコードからdまたはnの部分のみを抽出
    const iconBase = iconCode.replace(/[0-9]/g, '');
    const iconNumber = iconCode.replace(/[dn]/g, '');
    
    if (useCdn) {
      // OpenWeatherMapのCDNからアイコンを取得
      return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    } else {
      // ローカルに保存されたアイコンを使用
      return `public/images/weather/${iconNumber}${iconBase}.png`;
    }
  }
  
  /**
   * 要素のローディング状態を設定
   * @param {HTMLElement} element - 対象の要素
   * @param {boolean} isLoading - ローディング中かどうか
   */
  function setLoading(element, isLoading) {
    if (!element) return;
    
    if (isLoading) {
      element.classList.add('loading');
      
      // 既存のローダーがなければ作成
      if (!element.querySelector('.loader')) {
        const loader = document.createElement('div');
        loader.className = 'loader';
        element.appendChild(loader);
      }
    } else {
      element.classList.remove('loading');
      
      // ローダーを削除
      const loader = element.querySelector('.loader');
      if (loader) {
        loader.remove();
      }
    }
  }
  
  /**
   * ボタンのローディング状態を設定
   * @param {HTMLButtonElement} button - 対象のボタン
   * @param {boolean} isLoading - ローディング中かどうか
   * @param {string} [loadingText='処理中...'] - ローディング中のテキスト
   */
  function setButtonLoading(button, isLoading, loadingText = '処理中...') {
    if (!button) return;
    
    if (isLoading) {
      // 元のテキストを保存
      button.setAttribute('data-original-text', button.textContent);
      button.innerHTML = `<span class="btn-loader"></span>${loadingText}`;
      button.classList.add('btn-loading');
      button.disabled = true;
    } else {
      // 元のテキストを復元
      const originalText = button.getAttribute('data-original-text') || '';
      button.textContent = originalText;
      button.classList.remove('btn-loading');
      button.disabled = false;
    }
  }
  
  /**
   * URLパラメータを取得
   * @param {string} name - パラメータ名
   * @returns {string|null} パラメータの値、存在しない場合はnull
   */
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
  
  /**
   * ブラウザがダークモードかどうかを取得
   * @returns {boolean} ダークモードの場合true
   */
  function isDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  /**
   * 要素を指定時間で非表示にするアニメーション
   * @param {HTMLElement} element - 対象要素
   * @param {number} [duration=300] - アニメーション時間（ミリ秒）
   * @returns {Promise} アニメーション完了後に解決するPromise
   */
  function fadeOut(element, duration = 300) {
    return new Promise(resolve => {
      if (!element) {
        resolve();
        return;
      }
      
      // トランジションを設定
      element.style.transition = `opacity ${duration}ms ease-out`;
      element.style.opacity = '0';
      
      // アニメーション完了後に要素を非表示
      setTimeout(() => {
        element.style.display = 'none';
        resolve();
      }, duration);
    });
  }
  
  /**
   * 要素を指定時間で表示するアニメーション
   * @param {HTMLElement} element - 対象要素
   * @param {number} [duration=300] - アニメーション時間（ミリ秒）
   * @returns {Promise} アニメーション完了後に解決するPromise
   */
  function fadeIn(element, duration = 300) {
    return new Promise(resolve => {
      if (!element) {
        resolve();
        return;
      }
      
      // 表示設定
      element.style.opacity = '0';
      element.style.display = '';
      
      // 一度レイアウトを強制的に計算させる
      void element.offsetWidth;
      
      // トランジションを設定
      element.style.transition = `opacity ${duration}ms ease-in`;
      element.style.opacity = '1';
      
      // アニメーション完了後に解決
      setTimeout(resolve, duration);
    });
  }
  
  /**
   * デバイスのタイプを取得
   * @returns {string} デバイスタイプ ('mobile', 'tablet', 'desktop')
   */
  function getDeviceType() {
    const width = window.innerWidth;
    
    if (width < 768) {
      return 'mobile';
    } else if (width < 1024) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }
  
  // 公開API
  return {
    showError,
    setText,
    setAttribute,
    clearChildren,
    toggleDisplay,
    formatDate,
    getJapaneseDayOfWeek,
    kelvinToCelsius,
    formatWindDirection,
    formatVisibility,
    formatWindSpeed,
    formatHumidity,
    getWeatherIconUrl,
    setLoading,
    setButtonLoading,
    getUrlParameter,
    isDarkMode,
    fadeIn,
    fadeOut,
    getDeviceType
  };
})();