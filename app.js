const STORAGE = {
  users: 'he_users',
  session: 'he_session'
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  return readJson(STORAGE.users, []);
}

function setUsers(users) {
  writeJson(STORAGE.users, users);
}

function getSession() {
  return readJson(STORAGE.session, null);
}

function setSession(session) {
  writeJson(STORAGE.session, session);
}

function clearSession() {
  localStorage.removeItem(STORAGE.session);
}

function nowString() {
  return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

function byId(id) {
  return document.getElementById(id);
}

function message(targetId, text, type) {
  const el = byId(targetId);
  if (!el) return;
  el.className = `message ${type}`;
  el.textContent = text;
}

function getCurrentUser() {
  const session = getSession();
  if (!session || !session.username) return null;
  const users = getUsers();
  return users.find((u) => u.username === session.username) || null;
}

function requireAuth() {
  const body = document.body;
  const needsAuth = body.dataset.protected === 'true';
  const currentPage = body.dataset.page || '';
  const session = getSession();

  if (!needsAuth) {
    if ((currentPage === 'login' || currentPage === 'signup') && session) {
      window.location.href = 'fumod.html';
    }
    return;
  }

  if (!session) {
    window.location.href = 'login2.html';
    return;
  }

  const userTag = byId('userTag');
  if (userTag) {
    userTag.textContent = `${session.username} (${session.role})`;
  }
}

function mountClock() {
  const dt = byId('datetime');
  if (!dt) return;
  dt.textContent = nowString();
  setInterval(() => {
    dt.textContent = nowString();
  }, 1000);
}

function mountLogout() {
  const logoutBtn = byId('logoutBtn');
  if (!logoutBtn) return;
  logoutBtn.addEventListener('click', () => {
    clearSession();
    window.location.href = 'login2.html';
  });
}

function markActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;
  const link = document.querySelector(`a[data-link='${page}']`);
  if (link) link.classList.add('active');
}

function profileKey(username) {
  return `he_profile_${username}`;
}

function historyKey(username) {
  return `he_history_${username}`;
}

function ambulanceKey(username) {
  return `he_ambulance_${username}`;
}

function queryKey(username) {
  return `he_queries_${username}`;
}

function chatKey(username) {
  return `he_chat_${username}`;
}

function initLogin() {
  const form = byId('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const role = byId('role').value;
    const username = byId('username').value.trim();
    const password = byId('password').value;

    const user = getUsers().find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.role === role
    );

    if (!user || user.password !== password) {
      message('authMsg', 'Invalid credentials. Please try again.', 'err');
      return;
    }

    setSession({ username: user.username, role: user.role, loginAt: nowString() });
    message('authMsg', 'Login successful. Redirecting...', 'ok');
    setTimeout(() => {
      window.location.href = 'fumod.html';
    }, 700);
  });
}

function initSignup() {
  const form = byId('signupForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const role = byId('sRole').value;
    const username = byId('sUsername').value.trim();
    const fullName = byId('sFullName').value.trim();
    const email = byId('sEmail').value.trim();
    const phone = byId('sPhone').value.trim();
    const password = byId('sPassword').value;
    const confirm = byId('sConfirm').value;

    if (password.length < 6) {
      message('signupMsg', 'Password must be at least 6 characters.', 'warn');
      return;
    }

    if (password !== confirm) {
      message('signupMsg', 'Passwords do not match.', 'err');
      return;
    }

    const users = getUsers();
    const exists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());

    if (exists) {
      message('signupMsg', 'Username already exists. Choose another one.', 'warn');
      return;
    }

    users.push({
      role,
      username,
      fullName,
      email,
      phone,
      password,
      createdAt: nowString()
    });

    setUsers(users);
    message('signupMsg', 'Account created. Please login now.', 'ok');
    form.reset();
    setTimeout(() => {
      window.location.href = 'login2.html';
    }, 1000);
  });
}

