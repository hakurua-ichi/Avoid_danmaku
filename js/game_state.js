// ========================================
// 게임 상태 관리
// 게임의 모든 상태 변수와 설정을 관리합니다
// ========================================

// Canvas 설정
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 배경 이미지 설정
const bgImage = new Image();
bgImage.src = 'images/background.jpg'; // 배경 이미지 경로
let bgY1 = 0;
let bgY2 = 0;
let bgScrollSpeed = 120; // 픽셀/초 (60fps 기준 2픽셀 * 60)
let bgImageLoaded = false;

bgImage.onload = function() {
  bgImageLoaded = true;
};

bgImage.onerror = function() {
  bgImageLoaded = false;
};

// 플레이어 이미지 설정
const playerImage = new Image();
playerImage.src = 'images/player.png';
let playerImageLoaded = false;

playerImage.onload = function() {
  playerImageLoaded = true;
};

playerImage.onerror = function() {
  playerImageLoaded = false;
};

// 장애물 이미지 설정
const obstacleImage = new Image();
obstacleImage.src = 'images/obstacle.png';
let obstacleImageLoaded = false;

obstacleImage.onload = function() {
  obstacleImageLoaded = true;
};

obstacleImage.onerror = function() {
  obstacleImageLoaded = false;
};

// 플레이어 설정 (초기값, resizeCanvas에서 실제 위치 설정됨)
let player = {
  health: 3,
  x: 400,
  y: 300,
  width: 40,
  height: 40,
  speed: 360,          // 픽셀/초 (60fps 기준 6픽셀 * 60 = 360)
  baseSpeed: 360,      // 기본 속도
  minSpeed: 120,       // 최소 속도 (60fps 기준 2픽셀 * 60)
  maxSpeed: 840,       // 최대 속도 (60fps 기준 14픽셀 * 60)
  isGodmode: false,
  godmodeEndTime: 0,
  speedBoostEndTime: 0,
  invincible: false,    // 피격 후 무적 상태
  invincibleEndTime: 0  // 무적 종료 시간
};

// 전역에서 접근 가능하도록 설정 (UI Manager용)
window.player = player;

// 게임 상태 변수
let obstacles = [];
let gameOver = false;
let gameStarted = false;
let isPaused = false;
let startTime = Date.now();
let pausedTime = 0;
let pauseStartTime = 0;
let elapsedTime = 0;
let frameCount = 0;

// deltaTime 관련 변수 (프레임 독립적 움직임)
let lastFrameTime = Date.now();
let deltaTime = 0;
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS; // 16.67ms

// 키보드 입력 상태
let keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false
};

// 캔버스 크기 조절 함수
function resizeCanvas() {
  const container = document.querySelector('.main-game-area');
  const leftPanel = document.querySelector('.controls-panel');
  const rightPanel = document.querySelector('.leaderboard-panel');
  const topBar = document.querySelector('.top-bar');
  
  if (container && leftPanel && rightPanel && topBar) {
    // 사용 가능한 너비 계산 (전체 너비 - 사이드 패널 - 갭)
    const availableWidth = window.innerWidth - leftPanel.offsetWidth - rightPanel.offsetWidth - 100;
    // 사용 가능한 높이 계산 (전체 높이 - 상단 바 - 패딩)
    const availableHeight = window.innerHeight - topBar.offsetHeight - 60;
    
    // 캔버스 크기 설정 (최소값 보장)
    canvas.width = Math.max(800, Math.min(availableWidth, 1400));
    canvas.height = Math.max(600, Math.min(availableHeight, 1000));
    
    // 배경 이미지 초기 위치 설정
    bgY2 = -canvas.height;
    
    // 플레이어 위치를 캔버스 중앙으로 조정
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height / 2 - player.height / 2;
  }
}

// 초기 캔버스 크기 설정
resizeCanvas();

// 윈도우 리사이즈 이벤트
window.addEventListener('resize', resizeCanvas);
