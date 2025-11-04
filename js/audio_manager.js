// ========================================
// Audio Manager - 게임 음악 및 효과음 관리 (HTML Audio)
// ========================================

const AudioManager = {
  bgMusic: null,
  hitSound: null,
  itemSound: null,
  powerupSound: null,
  gameoverSound: null,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  isUnlocked: false, // 오디오 잠금 해제 여부
  
  // 오디오 잠금 해제 (브라우저 정책)
  unlockAudio: function() {
    if (this.isUnlocked) return;
    
    console.log('오디오 잠금 해제 시도...');
    
    // 효과음만 짧게 재생했다가 멈춰서 브라우저 정책 우회
    // 배경 음악은 나중에 재생하므로 여기서는 건너뜀
    const sounds = [this.hitSound, this.itemSound, this.powerupSound, this.gameoverSound];
    
    let unlockPromises = sounds.map(sound => {
      if (sound) {
        return sound.play().then(() => {
          sound.pause();
          sound.currentTime = 0;
        }).catch(e => {
          console.log('오디오 잠금 해제 중 에러:', e);
        });
      }
      return Promise.resolve();
    });
    
    // 모든 잠금 해제가 완료될 때까지 대기
    Promise.all(unlockPromises).then(() => {
      this.isUnlocked = true;
      console.log('오디오 잠금 해제 완료!');
    });
  },
  
  // 오디오 초기화
  init: function() {
    // HTML Audio 요소 가져오기
    this.bgMusic = document.getElementById('bgMusic');
    this.hitSound = document.getElementById('hitSound');
    this.itemSound = document.getElementById('itemSound');
    this.powerupSound = document.getElementById('powerupSound');
    this.gameoverSound = document.getElementById('gameoverSound');
    
    // 오디오 파일 로드 확인
    console.log('Audio Manager 초기화:', {
      bgMusic: this.bgMusic ? '로드됨' : '없음',
      hitSound: this.hitSound ? '로드됨' : '없음',
      itemSound: this.itemSound ? '로드됨' : '없음',
      powerupSound: this.powerupSound ? '로드됨' : '없음',
      gameoverSound: this.gameoverSound ? '로드됨' : '없음'
    });
    
    // 초기 볼륨 설정
    if (this.bgMusic) {
      this.bgMusic.volume = this.musicVolume;
      this.bgMusic.load(); // 명시적으로 로드
    }
    if (this.hitSound) {
      this.hitSound.volume = this.sfxVolume;
      this.hitSound.load();
    }
    if (this.itemSound) {
      this.itemSound.volume = this.sfxVolume;
      this.itemSound.load();
    }
    if (this.powerupSound) {
      this.powerupSound.volume = this.sfxVolume;
      this.powerupSound.load();
    }
    if (this.gameoverSound) {
      this.gameoverSound.volume = this.sfxVolume;
      this.gameoverSound.load();
    }
    
    // 사용자의 첫 클릭으로 오디오 잠금 해제
    document.body.addEventListener('click', () => {
      this.unlockAudio();
    }, { once: true }); // 한 번만 실행
    
    // 터치 디바이스 지원
    document.body.addEventListener('touchstart', () => {
      this.unlockAudio();
    }, { once: true });
    
    // 음악 볼륨 슬라이더 이벤트
    const musicVolumeSlider = document.getElementById('musicVolume');
    const musicVolumeValue = document.getElementById('musicVolumeValue');
    if (musicVolumeSlider) {
      musicVolumeSlider.addEventListener('input', (e) => {
        this.musicVolume = e.target.value / 100;
        if (this.bgMusic) {
          this.bgMusic.volume = this.musicVolume;
          console.log('음악 볼륨 변경:', this.musicVolume);
        }
        if (musicVolumeValue) musicVolumeValue.textContent = e.target.value + '%';
      });
      
      // 슬라이더 변경 시 음악이 재생 중이면 계속 재생
      musicVolumeSlider.addEventListener('change', (e) => {
        if (this.bgMusic && !this.bgMusic.paused && this.musicVolume > 0) {
          console.log('음악 볼륨 조절 완료, 계속 재생 중');
        }
      });
    }
    
    // 효과음 볼륨 슬라이더 이벤트
    const sfxVolumeSlider = document.getElementById('sfxVolume');
    const sfxVolumeValue = document.getElementById('sfxVolumeValue');
    if (sfxVolumeSlider) {
      sfxVolumeSlider.addEventListener('input', (e) => {
        this.sfxVolume = e.target.value / 100;
        if (this.hitSound) this.hitSound.volume = this.sfxVolume;
        if (this.itemSound) this.itemSound.volume = this.sfxVolume;
        if (this.powerupSound) this.powerupSound.volume = this.sfxVolume;
        if (this.gameoverSound) this.gameoverSound.volume = this.sfxVolume;
        if (sfxVolumeValue) sfxVolumeValue.textContent = e.target.value + '%';
      });
    }
  },
  
  // 배경 음악 재생
  playBackgroundMusic: function() {
    if (!this.isUnlocked) {
      console.log('오디오가 아직 잠금 해제되지 않았습니다. 화면을 클릭하세요.');
      this.unlockAudio();
    }
    
    if (this.bgMusic && this.musicVolume > 0) {
      console.log('배경 음악 재생 시도, 볼륨:', this.bgMusic.volume, '잠금해제:', this.isUnlocked);
      
      // 루프 설정 확인
      this.bgMusic.loop = true;
      console.log('루프 설정:', this.bgMusic.loop);
      
      // 처음부터 재생
      this.bgMusic.currentTime = 0;
      const playPromise = this.bgMusic.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('배경 음악 재생 성공! 재생 중:', !this.bgMusic.paused, '루프:', this.bgMusic.loop);
        }).catch(e => {
          console.error('배경 음악 재생 실패:', e);
          console.log('브라우저가 자동 재생을 차단했습니다. 다시 시작 버튼을 눌러주세요.');
        });
      }
      
      // 음악이 끝났을 때 이벤트 리스너 (디버깅용)
      this.bgMusic.addEventListener('ended', () => {
        console.log('배경 음악 종료됨 (루프가 작동 안함?)');
      });
    } else {
      console.log('배경 음악이 없거나 볼륨이 0입니다.');
    }
  },
  
  // 배경 음악 정지
  stopBackgroundMusic: function() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  },
  
  // 배경 음악 일시정지
  pauseBackgroundMusic: function() {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  },
  
  // 배경 음악 재개
  resumeBackgroundMusic: function() {
    if (this.bgMusic && this.musicVolume > 0) {
      this.bgMusic.play().catch(e => {
        console.log('배경 음악 재생 실패:', e);
      });
    }
  },
  
  // 효과음 재생
  playSound: function(type) {
    if (!this.isUnlocked) {
      console.log('오디오가 아직 잠금 해제되지 않았습니다.');
      return;
    }
    
    if (this.sfxVolume === 0) {
      console.log('효과음 볼륨이 0입니다.');
      return;
    }
    
    let sound = null;
    
    switch(type) {
      case 'hit':
        sound = this.hitSound;
        break;
      case 'item':
        sound = this.itemSound;
        break;
      case 'powerup':
        sound = this.powerupSound;
        break;
      case 'gameover':
        sound = this.gameoverSound;
        break;
    }
    
    if (sound) {
      console.log(`효과음 재생 시도 (${type}), 볼륨:`, sound.volume);
      // 소리를 처음부터 재생 (이미 재생 중이어도)
      sound.currentTime = 0;
      const playPromise = sound.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log(`효과음 재생 성공 (${type})`);
        }).catch(e => {
          console.error(`효과음 재생 실패 (${type}):`, e);
        });
      }
    } else {
      console.log(`효과음 파일이 없습니다 (${type})`);
    }
  }
};

// 전역에서 접근 가능하도록 설정
window.AudioManager = AudioManager;

// 페이지 로드 시 오디오 초기화
window.addEventListener('load', () => {
  AudioManager.init();
});
