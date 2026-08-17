/**
 * MOBILE-TERMINAL.JS
 * Responsibilities: Interactive simulated mobile Termux terminal engine,
 * realistic bash command execution for all 292 commands, command history,
 * softkey toolbar operations (ESC, TAB, CTRL, ALT, -, /, ~, UP, DOWN, CLR),
 * and output styling.
 */

export class MobileTerminal {
  constructor(allCommands = [], onRunCallback = null) {
    this.commands = allCommands;
    this.onRunCallback = onRunCallback;
    this.history = [
      'neofetch',
      'pkg update',
      'termux-battery-status',
      'proot-distro login ubuntu'
    ];
    this.historyIndex = -1;
    this.isRunning = false;

    this.container = document.getElementById('term-screen');
    this.stream = document.getElementById('term-stream');
    this.inputField = document.getElementById('term-input-field');
    this.execBtn = document.getElementById('term-exec-btn');

    this.init();
  }

  setCommands(cmds) {
    this.commands = cmds;
  }

  init() {
    if (!this.container || !this.inputField) return;

    this.bindEvents();
    this.bindSoftkeys();
    this.bindQuickChips();
  }

  bindEvents() {
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.executeCurrentInput();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateHistory('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateHistory('down');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.autocomplete();
      }
    });

    if (this.execBtn) {
      this.execBtn.addEventListener('click', () => {
        this.executeCurrentInput();
      });
    }
  }

  bindSoftkeys() {
    const softkeys = document.querySelectorAll('.softkey-btn');
    softkeys.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = btn.dataset.key;
        this.handleSoftkey(key);
      });
    });
  }

  bindQuickChips() {
    const chips = document.querySelectorAll('.quick-cmd-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const cmdText = chip.dataset.cmd;
        if (cmdText) {
          this.runCommand(cmdText);
        }
      });
    });
  }

  handleSoftkey(key) {
    if (!this.inputField) return;

    switch (key) {
      case 'ESC':
        this.inputField.value = '';
        this.inputField.focus();
        break;
      case 'TAB':
        this.autocomplete();
        break;
      case 'UP':
        this.navigateHistory('up');
        break;
      case 'DOWN':
        this.navigateHistory('down');
        break;
      case 'CLEAR':
        this.clearScreen();
        break;
      case 'CTRL':
      case 'ALT':
        // Flash input field
        this.inputField.focus();
        break;
      case '-':
        this.insertTextAtCursor('-');
        break;
      case '/':
        this.insertTextAtCursor('/');
        break;
      case '~':
        this.insertTextAtCursor('~');
        break;
    }
  }

  insertTextAtCursor(text) {
    const field = this.inputField;
    const start = field.selectionStart || field.value.length;
    const end = field.selectionEnd || field.value.length;
    const val = field.value;
    field.value = val.substring(0, start) + text + val.substring(end);
    field.selectionStart = field.selectionEnd = start + text.length;
    field.focus();
  }

  autocomplete() {
    const cur = this.inputField.value.trim();
    if (!cur) return;

    const matches = this.commands.filter((c) =>
      c.syntax.toLowerCase().startsWith(cur.toLowerCase()) ||
      c.name.toLowerCase().startsWith(cur.toLowerCase())
    );

    if (matches.length === 1) {
      this.inputField.value = matches[0].syntax;
    } else if (matches.length > 1) {
      const suggestions = matches.slice(0, 8).map((c) => c.syntax).join('   ');
      this.appendLine(`\n${suggestions}`, 'term-out-info');
    }
  }

  navigateHistory(direction) {
    if (this.history.length === 0) return;

    if (direction === 'up') {
      if (this.historyIndex === -1) {
        this.historyIndex = this.history.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex--;
      }
    } else if (direction === 'down') {
      if (this.historyIndex !== -1) {
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
        } else {
          this.historyIndex = -1;
          this.inputField.value = '';
          return;
        }
      }
    }

    if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
      this.inputField.value = this.history[this.historyIndex];
    }
  }

  clearScreen() {
    if (!this.stream) return;
    this.stream.innerHTML = `
      <div class="term-line term-welcome-banner">
        <span class="term-accent-bold">TERMUX v0.118 (Linux 6.1.45-android aarch64)</span><br />
        <span class="term-muted">Screen cleared. Ready for input.</span>
      </div>
    `;
    if (this.inputField) {
      this.inputField.value = '';
      this.inputField.focus();
    }
  }

  executeCurrentInput() {
    if (!this.inputField) return;
    const rawCmd = this.inputField.value.trim();
    if (!rawCmd) return;

    this.runCommand(rawCmd);
    this.inputField.value = '';
  }

  runCommand(cmdString) {
    const cmd = cmdString.trim();
    if (!cmd) return;

    // Add to history if not duplicate of last
    if (this.history[this.history.length - 1] !== cmd) {
      this.history.push(cmd);
    }
    this.historyIndex = -1;

    // Append Command Input line
    this.appendCommandLine(cmd);

    // Process output
    this.processCommand(cmd);

    // Scroll to bottom
    this.scrollToBottom();
  }

  appendCommandLine(cmdText) {
    if (!this.stream) return;
    const line = document.createElement('div');
    line.className = 'term-line term-cmd-entry';
    line.innerHTML = `
      <span class="term-prompt-tag">u0_a249:~$</span>
      <span class="term-cmd-text">${this.escapeHtml(cmdText)}</span>
    `;
    this.stream.appendChild(line);
  }

  appendLine(text, className = '') {
    if (!this.stream) return;
    const line = document.createElement('div');
    line.className = `term-line term-cmd-output ${className}`;
    line.textContent = text;
    this.stream.appendChild(line);
    this.scrollToBottom();
  }

  appendHtmlLine(html, className = '') {
    if (!this.stream) return;
    const line = document.createElement('div');
    line.className = `term-line term-cmd-output ${className}`;
    line.innerHTML = html;
    this.stream.appendChild(line);
    this.scrollToBottom();
  }

  processCommand(rawCmd) {
    const lower = rawCmd.toLowerCase();

    // 1. Built-in special commands
    if (lower === 'clear' || lower === 'cls') {
      this.clearScreen();
      return;
    }

    if (lower === 'about' || lower === 'ritam') {
      this.appendHtmlLine(`
<span class="term-accent-bold">TERMUX ACADEMY</span> — The Definitive Mobile Linux &amp; Termux Guide
<span style="color:#a3a3a3;">Architecture: Pure Client-side AMOLED • 292 Indexed Commands</span>
<span style="color:#ef4444;">♥</span> <span class="term-green">Made with love By Ritam</span>
      `, 'term-out-info');
      return;
    }

    if (lower === 'help') {
      this.appendHtmlLine(`
<span class="term-accent-bold">TERMUX ACADEMY COMMAND SIMULATOR</span>
Available built-in commands:
  • <span class="term-green">neofetch / fastfetch</span>  Display simulated device and Termux specs
  • <span class="term-green">pkg update</span>             Update package mirrors & dependencies
  • <span class="term-green">termux-battery-status</span>  Inspect battery telemetry via Termux:API
  • <span class="term-green">proot-distro login</span>     Enter simulated Ubuntu guest environment
  • <span class="term-green">cmatrix</span>                  Simulate green Matrix raining code
  • <span class="term-green">about</span>                    Creator credits & platform info
  • <span class="term-green">history</span>                  View executed command history
  • <span class="term-green">clear</span>                    Clear terminal console screen
  • <span class="term-green">help</span>                     Show this help guide

<span class="term-muted">Type any of the 292 commands from the Vault to see live simulation.</span>
<span class="term-muted">Termux Academy • Made with love By Ritam</span>
      `, 'term-out-info');
      return;
    }

    if (lower === 'history') {
      const historyList = this.history
        .map((h, i) => ` ${String(i + 1).padStart(3, ' ')}  ${this.escapeHtml(h)}`)
        .join('\n');
      this.appendLine(historyList);
      return;
    }

    if (lower === 'cmatrix') {
      this.appendHtmlLine(`
<span style="color:#00ff66;font-family:monospace;line-height:1.2;">
0 1 0 1 1 0 1 0 0 1 0 1 0 1 1 0
1 0 0 1 0 1 1 0 1 0 0 1 0 1 0 1
0 1 1 0 1 0 0 1 0 1 1 0 1 0 1 0
[cmatrix matrix cascade active - press Ctrl+C to terminate]
</span>
      `);
      return;
    }

    // 2. Search matched command in database
    const matched = this.findMatchingCommand(rawCmd);

    if (matched && matched.exampleOutput) {
      this.typeStreamOutput(matched.exampleOutput);
      return;
    }

    // 3. Fallback heuristic responses for common CLI utilities
    if (lower.startsWith('pkg install') || lower.startsWith('apt install')) {
      const pkgName = rawCmd.split(' ').slice(2).join(' ') || 'package';
      this.typeStreamOutput(`Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  ${pkgName}\n0 upgraded, 1 newly installed, 0 to remove.\nNeed to get 2,418 kB of archives.\nAfter this operation, 9,840 kB of additional disk space will be used.\nGet:1 https://packages.termux.dev/apt/termux-main stable/main aarch64 ${pkgName} [2,418 kB]\nFetched 2,418 kB in 0s (5,120 kB/s)\nSelecting previously unselected package ${pkgName}.\n(Reading database ... 24192 files and directories currently installed.)\nPreparing to unpack .../${pkgName}.deb ...\nUnpacking ${pkgName} ...\nSetting up ${pkgName} ...\n✓ Installation completed successfully.`);
      return;
    }

    if (lower.startsWith('ls')) {
      this.appendHtmlLine(`
<span style="color:#60a5fa;font-weight:700;">storage</span>  <span style="color:#60a5fa;font-weight:700;">projects</span>  <span style="color:#60a5fa;font-weight:700;">scripts</span>  <span style="color:#4ade80;">app.py</span>  <span style="color:#f5f5f5;">notes.txt</span>  <span style="color:#4ade80;">server.js</span>
      `);
      return;
    }

    if (lower.startsWith('pwd')) {
      this.typeStreamOutput('/data/data/com.termux/files/home');
      return;
    }

    if (lower.startsWith('whoami')) {
      this.typeStreamOutput('u0_a249');
      return;
    }

    if (lower.startsWith('uname')) {
      this.typeStreamOutput('Linux localhost 6.1.45-android-g89e3a aarch64 Android');
      return;
    }

    if (lower.startsWith('date')) {
      this.typeStreamOutput(new Date().toString());
      return;
    }

    // Command not found
    this.appendHtmlLine(
      `bash: ${this.escapeHtml(rawCmd)}: command executed in simulation.<br><span class="term-muted">Tip: Browse the Vault tab to copy or run verified Termux commands.</span>`,
      'term-out-error'
    );
  }

  typeStreamOutput(rawText, className = '') {
    if (!this.stream) return;
    const line = document.createElement('div');
    line.className = `term-line term-cmd-output ${className}`;
    
    const textSpan = document.createElement('span');
    const cursor = document.createElement('span');
    cursor.className = 'live-stream-cursor';
    cursor.textContent = '█';

    line.appendChild(textSpan);
    line.appendChild(cursor);
    this.stream.appendChild(line);
    this.scrollToBottom();

    let charIdx = 0;
    const text = rawText;
    const speed = 4 + Math.random() * 4;

    const streamNext = () => {
      if (charIdx < text.length) {
        textSpan.textContent += text[charIdx];
        charIdx++;
        if (charIdx % 10 === 0) this.scrollToBottom();
        setTimeout(streamNext, speed);
      } else {
        this.scrollToBottom();
      }
    };

    streamNext();
  }

  findMatchingCommand(input) {
    const clean = input.trim().toLowerCase();
    
    // Exact syntax match
    let match = this.commands.find((c) => c.syntax.toLowerCase() === clean);
    if (match) return match;

    // Exact name match
    match = this.commands.find((c) => c.name.toLowerCase() === clean);
    if (match) return match;

    // Starts with syntax
    match = this.commands.find((c) => clean.startsWith(c.syntax.toLowerCase()));
    if (match) return match;

    // Contains name
    match = this.commands.find((c) => clean.includes(c.name.toLowerCase()));
    if (match) return match;

    return null;
  }

  scrollToBottom() {
    if (!this.container) return;
    requestAnimationFrame(() => {
      this.container.scrollTop = this.container.scrollHeight;
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
