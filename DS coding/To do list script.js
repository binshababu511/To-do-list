const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearCompleted = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-btn");
const themeToggle = document.getElementById("themeToggle");
const alarmSound = document.getElementById("alarmSound");
const stopAlarm = document.getElementById("stopAlarm");

let tasks = [];
let currentFilter = "all";
let editTaskId = null;

function formatDate(dateString) {
  if (!dateString) return "No deadline";
  return new Date(dateString).toLocaleString();
}

function updateTaskCount() {
  taskCount.textContent = `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`;
}

function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = tasks;

  if (currentFilter === "pending") {
    filteredTasks = tasks.filter(task => !task.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter(task => task.completed);
  }

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `<li class="empty-message">No tasks found</li>`;
  } else {
    filteredTasks.forEach(task => {
      const li = document.createElement("li");
      li.className = `task-item ${task.completed ? "completed" : ""}`;

      li.innerHTML = `
        <div class="task-main">
          <div class="task-title">${task.text}</div>
          <div class="task-meta">
            <span>${formatDate(task.date)}</span>
            <span class="priority ${task.priority}">${task.priority}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="complete-btn" onclick="toggleComplete(${task.id})">
            ${task.completed ? "Undo" : "Complete"}
          </button>
          <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
          <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        </div>
      `;

      taskList.appendChild(li);
    });
  }

  updateTaskCount();
}

function addTask() {
  const text = taskInput.value.trim();
  const date = taskDate.value;
  const priority = taskPriority.value;

  if (!text) {
    alert("Please enter a task.");
    return;
  }

  if (editTaskId) {
    tasks = tasks.map(task =>
      task.id === editTaskId
        ? {
            ...task,
            text,
            date,
            priority,
            alerted: false
          }
        : task
    );

    editTaskId = null;
    addBtn.textContent = "Add Task";
  } else {
    tasks.push({
      id: Date.now(),
      text,
      date,
      priority,
      completed: false,
      alerted: false
    });
  }

  taskInput.value = "";
  taskDate.value = "";
  taskPriority.value = "Low";

  renderTasks();
}

function toggleComplete(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(task => task.id === id);
  if (!task) return;

  taskInput.value = task.text;
  taskDate.value = task.date;
  taskPriority.value = task.priority;
  editTaskId = id;
  addBtn.textContent = "Update Task";
}

function clearCompletedTasks() {
  tasks = tasks.filter(task => !task.completed);
  renderTasks();
}

function startAlarm() {
  if (alarmSound) {
    alarmSound.loop = true;
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alarmSound.play().catch(error => {
      console.log("Audio play blocked:", error);
    });
  }
}

function stopAlarmSound() {
  if (alarmSound) {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alarmSound.loop = false;
  }
}

function checkTaskAlarms() {
  const now = new Date().getTime();

  tasks.forEach(task => {
    if (task.date && !task.completed && !task.alerted) {
      const deadlineTime = new Date(task.date).getTime();
      const alarmTime = deadlineTime + 10000;

      if (now >= alarmTime) {
        startAlarm();
        task.alerted = true;
      }
    }
  });
}

addBtn.addEventListener("click", addTask);
clearCompleted.addEventListener("click", clearCompletedTasks);

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

stopAlarm.addEventListener("click", stopAlarmSound);

setInterval(checkTaskAlarms, 1000);

renderTasks();