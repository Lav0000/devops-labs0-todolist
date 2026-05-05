<script setup lang="ts">
import { Todo } from "../types";

defineProps<{ todoList: Todo[], isLoading: boolean, isUpdating: number | null }>();
defineEmits<{
  (e: "deleteTask", id: number): void;
  (e: "toggleComplete", id: number, completed: boolean): void;
  (e: "editTask", todo: Todo): void;
}>();

</script>

<template>
  <table class="table w-full">
    <thead>
      <tr>
        <th>Task</th>
        <th>Due Date</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody class="todos-list-body" v-if="isLoading">
      <span class="loading loading-spinner"></span>
    </tbody>
    <tbody class="todos-list-body">
      <tr class="todo-item" v-for="item in todoList">
        <td>{{ item.task }}</td>
        <td>{{ item.dueDate }}</td>
        <td>{{ item.completed ? "Completed" : "Pending" }}</td>
        <td class="flex gap-x-1">
          <button
            class="btn btn-success btn-sm tooltip"
            :class="{
              'btn-success': !item.completed,
              'btn-warning': item.completed,
            }"
            @click="$emit('toggleComplete', item.id, !item.completed)"
            :data-tip="`Mark as ${item.completed ? 'Pending' : 'Completed'}`"
            :disabled="isUpdating === item.id"
          >
            <i class="bx bx-xs" :class="{
              'bx-history': item.completed,
              'bx-check': !item.completed,
            }"></i>
          </button>
          <button
            class="btn btn-error btn-sm tooltip"
            @click="$emit('deleteTask', item.id)"
            data-tip="Delete"
            :disabled="isUpdating === item.id"
          >
            <i class="bx bx-trash bx-xs"></i>
          </button>
        </td>
      </tr>
    </tbody>
  </table>


</template>

<style></style>
