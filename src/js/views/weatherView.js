/**
 * 天気情報の表示を管理するモジュール
 */
const WeatherView = (function() {
  // DOM要素の参照
  const weatherCard = document.getElementById('weather-card');
  const loader = document.getElementById('loader');
  const forecastContainer = document.getElementById('forecast-container');
  
  /**
   * 現在の天気情報を表示
   * @param {Object} weatherData - 整形された天気データ
   */
  function displayCurrentWeather(weatherData) {
    // ローディング表示を隠し、天気カードを表示
    Helpers.toggleDisplay('loader', false);
    Helpers.toggleDisplay('weather-card', true);
    
    // データをUIに反映
    Helpers.setText('location-name', weatherData.location);
    Helpers.setText('current-temp', weatherData.temperature);
    Helpers.setText('weather-condition', weatherData.condition);
    Helpers.setText('humidity', `${weatherData.humidity}%`);
    Helpers.setText('wind-speed', `${weatherData.windSpeed}km/h`);
    
    // 天気アイコンを設定
    const iconUrl = Helpers.getWeatherIconUrl(weatherData.icon);
    Helpers.setAttribute('weather-icon', 'src', iconUrl);
    
    // アニメーション効果を設定
    animateElement(weatherCard, 'slideUp');
  }
  
  /**
   * 週間予報を表示
   * @param {Array} forecastData - 整形された予報データの配列
   */
  function displayForecast(forecastData) {
    // 既存の予報表示をクリア
    Helpers.clearChildren('forecast-container');
    
    // 各日の予報を表示
    forecastData.forEach((day, index) => {
      const forecastItem = document.createElement('div');
      forecastItem.className = 'forecast-item';
      forecastItem.style.setProperty('--animation-index', index);
      
      // 日付と曜日
      const dayOfWeek = Helpers.getJapaneseDayOfWeek(day.date);
      const formattedDate = Helpers.formatDate(day.date);
      const dayElem = document.createElement('div');
      dayElem.className = 'forecast-day';
      dayElem.textContent = `${formattedDate}(${dayOfWeek})`;
      forecastItem.appendChild(dayElem);
      
      // 天気アイコン
      const iconContainer = document.createElement('div');
      iconContainer.className = 'forecast-icon';
      const iconImg = document.createElement('img');
      iconImg.src = Helpers.getWeatherIconUrl(day.icon);
      iconImg.alt = '天気アイコン';
      iconContainer.appendChild(iconImg);
      forecastItem.appendChild(iconContainer);
      
      // 気温
      const tempElem = document.createElement('div');
      tempElem.className = 'forecast-temp';
      tempElem.textContent = `${day.avgTemp}°C`;
      forecastItem.appendChild(tempElem);
      
      forecastContainer.appendChild(forecastItem);
      
      // アニメーション効果を付与（遅延付き）
      setTimeout(() => {
        animateElement(forecastItem, 'slideUp');
      }, index * 100);
    });
  }
  
  /**
   * エラー状態を表示
   * @param {Error} error - エラーオブジェクト
   */
  function displayError(error) {
    Helpers.toggleDisplay('loader', false);
    Helpers.toggleDisplay('weather-card', false);
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = `データを取得できませんでした: ${error.message}`;
    
    const currentWeatherSection = document.getElementById('current-weather');
    currentWeatherSection.appendChild(errorMessage);
    
    // アニメーション効果を付与
    animateElement(errorMessage, 'fadeIn');
  }
  
  /**
   * ローディング状態を表示
   */
  function displayLoading() {
    Helpers.toggleDisplay('loader', true);
    Helpers.toggleDisplay('weather-card', false);
  }
  
  /**
   * ローカルの天気アイコンのURLを生成
   * @param {string} iconCode - OpenWeatherMapのアイコンコード
   * @returns {string} アイコンのローカルURL
   * @deprecated Helpers.getWeatherIconUrlを直接使用してください
   */
  function getLocalWeatherIconUrl(iconCode) {
    console.warn('getLocalWeatherIconUrlは非推奨です。代わりにHelpers.getWeatherIconUrlを使用してください。');
    return Helpers.getWeatherIconUrl(iconCode);
  }
  
  /**
   * 要素にアニメーション効果を適用
   * @param {HTMLElement} element - アニメーションを適用する要素
   * @param {string} animationName - アニメーション名
   */
  function animateElement(element, animationName) {
    if (!element) return;
    
    element.style.animation = 'none';
    element.offsetHeight; // リフロー
    element.style.animation = `${animationName} 0.6s ease-out forwards`;
  }
  
  /**
   * トークルームに送信するFlexメッセージを生成
   * @param {Object} currentWeather - 現在の天気データ
   * @param {Array} forecast - 予報データの配列
   * @returns {Object} Flexメッセージオブジェクト
   */
  function createWeatherFlexMessage(currentWeather, forecast) {
    // 日付フォーマット
    const now = new Date();
    const formattedDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // 天気予報FlexMessage
    const flexMessage = {
      type: "flex",
      altText: `${currentWeather.location}の天気予報`,
      contents: {
        type: "bubble",
        size: "kilo",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `${currentWeather.location}の天気`,
              weight: "bold",
              size: "xl",
              color: "#ffffff"
            },
            {
              type: "text",
              text: formattedDate,
              size: "xs",
              color: "#ffffff",
              margin: "md"
            }
          ],
          backgroundColor: "#5c6bc0"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "image",
                      url: Helpers.getWeatherIconUrl(currentWeather.icon, true),
                      size: "md"
                    }
                  ],
                  width: "30%"
                },
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: `${currentWeather.temperature}°C`,
                      size: "xxl",
                      weight: "bold",
                      color: "#5c6bc0"
                    },
                    {
                      type: "text",
                      text: currentWeather.condition,
                      size: "sm",
                      margin: "md",
                      color: "#78909c"
                    }
                  ]
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: "湿度",
                      size: "sm",
                      color: "#78909c"
                    },
                    {
                      type: "text",
                      text: `${currentWeather.humidity}%`,
                      size: "sm",
                      color: "#37474f"
                    }
                  ],
                  flex: 1
                },
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: "風速",
                      size: "sm",
                      color: "#78909c"
                    },
                    {
                      type: "text",
                      text: `${currentWeather.windSpeed}km/h`,
                      size: "sm",
                      color: "#37474f"
                    }
                  ],
                  flex: 1
                }
              ],
              margin: "lg",
              backgroundColor: "#f5f7fa",
              cornerRadius: "md",
              paddingAll: "md"
            },
            {
              type: "separator",
              margin: "lg"
            },
            {
              type: "text",
              text: "週間予報",
              weight: "bold",
              margin: "lg",
              color: "#5c6bc0"
            },
            {
              type: "box",
              layout: "horizontal",
              contents: forecast.slice(0, 3).map(day => {
                return {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: `${Helpers.formatDate(day.date)}(${Helpers.getJapaneseDayOfWeek(day.date)})`,
                      size: "xs",
                      color: "#5c6bc0"
                    },
                    {
                      type: "image",
                      url: Helpers.getWeatherIconUrl(day.icon),
                      size: "xs",
                      margin: "md"
                    },
                    {
                      type: "text",
                      text: `${day.avgTemp}°C`,
                      size: "sm",
                      margin: "md",
                      color: "#37474f"
                    }
                  ],
                  alignItems: "center",
                  backgroundColor: "#f5f7fa",
                  cornerRadius: "md",
                  paddingAll: "sm",
                  margin: "xs"
                };
              }),
              margin: "md",
              spacing: "md"
            }
          ],
          backgroundColor: "#ffffff"
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "LINE WORKS 天気予報",
              size: "xs",
              color: "#78909c",
              align: "center"
            }
          ],
          backgroundColor: "#f5f7fa",
          paddingAll: "md"
        },
        styles: {
          header: {
            backgroundColor: "#5c6bc0"
          },
          body: {
            backgroundColor: "#ffffff",
            separator: true,
            separatorColor: "#e1e5ee"
          },
          footer: {
            backgroundColor: "#f5f7fa",
            separator: true,
            separatorColor: "#e1e5ee"
          }
        }
      }
    };
    
    return flexMessage;
  }
  
  // 公開API
  return {
    displayCurrentWeather,
    displayForecast,
    displayError,
    displayLoading,
    createWeatherFlexMessage,
    getLocalWeatherIconUrl
  };
})(); 