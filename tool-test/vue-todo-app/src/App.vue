<script setup lang="ts">
import { ref, computed } from 'vue'

// 定义类型
interface Todo {
  id: number
  text: string
  completed: boolean
  editing: boolean
  category: 'work' | 'life' | 'other'
}

// 从 localStorage 读取数据
const savedTodos = localStorage.getItem('todos')
const todos = ref<Todo[]>(savedTodos ? JSON.parse(savedTodos) : [])

// 当前输入的文本
const newTodoText = ref('')
// 当前选择的分类
const currentFilter = ref<'all' | 'active' | 'completed'>('all')
// 新任务的分类
const newTodoCategory = ref<'work' | 'life' | 'other'>('other')

// 添加新任务
const addTodo = () => {
  if (newTodoText.value.trim() === '') return
  
  todos.value.push({
    id: Date.now(),
    text: newTodoText.value.trim(),
    completed: false,
    editing: false,
    category: newTodoCategory.value
  })
  
  // 保存到 localStorage
  saveToStorage()
  // 清空输入框
  newTodoText.value = ''
}

// 编辑任务
const editTodo = (todo: Todo) => {
  todo.editing = true
}

// 保存编辑
const saveEdit = (todo: Todo) => {
  if (todo.text.trim() === '') {
    removeTodo(todo)
  } else {
    todo.editing = false
    saveToStorage()
  }
}

// 取消编辑
const cancelEdit = (todo: Todo) => {
  todo.editing = false
}

// 删除任务
const removeTodo = (todo: Todo) => {
  todos.value = todos.value.filter(t => t.id !== todo.id)
  saveToStorage()
}

// 切换完成状态
const toggleComplete = (todo: Todo) => {
  todo.completed = !todo.completed
  saveToStorage()
}

// 保存到 localStorage
const saveToStorage = () => {
  localStorage.setItem('todos', JSON.stringify(todos.value))
}

// 计算属性：根据筛选条件显示任务
const filteredTodos = computed(() => {
  switch (currentFilter.value) {
    case 'active':
      return todos.value.filter(todo => !todo.completed)
    case 'completed':
      return todos.value.filter(todo => todo.completed)
    default:
      return todos.value
  }
})

// 统计信息
const stats = computed(() => {
  const total = todos.value.length
  const completed = todos.value.filter(todo => todo.completed).length
  const active = total - completed
  return { total, completed, active }
})

// 清除所有已完成的任务
const clearCompleted = () => {
  todos.value = todos.value.filter(todo => !todo.completed)
  saveToStorage()
}
</script>

<template>
  <div class="app-container">
    <div class="todo-card">
      <h1>Vue TodoList</h1>
      
      <!-- 添加新任务 -->
      <div class="add-todo">
        <input
          v-model="newTodoText"
          @keyup.enter="addTodo"
          type="text"
          placeholder="添加新任务..."
          class="new-todo-input"
        />
        <select v-model="newTodoCategory" class="category-select">
          <option value="work">工作</option>
          <option value="life">生活</option>
          <option value="other">其他</option>
        </select>
        <button @click="addTodo" class="add-button">添加</button>
      </div>
      
      <!-- 筛选按钮 -->
      <div class="filters">
        <button
          :class="['filter-btn', { active: currentFilter === 'all' }]"
          @click="currentFilter = 'all'"
        >
          全部 ({{ stats.total }})
        </button>
        <button
          :class="['filter-btn', { active: currentFilter === 'active' }]"
          @click="currentFilter = 'active'"
        >
          进行中 ({{ stats.active }})
        </button>
        <button
          :class="['filter-btn', { active: currentFilter === 'completed' }]"
          @click="currentFilter = 'completed'"
        >
          已完成 ({{ stats.completed }})
        </button>
      </div>
      
      <!-- 任务列表 -->
      <transition-group name="list" tag="ul" class="todo-list">
        <li
          v-for="todo in filteredTodos"
          :key="todo.id"
          :class="['todo-item', { completed: todo.completed, editing: todo.editing }]"
        >
          <!-- 显示模式 -->
          <div v-if="!todo.editing" class="view-mode">
            <label class="checkbox-container">
              <input
                type="checkbox"
                :checked="todo.completed"
                @change="toggleComplete(todo)"
              />
              <span class="checkmark"></span>
            </label>
            
            <span
              :class="['todo-text', todo.category]"
              @dblclick="editTodo(todo)"
            >
              {{ todo.text }}
            </span>
            
            <span :class="['category-tag', todo.category]">{{
              { work: '工作', life: '生活', other: '其他' }[todo.category]
            }}</span>
            
            <button @click="editTodo(todo)" class="edit-btn">编辑</button>
            <button @click="removeTodo(todo)" class="delete-btn">删除</button>
          </div>
          
          <!-- 编辑模式 -->
          <div v-else class="edit-mode">
            <input
              v-model="todo.text"
              @keyup.enter="saveEdit(todo)"
              @keyup.esc="cancelEdit(todo)"
              @blur="saveEdit(todo)"
              type="text"
              class="edit-input"
              autofocus
            />
            <button @click="saveEdit(todo)" class="save-btn">保存</button>
            <button @click="cancelEdit(todo)" class="cancel-btn">取消</button>
          </div>
        </li>
      </transition-group>
      
      <!-- 统计和清除 -->
      <div v-if="todos.length > 0" class="stats">
        <span>共 {{ stats.total }} 项，已完成 {{ stats.completed }} 项</span>
        <button
          v-if="stats.completed > 0"
          @click="clearCompleted"
          class="clear-completed"
        >
          清除已完成
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
}

