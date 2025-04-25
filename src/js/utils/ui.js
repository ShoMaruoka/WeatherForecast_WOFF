/**
 * UI操作に関するユーティリティ関数
 */

/**
 * トースト通知を表示する基本関数
 * @param {string} message - 表示するメッセージ
 * @param {string} type - トーストの種類 ('error' または 'success')
 * @param {number} [duration=3000] - 表示時間（ミリ秒）
 */
export function showToast(message, type, duration = 3000) {
  // 既存のトーストを削除
  const existingToasts = document.querySelectorAll('.error-toast, .success-toast');
  existingToasts.forEach(toast => {
    document.body.removeChild(toast);
  });

  // 新しいトースト要素の作成
  const toast = document.createElement('div');
  toast.className = `${type}-toast`;
  
  // アイコン要素の作成
  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  
  if (type === 'error') {
    icon.innerHTML = '&#9888;'; // 警告アイコン
  } else if (type === 'success') {
    icon.innerHTML = '&#10004;'; // チェックマークアイコン
  }
  
  toast.appendChild(icon);
  
  // メッセージテキストの追加
  const messageText = document.createTextNode(message);
  toast.appendChild(messageText);
  
  // CSSが読み込まれていることを確認
  ensureStylesLoaded();
  
  // トーストを表示
  document.body.appendChild(toast);
  
  // アニメーション効果のためのタイムアウト
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // 指定時間後に非表示
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, duration);
}

/**
 * エラートースト通知を表示
 * @param {string} message - エラーメッセージ
 * @param {number} [duration=3000] - 表示時間（ミリ秒）
 */
export function showError(message, duration = 3000) {
  showToast(message, 'error', duration);
}

/**
 * 成功トースト通知を表示
 * @param {string} message - 成功メッセージ
 * @param {number} [duration=3000] - 表示時間（ミリ秒）
 */
export function showSuccess(message, duration = 3000) {
  showToast(message, 'success', duration);
}

/**
 * 要素の読み込み状態を設定
 * @param {HTMLElement} element - 対象の要素
 * @param {boolean} isLoading - ローディング状態かどうか
 */
export function setLoading(element, isLoading) {
  if (!element) return;
  
  if (isLoading) {
    element.classList.add('is-loading');
    element.setAttribute('aria-busy', 'true');
  } else {
    element.classList.remove('is-loading');
    element.setAttribute('aria-busy', 'false');
  }
}

/**
 * ボタンの読み込み状態を設定
 * @param {HTMLButtonElement} button - 対象のボタン
 * @param {boolean} isLoading - ローディング状態かどうか
 * @param {string} [loadingText='Loading...'] - ローディング中に表示するテキスト
 */
export function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
  if (!button) return;
  
  const originalText = button.getAttribute('data-original-text') || button.textContent;
  
  if (isLoading) {
    button.setAttribute('data-original-text', originalText);
    button.textContent = loadingText;
    button.disabled = true;
    button.classList.add('is-loading');
  } else {
    button.textContent = originalText;
    button.removeAttribute('data-original-text');
    button.disabled = false;
    button.classList.remove('is-loading');
  }
}

/**
 * 要素をフェードイン
 * @param {HTMLElement} element - フェードインする要素
 * @param {number} [duration=300] - アニメーション時間（ミリ秒）
 * @returns {Promise} アニメーション完了時に解決するPromise
 */
export function fadeIn(element, duration = 300) {
  return new Promise(resolve => {
    if (!element) {
      resolve();
      return;
    }
    
    element.style.opacity = '0';
    element.style.display = 'block';
    
    setTimeout(() => {
      element.style.transition = `opacity ${duration}ms ease-in-out`;
      element.style.opacity = '1';
      
      setTimeout(() => {
        element.style.removeProperty('transition');
        resolve();
      }, duration);
    }, 10);
  });
}

/**
 * 要素をフェードアウト
 * @param {HTMLElement} element - フェードアウトする要素
 * @param {number} [duration=300] - アニメーション時間（ミリ秒）
 * @returns {Promise} アニメーション完了時に解決するPromise
 */
export function fadeOut(element, duration = 300) {
  return new Promise(resolve => {
    if (!element || element.style.display === 'none') {
      resolve();
      return;
    }
    
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    element.style.opacity = '0';
    
    setTimeout(() => {
      element.style.display = 'none';
      element.style.removeProperty('transition');
      resolve();
    }, duration);
  });
}

/**
 * CSSスタイルが読み込まれていることを確認
 * 必要ならCSSをインジェクト
 */
function ensureStylesLoaded() {
  if (!document.querySelector('link[href*="toast.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/toast.css';
    document.head.appendChild(link);
  }
}

/**
 * ダークモードかどうかを確認
 * @returns {boolean} ダークモードならtrue
 */
export function isDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * デバイスタイプを取得
 * @returns {string} 'mobile', 'tablet', または 'desktop'
 */
export function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
} 