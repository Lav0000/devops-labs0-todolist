<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import ThemeSwitcher from "./components/ThemeSwitcher.vue";
import TodoComposer from "./components/TodoComposer.vue";
import TodoList from "./components/TodoList.vue";
import { Todo } from "./types";

const todoList = ref<Todo[]>([]);
const isLoading = ref(false);
const isFetching = ref(false);
const isShowingToast = ref<string | null>(null);
const isDeletingAll = ref(false)
const isUpdating = ref<number | null>(null)
const filter = ref<'all' | 'pending' | 'completed'>('all')

const todoListFiltered = computed(() => {
  switch(filter.value) {
    case 'pending': {
      return todoList.value.filter(item => !item.completed)
    }

    case 'completed': {
      return todoList.value.filter(item => item.completed)
    }
    default: {
      return todoList.value
    }
  }
})

onBeforeMount(async () => {
  try {
    isFetching.value = true
    const res = await fetch("/api");
    todoList.value = await res.json();
    isFetching.value = false
  } catch (error) {
   console.error(error) 
  }
});

async function onSubmitTask(todo: Omit<Todo, "id" | "completed">) {
  isLoading.value = true;
  try {
    const res = await fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    });
    todoList.value.push(await res.json());
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
}

async function onDeleteTask(id: number) {
  try {
    await fetch("/api/" + id, {
      method: "DELETE",
    });
    todoList.value = todoList.value.filter(item => item.id !== id)

    showToast("Task deleted successfully")
  } catch (error) {
    console.error(error);
  }
}

async function deleteAll() {
  isDeletingAll.value = true
  try {
    await fetch("/api", {
      method: "DELETE",
    });
    todoList.value = []

    showToast("All tasks deleted successfully")
  } catch (error) {
    console.error(error);
  } finally {
    isDeletingAll.value = false
  }
}

async function onToggleComplete(id: number, completed: boolean) {
  isUpdating.value = id
  try {
    await fetch("/api/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed
      }),
    });
    const index = todoList.value.findIndex(item => item.id === id)

    if (index > -1) {
      todoList.value[index].completed = completed
    }

    showToast("Task updated successfully")
  } catch (error) {
    console.error(error);
  } finally {
    isUpdating.value = null
  }
}

function showToast(message: string) {
  isShowingToast.value = message
  setTimeout(() => {
    isShowingToast.value = null
  }, 3000)
}
</script>

<template>
  <header>
    <h1>Todo List</h1>
    <TodoComposer
      @submitTask="onSubmitTask"
      :isLoading="isLoading"
    />
  </header>

  <div class="todos-filter z-10">
    <div class="dropdown">
      <label tabindex="0" class="btn m-1">Filter: {{  filter  }}</label>
      <ul
        tabindex="0"
        class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
      >
        <li @click="filter = 'all'"><a>All</a></li>
        <li @click="filter = 'pending'"><a>Pending</a></li>
        <li @click="filter = 'completed'"><a>Completed</a></li>
      </ul>
    </div>
    <button class="btn btn-secondary delete-all-btn" @click="deleteAll">
      <span v-if="isDeletingAll" class="loading loading-spinner"></span>
      <span v-else>
        Delete All
      </span>
    </button>
  </div>

  <TodoList :todoList="todoListFiltered" :isLoading="isFetching" :isUpdating="isUpdating" @deleteTask="onDeleteTask" @toggleComplete="onToggleComplete" />

  <ThemeSwitcher />

  <Teleport to="body" v-if="!!isShowingToast">
    <div class="toast toast-top toast-end">
      <div class="alert alert-info">
        <span>{{ isShowingToast }}</span>
      </div>
    </div>
  </Teleport>
</template>

<style></style>
