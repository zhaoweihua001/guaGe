import { useState, useEffect } from 'react';
import './App.css';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        const parsed = JSON.parse(savedTodos);
        // Convert createdAt strings back to Date objects
        const todosWithDates = parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        }));
        setTodos(todosWithDates);
      } catch (e) {
        console.error('Failed to parse todos from localStorage', e);
      }
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    
    const newTodoItem: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date()
    };
    
    setTodos([newTodoItem, ...todos]);
    setNewTodo('');
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editText.trim() === '') return;
    
    setTodos(todos.map(todo => 
      todo.id === editingId ? { ...todo, text: editText.trim() } : todo
    ));
    
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingId) {
        saveEdit();
      } else {
        addTodo();
      }
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>📝 Todo List</h1>
        <p className="subtitle">Organize your tasks efficiently</p>
      </div>
      
      <div className="stats">
        <div className="stat-item">
          <span className="stat-number">{todos.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{activeCount}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{completedCount}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>
      
      <div className="input-section">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
          className="todo-input"
        />
        <button onClick={addTodo} className="add-btn">
          ➕ Add
        </button>
      </div>
      
      <div className="filter-section">
        <button 
          onClick={() => setFilter('all')}
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('active')}
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
        >
          Active
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
        >
          Completed
        </button>
      </div>
      
      <div className="todos-container">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. {filter === 'all' ? 'Add your first task!' : `Try switching to 'All' filter.`}</p>
          </div>
        ) : (
          <ul className="todo-list">
            {filteredTodos.map((todo) => (
              <li 
                key={todo.id} 
                className={`todo-item ${todo.completed ? 'completed' : ''} ${editingId === todo.id ? 'editing' : ''}`}
              >
                {editingId === todo.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="edit-input"
                    />
                    <div className="edit-buttons">
                      <button onClick={saveEdit} className="save-btn">✓ Save</button>
                      <button onClick={cancelEdit} className="cancel-btn">✕ Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="todo-content">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="todo-checkbox"
                    />
                    <span className="todo-text">{todo.text}</span>
                    <div className="todo-actions">
                      <button 
                        onClick={() => startEditing(todo)}
                        className="action-btn edit-btn"
                        aria-label="Edit todo"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => deleteTodo(todo.id)}
                        className="action-btn delete-btn"
                        aria-label="Delete todo"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="footer">
        <p>Double-click to edit a task • Drag and drop to reorder</p>
      </div>
    </div>
  );
}

export default App;