function initDashboard() {
  const root = byId('quickStats');
  if (!root) return;
  const user = getCurrentUser();
  if (!user) return;

  const profile = readJson(profileKey(user.username), null);
  const history = readJson(historyKey(user.username), []);
  const ambulances = readJson(ambulanceKey(user.username), []);
  const queries = readJson(queryKey(user.username), []);

  const cards = [
    ['Role', user.role],
    ['Profile', profile ? 'Completed' : 'Pending'],
    ['History Items', String(history.length)],
    ['Ambulance Requests', String(ambulances.length)],
    ['Queries Raised', String(queries.length)]
  ];

  root.innerHTML = cards
    .map(([title, val]) => `<article class='card'><h3>${title}</h3><p>${val}</p></article>`)
    .join('');
}

function initPersonal() {
  const form = byId('personalForm');
  if (!form) return;
  const user = getCurrentUser();
  if (!user) return;
  const key = profileKey(user.username);
  const profile = readJson(key, null);

  if (profile) {
    Object.entries(profile).forEach(([k, v]) => {
      const input = byId(k);
      if (input) input.value = v;
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      fullName: byId('fullName').value.trim(),
      dob: byId('dob').value,
      gender: byId('gender').value,
      bloodGroup: byId('bloodGroup').value,
      phone: byId('phone').value.trim(),
      emergencyContact: byId('emergencyContact').value.trim(),
      address: byId('address').value.trim(),
      allergies: byId('allergies').value.trim()
    };
    writeJson(key, data);
    message('personalMsg', 'Personal details saved successfully.', 'ok');
  });
}

function renderHistoryTable() {
  const tableBody = byId('historyRows');
  const user = getCurrentUser();
  if (!tableBody || !user) return;
  const records = readJson(historyKey(user.username), []);

  tableBody.innerHTML = records.length
    ? records
        .map(
          (item, idx) =>
            `<tr><td>${idx + 1}</td><td>${item.visitDate}</td><td>${item.doctor}</td><td>${item.diagnosis}</td><td>${item.notes}</td></tr>`
        )
        .join('')
    : `<tr><td colspan='5'>No records added yet.</td></tr>`;
}

function initHistory() {
  const form = byId('historyForm');
  if (!form) return;
  renderHistoryTable();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;
    const key = historyKey(user.username);
    const records = readJson(key, []);
    records.push({
      visitDate: byId('visitDate').value,
      doctor: byId('doctor').value.trim(),
      diagnosis: byId('diagnosis').value.trim(),
      notes: byId('notes').value.trim()
    });
    writeJson(key, records);
    form.reset();
    renderHistoryTable();
    message('historyMsg', 'History entry added.', 'ok');
  });
}

function initHospital() {
  const cards = byId('hospitalCards');
  const filter = byId('cityFilter');
  if (!cards || !filter) return;

  const hospitals = [
    { name: 'City Care Hospital', city: 'Hyderabad', type: 'Multi-speciality', emergency: '24x7' },
    { name: 'Hope Life Clinic', city: 'Bengaluru', type: 'General Medicine', emergency: 'Limited' },
    { name: 'Sunrise Medical Center', city: 'Pune', type: 'Cardiology', emergency: '24x7' },
    { name: 'Metro Health Point', city: 'Delhi', type: 'Trauma Care', emergency: '24x7' }
  ];

  function paint() {
    const city = filter.value;
    const list = city ? hospitals.filter((h) => h.city === city) : hospitals;
    cards.innerHTML = list
      .map(
        (h) =>
          `<article class='card'><h3>${h.name}</h3><p><strong>City:</strong> ${h.city}</p><p><strong>Speciality:</strong> ${h.type}</p><p><strong>Emergency:</strong> ${h.emergency}</p></article>`
      )
      .join('');
  }

  filter.addEventListener('change', paint);
  paint();
}

