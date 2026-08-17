/**
 * COMMANDS.JS
 * Responsibilities: High-performance mobile command card renderer,
 * batch virtualization, auto-collapsing accordion expansion animation,
 * character-by-character output typing with blinking block cursor,
 * 1-tap copy with icon morphing and tactile touch feedback.
 */

export class CommandsRenderer {
  constructor(containerElement, allCommands = [], onRunCommandCallback = null) {
    this.container = containerElement;
    this.allCommands = allCommands;
    this.filteredCommands = allCommands;
    this.onRunCommandCallback = onRunCommandCallback;
    this.currentOpenCardId = null;
    this.activeTypingTimeouts = new Map();

    // DOM virtualization batch size
    this.batchSize = 25;
    this.renderedCount = 25;

    this.loadMoreBtn = document.getElementById('vault-load-more-btn');
    this.loadMoreWrap = document.getElementById('vault-load-more-wrap');

    this.init();
  }

  init() {
    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', () => {
        this.loadMore();
      });
    }

    if (this.container) {
      this.bindCardActions();
    }
  }

  setCommands(newList) {
    this.filteredCommands = newList;
    this.renderedCount = Math.min(this.batchSize, newList.length);
    this.currentOpenCardId = null;
    this.render();
  }

  loadMore() {
    this.renderedCount = Math.min(this.renderedCount + this.batchSize, this.filteredCommands.length);
    this.render();
  }

  bindCardActions() {
    this.container.addEventListener('click', async (e) => {
      // 1. Copy Action with Icon Morphing
      const copyBtn = e.target.closest('[data-copy-syntax]');
      if (copyBtn) {
        e.stopPropagation();
        const syntax = copyBtn.dataset.copySyntax;
        if (syntax) {
          try {
            await navigator.clipboard.writeText(syntax);
            window.showAppToast?.(`Copied: "${syntax}"`);
            
            // Icon Morphing to checkmark with crossfade
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

      // 2. Output Preview Action
      const previewBtn = e.target.closest('[data-preview-syntax]');
      if (previewBtn) {
        e.stopPropagation();
        const cardId = previewBtn.dataset.previewSyntax;
        if (cardId) {
          this.toggleCardPreview(cardId);
        }
        return;
      }

      // 3. Toggle Output Preview with Auto-Collapse & Typing Animation
      const toggleEl = e.target.closest('[data-toggle-preview]');
      if (toggleEl) {
        const cardId = toggleEl.dataset.togglePreview;
        this.toggleCardPreview(cardId);
        return;
      }
    });
  }

  toggleCardPreview(cardId) {
    const accordion = document.getElementById(`preview-acc-${cardId}`);
    const toggleIcon = document.getElementById(`toggle-icon-${cardId}`);
    const cardEl = document.getElementById(`card-${cardId}`);
    const cmdData = this.filteredCommands.find((c) => c.id === cardId);

    if (!accordion || !cmdData) return;

    const isAlreadyOpen = accordion.classList.contains('is-open');

    // Auto-collapse previously open card
    if (this.currentOpenCardId && this.currentOpenCardId !== cardId) {
      const prevAcc = document.getElementById(`preview-acc-${this.currentOpenCardId}`);
      const prevIcon = document.getElementById(`toggle-icon-${this.currentOpenCardId}`);
      const prevCard = document.getElementById(`card-${this.currentOpenCardId}`);
      if (prevAcc) prevAcc.classList.remove('is-open');
      if (prevIcon) prevIcon.textContent = '▼ Live Output Preview';
      if (prevCard) prevCard.classList.remove('is-expanded');
      this.cancelTyping(this.currentOpenCardId);
    }

    if (isAlreadyOpen) {
      // Collapse this card
      accordion.classList.remove('is-open');
      if (toggleIcon) toggleIcon.textContent = '▼ Live Output Preview';
      if (cardEl) cardEl.classList.remove('is-expanded');
      this.currentOpenCardId = null;
      this.cancelTyping(cardId);
    } else {
      // Expand this card
      accordion.classList.add('is-open');
      if (toggleIcon) toggleIcon.textContent = '▲ Hide Preview';
      if (cardEl) cardEl.classList.add('is-expanded');
      this.currentOpenCardId = cardId;

      // Run character-by-character output typing animation
      this.typeOutputText(cardId, cmdData.exampleOutput || 'No output recorded.');
    }
  }

  typeOutputText(cardId, outputText) {
    const screen = document.getElementById(`screen-${cardId}`);
    if (!screen) return;

    this.cancelTyping(cardId);
    screen.innerHTML = '';

    const textSpan = document.createElement('span');
    const cursor = document.createElement('span');
    cursor.className = 'live-stream-cursor';
    cursor.textContent = '█';

    screen.appendChild(textSpan);
    screen.appendChild(cursor);

    let charIdx = 0;
    const speed = 8 + Math.random() * 8;

    const typeNext = () => {
      if (charIdx < outputText.length) {
        textSpan.textContent += outputText[charIdx];
        charIdx++;
        const timeout = setTimeout(typeNext, speed);
        this.activeTypingTimeouts.set(cardId, timeout);
      } else {
        // Leave cursor blinking at the end of output
        this.activeTypingTimeouts.delete(cardId);
      }
    };

    typeNext();
  }

  cancelTyping(cardId) {
    if (this.activeTypingTimeouts.has(cardId)) {
      clearTimeout(this.activeTypingTimeouts.get(cardId));
      this.activeTypingTimeouts.delete(cardId);
    }
  }

  render() {
    if (!this.container) return;

    const countMeta = document.getElementById('vault-results-count');
    if (countMeta) {
      countMeta.textContent = `Showing ${this.filteredCommands.length} command${this.filteredCommands.length === 1 ? '' : 's'}`;
    }

    if (this.filteredCommands.length === 0) {
      this.container.innerHTML = `
        <div style="padding: 32px 16px; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.78rem; border: 1px dashed var(--border);">
          [0 results found] No commands match your search or filter criteria.
        </div>
      `;
      if (this.loadMoreWrap) this.loadMoreWrap.style.display = 'none';
      return;
    }

    const itemsToRender = this.filteredCommands.slice(0, this.renderedCount);
    let html = '';

    itemsToRender.forEach((cmd) => {
      const isOpen = this.currentOpenCardId === cmd.id;
      const dangerLevel = (cmd.dangerLevel || 'safe').toLowerCase();
      const tagsHtml = (cmd.tags || [])
        .map((t) => `<span class="cmd-tag-pill">#${this.escapeHtml(t)}</span>`)
        .join('');

      html += `
        <article class="cmd-card touch-interactive ${isOpen ? 'is-expanded' : ''}" id="card-${cmd.id}" data-id="${cmd.id}">
          <div class="cmd-card-main">
            
            <div class="cmd-header-row">
              <div class="cmd-title-group">
                <span class="cmd-name">${this.escapeHtml(cmd.name)}</span>
                <span class="cmd-cat-tag">${this.escapeHtml(cmd.category || 'General')}</span>
              </div>
              <div class="cmd-badges-group">
                <span class="cmd-tier-badge">${this.escapeHtml(cmd.tier || 'basic')}</span>
                <span class="cmd-danger-badge ${dangerLevel}">${dangerLevel}</span>
              </div>
            </div>

            <div class="cmd-syntax-box">
              <code class="cmd-syntax-text">${this.escapeHtml(cmd.syntax)}</code>
              <div class="cmd-actions">
                <button type="button" class="cmd-act-btn touch-interactive" data-copy-syntax="${this.escapeHtml(cmd.syntax)}" title="Copy command">
                  <span class="btn-icon-swap">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                    <span>Copy</span>
                  </span>
                </button>
                <button type="button" class="cmd-act-btn preview-action-btn touch-interactive" data-preview-syntax="${cmd.id}" title="Toggle Live Output">
                  <span class="btn-icon-swap">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    <span>Output</span>
                  </span>
                </button>
              </div>
            </div>

            <p class="cmd-desc">${this.escapeHtml(cmd.description)}</p>

            ${tagsHtml ? `<div class="cmd-tags-row">${tagsHtml}</div>` : ''}
          </div>

          <div class="cmd-footer-toggle touch-interactive" data-toggle-preview="${cmd.id}">
            <span id="toggle-icon-${cmd.id}">${isOpen ? '▲ Hide Preview' : '▼ Live Output Preview'}</span>
            <span>ID: ${this.escapeHtml(cmd.id)}</span>
          </div>

          <!-- Animated Accordion Drawer -->
          <div class="cmd-preview-accordion ${isOpen ? 'is-open' : ''}" id="preview-acc-${cmd.id}">
            <div class="cmd-preview-accordion-inner">
              <div class="cmd-preview-drawer">
                <span class="cmd-preview-label">Simulated Termux Output:</span>
                <div class="cmd-preview-screen" id="screen-${cmd.id}">
                  ${isOpen ? this.escapeHtml(cmd.exampleOutput || 'No output recorded.') : ''}
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    });

    this.container.innerHTML = html;

    // Trigger GSAP/scroll stagger on newly rendered items if available
    window.triggerVaultCardsStagger?.();

    // Show/hide load more button
    if (this.loadMoreWrap) {
      if (this.renderedCount < this.filteredCommands.length) {
        this.loadMoreWrap.style.display = 'flex';
      } else {
        this.loadMoreWrap.style.display = 'none';
      }
    }
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

