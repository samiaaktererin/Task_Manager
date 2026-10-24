
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const filterButtons = document.querySelectorAll(".filter-btn");

const STORAGE_KEY = "taskManagerTasks";

let tasks = loadTasks();
let currentFilter = "all";

// Load saved tasks from Local Storage
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        if (!Array.isArray(parsedTasks)) {
            return [];
        }

        return parsedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
    } catch (error) {
        console.error("Could not load saved tasks:", error);
        return [];
    }
}

// Save tasks to Local Storage
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error("Could not save tasks:", error);
        alert("Tasks could not be saved. Check your browser storage.");
    }
}

// Add a new task
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        alert("Please enter a task.");
        return;
    }

    const newTask = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        text: text,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
});

// Display tasks according to the selected filter
function renderTasks() {
    taskList.replaceChildren();

    let filteredTasks = tasks;

    if (currentFilter === "pending") {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === "completed") {
        filteredTasks = tasks.filter(task => task.completed);
    }

    filteredTasks.forEach(function (task) {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.text} as completed`
        );

        checkbox.addEventListener("change", function () {
            toggleTask(task.id);
        });

        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;

        const status = document.createElement("span");
        status.className = "status-label";

        if (task.completed) {
            status.classList.add("completed");
            status.textContent = "Completed";
        } else {
            status.classList.add("pending");
            status.textContent = "Pending";
        }

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", `Delete ${task.text}`);

        deleteButton.addEventListener("click", function () {
            deleteTask(task.id);
        });

        li.append(checkbox, taskText, status, deleteButton);
        taskList.appendChild(li);
    });

    // Show or hide the empty-state message
    emptyMessage.hidden = filteredTasks.length > 0;

    if (tasks.length === 0) {
        emptyMessage.textContent = "No tasks yet. Add your first task!";
    } else if (filteredTasks.length === 0) {
        emptyMessage.textContent = "No tasks in this category.";
    }

    updateSummary();
}

// Mark a task as completed or pending
function toggleTask(id) {
    tasks = tasks.map(function (task) {
        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

// Update task counters
function updateSummary() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    totalCount.textContent = tasks.length;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;
}

// Filter tasks by status
filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(function (btn) {
            btn.classList.toggle("active", btn === button);
        });

        renderTasks();
    });
});

// Display saved tasks when the page opens
renderTasks();
