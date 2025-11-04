// ========================================
// UI Manager - 언어 설정 및 난이도 관리
// ========================================

const UIManager = {
  currentLanguage: 'ko',
  currentDifficulty: 'normal',
  
  // 다국어 텍스트
  translations: {
    ko: {
      health: '❤️ 체력',
      time: '⏱️ 시간',
      gameOver: '게임 오버!',
      survivalTime: '생존 시간',
      seconds: '초',
      language: '언어',
      difficulty: '난이도',
      music: '음악',
      easy: '쉬움',
      normal: '보통',
      hard: '어려움',
      start: '시작',
      pause: '일시정지',
      resume: '계속하기',
      reset: '초기화',
      gameStart: '게임 시작',
      pressStart: '시작 버튼을 눌러주세요',
      paused: '일시정지',
      pressResume: '계속하기 버튼을 눌러주세요',
      controlsTitle: '🎮 조작',
      controlUp: '위',
      controlDown: '아래',
      controlLeft: '왼쪽',
      controlRight: '오른쪽',
      itemsTitle: '💎 아이템',
      itemGodmode: '무적',
      itemHealth: '회복',
      itemSpeedUp: '가속',
      itemSpeedDown: '감속',
      leaderboardTitle: '🏆 리더보드'
    },
    en: {
      health: '❤️ Health',
      time: '⏱️ Time',
      gameOver: 'Game Over!',
      survivalTime: 'Survival Time',
      seconds: 'sec',
      language: 'Language',
      difficulty: 'Difficulty',
      music: 'Music',
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard',
      start: 'Start',
      pause: 'Pause',
      resume: 'Resume',
      reset: 'Reset',
      gameStart: 'Game Start',
      pressStart: 'Press Start Button',
      paused: 'Paused',
      pressResume: 'Press Resume Button',
      controlsTitle: '🎮 Controls',
      controlUp: 'Up',
      controlDown: 'Down',
      controlLeft: 'Left',
      controlRight: 'Right',
      itemsTitle: '💎 Items',
      itemGodmode: 'Godmode',
      itemHealth: 'Heal',
      itemSpeedUp: 'Fast',
      itemSpeedDown: 'Slow',
      leaderboardTitle: '🏆 Leaderboard'
    }
  },
  
  // 난이도 설정 (속도는 픽셀/초 단위로 변경)
  difficultySettings: {
    easy: {
      obstacleSpawnRate: 35,    // 프레임 수 (높을수록 느림)
      itemSpawnRate: 150,
      baseSpeed: 150,           // 픽셀/초 (60fps 기준 2.5픽셀 * 60)
      speedVariation: 120       // 픽셀/초 (60fps 기준 2픽셀 * 60)
    },
    normal: {
      obstacleSpawnRate: 22,
      itemSpawnRate: 110,
      baseSpeed: 210,           // 픽셀/초 (60fps 기준 3.5픽셀 * 60)
      speedVariation: 150       // 픽셀/초 (60fps 기준 2.5픽셀 * 60)
    },
    hard: {
      obstacleSpawnRate: 15,
      itemSpawnRate: 80,
      baseSpeed: 270,           // 픽셀/초 (60fps 기준 4.5픽셀 * 60)
      speedVariation: 180       // 픽셀/초 (60fps 기준 3픽셀 * 60)
    }
  },
  
  // 초기화
  init: function() {
    // 언어 설정 이벤트
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        this.currentLanguage = e.target.value;
        this.updateLanguage();
      });
    }
    
    // 난이도 설정 이벤트
    const difficultySelect = document.getElementById('difficulty');
    if (difficultySelect) {
      difficultySelect.addEventListener('change', (e) => {
        this.currentDifficulty = e.target.value;
        this.updateDifficulty();
      });
    }
    
    // 게임 컨트롤 버튼 이벤트
    this.initGameControls();
    
    // 초기 언어 적용
    this.updateLanguage();
    
    // 초기 난이도 적용
    this.updateDifficulty();
    
    // 리더보드 로드
    this.updateLeaderboardDisplay();
  },
  
  // 게임 컨트롤 초기화
  initGameControls: function() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (window.gameControl) {
          window.gameControl.start();
        }
      });
    }
    
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (window.gameControl) {
          window.gameControl.togglePause();
        }
      });
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (window.gameControl) {
          window.gameControl.reset();
        }
      });
    }
  },
  
  // 언어 업데이트
  updateLanguage: function() {
    const lang = this.translations[this.currentLanguage];
    
    // 체력 텍스트 업데이트 (값은 유지하고 라벨만 변경)
    const healthText = document.getElementById('healthText');
    const healthValue = document.getElementById('healthValue');
    if (healthText) {
      const currentHealth = healthValue ? healthValue.textContent : (window.player ? window.player.health : '3');
      healthText.innerHTML = `${lang.health}: <span id="healthValue">${currentHealth}</span>`;
    }
    
    // 시간 텍스트 업데이트 (값은 유지하고 라벨만 변경)
    const timeText = document.getElementById('timeText');
    const timeValue = document.getElementById('timeValue');
    if (timeText) {
      const currentTime = timeValue ? timeValue.textContent : '0.0';
      timeText.innerHTML = `${lang.time}: <span id="timeValue">${currentTime}</span>${lang.seconds}`;
    }
    
    // 난이도 옵션 텍스트 업데이트
    const difficultySelect = document.getElementById('difficulty');
    if (difficultySelect) {
      difficultySelect.options[0].text = lang.easy;
      difficultySelect.options[1].text = lang.normal;
      difficultySelect.options[2].text = lang.hard;
    }
    
    // 버튼 텍스트 업데이트
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (startBtn) startBtn.textContent = lang.start;
    if (resetBtn) resetBtn.textContent = lang.reset;
    
    // 일시정지 버튼은 상태에 따라 다름
    if (pauseBtn && window.gameControl) {
      pauseBtn.textContent = window.gameControl.isPaused ? lang.resume : lang.pause;
    }
    
    // 사이드 패널 텍스트 업데이트
    const controlsTitle = document.getElementById('controlsTitle');
    const controlUp = document.getElementById('controlUp');
    const controlDown = document.getElementById('controlDown');
    const controlLeft = document.getElementById('controlLeft');
    const controlRight = document.getElementById('controlRight');
    const itemsTitle = document.getElementById('itemsTitle');
    const itemGodmode = document.getElementById('itemGodmode');
    const itemHealth = document.getElementById('itemHealth');
    const itemSpeedUp = document.getElementById('itemSpeedUp');
    const itemSpeedDown = document.getElementById('itemSpeedDown');
    const leaderboardTitle = document.getElementById('leaderboardTitle');
    
    if (controlsTitle) controlsTitle.textContent = lang.controlsTitle;
    if (controlUp) controlUp.textContent = lang.controlUp;
    if (controlDown) controlDown.textContent = lang.controlDown;
    if (controlLeft) controlLeft.textContent = lang.controlLeft;
    if (controlRight) controlRight.textContent = lang.controlRight;
    if (itemsTitle) itemsTitle.textContent = lang.itemsTitle;
    if (itemGodmode) itemGodmode.textContent = lang.itemGodmode;
    if (itemHealth) itemHealth.textContent = lang.itemHealth;
    if (itemSpeedUp) itemSpeedUp.textContent = lang.itemSpeedUp;
    if (itemSpeedDown) itemSpeedDown.textContent = lang.itemSpeedDown;
    if (leaderboardTitle) leaderboardTitle.textContent = lang.leaderboardTitle;
  },
  
  // 난이도 업데이트
  updateDifficulty: function() {
    const settings = this.difficultySettings[this.currentDifficulty];
    
    // 전역 난이도 설정 객체 생성 (avoid_boxes.js에서 사용)
    window.gameDifficulty = settings;
  },
  
  // 체력 표시 업데이트
  updateHealthDisplay: function(health) {
    const healthValue = document.getElementById('healthValue');
    if (healthValue) {
      healthValue.textContent = health;
      
      // 체력에 따라 색상 변경
      if (health <= 1) {
        healthValue.style.color = '#e74c3c'; // 빨강
      } else if (health <= 2) {
        healthValue.style.color = '#f39c12'; // 주황
      } else {
        healthValue.style.color = '#27ae60'; // 초록
      }
    }
  },
  
  // 시간 표시 업데이트
  updateTimeDisplay: function(time) {
    const timeValue = document.getElementById('timeValue');
    if (timeValue) {
      timeValue.textContent = time;
    }
  },
  
  // 오버레이 표시
  showOverlay: function(title, message) {
    const overlay = document.getElementById('gameOverlay');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlayMessage = document.getElementById('overlayMessage');
    
    if (overlay) overlay.classList.remove('hidden');
    if (overlayTitle) overlayTitle.textContent = title;
    if (overlayMessage) overlayMessage.textContent = message;
  },
  
  // 오버레이 숨기기
  hideOverlay: function() {
    const overlay = document.getElementById('gameOverlay');
    if (overlay) overlay.classList.add('hidden');
  },
  
  // 버튼 상태 업데이트
  updateButtonStates: function(gameState) {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const lang = this.translations[this.currentLanguage];
    
    if (gameState === 'notStarted') {
      if (startBtn) startBtn.disabled = false;
      if (pauseBtn) pauseBtn.disabled = true;
      if (resetBtn) resetBtn.disabled = true;
    } else if (gameState === 'playing') {
      if (startBtn) startBtn.disabled = true;
      if (pauseBtn) {
        pauseBtn.disabled = false;
        pauseBtn.textContent = lang.pause;
      }
      if (resetBtn) resetBtn.disabled = false;
    } else if (gameState === 'paused') {
      if (startBtn) startBtn.disabled = true;
      if (pauseBtn) {
        pauseBtn.disabled = false;
        pauseBtn.textContent = lang.resume;
      }
      if (resetBtn) resetBtn.disabled = false;
    } else if (gameState === 'gameOver') {
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = lang.start;
      }
      if (pauseBtn) pauseBtn.disabled = true;
      if (resetBtn) resetBtn.disabled = false;
    }
  },
  
  // 텍스트 가져오기
  getText: function(key) {
    return this.translations[this.currentLanguage][key] || key;
  },
  
  // 게임 오버 메시지
  getGameOverMessage: function(time) {
    const lang = this.translations[this.currentLanguage];
    return `${lang.gameOver}\n${lang.survivalTime}: ${time}${lang.seconds}`;
  },
  
  // 리더보드 관리
  loadLeaderboard: function() {
    const saved = localStorage.getItem('avoidBoxesLeaderboard');
    return saved ? JSON.parse(saved) : [];
  },
  
  saveLeaderboard: function(leaderboard) {
    localStorage.setItem('avoidBoxesLeaderboard', JSON.stringify(leaderboard));
  },
  
  addScore: function(name, time) {
    const leaderboard = this.loadLeaderboard();
    leaderboard.push({ name, time: parseFloat(time) });
    leaderboard.sort((a, b) => b.time - a.time); // 높은 시간부터 정렬
    const top5 = leaderboard.slice(0, 5);
    this.saveLeaderboard(top5);
    this.updateLeaderboardDisplay();
    return top5;
  },
  
  updateLeaderboardDisplay: function() {
    const leaderboard = this.loadLeaderboard();
    const leaderboardDiv = document.getElementById('leaderboard');
    const lang = this.translations[this.currentLanguage];
    
    if (!leaderboardDiv) return;
    
    if (leaderboard.length === 0) {
      leaderboardDiv.innerHTML = `<p style="text-align: center; color: #999; padding: 20px;">${this.currentLanguage === 'ko' ? '아직 기록이 없습니다' : 'No records yet'}</p>`;
      return;
    }
    
    leaderboardDiv.innerHTML = leaderboard.map((entry, index) => `
      <div class="leaderboard-item">
        <span class="rank">${index + 1}</span>
        <span class="name">${entry.name}</span>
        <span class="score">${entry.time}${lang.seconds}</span>
      </div>
    `).join('');
  },
  
  promptPlayerName: function(time) {
    const lang = this.translations[this.currentLanguage];
    const message = this.currentLanguage === 'ko' 
      ? `생존 시간: ${time}초\n\n이름을 입력하세요:`
      : `Survival Time: ${time}sec\n\nEnter your name:`;
    
    const name = prompt(message, this.currentLanguage === 'ko' ? '플레이어' : 'Player');
    
    if (name && name.trim()) {
      this.addScore(name.trim(), time);
      return true;
    }
    return false;
  }
};

// 전역에 등록
window.UIManager = UIManager;

// 페이지 로드 시 UI 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
  });
} else {
  // 이미 로드된 경우 즉시 초기화
  UIManager.init();
}
