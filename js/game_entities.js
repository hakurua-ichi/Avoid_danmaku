// ========================================
// 게임 엔티티 관리
// 플레이어, 장애물, 아이템의 그리기 및 로직을 관리합니다
// ========================================

// ========================================
// 배경 그리기 함수
// ========================================

function drawBackground() {
  if (bgImageLoaded && bgImage.complete) {
    // 배경 이미지가 로드되었으면 스크롤링
    ctx.drawImage(bgImage, 0, bgY1, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, bgY2, canvas.width, canvas.height);
    
    // 게임 진행 중일 때만 스크롤 (deltaTime 적용)
    if (gameStarted && !isPaused && !gameOver) {
      const scrollAmount = bgScrollSpeed * deltaTime;
      bgY1 += scrollAmount;
      bgY2 += scrollAmount;
      
      // 첫 번째 배경이 화면 밖으로 나가면 위로 리셋
      if (bgY1 >= canvas.height) {
        bgY1 = bgY2 - canvas.height;
      }
      
      // 두 번째 배경이 화면 밖으로 나가면 위로 리셋
      if (bgY2 >= canvas.height) {
        bgY2 = bgY1 - canvas.height;
      }
    }
  } else {
    // 이미지가 없으면 그라데이션 배경 (위에서 아래로 어두워짐)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');  // 하늘색
    gradient.addColorStop(0.5, '#E0F6FF'); // 밝은 하늘색
    gradient.addColorStop(1, '#B0E0E6');  // 파우더 블루
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 구름 효과 (선택사항)
    if (gameStarted && !isPaused && !gameOver) {
      bgY1 += bgScrollSpeed * 0.3 * deltaTime;
      if (bgY1 >= canvas.height) bgY1 = 0;
    }
  }
}

// ========================================
// 플레이어 관련 함수
// ========================================

