<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface TitleEntry {
  title: string;
  tagline: string;
}

const titles: TitleEntry[] = [
  { title: "CODE", tagline: "& wandering thoughts" },
  { title: "HOLA", tagline: "@ world" },
  { title: "HIRE", tagline: "=> let's talk :)" },
  { title: "FONT", tagline: "{ bold, sans-serif }" },
  { title: "HUGS", tagline: "& happiness" },
  { title: "NODE", tagline: "& networks" },
];

const CYCLE_INTERVAL = 4000; // Time between changes (ms)
const SCRAMBLE_DURATION = 600; // Total scramble animation time (ms)
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

const currentIndex = ref(0);
const displayTitle = ref(titles[0].title);
const displayTagline = ref(titles[0].tagline);
const isTransitioning = ref(false);

let cycleTimer: ReturnType<typeof setInterval> | null = null;
let scrambleTimer: ReturnType<typeof setTimeout> | null = null;

function getRandomChar(): string {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

function scrambleText(
  from: string,
  to: string,
  onUpdate: (text: string) => void,
  onComplete: () => void
) {
  const maxLen = Math.max(from.length, to.length);
  const steps = 12;
  const stepDuration = SCRAMBLE_DURATION / steps;
  let currentStep = 0;

  const animate = () => {
    currentStep++;
    const progress = currentStep / steps;

    let result = "";
    for (let i = 0; i < maxLen; i++) {
      const targetChar = to[i] || "";
      const revealThreshold = (i + 1) / maxLen;

      if (progress >= revealThreshold) {
        result += targetChar;
      } else if (progress > revealThreshold - 0.3) {
        result += getRandomChar();
      } else {
        result += from[i] || getRandomChar();
      }
    }

    onUpdate(result);

    if (currentStep < steps) {
      scrambleTimer = setTimeout(animate, stepDuration);
    } else {
      onUpdate(to);
      onComplete();
    }
  };

  animate();
}

function transitionToNext() {
  if (isTransitioning.value) return;

  isTransitioning.value = true;
  const nextIndex = (currentIndex.value + 1) % titles.length;
  const nextEntry = titles[nextIndex];

  // Scramble title
  scrambleText(
    displayTitle.value,
    nextEntry.title,
    (text) => {
      displayTitle.value = text;
    },
    () => {}
  );

  // Scramble tagline with slight delay
  setTimeout(() => {
    scrambleText(
      displayTagline.value,
      nextEntry.tagline,
      (text) => {
        displayTagline.value = text;
      },
      () => {
        currentIndex.value = nextIndex;
        isTransitioning.value = false;
      }
    );
  }, 150);
}

onMounted(() => {
  cycleTimer = setInterval(transitionToNext, CYCLE_INTERVAL);
});

onUnmounted(() => {
  if (cycleTimer) clearInterval(cycleTimer);
  if (scrambleTimer) clearTimeout(scrambleTimer);
});
</script>

<template>
  <div class="poster-title-wrapper">
    <h1 class="poster-title">{{ displayTitle }}</h1>
    <span class="poster-tagline" :class="{ transitioning: isTransitioning }">
      {{ displayTagline }}
    </span>
  </div>
</template>

<style scoped>
.poster-title-wrapper {
  position: relative;
  text-align: center;
  width: 100%;
}

.poster-title {
  font-family: "Montserrat Alternates", sans-serif;
  font-weight: 700;
  font-size: clamp(20vw, 24vw, 27rem);
  line-height: 0.87;
  letter-spacing: 0em;
  color: var(--warm-white);
  display: block;
  margin: 0;
}

.poster-tagline {
  position: absolute;
  bottom: -0.65em;
  right: 2.2em;
  font-family: "Cormorant Garamond", serif;
  font-style: italic;
  font-weight: 900;
  font-size: clamp(0.9rem, 2.6vw, 2.6rem);
  color: var(--ochre);
  letter-spacing: 0.02em;
  transform: rotate(-9deg);
  transition: opacity 0.1s ease;
  white-space: nowrap;
}

.poster-tagline.transitioning {
  opacity: 0.85;
}

@media (max-width: 768px) {
  .poster-title {
    line-height: 1.1;
  }

  .poster-tagline {
    right: 1.7em;
    bottom: 0.2em;
  }
}

@media (max-width: 480px) {
  .poster-title-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .poster-title {
    font-size: 32vw;
    line-height: 1;
  }

  .poster-tagline {
    position: absolute;
    font-size: 1.2rem;
    right: 0.5em;
    bottom: -0.2em;
    transform: rotate(0deg);
  }
}
</style>
