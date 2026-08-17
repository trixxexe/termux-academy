/**
 * GITHUB-STATS.JS
 * Responsibilities: Real-time count-up telemetry interpolation (0 -> Target)
 * over ~800ms via requestAnimationFrame, triggered when scrolled into view
 * via IntersectionObserver, pausing when off-screen or tab hidden.
 */

export class GitHubStatsCounter {
  constructor(containerElement) {
    this.container = containerElement;
    this.hasAnimated = false;
    this.isPaused = false;
    this.stats = [
      { id: 'stat-stars', target: 14820, suffix: '', formatK: true, label: 'GitHub Stars' },
      { id: 'stat-forks', target: 3240, suffix: '', formatK: true, label: 'Forks' },
      { id: 'stat-cmds', target: 292, suffix: '', formatK: false, label: 'Commands' },
      { id: 'stat-distros', target: 11, suffix: '', formatK: false, label: 'Subsystems' }
    ];

    this.init();
  }

  init() {
    if (!this.container) return;

    // Render placeholder markup
    this.render();

    // Listen to tab visibility
    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
    });

    // Observer to trigger count-up once in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.hasAnimated = true;
            this.animateCounters();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(this.container);
  }

  render() {
    let html = `
      <div class="accent-trace-line" id="trace-github-stats"></div>
    `;
    this.stats.forEach((st) => {
      html += `
        <div class="stat-item touch-interactive" data-stat-id="${st.id}">
          <span class="stat-value" id="${st.id}">0</span>
          <span class="stat-label">${st.label}</span>
        </div>
      `;
    });
    this.container.innerHTML = html;
  }

  animateCounters() {
    const duration = 800; // ~800ms per requirements
    const startTime = performance.now();

    const updateFrame = (currentTime) => {
      if (this.isPaused) {
        requestAnimationFrame(updateFrame);
        return;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic curve
      const easeOut = 1 - Math.pow(1 - progress, 3);

      this.stats.forEach((st) => {
        const el = document.getElementById(st.id);
        if (!el) return;

        const currentVal = Math.round(st.target * easeOut);
        if (st.formatK && currentVal >= 1000) {
          el.textContent = `${(currentVal / 1000).toFixed(1)}k`;
        } else {
          el.textContent = currentVal.toLocaleString();
        }
      });

      if (progress < 1) {
        requestAnimationFrame(updateFrame);
      } else {
        // Ensure final exact formatted numbers
        this.stats.forEach((st) => {
          const el = document.getElementById(st.id);
          if (!el) return;
          if (st.formatK && st.target >= 1000) {
            el.textContent = `${(st.target / 1000).toFixed(1)}k`;
          } else {
            el.textContent = st.target.toLocaleString();
          }
        });
      }
    };

    requestAnimationFrame(updateFrame);
  }

  triggerTraceLine() {
    const line = document.getElementById('trace-github-stats');
    if (line) {
      line.classList.add('is-drawn');
    }
  }
}
