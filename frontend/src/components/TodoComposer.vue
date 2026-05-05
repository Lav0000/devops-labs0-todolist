<script setup lang="ts">
import { ref } from "vue";
import { Todo } from "../types";

defineProps<{
  isLoading: boolean;
}>();
const emits = defineEmits<{
  (e: "submitTask", todo: Omit<Todo, "id" | "completed">): void;
}>();

const task = ref("");
const dueDate = ref(null);

function submitTask() {
  emits("submitTask", { task: task.value, dueDate: dueDate.value });
  task.value = "";
  dueDate.value = null;
}
</script>

<template>
  <div class="input-section">
    <input
      type="text"
      placeholder="Add a todo . . ."
      class="input input-bordered input-secondary w-full max-w-xs"
      v-model="task"
    />
    <input
      type="date"
      class="input input-bordered input-secondary w-full max-w-xs schedule-date"
      v-model="dueDate"
    />
    <button class="btn btn-secondary add-task-button" @click="submitTask">
      <span v-if="isLoading" class="loading loading-spinner"></span>
      <i v-else class="bx bx-plus bx-sm"></i>
    </button>
  </div>
</template>

<style></style>