.todo-card {
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h1 {
  text-align: center;
  color: #333;
  margin: 30px 0 20px;
  font-size: 2.2em;
  font-weight: 300;
}

.add-todo {
  display: flex;
  padding: 0 20px 20px;
  gap: 10px;
  flex-wrap: wrap;
}

.new-todo-input {
  flex: 1;
  min-width: 200px;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.new-todo-input:focus {
  border-color: #667eea;
}

.category-select {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  font-size: 16px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.category-select:focus {
  border-color: #667eea;
}

.add-button {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.add-button:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.filters {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 10px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
}

.filter-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #6c757d;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: #e9ecef;
}

.filter-btn.active {
  background: #667eea;
  color: white;
}

.todo-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
}

.todo-item {
  padding: 16px 20px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.todo-item:hover {
  background: #f8f9fa;
}

.todo-item.completed {
  opacity: 0.7;
}

.checkbox-container {
  position: relative;
  display: inline-block;
  width: 22px;
  height: 22px;
  margin-right: 12px;
}

.checkbox-container input {
  opacity: 0;
  width: 0;
  height: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 22px;
  width: 22px;
  background: #fff;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.checkbox-container input:checked ~ .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 7px;
  top: 3px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.todo-text {
  flex: 1;
  font-size: 16px;
  transition: all 0.3s ease;
}

.todo-text.work {
  color: #e74c3c;
  font-weight: 500;
}

.todo-text.life {
  color: #27ae60;
  font-weight: 500;
}

.todo-text.other {
  color: #3498db;
  font-weight: 500;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #95a5a6;
}

.category-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 10px;
}

.category-tag.work {
  background: #fdf2f2;
  color: #e74c3c;
  border: 1px solid #fadbd8;
}

.category-tag.life {
  background: #f2fdf5;
  color: #27ae60;
  border: 1px solid #d5f5e3;
}

.category-tag.other {
  background: #f2f6fd;
  color: #3498db;
  border: 1px solid #d6eaf8;
}

.edit-btn, .delete-btn {
  margin-left: 10px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #f39c12;
  color: white;
}

.edit-btn:hover {
  background: #e67e22;
  transform: translateY(-1px);
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.view-mode {
  display: flex;
  align-items: center;
  width: 100%;
}

.edit-mode {
  display: flex;
  align-items: center;
  width: 100%;
}

.edit-input {
  flex: 1;
  padding: 10px;
  border: 2px solid #667eea;
  border-radius: 6px;
  font-size: 16px;
  outline: none;
}

.save-btn, .cancel-btn {
  padding: 6px 12px;
  margin-left: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn {
  background: #27ae60;
  color: white;
}

.save-btn:hover {
  background: #219653;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

.stats {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-top: 1px solid #e1e5e9;
  font-size: 14px;
  color: #6c757d;
}

.clear-completed {
  padding: 6px 12px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.clear-completed:hover {
  background: #c0392b;
}

/* 动画 */
.list-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.list-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.list-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.list-leave-active {
  position: absolute;
}

.list-move {
  transition: transform 0.3s ease;
}
</style>