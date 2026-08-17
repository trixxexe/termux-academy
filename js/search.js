/**
 * SEARCH.JS
 * Responsibilities: Real-time search with Fuse.js fallback,
 * simultaneous category and tier filtering, debouncing,
 * and GSAP timeline stagger animations on tier/filter changes.
 */

export class SearchManager {
  constructor(commandsData = [], onFilterChange = null) {
    this.commands = commandsData;
    this.onFilterChange = onFilterChange;
    this.currentQuery = '';
    this.currentCategory = 'all';
    this.currentTier = 'all';
    this.fuse = null;
    this.debounceTimer = null;
    this.isAnimatingSwitch = false;

    this.searchInput = document.getElementById('vault-search-input');
    this.clearBtn = document.getElementById('vault-search-clear');
    this.tierPills = document.querySelectorAll('.tier-pill');
    this.catChips = document.querySelectorAll('.cat-chip');

    this.initFuse();
    this.bindEvents();
  }

  setCommands(cmds) {
    this.commands = cmds;
    this.initFuse();
    this.applyFilters(false);
  }

  initFuse() {
    if (typeof window.Fuse !== 'undefined' && this.commands.length > 0) {
      const options = {
        keys: [
          { name: 'name', weight: 0.35 },
          { name: 'syntax', weight: 0.3 },
          { name: 'tags', weight: 0.2 },
          { name: 'description', weight: 0.15 }
        ],
        threshold: 0.35,
        ignoreLocation: true,
        useExtendedSearch: true
      };
      this.fuse = new window.Fuse(this.commands, options);
    }
  }

  bindEvents() {
    // 1. Search Input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.currentQuery = e.target.value.trim();
          if (this.clearBtn) {
            this.clearBtn.style.display = this.currentQuery ? 'block' : 'none';
          }
          this.applyFilters(false);
        }, 120);
      });
    }

    // Clear search
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        if (this.searchInput) {
          this.searchInput.value = '';
          this.currentQuery = '';
          this.clearBtn.style.display = 'none';
          this.applyFilters(false);
          this.searchInput.focus();
        }
      });
    }

    // 2. Tier Pills (With Stagger Animation)
    this.tierPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        if (this.isAnimatingSwitch) return;
        this.tierPills.forEach((p) => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        this.currentTier = pill.dataset.tier || 'all';
        this.applyFilters(true);
      });
    });

    // 3. Category Chips
    this.catChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        if (this.isAnimatingSwitch) return;
        this.catChips.forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        this.currentCategory = chip.dataset.cat || 'all';
        this.applyFilters(true);
      });
    });
  }

  setTier(tierName) {
    this.currentTier = tierName;
    this.tierPills.forEach((pill) => {
      if (pill.dataset.tier === tierName) {
        pill.classList.add('is-active');
      } else {
        pill.classList.remove('is-active');
      }
    });
    this.applyFilters(true);
  }

  setCategory(catName) {
    this.currentCategory = catName;
    this.catChips.forEach((chip) => {
      if (chip.dataset.cat === catName) {
        chip.classList.add('is-active');
      } else {
        chip.classList.remove('is-active');
      }
    });
    this.applyFilters(true);
  }

  applyFilters(animateTransition = false) {
    let results = this.commands;

    // 1. Text Search Filter
    if (this.currentQuery) {
      if (this.fuse) {
        const fuseResults = this.fuse.search(this.currentQuery);
        results = fuseResults.map((r) => r.item);
      } else {
        const q = this.currentQuery.toLowerCase();
        results = results.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.syntax.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }
    }

    // 2. Tier Filter
    if (this.currentTier !== 'all') {
      results = results.filter((c) => (c.tier || '').toLowerCase() === this.currentTier.toLowerCase());
    }

    // 3. Category Filter
    if (this.currentCategory !== 'all') {
      results = results.filter(
        (c) => (c.category || '').toLowerCase() === this.currentCategory.toLowerCase()
      );
    }

    if (!animateTransition) {
      if (this.onFilterChange) {
        this.onFilterChange(results);
      }
      return;
    }

    // Requirement 6: Tier-switch stagger with GSAP timeline
    const container = document.getElementById('vault-cards-list');
    const existingCards = container ? Array.from(container.querySelectorAll('.cmd-card')).slice(0, 15) : [];

    if (existingCards.length > 0 && typeof window.gsap !== 'undefined') {
      this.isAnimatingSwitch = true;
      const tl = window.gsap.timeline({
        onComplete: () => {
          if (this.onFilterChange) {
            this.onFilterChange(results);
          }
          // Stagger in new cards
          setTimeout(() => {
            const newCards = container ? Array.from(container.querySelectorAll('.cmd-card')).slice(0, 15) : [];
            if (newCards.length > 0) {
              window.gsap.fromTo(
                newCards,
                { opacity: 0, y: 18 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.25,
                  stagger: 0.035,
                  ease: 'power2.out',
                  onComplete: () => {
                    this.isAnimatingSwitch = false;
                  }
                }
              );
            } else {
              this.isAnimatingSwitch = false;
            }
          }, 20);
        }
      });

      // Fast stagger-out (~140ms, 20ms stagger)
      tl.to(existingCards, {
        opacity: 0,
        y: -10,
        duration: 0.14,
        stagger: 0.02,
        ease: 'power1.in'
      });
    } else {
      if (this.onFilterChange) {
        this.onFilterChange(results);
      }
    }
  }
}

