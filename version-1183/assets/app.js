import { H as Hls } from "./hls.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function bindMenu() {
  const toggle = $("[data-menu-toggle]");
  if (!toggle) {
    return;
  }
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("is-menu-open");
  });
}

function bindHero() {
  const slider = $("[data-hero-slider]");
  if (!slider) {
    return;
  }
  const slides = $$("[data-hero-slide]", slider);
  const dots = $$("[data-hero-dot]", slider);
  let active = 0;
  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === active));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === active));
  };
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => show(i));
  });
  show(0);
  window.setInterval(() => show(active + 1), 5200);
}

function bindSearch() {
  const inputs = $$('[data-search-input]');
  if (!inputs.length) {
    return;
  }
  const cards = $$('[data-card]');
  const empty = $('[data-empty-state]');
  const region = $('[data-filter-region]');
  const type = $('[data-filter-type]');
  const run = () => {
    const query = inputs.map((input) => input.value.trim().toLowerCase()).find(Boolean) || '';
    const regionValue = region ? region.value : '';
    const typeValue = type ? type.value : '';
    let visible = 0;
    cards.forEach((card) => {
      const haystack = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.year, card.dataset.type]
        .join(' ')
        .toLowerCase();
      const matchQuery = !query || haystack.includes(query);
      const matchRegion = !regionValue || (card.dataset.region || '').includes(regionValue);
      const matchType = !typeValue || (card.dataset.type || '').includes(typeValue);
      const show = matchQuery && matchRegion && matchType;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });
    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  };
  inputs.forEach((input) => input.addEventListener('input', run));
  if (region) {
    region.addEventListener('change', run);
  }
  if (type) {
    type.addEventListener('change', run);
  }
  run();
}

function bindPlayers() {
  $$('[data-player]').forEach((player) => {
    const video = $('video', player);
    const trigger = $('[data-play-trigger]', player);
    if (!video || !trigger) {
      return;
    }
    const source = video.dataset.stream;
    let attached = false;
    const attach = () => {
      if (attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      attached = true;
    };
    const start = () => {
      attach();
      player.classList.add('is-playing');
      video.play().catch(() => {});
    };
    trigger.addEventListener('click', start);
    video.addEventListener('click', () => {
      if (video.paused) {
        start();
      }
    });
  });
}

function boot() {
  bindMenu();
  bindHero();
  bindSearch();
  bindPlayers();
}

document.addEventListener('DOMContentLoaded', boot);