function renderAmbulanceTable() {
  const rows = byId('ambulanceRows');
  const user = getCurrentUser();
  if (!rows || !user) return;
  const requests = readJson(ambulanceKey(user.username), []);

  rows.innerHTML = requests.length
    ? requests
        .map(
          (item, idx) =>
            `<tr><td>${idx + 1}</td><td>${item.pickup}</td><td>${item.hospital}</td><td>${item.priority}</td><td>${item.status}</td></tr>`
        )
        .join('')
    : `<tr><td colspan='5'>No ambulance requests yet.</td></tr>`;
}

function initAmbulance() {
  const form = byId('ambulanceForm');
  if (!form) return;
  renderAmbulanceTable();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;
    const key = ambulanceKey(user.username);
    const requests = readJson(key, []);
    requests.push({
      pickup: byId('pickup').value.trim(),
      hospital: byId('targetHospital').value.trim(),
      priority: byId('priority').value,
      status: 'Requested'
    });
    writeJson(key, requests);
    form.reset();
    renderAmbulanceTable();
    message('ambulanceMsg', 'Ambulance request submitted.', 'ok');
  });
}

function botReply(input) {
  const text = input.toLowerCase();
  if (text.includes('fever')) return 'Stay hydrated, monitor temperature, and seek a doctor if fever persists beyond 2 days.';
  if (text.includes('headache')) return 'Try hydration and rest. If severe or recurring, consult a physician.';
  if (text.includes('chest pain') || text.includes('breath')) return 'This may be urgent. Please contact emergency services immediately.';
  if (text.includes('diet')) return 'Focus on a balanced plate: protein, vegetables, fiber, and adequate water intake.';
  return 'I can guide with basic health suggestions. For diagnosis and treatment, consult a qualified doctor.';
}

function paintChat() {
  const chat = byId('chatBox');
  const user = getCurrentUser();
  if (!chat || !user) return;
  const items = readJson(chatKey(user.username), []);
  chat.innerHTML = items
    .map(
      (m) =>
        `<div class='chat-item ${m.role === 'user' ? 'user' : 'bot'}'><strong>${m.role === 'user' ? 'You' : 'Assistant'}:</strong> ${m.text}</div>`
    )
    .join('');
  chat.scrollTop = chat.scrollHeight;
}

function initChatbot() {
  const form = byId('chatForm');
  if (!form) return;
  const user = getCurrentUser();
  if (!user) return;
  paintChat();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const key = chatKey(user.username);
    const text = byId('chatInput').value.trim();
    if (!text) return;
    const items = readJson(key, []);
    items.push({ role: 'user', text });
    items.push({ role: 'bot', text: botReply(text) });
    writeJson(key, items);
    byId('chatInput').value = '';
    paintChat();
  });

  const clearBtn = byId('clearChat');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      localStorage.removeItem(chatKey(user.username));
      paintChat();
    });
  }
}

function renderQueries() {
  const rows = byId('queryRows');
  const user = getCurrentUser();
  if (!rows || !user) return;
  const items = readJson(queryKey(user.username), []);

  rows.innerHTML = items.length
    ? items
        .map(
          (item, idx) =>
            `<tr><td>${idx + 1}</td><td>${item.topic}</td><td>${item.query}</td><td>${item.createdAt}</td></tr>`
        )
        .join('')
    : `<tr><td colspan='4'>No queries submitted yet.</td></tr>`;
}

function initHealthTips() {
  const form = byId('queryForm');
  if (!form) return;
  renderQueries();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;
    const key = queryKey(user.username);
    const items = readJson(key, []);
    items.push({
      topic: byId('queryTopic').value,
      query: byId('queryText').value.trim(),
      createdAt: nowString()
    });
    writeJson(key, items);
    form.reset();
    renderQueries();
    message('queryMsg', 'Your query has been captured.', 'ok');
  });
}

window.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  mountClock();
  mountLogout();
  markActiveNav();

  initLogin();
  initSignup();
  initDashboard();
  initPersonal();
  initHistory();
  initHospital();
  initAmbulance();
  initChatbot();
  initHealthTips();
});
