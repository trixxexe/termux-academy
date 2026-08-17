/**
 * SETUP-WIZARD.JS
 * Responsibilities: Android Termux step-by-step onboarding protocol,
 * persistent progress tracking in localStorage, animated left-to-right completion fill lines,
 * smoothly transitioning top progress bar, and 1-tap copy icon morphing.
 */

export class SetupWizard {
  constructor(onRunCallback = null) {
    this.storageKey = 'termux_academy_setup_progress_v2';
    this.onRunCallback = onRunCallback;
    this.container = document.getElementById('setup-steps-container');
    this.progressFill = document.getElementById('setup-progress-fill');
    this.progressPct = document.getElementById('setup-progress-pct');

    this.steps = [
      {
        id: 'step-1',
        number: '1',
        title: 'Install Official Termux from F-Droid',
        desc: 'CRITICAL: Do NOT use the Google Play Store build — it is completely deprecated and fails to update packages due to Android 10+ target SDK policies. Download from F-Droid or GitHub Releases.',
        command: 'https://f-droid.org/packages/com.termux/',
        isLink: true
      },
      {
        id: 'step-2',
        number: '2',
        title: 'Grant Android Shared Storage Permission',
        desc: 'Permits Termux to access your internal storage (/sdcard), Downloads, and DCIM folders, creating symlinks inside ~/storage.',
        command: 'termux-setup-storage'
      },
      {
        id: 'step-3',
        number: '3',
        title: 'Update Package Index & Mirrors',
        desc: 'Refreshes apt/pkg package repositories and upgrades core bootstrap utilities to the latest versions.',
        command: 'pkg update && pkg upgrade -y'
      },
      {
        id: 'step-4',
        number: '4',
        title: 'Install Essential CLI Tools & Utilities',
        desc: 'Equips Termux with git, curl, wget, nano text editor, tmux terminal multiplexer, and tar.',
        command: 'pkg install git curl wget nano tmux tar -y'
      },
      {
        id: 'step-5',
        number: '5',
        title: 'Install Termux:API Companion System',
        desc: 'Enables device hardware access (battery, camera, torch, sensors, clipboard) through scripts.',
        command: 'pkg install termux-api -y'
      },
      {
        id: 'step-6',
        number: '6',
        title: 'Install PRoot Linux Container Engine',
        desc: 'Allows running full guest Linux distributions (Ubuntu, Debian, Kali, Alpine) without device root.',
        command: 'pkg install proot-distro -y'
      },
      {
        id: 'step-7',
        number: '7',
        title: 'Deploy Ubuntu 24.04 Rootfs & Login',
        desc: 'Downloads official Ubuntu root filesystem and launches a full root terminal session.',
        command: 'proot-distro install ubuntu && proot-distro login ubuntu'
      }
    ];

    this.completedSteps = this.loadProgress();
    this.init();
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveProgress() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.completedSteps));
    } catch (e) {
      // ignore
    }
  }

  init() {
    this.render();
    this.bindEvents();
    this.updateProgressUI();
  }

  toggleStep(stepId) {
    const card = document.getElementById(`card-${stepId}`);
    if (this.completedSteps.includes(stepId)) {
      this.completedSteps = this.completedSteps.filter((id) => id !== stepId);
      if (card) card.classList.remove('is-completed');
    } else {
      this.completedSteps.push(stepId);
      if (card) card.classList.add('is-completed');
      window.showAppToast?.('Step marked as completed!');
    }
    this.saveProgress();
    this.updateProgressUI();
  }

  updateProgressUI() {
    const total = this.steps.length;
    const completed = this.completedSteps.length;
    const pct = Math.round((completed / total) * 100);

    if (this.progressFill) {
      // Smoothly animate progress fill width
      this.progressFill.style.width = `${pct}%`;
    }

    if (this.progressPct) {
      this.progressPct.textContent = `${pct}% (${completed}/${total} completed)`;
    }
  }

  bindEvents() {
    if (!this.container) return;

    this.container.addEventListener('click', async (e) => {
      // 1. Toggle Step Checkbox
      const checkBtn = e.target.closest('[data-toggle-step]');
      if (checkBtn) {
        const stepId = checkBtn.dataset.toggleStep;
        this.toggleStep(stepId);
        return;
      }

      // 2. Copy Command with Icon Morphing
      const copyBtn = e.target.closest('[data-copy-step]');
      if (copyBtn) {
        const cmd = copyBtn.dataset.copyStep;
        if (cmd) {
          try {
            await navigator.clipboard.writeText(cmd);
            window.showAppToast?.(`Copied: "${cmd}"`);
            
            copyBtn.classList.add('is-success');
            const iconWrap = copyBtn.querySelector('.btn-icon-swap');
            if (iconWrap) {
              iconWrap.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Copied</span>
              `;
            }
            setTimeout(() => {
              copyBtn.classList.remove('is-success');
              if (iconWrap) {
                iconWrap.innerHTML = `
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                  <span>Copy</span>
                `;
              }
            }, 1000);
          } catch (err) {
            console.error('Clipboard copy failed:', err);
          }
        }
        return;
      }

      // 3. Run in Terminal
      const runBtn = e.target.closest('[data-run-step]');
      if (runBtn) {
        const cmd = runBtn.dataset.runStep;
        if (cmd && this.onRunCallback) {
          this.onRunCallback(cmd);
        }
        return;
      }
    });
  }

  render() {
    if (!this.container) return;

    let html = '';

    this.steps.forEach((step) => {
      const isDone = this.completedSteps.includes(step.id);

      html += `
        <div class="setup-step-card touch-interactive ${isDone ? 'is-completed' : ''}" id="card-${step.id}">
          <div class="step-card-hdr">
            <button
              type="button"
              class="step-checkbox-btn touch-interactive"
              data-toggle-step="${step.id}"
              aria-label="${isDone ? 'Mark as incomplete' : 'Mark as completed'}"
            >
              ${isDone ? '✓' : ''}
            </button>
            <div class="step-meta">
              <span class="step-num-tag">STEP 0${step.number}</span>
              <h3 class="step-title">${this.escapeHtml(step.title)}</h3>
              <p class="step-desc">${this.escapeHtml(step.desc)}</p>
            </div>
          </div>

          <div class="step-command-box">
            <code class="step-cmd-code">${this.escapeHtml(step.command)}</code>
            <div class="step-actions">
              ${
                !step.isLink
                  ? `
                <button type="button" class="cmd-act-btn touch-interactive" data-copy-step="${this.escapeHtml(step.command)}" title="Copy command">
                  <span class="btn-icon-swap">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                    <span>Copy</span>
                  </span>
                </button>
              `
                  : `
                <a href="${this.escapeHtml(step.command)}" target="_blank" rel="noopener noreferrer" class="cmd-act-btn preview-action-btn touch-interactive" title="Open Official F-Droid Page">
                  <span>Open ↗</span>
                </a>
              `
              }
            </div>
          </div>

          <!-- Bottom animated completion line -->
          <div class="step-completion-line" id="fill-${step.id}"></div>
        </div>
      `;
    });

    this.container.innerHTML = html;
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

