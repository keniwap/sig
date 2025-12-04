document.addEventListener('DOMContentLoaded', () => {
  // Authentication check
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    window.location.href = '../login.html';
    return;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  const totalMembersEl = document.getElementById('totalMembers');
  const pendingApprovalsEl = document.getElementById('pendingApprovals');
  const upcomingSessionDateEl = document.getElementById('upcomingSessionDate');
  const upcomingSessionTitleEl = document.getElementById('upcomingSessionTitle');
  const announcementTodayEl = document.getElementById('announcementToday');

  const announcementForm = document.getElementById('announcementForm');
  const announcementSubmitBtn = announcementForm?.querySelector('button[type="submit"]');
  const clearAnnouncementBtn = document.getElementById('clearAnnouncement');
  const refreshAnnouncementsBtn = document.getElementById('refreshAnnouncements');
  const adminAnnouncementList = document.getElementById('adminAnnouncementList');

  const addSessionBtn = document.getElementById('addSessionBtn');
  const adminScheduleList = document.getElementById('adminScheduleList');
  const sessionModal = document.getElementById('sessionModal');
  const sessionForm = document.getElementById('sessionForm');
  const modalTitle = document.getElementById('modalTitle');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelModalBtn = document.getElementById('cancelModal');

  const memberSearchInput = document.getElementById('memberSearch');
  const memberTableBody = document.getElementById('memberTableBody');
  const filterProgram = document.getElementById('filterProgram');
  const filterStatus = document.getElementById('filterStatus');
  const filterParticipation = document.getElementById('filterParticipation');
  const clearFiltersBtn = document.getElementById('clearFilters');

  const navLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');

  let editingAnnouncementId = null;
  let editingSessionId = null;

  // Initialize empty arrays - data will be loaded from backend
  let announcements = [];
  let sessions = [];
  let members = [];

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

  function resetAnnouncementForm() {
    if (!announcementForm) return;
    announcementForm.reset();
    editingAnnouncementId = null;
    if (announcementSubmitBtn) {
      announcementSubmitBtn.textContent = 'Publish Announcement';
    }
  }

  function renderAnnouncements() {
    if (!adminAnnouncementList) return;
    if (!announcements.length) {
      adminAnnouncementList.innerHTML = '<p class="helper-text">No announcements yet.</p>';
      return;
    }

    adminAnnouncementList.innerHTML = announcements
      .map(announcement => {
        const badgeClass = `announcement-badge${announcement.category === 'urgent' ? ' urgent' : ''}`;
        const badgeLabel = announcement.category === 'urgent'
          ? 'Urgent'
          : announcement.category === 'event'
            ? 'Event'
            : 'General';
        const visibilityLabel = announcement.visibility === 'public' ? 'Public' : 'Members Only';
        return `
          <div class="announcement-item" data-id="${announcement.id}">
            <div class="${badgeClass}">${badgeLabel}</div>
            <div class="announcement-content">
              <h3>${announcement.title}</h3>
              <p>${announcement.body}</p>
              <div class="announcement-meta">
                <span>📅 ${formatDate(announcement.date)}</span>
                <span>✍️ ${announcement.author}</span>
                <span>👁️ ${visibilityLabel}</span>
              </div>
              <div class="announcement-actions">
                <button class="btn btn-outline btn-sm" data-action="edit-announcement" data-id="${announcement.id}">Edit</button>
                <button class="btn btn-danger btn-sm" data-action="delete-announcement" data-id="${announcement.id}">Delete</button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
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

  function renderMembers(filterTerm = '', programFilter = 'all', statusFilter = 'all', participationSort = 'none') {
    if (!memberTableBody) return;
    const term = filterTerm.trim().toLowerCase();

    let filteredMembers = members.filter(member => {
      // Search filter
      const matchesSearch = !term || (
        member.name.toLowerCase().includes(term) ||
        member.studentNumber.toLowerCase().includes(term) ||
        member.program.toLowerCase().includes(term)
      );

      // Program filter
      const matchesProgram = programFilter === 'all' || member.program === programFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

      return matchesSearch && matchesProgram && matchesStatus;
    });

    // Sort by participation if requested
    if (participationSort === 'highest') {
      filteredMembers = filteredMembers.sort((a, b) => b.participation - a.participation);
    } else if (participationSort === 'lowest') {
      filteredMembers = filteredMembers.sort((a, b) => a.participation - b.participation);
    }

    if (!filteredMembers.length) {
      let message = 'No members found.';
      if (filterTerm || programFilter !== 'all' || statusFilter !== 'all') {
        message = 'No members match the current filters.';
      }
      memberTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:16px;">
            <span class="helper-text">${message}</span>
          </td>
        </tr>
      `;
      return;
    }

    memberTableBody.innerHTML = filteredMembers
      .map(member => {
        const statusClass = `status-pill ${member.status}`;
        const statusLabel = member.status === 'active'
          ? 'Active'
          : member.status === 'pending'
            ? 'Pending'
            : 'Inactive';

        let actions = `
          <button class="btn btn-outline btn-sm" data-action="message-member" data-id="${member.id}">Message</button>
          <button class="btn btn-outline btn-sm" data-action="view-member" data-id="${member.id}">View</button>
        `;

        if (member.status === 'pending') {
          actions = `
            <button class="btn btn-primary btn-sm" data-action="approve-member" data-id="${member.id}">Approve</button>
            <button class="btn btn-outline btn-sm" data-action="message-member" data-id="${member.id}">Remind</button>
          `;
        } else if (member.status === 'active') {
          actions += `
            <button class="btn btn-danger btn-sm" data-action="suspend-member" data-id="${member.id}">Suspend</button>
          `;
        } else if (member.status === 'inactive') {
          actions = `
            <button class="btn btn-primary btn-sm" data-action="reactivate-member" data-id="${member.id}">Reactivate</button>
          `;
        }

        return `
          <tr data-id="${member.id}">
            <td>${member.name}</td>
            <td>${member.studentNumber}</td>
            <td>${member.program}</td>
            <td><span class="${statusClass}">${statusLabel}</span></td>
            <td>${member.participation}%</td>
            <td>
              <div class="member-actions">
                ${actions}
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  function updateStats() {
    if (totalMembersEl) {
      totalMembersEl.textContent = members.length;
    }

    if (pendingApprovalsEl) {
      const pending = members.filter(member => member.status === 'pending').length;
      pendingApprovalsEl.textContent = pending;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    if (announcementTodayEl) {
      const todaysAnnouncements = announcements.filter(announcement => announcement.date === todayStr).length;
      announcementTodayEl.textContent = todaysAnnouncements;
    }

    if (upcomingSessionDateEl && upcomingSessionTitleEl) {
      if (sessions.length > 0) {
        const now = new Date();
        const futureSessions = sessions
          .slice()
          .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`))
          .filter(session => new Date(`${session.date}T${session.startTime}`) >= now);

        if (futureSessions.length) {
          const nextSession = futureSessions[0];
          upcomingSessionDateEl.textContent = formatDate(nextSession.date);
          upcomingSessionTitleEl.textContent = `${nextSession.title} • ${nextSession.type}`;
        } else {
          upcomingSessionDateEl.textContent = '—';
          upcomingSessionTitleEl.textContent = 'No upcoming sessions';
        }
      } else {
        upcomingSessionDateEl.textContent = '—';
        upcomingSessionTitleEl.textContent = 'No sessions scheduled';
      }
    }
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

  if (announcementForm) {
    announcementForm.addEventListener('submit', event => {
      event.preventDefault();
      const title = announcementForm.announcementTitle.value.trim();
      const body = announcementForm.announcementBody.value.trim();
      const category = announcementForm.announcementCategory.value;
      const visibility = announcementForm.announcementVisibility.value;
      if (!title || !body) return;

      if (editingAnnouncementId) {
        announcements = announcements.map(item =>
          item.id === editingAnnouncementId
            ? { ...item, title, body, category, visibility }
            : item
        );
      } else {
        announcements.unshift({
          id: `ann-${Date.now()}`,
          title,
          body,
          category,
          visibility,
          date: new Date().toISOString().slice(0, 10),
          author: 'Admin Team'
        });
      }

      resetAnnouncementForm();
      renderAnnouncements();
      updateStats();
    });
  }

  if (clearAnnouncementBtn) {
    clearAnnouncementBtn.addEventListener('click', () => {
      resetAnnouncementForm();
    });
  }

  if (refreshAnnouncementsBtn) {
    refreshAnnouncementsBtn.addEventListener('click', () => {
      refreshAnnouncementsBtn.textContent = 'Refreshing...';
      refreshAnnouncementsBtn.disabled = true;
      setTimeout(() => {
        renderAnnouncements();
        refreshAnnouncementsBtn.textContent = 'Refresh';
        refreshAnnouncementsBtn.disabled = false;
      }, 800);
    });
  }

  if (adminAnnouncementList) {
    adminAnnouncementList.addEventListener('click', event => {
      const target = event.target.closest('button[data-action]');
      if (!target) return;
      const id = target.dataset.id;
      const action = target.dataset.action;
      const announcement = announcements.find(item => item.id === id);
      if (!announcement) return;

      if (action === 'edit-announcement') {
        editingAnnouncementId = id;
        if (announcementForm) {
          announcementForm.announcementTitle.value = announcement.title;
          announcementForm.announcementBody.value = announcement.body;
          announcementForm.announcementCategory.value = announcement.category;
          announcementForm.announcementVisibility.value = announcement.visibility;
          if (announcementSubmitBtn) {
            announcementSubmitBtn.textContent = 'Update Announcement';
          }
          announcementForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (action === 'delete-announcement') {
        const confirmed = confirm('Delete this announcement?');
        if (!confirmed) return;
        announcements = announcements.filter(item => item.id !== id);
        resetAnnouncementForm();
        renderAnnouncements();
        updateStats();
      }
    });
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

      closeSessionModal();
      renderSessions();
      updateStats();
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
        renderSessions();
        updateStats();
      }
    });
  }

  // Mapping function to get abbreviation from full program name
  function getProgramAbbreviation(program) {
    const programMap = {
      'BS Computer Science': 'BSCS',
      'BS Information Technology': 'BSIT',
      'BS Information Systems': 'BSIS'
    };
    return programMap[program] || program;
  }

  function updateProgramFilter() {
    if (!filterProgram) return;
    
    // Get unique programs from members
    const uniquePrograms = [...new Set(members.map(m => m.program))].sort();
    
    // Store current selection
    const currentValue = filterProgram.value;
    
    // Clear and rebuild options
    filterProgram.innerHTML = '<option value="all">All Programs</option>';
    
    // Add unique programs with abbreviations as display text
    uniquePrograms.forEach(program => {
      const option = document.createElement('option');
      option.value = program;
      option.textContent = getProgramAbbreviation(program);
      filterProgram.appendChild(option);
    });
    
    // Restore selection if still valid
    if (currentValue && uniquePrograms.includes(currentValue)) {
      filterProgram.value = currentValue;
    } else {
      filterProgram.value = 'all';
    }
  }

  function applyFilters() {
    const searchTerm = memberSearchInput ? memberSearchInput.value : '';
    const programValue = filterProgram ? filterProgram.value : 'all';
    const statusValue = filterStatus ? filterStatus.value : 'all';
    const participationValue = filterParticipation ? filterParticipation.value : 'none';
    renderMembers(searchTerm, programValue, statusValue, participationValue);
  }

  if (memberSearchInput) {
    memberSearchInput.addEventListener('input', () => {
      applyFilters();
    });
  }

  if (filterProgram) {
    filterProgram.addEventListener('change', () => {
      applyFilters();
    });
  }

  if (filterStatus) {
    filterStatus.addEventListener('change', () => {
      applyFilters();
    });
  }

  if (filterParticipation) {
    filterParticipation.addEventListener('change', () => {
      applyFilters();
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      if (memberSearchInput) memberSearchInput.value = '';
      if (filterProgram) filterProgram.value = 'all';
      if (filterStatus) filterStatus.value = 'all';
      if (filterParticipation) filterParticipation.value = 'none';
      applyFilters();
    });
  }

  if (memberTableBody) {
    memberTableBody.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const action = button.dataset.action;
      const id = button.dataset.id;
      const memberIndex = members.findIndex(member => member.id === id);
      if (memberIndex === -1) return;

      if (action === 'approve-member') {
        members[memberIndex].status = 'active';
        members[memberIndex].participation = Math.max(members[memberIndex].participation, 60);
      } else if (action === 'message-member') {
        alert('Messaging functionality will be integrated with backend.');
        return;
      } else if (action === 'suspend-member') {
        const confirmed = confirm('Suspend this member?');
        if (!confirmed) return;
        members[memberIndex].status = 'inactive';
      } else if (action === 'reactivate-member') {
        members[memberIndex].status = 'active';
      } else if (action === 'view-member') {
        alert('Member profile view will be available in a future update.');
        return;
      }

      applyFilters();
      updateStats();
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', event => {
      const hash = link.getAttribute('href');
      if (!hash || !hash.startsWith('#')) return;
      event.preventDefault();
      const section = document.querySelector(hash);
      if (!section) return;
      navLinks.forEach(nav => nav.classList.remove('active'));
      link.classList.add('active');
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        sessionStorage.clear();
        window.location.href = '../login.html';
      }
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && sessionModal?.classList.contains('open')) {
      closeSessionModal();
    }
  });

  resetAnnouncementForm();
  renderAnnouncements();
  renderSessions();
  updateProgramFilter();
  applyFilters();
  updateStats();
});




