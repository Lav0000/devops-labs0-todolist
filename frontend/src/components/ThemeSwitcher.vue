<script setup lang="ts">
import { onBeforeMount } from "vue";

const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
];

onBeforeMount(() => {
  const theme = localStorage.getItem("theme");
  if (theme) {
    document.querySelector("html")!.dataset.theme = theme;
  }
});

function selectTheme(theme: string) {
  document.querySelector("html")!.dataset.theme = theme;

  localStorage.setItem("theme", theme);
}
</script>

<template>
  <Teleport to="body">
    <div class="theme-switcher">
      <div class="dropdown dropdown-left">
        <label tabindex="0" class="btn m-1">
          <i class="bx bxs-palette bx-sm"></i>
        </label>
        <ul
          tabindex="0"
          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li
            v-for="theme in themes"
            class="theme-item"
            @click="selectTheme(theme)"
          >
            <a>{{ theme }}</a>
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>

<style></style>
