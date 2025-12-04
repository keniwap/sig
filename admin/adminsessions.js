document.addEventListener('DOMContentLoaded', () => {
  // Authentication check
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    window.location.href = '../login.html';
    return;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  const addSessionBtn = document.getElementById('addSessionBtn');
  const adminScheduleList = document.getElementById('adminScheduleList');
  const sessionModal = document.getElementById('sessionModal');
  const sessionForm = document.getElementById('sessionForm');
  const modalTitle = document.getElementById('modalTitle');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelModalBtn = document.getElementById('cancelModal');

  let editingSessionId = null;

  // Load sessions from localStorage or use defaults
  let sessions = JSON.parse(localStorage.getItem('adminSessions') || JSON.stringify([
    {
      id: 'sess-1',
      title: 'Intro to Web APIs',
      date: '2024-11-15',
      startTime: '14:00',
      endTime: '16:00',
      location: 'Room 201',
      type: 'Workshop',
      description: 'Learn how to consume and create RESTful APIs with hands-on exercises.'
    },
    {
      id: 'sess-2',
      title: 'Frontend Best Practices',
      date: '2024-11-22',
      startTime: '15:00',
      endTime: '17:00',
      location: 'Room 205',
      type: 'Session',
      description: 'Discussion on modern frontend development practices and performance optimization.'
    },
    {
      id: 'sess-3',
      title: 'Project Collaboration Kickoff',
      date: '2024-11-29',
      startTime: '13:00',
      endTime: '15:00',
      location: 'Main Hall',
      type: 'Meetup',
      description: 'Kickoff meeting for the semester project with team assignments and timeline overview.'
    }
  ]));

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  function formatTimeRange(start, end) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
    const startDate = new Date(`1970-01-01T${start}`);
    const endDate = new Date(`1970-01-01T${end}`);
    return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
  }

  function saveSessions() {
    localStorage.setItem('adminSessions', JSON.stringify(sessions));
  }

  function renderSessions() {
    if (!adminScheduleList) return;
    if (!sessions.length) {
      adminScheduleList.innerHTML = '<p class="helper-text">No sessions scheduled yet.</p>';
      return;
    }

    const sessionMarkup = sessions
      .slice()
      .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`))
      .map(session => `
        <div class="schedule-item" data-id="${session.id}">
          <div class="schedule-main">
            <div class="schedule-tags">
              <span class="schedule-type ${session.type}">${session.type}</span>
            </div>
            <h3>${session.title}</h3>
            <p class="schedule-desc">${session.description}</p>
            <div class="schedule-meta">
              <span>📅 ${formatDate(session.date)}</span>
              <span>⏰ ${formatTimeRange(session.startTime, session.endTime)}</span>
              <span>📍 ${session.location}</span>
            </div>
          </div>
          <div class="schedule-actions">
            <button class="btn btn-outline btn-sm" data-action="edit-session" data-id="${session.id}">Edit</button>
            <button class="btn btn-danger btn-sm" data-action="delete-session" data-id="${session.id}">Delete</button>
          </div>
        </div>
      `)
      .join('');

    adminScheduleList.innerHTML = sessionMarkup;
  }

  function openSessionModal(session = null) {
    if (!sessionModal || !sessionForm) return;
    sessionModal.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (session) {
      editingSessionId = session.id;
      modalTitle.textContent = 'Edit Session';
      sessionForm.sessionTitle.value = session.title;
      sessionForm.sessionDate.value = session.date;
      sessionForm.sessionStart.value = session.startTime;
      sessionForm.sessionEnd.value = session.endTime;
      sessionForm.sessionLocation.value = session.location;
      sessionForm.sessionType.value = session.type;
      sessionForm.sessionDescription.value = session.description;
    } else {
      editingSessionId = null;
      modalTitle.textContent = 'Add New Session';
      sessionForm.reset();
    }
  }

  function closeSessionModal() {
    if (!sessionModal || !sessionForm) return;
    sessionModal.classList.remove('open');
    document.body.style.overflow = '';
    sessionForm.reset();
    editingSessionId = null;
  }

  if (addSessionBtn) {
    addSessionBtn.addEventListener('click', () => openSessionModal());
  }

  if (sessionModal) {
    sessionModal.addEventListener('click', event => {
      if (event.target === sessionModal) {
        closeSessionModal();
      }
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => closeSessionModal());
  }

  if (cancelModalBtn) {
    cancelModalBtn.addEventListener('click', () => closeSessionModal());
  }

  if (sessionForm) {
    sessionForm.addEventListener('submit', event => {
      event.preventDefault();
      const title = sessionForm.sessionTitle.value.trim();
      const date = sessionForm.sessionDate.value;
      const startTime = sessionForm.sessionStart.value;
      const endTime = sessionForm.sessionEnd.value;
      const location = sessionForm.sessionLocation.value.trim();
      const type = sessionForm.sessionType.value;
      const description = sessionForm.sessionDescription.value.trim();

      if (!title || !date || !startTime || !endTime || !location || !description) {
        return;
      }

      if (editingSessionId) {
        sessions = sessions.map(session =>
          session.id === editingSessionId
            ? { ...session, title, date, startTime, endTime, location, type, description }
            : session
        );
      } else {
        sessions.push({
          id: `sess-${Date.now()}`,
          title,
          date,
          startTime,
          endTime,
          location,
          type,
          description
        });
      }

      saveSessions();
      closeSessionModal();
      renderSessions();
    });
  }

  if (adminScheduleList) {
    adminScheduleList.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const id = button.dataset.id;
      const action = button.dataset.action;
      const session = sessions.find(item => item.id === id);
      if (!session) return;

      if (action === 'edit-session') {
        openSessionModal(session);
      } else if (action === 'delete-session') {
        const confirmed = confirm('Delete this session?');
        if (!confirmed) return;
        sessions = sessions.filter(item => item.id !== id);
        saveSessions();
        renderSessions();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        sessionStorage.clear();
        window.location.href = '../login.html';
      }
    });
  }

  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.querySelector('.sidebar');
  if (mobileMenuToggle && sidebar) {
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);

    mobileMenuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarOverlay.classList.toggle('active');
    });

    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    });

    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
          sidebarOverlay.classList.remove('active');
        }
      });
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && sessionModal?.classList.contains('open')) {
      closeSessionModal();
    }
  });

  renderSessions();
});

