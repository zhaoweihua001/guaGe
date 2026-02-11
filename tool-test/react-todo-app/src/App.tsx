import { useState, useEffect } from 'react';
import './App.css';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  editing?: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim() !== '') {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
    }
  };

  const toggleComplete = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const startEdit = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, editing: true } : todo
      )
    );
  };

  const saveEdit = (id: number, newText: string) => {
    if (newText.trim() === '') {
      deleteTodo(id);
      return;
    }
    setTodos(
      todos.map(todo =>
        todo.id === id 
          ? { ...todo, text: newText.trim(), editing: false } 
          : todo
      )
    );
  };

  const cancelEdit = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, editing: false } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  return (
    <div className="app">
      <div className="todo-container">
        <h1>Todo List</h1>
        
        <div className="add-todo">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="添加新的待办事项..."
            className="todo-input"
          />
          <button onClick={addTodo} className="add-btn">添加</button>
        </div>

        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            全部 ({todos.length})
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            进行中 ({activeCount})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            已完成 ({completedCount})
          </button>
        </div>

        <div className="todo-list">
          {filteredTodos.length === 0 ? (
            <p className="no-todos">没有找到匹配的待办事项</p>
          ) : (
            filteredTodos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''} ${todo.editing ? 'editing' : ''}`}> 
                {todo.editing ? (
                  <div className="edit-mode">
                    <input
                      type="text"
                      defaultValue={todo.text}
                      autoFocus
                      onBlur={(e) => saveEdit(todo.id, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          saveEdit(todo.id, e.currentTarget.value);
                        } else if (e.key === 'Escape') {
                          cancelEdit(todo.id);
                        }
                      }}
                    />
                    <button onClick={() => saveEdit(todo.id, (document.activeElement as HTMLInputElement).value)}>保存</button>
                    <button onClick={() => cancelEdit(todo.id)}>取消</button>
                  </div>
                ) : (
                  <>
                    <div className="todo-content" onClick={() => toggleComplete(todo.id)}>
                      <span className="checkbox">{todo.completed && '✓'}</span>
                      <span className="text">{todo.text}</span>
                    </div>
                    <div className="todo-actions">
                      <button onClick={() => startEdit(todo.id)} className="edit-btn">编辑</button>
                      <button onClick={() => deleteTodo(todo.id)} className="delete-btn">删除</button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className="stats">
          <p>总计: {todos.length} | 进行中: {activeCount} | 已完成: {completedCount}</p>
        </div>
      </div>
    </div>
  );
}

export default App;