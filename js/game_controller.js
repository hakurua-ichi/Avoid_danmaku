// ========================================
// 게임 컨트롤러
// 게임 시작, 일시정지, 리셋 및 메인 게임 루프를 관리합니다
// ========================================

// 게임 컨트롤 객체
const gameControl = {
  isPaused: false,
  isStarted: false,
  
  // 게임 시작
  start: function() {
    // 게임 오버 상태면 초기화 후 시작
    if (gameOver) {
      this.reset();
    }
    
    if (this.isStarted) return;
    
    this.isStarted = true;
    gameStarted = true;
    gameOver = false;
    isPaused = false;
    
    // 시작 시간 초기화
    startTime = Date.now();
    pausedTime = 0;
    elapsedTime = 0;
    
    // UI 초기화
    if (window.UIManager) {
      UIManager.updateHealthDisplay(player.health);
      UIManager.updateTimeDisplay('0.0');
      UIManager.hideOverlay();
    }
    
    // 오디오 잠금 해제 및 배경 음악 재생
    if (window.AudioManager) {
      AudioManager.unlockAudio();
      setTimeout(() => {
        AudioManager.playBackgroundMusic();
      }, 150);
    }
    
    // 버튼 상태 업데이트
    if (window.UIManager) UIManager.updateButtonStates('playing');
  },
  
  // 일시정지 토글
  togglePause: function() {
    if (!this.isStarted || gameOver) return;
    
    this.isPaused = !this.isPaused;
    isPaused = this.isPaused;
    
    if (this.isPaused) {
      // 일시정지
      pauseStartTime = Date.now();
      if (window.AudioManager) AudioManager.pauseBackgroundMusic();
      if (window.UIManager) {
        UIManager.showOverlay(
          UIManager.getText('paused'),
          UIManager.getText('pressResume')
        );
        UIManager.updateButtonStates('paused');
      }
    } else {
      // 재개
      pausedTime += Date.now() - pauseStartTime;
      if (window.AudioManager) AudioManager.resumeBackgroundMusic();
      if (window.UIManager) {
        UIManager.hideOverlay();
        UIManager.updateButtonStates('playing');
      }
    }
  },
  
  // 게임 초기화
  reset: function() {
    // 게임 상태 초기화
    this.isStarted = false;
    this.isPaused = false;
    gameStarted = false;
    gameOver = false;
    isPaused = false;
    
    // 시간 초기화
    startTime = Date.now();
    pausedTime = 0;
    elapsedTime = 0;
    frameCount = 0;
    
    // 플레이어 상태 초기화
    player.health = 3;
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height / 2 - player.height / 2;
    player.speed = player.baseSpeed;
    player.isGodmode = false;
    player.godmodeEndTime = 0;
    player.speedBoostEndTime = 0;
    player.invincible = false;
    player.invincibleEndTime = 0;
    
    // 장애물 초기화
    obstacles = [];
    
    // 오디오 정지
    if (window.AudioManager) {
      AudioManager.stopBackgroundMusic();
    }
    
    // UI 업데이트
    if (window.UIManager) {
      UIManager.updateHealthDisplay(player.health);
      UIManager.updateTimeDisplay('0.0');
      UIManager.showOverlay(
        UIManager.getText('gameStart'),
        UIManager.getText('pressStart')
      );
      UIManager.updateButtonStates('notStarted');
    }
    
    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

// 전역에서 접근 가능하도록 설정
window.gameControl = gameControl;

// ========================================
// 탭 전환 감지 (자동 일시정지)
// ========================================

document.addEventListener('visibilitychange', function() {
  // 탭이 숨겨지면 (다른 탭으로 이동)
  if (document.hidden) {
    // 게임이 진행 중이고 일시정지 상태가 아니면 자동 일시정지
    if (gameControl.isStarted && !gameControl.isPaused && !gameOver) {
      gameControl.togglePause();
    }
  }
  // 탭이 다시 보여도 자동으로 재개하지 않음 (사용자가 수동으로 재개해야 함)
});

// ========================================
// 키보드 입력 처리
// ========================================

document.addEventListener("keydown", function (e) {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
    keys[e.key] = true;
    e.preventDefault();
  }
});

document.addEventListener("keyup", function (e) {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
    keys[e.key] = false;
    e.preventDefault();
  }
});

// ========================================
// 메인 게임 루프
// ========================================

function update(currentTime) {
  // deltaTime 계산 (초 단위)
  const now = currentTime || Date.now();
  deltaTime = (now - lastFrameTime) / 1000;
  lastFrameTime = now;
  
  // deltaTime 제한 (너무 큰 값 방지 - 탭 전환 시 등)
  if (deltaTime > 0.1) deltaTime = 0.1;
  
  // 배경 그리기 (clearRect 대신 배경으로 덮어씀)
  drawBackground();

  // 게임이 시작되지 않았거나 일시정지 상태면 정적인 화면만 그리기
  if (!gameStarted || isPaused) {
    drawPlayer();
    drawObstacles();
    drawTime();
    requestAnimationFrame(update);
    return;
  }

  // 게임 오버 상태면 게임 로직 중단 (그리기는 유지)
  if (gameOver) {
    drawPlayer();
    drawObstacles();
    drawTime();
    
    // 게임 오버 시 반투명 회색 오버레이
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 게임 오버 텍스트
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '24px Arial';
    ctx.fillText(`${elapsedTime}초`, canvas.width / 2, canvas.height / 2 + 30);
    
    requestAnimationFrame(update);
    return;
  }

  // 타이머 기반 효과 체크 (일시정지 시간 제외)
  const currentGameTime = Date.now() - startTime - pausedTime;
  const currentAbsoluteTime = Date.now();
  
  // 무적 모드 종료 체크
  if (player.isGodmode && player.godmodeEndTime > 0 && currentGameTime >= player.godmodeEndTime) {
    player.isGodmode = false;
    player.godmodeEndTime = 0;
  }
  
  // 피격 무적 시간 종료 체크 (절대 시간 비교)
  if (player.invincible && player.invincibleEndTime > 0 && currentAbsoluteTime >= player.invincibleEndTime) {
    player.invincible = false;
    player.invincibleEndTime = 0;
  }
  
  // 속도 부스트 종료 체크
  if (player.speedBoostEndTime > 0 && currentGameTime >= player.speedBoostEndTime) {
    player.speed = Math.max(player.speed - 120, player.minSpeed);
    player.speedBoostEndTime = 0;
  }

  // 게임 요소 그리기 및 업데이트
  movePlayer();
  drawPlayer();
  drawObstacles();
  drawTime();

  // 모든 장애물에 대해 플레이어와의 충돌 확인
  for (let ob of obstacles) {
    if (checkCollision(player, ob)) {
      checkPlayerHealth(ob);
    }
  }

  // 화면 밖으로 나간 장애물을 제거
  obstacles = obstacles.filter(
    ob => ob.y < canvas.height + 50 && 
          ob.x > -50 && 
          ob.x < canvas.width + 50
  );

  // 난이도 설정 가져오기
  const difficulty = window.gameDifficulty || { 
    obstacleSpawnRate: 90,
    itemSpawnRate: 300 
  };

  // 프레임 카운트 증가
  frameCount++;
  
  // 일정 프레임마다 새 장애물 생성
  if (frameCount % difficulty.obstacleSpawnRate === 0) {
    generateObstacle();
  }

  // 아이템 생성 (더 낮은 빈도)
  if (frameCount % difficulty.itemSpawnRate === 0) {
    generateItem();
  }

  // 다음 프레임 요청
  requestAnimationFrame(update);
}

// 게임 루프 시작
update();
