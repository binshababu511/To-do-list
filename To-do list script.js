const authContainer = document.getElementById("authContainer");
const appContainer = document.getElementById("appContainer");
const authTitle = document.getElementById("authTitle");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const authBtn = document.getElementById("authBtn");
const toggleText = document.getElementById("toggleText");
const authMessage = document.getElementById("authMessage");
const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");

const taskInput = document.getElementById("taskInput");
const taskDateTime = document.getElementById("taskDateTime");
const taskPriority = document.getElementById("taskPriority");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearCompleted = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-btn");
const themeToggle = document.getElementById("themeToggle");

let isLoginMode = true;
let currentFilter = "all";
let editTaskId = null;
let tasks = [];

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem("currentUser");
}

function setCurrentUser(username) {
  localStorage.setItem("currentUser", username);
}

function logout() {
  localStorage.removeItem("currentUser");
  appContainer.style.display = "none";
  authContainer.style.display = "flex";
  usernameInput.value = "";
  passwordInput.value = "";
  authMessage.textContent = "";
}

function showApp(username) {
  authContainer.style.display = "none";
  appContainer.style.display = "flex";
  welcomeUser.textContent = username;
  loadTasks(username);
  renderTasks();
}

function attachToggleAuthEvent() {
  const toggleAuth = document.getElementById("toggleAuth");
  if (toggleAuth) {
    toggleAuth.addEventListener("click", toggleAuthMode);
  }
}

function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  authTitle.textContent = isLoginMode ? "Login" : "Register";
  authBtn.textContent = isLoginMode ? "Login" : "Register";
  authMessage.style.color = "red";
  authMessage.textContent = "";

  toggleText.innerHTML = isLoginMode
    ? `Don't have an account? <span id="toggleAuth">Register</span>`
    : `Already have an account? <span id="toggleAuth">Login</span>`;

  attachToggleAuthEvent();
}

function handleAuth() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    authMessage.style.color = "red";
    authMessage.textContent = "Please enter username and password";
    return;
  }

  const users = getUsers();

  if (isLoginMode) {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      setCurrentUser(username);
      usernameInput.value = "";
      passwordInput.value = "";
      authMessage.textContent = "";
      showApp(username);
    } else {
      authMessage.style.color = "red";
      authMessage.textContent = "Invalid username or password";
    }
  } else {
    const existingUser = users.find((u) => u.username === username);

    if (existingUser) {
      authMessage.style.color = "red";
      authMessage.textContent = "Username already exists";
      return;
    }

    users.push({ username, password });
    saveUsers(users);

    authMessage.style.color = "green";
    authMessage.textContent = "Registration successful. Please login.";

    isLoginMode = true;
    authTitle.textContent = "Login";
    authBtn.textContent = "Login";
    toggleText.innerHTML = `Don't have an account? <span id="toggleAuth">Register</span>`;
    attachToggleAuthEvent();

    usernameInput.value = "";
    passwordInput.value = "";
  }
}

function loadTasks(username) {
  tasks = JSON.parse(localStorage.getItem(`tasks_${username}`)) || [];
}

function saveTasks() {
  const username = getCurrentUser();
  if (username) {
    localStorage.setItem(`tasks_${username}`, JSON.stringify(tasks));
  }
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return "No ending time";
  const date = new Date(dateTimeString);
  return date.toLocaleString();
}

function isOverdue(task) {
  if (!task.dateTime || task.completed) return false;
  return new Date() > new Date(task.dateTime);
}

function renderTasks() {
  taskList.innerHTML = "";
  let filteredTasks = tasks;

  if (currentFilter === "pending") {
    filteredTasks = tasks.filter((task) => !task.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter((task) => task.completed);
  }

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `<li class="empty-message">No tasks available</li>`;
  } else {
    filteredTasks.forEach((task) => {
      const overdue = isOverdue(task);
      const li = document.createElement("li");
      li.className = `task-item ${task.completed ? "completed" : ""} ${overdue ? "overdue" : ""}`;

      li.innerHTML = `
        <div class="task-main">
          <div class="task-title">${task.text}</div>
          <div class="task-meta">
            <span>Ends: ${formatDateTime(task.dateTime)}</span>
            <span class="priority ${task.priority}">${task.priority}</span>
            <span>Status: ${task.completed ? "Completed" : overdue ? "Overdue" : "Pending"}</span>
            ${overdue ? `<span class="overdue-badge">Time Over</span>` : ""}
          </div>
        </div>
        <div class="task-actions">
          <button class="complete-btn" data-id="${task.id}">Done</button>
          <button class="edit-btn" data-id="${task.id}">Edit</button>
          <button class="delete-btn" data-id="${task.id}">Delete</button>
        </div>
      `;

      taskList.appendChild(li);
    });

    document.querySelectorAll(".complete-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const id = Number(this.dataset.id);
        toggleTask(id);
      });
    });

    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const id = Number(this.dataset.id);
        editTask(id);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const id = Number(this.dataset.id);
        deleteTask(id);
      });
    });
  }

  updateTaskCount();
}

function addOrUpdateTask() {
  const text = taskInput.value.trim();
  const dateTime = taskDateTime.value;
  const priority = taskPriority.value;

  if (text === "") {
    alert("Please enter a task title");
    return;
  }

  if (editTaskId !== null) {
    tasks = tasks.map((task) =>
      task.id === editTaskId ? { ...task, text, dateTime, priority } : task
    );
    editTaskId = null;
    addBtn.textContent = "Add Task";
  } else {
    tasks.push({
      id: Date.now(),
      text,
      dateTime,
      priority,
      completed: false,
    });
  }

  taskInput.value = "";
  taskDateTime.value = "";
  taskPriority.value = "Medium";

  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  if (editTaskId === id) {
    editTaskId = null;
    addBtn.textContent = "Add Task";
    taskInput.value = "";
    taskDateTime.value = "";
    taskPriority.value = "Medium";
  }

  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find((task) => task.id === id);
  if (!task) return;

  taskInput.value = task.text;
  taskDateTime.value = task.dateTime || "";
  taskPriority.value = task.priority;
  editTaskId = id;
  addBtn.textContent = "Update Task";
  taskInput.focus();
}

function updateTaskCount() {
  const total = tasks.length;
  const pending = tasks.filter((task) => !task.completed && !isOverdue(task)).length;
  const overdue = tasks.filter((task) => !task.completed && isOverdue(task)).length;
  const completed = tasks.filter((task) => task.completed).length;

  taskCount.textContent = `Total: ${total} | Pending: ${pending} | Overdue: ${overdue} | Completed: ${completed}`;
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  renderTasks();
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
}

authBtn.addEventListener("click", handleAuth);
logoutBtn.addEventListener("click", logout);
addBtn.addEventListener("click", addOrUpdateTask);
clearCompleted.addEventListener("click", clearCompletedTasks);
themeToggle.addEventListener("click", toggleTheme);

taskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addOrUpdateTask();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

attachToggleAuthEvent();

const currentUser = getCurrentUser();
if (currentUser) {
  showApp(currentUser);
}

setInterval(renderTasks, 30000);