function drawPlayer() {
  // 무적 모드 또는 피격 무적 시간일 때 깜빡임 효과 (프레임 카운트 기반)
  if ((player.isGodmode || player.invincible) && frameCount % 10 < 5) {
    return; // 5프레임마다 그리지 않음 (깜빡임)
  }
  
  if (playerImageLoaded && playerImage.complete) {
    // 이미지가 로드되었으면 이미지 그리기
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
  } else {
    // 이미지가 없으면 기본 사각형
    ctx.fillStyle = "black";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
}

function movePlayer() {
  const moveAmount = player.speed * deltaTime;
  
  if (keys.ArrowLeft) {
    player.x -= moveAmount;
    if (player.x < 0) player.x = 0;
  }
  if (keys.ArrowRight) {
    player.x += moveAmount;
    if (player.x + player.width > canvas.width) {
      player.x = canvas.width - player.width;
    }
  }
  if (keys.ArrowUp) {
    player.y -= moveAmount;
    if (player.y < 0) player.y = 0;
  }
  if (keys.ArrowDown) {
    player.y += moveAmount;
    if (player.y + player.height > canvas.height) {
      player.y = canvas.height - player.height;
    }
  }
}

// ========================================
// 시간 표시 함수
// ========================================

function drawTime() {
  // 경과 시간 계산 (게임 오버, 일시정지 시간 제외)
  if (gameStarted && !isPaused && !gameOver) {
    elapsedTime = ((Date.now() - startTime - pausedTime) / 1000).toFixed(1);
  }
  
  // UI에 시간 업데이트 (항상 업데이트)
  if (window.UIManager) {
    UIManager.updateTimeDisplay(elapsedTime);
  }

  // 시간 텍스트 스타일 설정
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.textAlign = "left";

  // 화면 왼쪽 상단에 시간 표시 (언어 지원)
  const timeText = window.UIManager ? UIManager.getText('time') : '시간';
  ctx.fillText(`${timeText.replace('⏱️ ', '')}: ${elapsedTime}${window.UIManager ? UIManager.getText('seconds') : '초'}`, 10, 30);
}

// ========================================
// 장애물/아이템 그리기 함수
// ========================================

function drawObstacles() {
  obstacles.forEach(ob => {
    if (ob.mode === 1) {
      // 일반 장애물 - 이미지 또는 사각형
      if (obstacleImageLoaded && obstacleImage.complete) {
        ctx.drawImage(obstacleImage, ob.x, ob.y, ob.width, ob.height);
      } else {
        ctx.fillStyle = ob.color;
        ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
      }
    } else if (ob.mode === 2) {
      // 무적 아이템 - 별
      drawStar(ob.x + ob.width / 2, ob.y + ob.height / 2, 5, ob.width / 2, ob.width / 4);
    } else if (ob.mode === 3) {
      // 회복 아이템 - 하트
      drawHeart(ob.x + ob.width / 2, ob.y + ob.height / 2, ob.width / 2);
    } else if (ob.mode === 4) {
      // 속도 증가 - 파란색 원
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(ob.x + ob.width / 2, ob.y + ob.height / 2, ob.width / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (ob.mode === 5) {
      // 속도 감소 - 주황색 원 (어두운 배경에서도 잘 보임)
      ctx.fillStyle = "#FF6B35";
      ctx.beginPath();
      ctx.arc(ob.x + ob.width / 2, ob.y + ob.height / 2, ob.width / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // 테두리 추가로 더 잘 보이게
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    // 방향에 따라 이동 (deltaTime 적용)
    ob.x += ob.speedX * deltaTime;
    ob.y += ob.speedY * deltaTime;
  });
}

// 별 그리기 함수
function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  let step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.strokeStyle = "orange";
  ctx.lineWidth = 2;
  ctx.stroke();
}

// 하트 그리기 함수
function drawHeart(cx, cy, size) {
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.moveTo(cx, cy + size / 4);
  ctx.bezierCurveTo(cx, cy, cx - size, cy, cx - size, cy - size / 2);
  ctx.bezierCurveTo(cx - size, cy - size, cx, cy - size / 1.5, cx, cy + size / 4);
  ctx.bezierCurveTo(cx, cy - size / 1.5, cx + size, cy - size, cx + size, cy - size / 2);
  ctx.bezierCurveTo(cx + size, cy, cx, cy, cx, cy + size / 4);
  ctx.fill();
}

// ========================================
// 장애물/아이템 생성 함수
// ========================================

function ColorRandom() {
  const r = Math.floor(Math.random() * 156) + 100;
  const g = Math.floor(Math.random() * 156) + 100;
  const b = Math.floor(Math.random() * 156) + 100;

  const average = (r + g + b) / 3;
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r));

  if (average < 150 || maxDiff < 50) {
    return ColorRandom();
  }
  return `rgb(${r}, ${g}, ${b})`;
}

function generateObstacle() {
  const difficulty = window.gameDifficulty || { baseSpeed: 150, speedVariation: 120 };
  const direction = Math.random() < 0.5 ? 'vertical' : 'diagonal';
  
  if (direction === 'vertical') {
    const x = Math.random() * (canvas.width - 40);
    const speed = difficulty.baseSpeed + Math.random() * difficulty.speedVariation;
    obstacles.push({
      x: x,
      y: 0,
      width: 40,
      height: 20,
      speed: speed,
      speedX: 0,
      speedY: speed,
      color: ColorRandom(),
      mode: 1,
      direction: 'vertical'
    });
  } else {
    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? -40 : canvas.width;
    const targetX = fromLeft ? canvas.width + 40 : -40;
    const y = 0;
    const targetY = canvas.height;
    
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const baseSpeed = difficulty.baseSpeed + Math.random() * difficulty.speedVariation;
    
    obstacles.push({
      x: x,
      y: y,
      width: 40,
      height: 20,
      speed: baseSpeed,
      speedX: (dx / distance) * baseSpeed,
      speedY: (dy / distance) * baseSpeed,
      color: ColorRandom(),
      mode: 1,
      direction: 'diagonal'
    });
  }
}

function generateItem() {
  const difficulty = window.gameDifficulty || { baseSpeed: 150, speedVariation: 120 };
  const direction = Math.random() < 0.5 ? 'vertical' : 'diagonal';
  const mode = Math.floor(Math.random() * 4) + 2; // 2~5 (코인 제외)
  
  if (direction === 'vertical') {
    const x = Math.random() * (canvas.width - 30);
    const speed = difficulty.baseSpeed + Math.random() * difficulty.speedVariation;
    obstacles.push({
      x: x,
      y: 0,
      width: 30,
      height: 30,
      speed: speed,
      speedX: 0,
      speedY: speed,
      mode: mode,
      direction: 'vertical'
    });
  } else {
    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? -30 : canvas.width;
    const targetX = fromLeft ? canvas.width + 30 : -30;
    const y = 0;
    const targetY = canvas.height;
    
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const baseSpeed = difficulty.baseSpeed + Math.random() * difficulty.speedVariation;
    
    obstacles.push({
      x: x,
      y: y,
      width: 30,
      height: 30,
      speed: baseSpeed,
      speedX: (dx / distance) * baseSpeed,
      speedY: (dy / distance) * baseSpeed,
      mode: mode,
      direction: 'diagonal'
    });
  }
}

// ========================================
// 충돌 감지 및 처리
// ========================================

function checkCollision(player, ob) {
  return (
    player.x < ob.x + ob.width &&
    player.x + player.width > ob.x &&
    player.y < ob.y + ob.height &&
    player.y + player.height > ob.y
  );
}

function checkPlayerHealth(ob) {
  if (ob.mode === 1) {
    // 장애물과 충돌
    // 무적 모드 또는 피격 무적 시간이면 데미지 무시
    if (player.isGodmode || player.invincible) {
      return;
    }
    
    obstacles = obstacles.filter(o => o !== ob);
    player.health--;
    
    // 피격 후 1초 무적 시간 부여 (절대 시간 기준)
    player.invincible = true;
    player.invincibleEndTime = Date.now() + 1000;
    
    if (window.UIManager) UIManager.updateHealthDisplay(player.health);
    if (window.AudioManager) AudioManager.playSound('hit');
    
    if (player.health === 0) {
      gameOver = true;
      if (window.AudioManager) {
        AudioManager.stopBackgroundMusic();
        AudioManager.playSound('gameover');
      }
      if (window.UIManager) {
        UIManager.showOverlay(
          UIManager.getText('gameOver'),
          `${UIManager.getText('survivalTime')}: ${elapsedTime}${UIManager.getText('seconds')}`
        );
        UIManager.updateButtonStates('gameOver');
        
        // 약간의 지연 후 이름 입력 받기
        setTimeout(() => {
          UIManager.promptPlayerName(elapsedTime);
        }, 500);
      }
    }
  } else {
    // 아이템 처리
    handleItemCollision(ob);
  }
}

function handleItemCollision(ob) {
  obstacles = obstacles.filter(o => o !== ob);
  
  if (ob.mode === 2) {
    toggleGodmode(ob);
    if (window.AudioManager) AudioManager.playSound('powerup');
  } else if (ob.mode === 3) {
    playerHealthRecovery(ob);
    if (window.AudioManager) AudioManager.playSound('item');
  } else if (ob.mode === 4) {
    playerSpeedUp(ob);
    if (window.AudioManager) AudioManager.playSound('item');
  } else if (ob.mode === 5) {
    playerSpeedDown(ob);
    if (window.AudioManager) AudioManager.playSound('item');
  }
}

// ========================================
// 아이템 효과 함수
// ========================================

function toggleGodmode(ob) {
  if (ob.mode === 2) {
    player.isGodmode = true;
    player.godmodeEndTime = Date.now() - startTime - pausedTime + 3000;
  }
}

function playerHealthRecovery(ob) {
  if (ob.mode === 3 && player.health < 3) {
    player.health++;
    if (window.UIManager) UIManager.updateHealthDisplay(player.health);
  }
}

function playerSpeedUp(ob) {
  if (ob.mode === 4) {
    player.speed = Math.min(player.speed + 120, player.maxSpeed); // 60fps 기준 2픽셀 * 60
    player.speedBoostEndTime = Date.now() - startTime - pausedTime + 5000;
  }
}

function playerSpeedDown(ob) {
  if (ob.mode === 5) {
    player.speed = Math.max(player.speed - 120, player.minSpeed); // 60fps 기준 2픽셀 * 60
  }
}
