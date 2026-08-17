/**
 * BOOT-SEQUENCE.JS
 * Responsibilities: Real character-by-character boot typing engine,
 * realistic Android/Linux aarch64 kernel bootstrap simulation,
 * blinking block cursor that follows typing stream,
 * skip on user tap, and pause on visibility change / off-screen.
 */

export class BootSequence {
  constructor(containerElement, onCompleteCallback = null) {
    this.container = containerElement;
    this.onCompleteCallback = onCompleteCallback;
    this.isPaused = false;
    this.isCompleted = false;
    this.currentTimeout = null;

    this.bootLines = [
      '[  0.000000] Linux version 6.1.45-android-aarch64 (termux@builder) #1 SMP PREEMPT',
      '[  0.041210] Memory: 7892340K/8388608K available (14336K kernel code, 2048K data)',
      '[  0.112040] CPU0: ARMv8 Processor [410fd034] revision 4 (aarch64 8 cores)',
      '[  0.198320] Termux prefix: /data/data/com.termux/files/usr',
      '[  0.245100] Storage subsystem initialized: /sdcard symlinked to ~/storage',
      '[  0.312900] PRoot engine ready: proot-distro v4.18 (guest rootfs available)',
      '[  0.389400] Termux API bridge active: battery, sensors, torch, clipboard',
      '[  0.450120] 292 commands indexed across 11 subsystems.',
      '[  0.510000] Initializing interactive shell (bash v5.2.21)...',
      'TERMUX ACADEMY BOOT SUCCESSFUL. Type "help" or select a quick chip.'
    ];

    this.init();
  }

  init() {
    if (!this.container) return;

    // Handle visibility changes (pause when tab hidden)
    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
    });

    // Skip typing on tap
    this.container.addEventListener('click', () => {
      if (!this.isCompleted) {
        this.skipToComplete();
      }
    });
  }

  async start() {
    if (!this.container) return;
    this.container.innerHTML = '';
    this.isCompleted = false;

    for (let lineIndex = 0; lineIndex < this.bootLines.length; lineIndex++) {
      if (this.isCompleted) break;
      const text = this.bootLines[lineIndex];
      const isHeader = lineIndex === 0;
      const isSuccess = lineIndex === this.bootLines.length - 1;

      const lineEl = document.createElement('div');
      lineEl.className = `term-line ${isHeader ? 'term-accent-bold' : ''} ${isSuccess ? 'term-green' : ''}`;
      this.container.appendChild(lineEl);

      await this.typeLine(lineEl, text);

      // Small pause between lines
      await this.wait(40);
    }

    this.finish();
  }

  typeLine(element, text) {
    return new Promise((resolve) => {
      let charIndex = 0;

      // Create text span + blinking cursor
      const textSpan = document.createElement('span');
      const cursorSpan = document.createElement('span');
      cursorSpan.className = 'boot-cursor';
      cursorSpan.textContent = '█';

      element.appendChild(textSpan);
      element.appendChild(cursorSpan);

      const typeNextChar = () => {
        if (this.isCompleted) {
          textSpan.textContent = text;
          cursorSpan.remove();
          resolve();
          return;
        }

        if (this.isPaused) {
          this.currentTimeout = setTimeout(typeNextChar, 100);
          return;
        }

        if (charIndex < text.length) {
          // Dynamic typing speed: fast for brackets, realistic for words
          const char = text[charIndex];
          textSpan.textContent += char;
          charIndex++;

          // Auto-scroll screen
          const screen = document.getElementById('term-screen');
          if (screen) {
            screen.scrollTop = screen.scrollHeight;
          }

          let delay = 12 + Math.random() * 12;
          if (char === ' ' || char === ']') delay += 10;
          if (char === '.') delay += 8;

          this.currentTimeout = setTimeout(typeNextChar, delay);
        } else {
          // Keep cursor temporarily on last line or remove on intermediate
          cursorSpan.remove();
          resolve();
        }
      };

      typeNextChar();
    });
  }

  skipToComplete() {
    this.isCompleted = true;
    clearTimeout(this.currentTimeout);
    if (!this.container) return;

    this.container.innerHTML = '';
    this.bootLines.forEach((line, idx) => {
      const isHeader = idx === 0;
      const isSuccess = idx === this.bootLines.length - 1;
      const div = document.createElement('div');
      div.className = `term-line ${isHeader ? 'term-accent-bold' : ''} ${isSuccess ? 'term-green' : ''}`;
      div.textContent = line;
      this.container.appendChild(div);
    });

    this.finish();
  }

  finish() {
    this.isCompleted = true;
    // Add active blinking cursor at the end
    const lastLine = this.container.lastElementChild;
    if (lastLine && !lastLine.querySelector('.boot-cursor')) {
      const cursor = document.createElement('span');
      cursor.className = 'terminal-cursor';
      lastLine.appendChild(cursor);
    }

    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }

  wait(ms) {
    return new Promise((r) => {
      this.currentTimeout = setTimeout(r, ms);
    });
  }
}
