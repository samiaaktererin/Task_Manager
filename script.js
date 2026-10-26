const STORAGE_KEY = 'task_manager_tasks';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyMessage = document.getElementById('empty-message');

const totalCountEl = document.getElementById('total-count');
const pendingCountEl = document.getElementById('pending-count');
const completeCountEl = document.getElementById('complete-count');

const filterButtons = document.querySelectorAll('.filter-btn');

let tasks = [];
let currentFilter = 'all';

function loadTasks() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      tasks = JSON.parse(stored);
    } catch (e) {
      tasks = [];
    }
  } else {
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateCounters() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  totalCountEl.textContent = total;
  pendingCountEl.textContent = pending;
  completeCountEl.textContent = completed;
}

function renderTasks() {
  let filteredTasks = tasks;
  if (currentFilter === 'pending') {
    filteredTasks = tasks.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(t => t.completed);
  }

  taskList.innerHTML = '';

  if (filteredTasks.length === 0) {
    emptyMessage.style.display = 'block';
  } else {
    emptyMessage.style.display = 'none';
  }

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    const leftDiv = document.createElement('div');
    leftDiv.className = 'task-left';

    const checkDiv = document.createElement('div');
    checkDiv.className = 'task-check';
    checkDiv.setAttribute('role', 'checkbox');
    checkDiv.setAttribute('aria-checked', task.completed ? 'true' : 'false');
    checkDiv.setAttribute('title', task.completed ? 'Mark as pending' : 'Mark as completed');

    checkDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTaskCompletion(task.id);
    });

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;

    leftDiv.appendChild(checkDiv);
    leftDiv.appendChild(textSpan);

    const rightDiv = document.createElement('div');
    rightDiv.className = 'task-right';

    const badge = document.createElement('span');
    badge.className = `status-badge ${task.completed ? 'completed' : 'pending'}`;
    badge.textContent = task.completed ? 'Completed' : 'Pending';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    rightDiv.appendChild(badge);
    rightDiv.appendChild(deleteBtn);

    li.appendChild(leftDiv);
    li.appendChild(rightDiv);
    taskList.appendChild(li);
  });

  updateCounters();
}

function addTask(text) {
  const trimmed = text.trim();
  if (trimmed === '') return;

  const newTask = {
    id: Date.now() + Math.random(),
    text: trimmed,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = '';
  taskInput.focus();
}

function toggleTaskCompletion(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach(btn => {
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderTasks();
}

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addTask(taskInput.value);
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    setFilter(btn.dataset.filter);
  });
});

function init() {
  loadTasks();
  setFilter('all');
  renderTasks();
  taskInput.focus();
}

init();
