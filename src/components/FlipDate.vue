<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

const props = defineProps<{
  easterEgg?: string;
}>();

const easterEggDate = props.easterEgg || "18.06.93";

const currentDate = computed(() => {
  const today = new Date();
  return today
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
    .replace(/\//g, ".");
});

const isShowingEasterEgg = ref(false);
const chars = ref<{ char: string; nextChar: string; isDot: boolean; flipping: boolean }[]>([]);

function buildChars(fromDate: string, toDate: string) {
  chars.value = fromDate.split("").map((char, i) => ({
    char,
    nextChar: toDate[i],
    isDot: char === ".",
    flipping: false,
  }));
}

function flipTo(toDate: string, fromDate: string) {
  buildChars(fromDate, toDate);
  chars.value.forEach((_, i) => {
    setTimeout(() => {
      chars.value[i].flipping = true;
    }, i * 50);
  });
}

function handleMouseEnter() {
  if (!isShowingEasterEgg.value) {
    flipTo(easterEggDate, currentDate.value);
    isShowingEasterEgg.value = true;
  }
}

function handleMouseLeave() {
  if (isShowingEasterEgg.value) {
    flipTo(currentDate.value, easterEggDate);
    isShowingEasterEgg.value = false;
  }
}

onMounted(() => {
  buildChars(currentDate.value, easterEggDate);
});
</script>

<template>
  <div
    class="poster-date"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <span
      v-for="(item, index) in chars"
      :key="index"
      :class="['flip-char', { dot: item.isDot, flipping: item.flipping }]"
      :style="{ animationDelay: `${index * 0.05}s` }"
    >
      <span class="current">{{ item.char }}</span>
      <span class="next">{{ item.nextChar }}</span>
    </span>
  </div>
</template>

<style scoped>
.poster-date {
  font-family: "Montserrat Alternates", sans-serif;
  font-size: clamp(4rem, 9vw, 9rem);
  letter-spacing: -0.05em;
  font-weight: 800;
  color: var(--cream);
  opacity: 0.9;
  line-height: 0.9;
  flex-shrink: 0;
  cursor: default;
  display: flex;
  perspective: 1000px;
}

.flip-char {
  display: inline-flex;
  justify-content: center;
  position: relative;
  transform-style: preserve-3d;
  width: 0.6em;
}

.flip-char.dot {
  width: 0.25em;
}

.flip-char .current,
.flip-char .next {
  backface-visibility: hidden;
}

.flip-char .next {
  position: absolute;
  transform: rotateX(-180deg);
}

.flip-char.flipping {
  animation: flipDown 0.4s ease-in-out forwards;
}

@keyframes flipDown {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(180deg);
  }
}

@media (max-width: 480px) {
  .poster-date {
    order: -1;
  }
}
</style>
