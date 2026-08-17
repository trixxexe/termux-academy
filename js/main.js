/**
 * MAIN.JS
 * Responsibilities: Termux Mobile Academy Orchestrator,
 * GSAP ScrollTrigger scroll-reveal engine, text-scramble heading reveal,
 * GitHub stats counter, tactile touch feedback handler,
 * bottom nav tab routing (Vault, Roadmap, Guides & Setup), live data loading,
 * tier counts sync, toast HUD notifications, and system status updates.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CommandsRenderer } from './commands.js';
import { SearchManager } from './search.js';
import { SetupWizard } from './setup-wizard.js';
import { GitHubStatsCounter } from './github-stats.js';
import commandsData from '../data/commands.json';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

class TermuxMobileApp {
  constructor() {
    this.commands = [];
    this.activeTab = 'commands'; // 'commands' | 'tiers' | 'setup'

    this.commandsRenderer = null;
    this.searchManager = null;
    this.setupWizard = null;
    this.githubStats = null;

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.scrambledHeadings = new WeakSet();

    this.init();
  }

  async init() {
    // 1. Setup Toast global helper
    this.initToastSystem();

    // 2. Start Live Clock & Battery telemetry
    this.initSystemStatusBar();

    // 3. Bind Bottom Navigation Tabs
    this.initBottomNav();

    // 4. Bind Header Action Buttons (Search & Help)
    this.initHeaderActions();

    // 5. Bind Help Modal Sheet
    this.initHelpModal();

    // 6. Bind Tiers Explore Buttons
    this.initTiersActions();

    // 7. Initialize Global Touch Feedback & Visibility listener
    this.initTouchFeedback();
    this.initVisibilityListener();

    // 8. Load 292 Commands Database
    await this.loadCommands();

    // 9. Initialize Sub-modules
    // Commands Renderer
    const vaultContainer = document.getElementById('vault-cards-list');
    this.commandsRenderer = new CommandsRenderer(vaultContainer, this.commands);

    // Search Manager
    this.searchManager = new SearchManager(this.commands, (filtered) => {
      this.commandsRenderer.setCommands(filtered);
    });

    // Setup Wizard
    this.setupWizard = new SetupWizard();

    // GitHub Stats Counter
    this.githubStats = new GitHubStatsCounter();

    // 10. Update UI Counts
    this.updateCommandCounts();

    // 11. Initialize GSAP Scroll Reveals & Text Scramble
    this.initScrollAnimations();
    this.initTextScrambleEngine();

    // Stagger helper for vault cards
    window.triggerVaultCardsStagger = () => {
      this.animateVaultCards();
    };

    // 12. Handle hash routing if present
    this.handleUrlHash();
  }

  initToastSystem() {
    const toastEl = document.getElementById('app-toast');
    const toastText = document.getElementById('toast-text');
    let toastTimer = null;

    window.showAppToast = (msg, duration = 1800) => {
      if (!toastEl || !toastText) return;
      toastText.textContent = msg;
      toastEl.classList.add('is-visible');

      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toastEl.classList.remove('is-visible');
      }, duration);
    };
  }

  initSystemStatusBar() {
    const clockEl = document.getElementById('sys-clock');
    const updateTime = () => {
      if (!clockEl) return;
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      clockEl.textContent = `${h}:${m}`;
    };
    updateTime();
    setInterval(updateTime, 10000);

    // Battery API if available
    const batteryEl = document.getElementById('sys-battery-indicator');
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        const updateBattery = () => {
          if (!batteryEl) return;
          const level = Math.round(battery.level * 100);
          const charging = battery.charging ? ' ⚡' : '';
          batteryEl.textContent = `${level}%${charging}`;
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch(() => {});
    }
  }

  initTouchFeedback() {
    // Mobile tactile feedback on buttons, chips, and interactive cards
    document.addEventListener('touchstart', (e) => {
      const interactiveEl = e.target.closest('.touch-interactive, .cmd-act-btn, .quick-cmd-chip, .tier-pill, .cat-chip, .nav-tab-btn, .step-checkbox-btn, .tier-card, .tier-explore-btn');
      if (interactiveEl) {
        interactiveEl.classList.add('touch-active');
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const activeEls = document.querySelectorAll('.touch-active');
      activeEls.forEach((el) => el.classList.remove('touch-active'));
    }, { passive: true });

    document.addEventListener('touchcancel', (e) => {
      const activeEls = document.querySelectorAll('.touch-active');
      activeEls.forEach((el) => el.classList.remove('touch-active'));
    }, { passive: true });
  }

  initVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause active GSAP animations when tab is backgrounded
        gsap.globalTimeline.pause();
      } else {
        // Resume GSAP animations when tab becomes visible
        gsap.globalTimeline.resume();
      }
    });
  }

  initScrollAnimations() {
    if (this.prefersReducedMotion) return;

    // Scroll-reveal on cards/sections using ScrollTrigger
    const revealElements = document.querySelectorAll('.tier-card, .setup-step-card, .guide-card, .github-stats-bar, .panel-hero-card');

    revealElements.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });

    // Accent Trace Line reveal
    const traceLines = document.querySelectorAll('.accent-trace-line');
    traceLines.forEach((line) => {
      gsap.fromTo(
        line,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: line.parentElement,
            start: 'top 88%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });
  }

  animateVaultCards() {
    if (this.prefersReducedMotion) return;
    const cards = Array.from(document.querySelectorAll('#vault-cards-list .cmd-card')).slice(0, 15);
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.045,
        ease: 'power2.out'
      }
    );
  }

  initTextScrambleEngine() {
    const scrambleElements = document.querySelectorAll('.scramble-target');
    const chars = '01#$_/[]<>*!ABCXYZ{}~';

    const scrambleText = (el) => {
      if (this.scrambledHeadings.has(el)) return;
      this.scrambledHeadings.add(el);

      const originalText = el.textContent || '';
      const totalFrames = 18;
      let frame = 0;

      const interval = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const revealedChars = Math.floor(progress * originalText.length);

        let scrambled = '';
        for (let i = 0; i < originalText.length; i++) {
          if (originalText[i] === ' ') {
            scrambled += ' ';
          } else if (i < revealedChars) {
            scrambled += originalText[i];
          } else {
            scrambled += chars[Math.floor(Math.random() * chars.length)];
          }
        }

        el.textContent = scrambled;

        if (frame >= totalFrames) {
          clearInterval(interval);
          el.textContent = originalText;
        }
      }, 25);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            scrambleText(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    scrambleElements.forEach((el) => observer.observe(el));
  }

  initBottomNav() {
    const navButtons = document.querySelectorAll('[data-nav-tab]');
    navButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.navTab;
        if (tab) {
          this.switchTab(tab);
        }
      });
    });
  }

  switchTab(tabName) {
    if (!['commands', 'tiers', 'setup'].includes(tabName)) return;

    this.activeTab = tabName;

    // 1. Update Bottom Nav buttons
    const navButtons = document.querySelectorAll('[data-nav-tab]');
    navButtons.forEach((btn) => {
      if (btn.dataset.navTab === tabName) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    // 2. Toggle Tab Panels
    const panels = document.querySelectorAll('[data-tab-panel]');
    panels.forEach((panel) => {
      if (panel.dataset.tabPanel === tabName) {
        panel.classList.add('is-active');
        panel.style.display = 'flex';
      } else {
        panel.classList.remove('is-active');
        panel.style.display = 'none';
      }
    });

    // Refresh GSAP ScrollTrigger calculations on tab switch
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 50);

    // 3. Update URL hash cleanly
    try {
      history.replaceState(null, '', `#${tabName}`);
    } catch (e) {}

    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  initHeaderActions() {
    const searchTrigger = document.getElementById('hdr-search-trigger');
    if (searchTrigger) {
      searchTrigger.addEventListener('click', () => {
        this.switchTab('commands');
        const searchInput = document.getElementById('vault-search-input');
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 150);
        }
      });
    }

    const helpTrigger = document.getElementById('hdr-help-trigger');
    if (helpTrigger) {
      helpTrigger.addEventListener('click', () => {
        this.openHelpModal();
      });
    }
  }

  initHelpModal() {
    const modal = document.getElementById('help-modal');
    const closeBtn = document.getElementById('modal-close-btn');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        this.closeHelpModal();
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeHelpModal();
        }
      });
    }
  }

  openHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  closeHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  initTiersActions() {
    const exploreButtons = document.querySelectorAll('[data-explore-tier]');
    exploreButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tier = btn.dataset.exploreTier;
        if (tier) {
          this.switchTab('commands');
          if (this.searchManager) {
            this.searchManager.setTier(tier);
          }
        }
      });
    });
  }

  async loadCommands() {
    try {
      if (Array.isArray(commandsData) && commandsData.length > 0) {
        this.commands = commandsData;
        return;
      }
      const res = await fetch('/data/commands.json');
      if (res.ok) {
        this.commands = await res.json();
      } else {
        this.commands = Array.isArray(commandsData) ? commandsData : [];
      }
    } catch (e) {
      console.warn('Network fetch for commands.json bypassed, using bundled dataset:', e);
      this.commands = Array.isArray(commandsData) ? commandsData : [];
    }
  }

  updateCommandCounts() {
    const total = this.commands.length;
    const headerCount = document.getElementById('header-cmd-count');
    if (headerCount) headerCount.textContent = `${total}`;

    const catAllCount = document.getElementById('cat-count-all');
    if (catAllCount) catAllCount.textContent = `${total}`;

    const tierCounts = {
      newbie: 0,
      basic: 0,
      normal: 0,
      advanced: 0
    };

    this.commands.forEach((c) => {
      const t = (c.tier || '').toLowerCase();
      if (tierCounts[t] !== undefined) {
        tierCounts[t]++;
      }
    });

    const pillNewbie = document.getElementById('tier-pill-newbie');
    const pillBasic = document.getElementById('tier-pill-basic');
    const pillNormal = document.getElementById('tier-pill-normal');
    const pillAdv = document.getElementById('tier-pill-advanced');

    if (pillNewbie) pillNewbie.textContent = `${tierCounts.newbie} cmds`;
    if (pillBasic) pillBasic.textContent = `${tierCounts.basic} cmds`;
    if (pillNormal) pillNormal.textContent = `${tierCounts.normal} cmds`;
    if (pillAdv) pillAdv.textContent = `${tierCounts.advanced} cmds`;
  }

  handleUrlHash() {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (['commands', 'tiers', 'setup'].includes(hash)) {
      this.switchTab(hash);
    }
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  new TermuxMobileApp();
});
