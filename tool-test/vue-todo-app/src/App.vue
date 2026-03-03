<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  editing: boolean;
}

const todos = ref<Todo[]>([]);
const newTodo = ref('');
const filter = ref('all'); // 'all', 'active', 'completed'
const editId = ref<string | null>(null);
const editText = ref('');

// Load from localStorage
onMounted(() => {
  const saved = localStorage.getItem('todos');
  if (saved) {
    try {
      todos.value = JSON.parse(saved).map((t: any) => ({
        ...t,
        editing: false
      }));
    } catch (e) {
      console.error('Failed to parse todos from localStorage', e);
      todos.value = [];
    }
  }
});

// Save to localStorage
watch(todos, () => {
  localStorage.setItem('todos', JSON.stringify(todos.value));
}, { deep: true });

const addTodo = () => {
  if (newTodo.value.trim() === '') return;
  todos.value.push({
    id: Date.now().toString(),
    text: newTodo.value.trim(),
    completed: false,
    editing: false
  });
  newTodo.value = '';
};

const removeTodo = (id: string) => {
  todos.value = todos.value.filter(todo => todo.id !== id);
};

const toggleTodo = (id: string) => {
  const todo = todos.value.find(t => t.id === id);
  if (todo) todo.completed = !todo.completed;
};

const startEditing = (todo: Todo) => {
  editId.value = todo.id;
  editText.value = todo.text;
};

const saveEdit = () => {
  if (!editId.value || editText.value.trim() === '') return;
  const todo = todos.value.find(t => t.id === editId.value);
  if (todo) {
    todo.text = editText.value.trim();
    todo.editing = false;
  }
  editId.value = null;
  editText.value = '';
};

const cancelEdit = () => {
  editId.value = null;
  editText.value = '';
};

const filteredTodos = () => {
  if (filter.value === 'active') {
    return todos.value.filter(todo => !todo.completed);
  } else if (filter.value === 'completed') {
    return todos.value.filter(todo => todo.completed);
  }
  return todos.value;
};

const activeCount = computed(() => todos.value.filter(t => !t.completed).length);
const completedCount = computed(() => todos.value.filter(t => t.completed).length);

const clearCompleted = () => {
  todos.value = todos.value.filter(todo => !todo.completed);
};
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>✨ Vue TodoList</h1>
      <p>功能完整 · 持久化 · 动画 · 响应式</p>
    </header>

    <main class="main">
      <!-- Add Todo -->
      <div class="add-section">
        <input
          v-model="newTodo"
          @keyup.enter="addTodo"
          type="text"
          placeholder="添加新任务..."
          class="todo-input"
        />
        <button @click="addTodo" class="add-btn">➕ 添加</button>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          :class="{ active: filter === 'all' }" 
          @click="filter = 'all'"
        >
          全部 ({{ todos.length }})
        </button>
        <button 
          :class="{ active: filter === 'active' }" 
          @click="filter = 'active'"
        >
          进行中 ({{ activeCount }})
        </button>
        <button 
          :class="{ active: filter === 'completed' }" 
          @click="filter = 'completed'"
        >
          已完成 ({{ completedCount }})
        </button>
      </div>

      <!-- Todo List -->
      <ul class="todo-list" v-if="filteredTodos().length > 0">
        <li 
          v-for="todo in filteredTodos()" 
          :key="todo.id"
          class="todo-item"
          :class="{ completed: todo.completed, editing: todo.editing || editId === todo.id }"
        >
          <div class="todo-content">
            <input 
              type="checkbox" 
              :checked="todo.completed" 
              @change="toggleTodo(todo.id)"
              class="todo-checkbox"
            />
            <span 
              v-if="!(todo.editing || editId === todo.id)" 
              class="todo-text"
              @dblclick="startEditing(todo)"
            >
              {{ todo.text }}
            </span>
            <input 
              v-else 
              v-model="editText" 
              @keyup.enter="saveEdit" 
              @blur="saveEdit"
              type="text" 
              class="todo-edit-input"
              autofocus
            />
            <div class="todo-actions">
              <button 
                v-if="!(todo.editing || editId === todo.id)" 
                @click="startEditing(todo)"
                class="edit-btn"
              >✎</button>
              <button 
                v-else 
                @click="saveEdit"
                class="save-btn"
              >✓</button>
              <button 
                v-if="!(todo.editing || editId === todo.id)" 
                @click="removeTodo(todo.id)"
                class="delete-btn"
              >🗑️</button>
              <button 
                v-else 
                @click="cancelEdit"
                class="cancel-btn"
              >✕</button>
            </div>
          </div>
        </li>
      </ul>

      <div v-else class="empty-state">
        <p>📝 暂无待办事项</p>
        <p>双击文字可编辑，回车保存</p>
      </div>

      <!-- Stats & Clear -->
      <div class="stats-bar" v-if="todos.length > 0">
        <span class="stats-text">
          {{ activeCount }} 项进行中，{{ completedCount }} 项已完成
        </span>
        <button @click="clearCompleted" class="clear-btn">
          清除已完成
        </button>
      </div>
    </main>

    <footer class="footer">
      <p>✅ 数据已自动保存至 localStorage</p>
      <p>🎨 渐变背景 · 卡片阴影 · 悬停动画</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #4b6584, #6a11cb);
  color: #fff;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  max-width: 600px;
}

.header h1 {
  font-size: 2.5rem;
  margin: 0;
  background: linear-gradient(to right, #ff9a9e, #fad0c4, #a1c4fd);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-top: 0.5rem;
}

.main {
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.add-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.todo-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.todo-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.todo-input:focus {
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.3);
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #6a11cb, #2575fc);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(106, 17, 203, 0.3);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(106, 17, 203, 0.4);
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-tabs button {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.filter-tabs button.active {
  background: linear-gradient(45deg, #6a11cb, #2575fc);
  box-shadow: 0 4px 12px rgba(106, 17, 203, 0.3);
}

.filter-tabs button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.15);
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  animation: fadeIn 0.4s ease-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.todo-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.todo-item.completed {
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.05);
}

.todo-item.editing {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.02);
}

.todo-content {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.75rem;
}

.todo-checkbox {
  width: 1.4rem;
  height: 1.4rem;
  cursor: pointer;
  accent-color: #6a11cb;
}

.todo-text {
  flex: 1;
  padding: 0.25rem 0;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.todo-text:hover {
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  opacity: 0.7;
}

.todo-edit-input {
  flex: 1;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1rem;
  outline: none;
}

.todo-actions {
  display: flex;
  gap: 0.25rem;
}

.edit-btn, .delete-btn, .save-btn, .cancel-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.edit-btn:hover, .delete-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.save-btn, .cancel-btn {
  font-size: 1rem;
  width: 2.2rem;
  height: 2.2rem;
}

.save-btn {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.cancel-btn {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.empty-state p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-text {
  font-size: 0.9rem;
  opacity: 0.8;
}

.clear-btn {
  padding: 0.4rem 0.8rem;
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: rgba(220, 53, 69, 0.3);
  transform: scale(1.05);
}

.footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.85rem;
  opacity: 0.7;
  max-width: 600px;
}

.footer p {
  margin: 0.25rem 0;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .app {
    padding: 1rem;
  }
  
  .main {
    padding: 1rem;
  }
  
  .add-section {
    flex-direction: column;
  }
  
  .filter-tabs {
    justify-content: center;
  }
}
</style>
