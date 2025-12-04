document.addEventListener('DOMContentLoaded', () => {
  // Authentication check
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    window.location.href = '../login.html';
    return;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  const announcementForm = document.getElementById('announcementForm');
  const announcementSubmitBtn = announcementForm?.querySelector('button[type="submit"]');
  const clearAnnouncementBtn = document.getElementById('clearAnnouncement');
  const refreshAnnouncementsBtn = document.getElementById('refreshAnnouncements');
  const adminAnnouncementList = document.getElementById('adminAnnouncementList');

  let editingAnnouncementId = null;

  // Load announcements from localStorage or initialize empty array
  let announcements = JSON.parse(localStorage.getItem('adminAnnouncements') || '[]');

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  function resetAnnouncementForm() {
    if (!announcementForm) return;
    announcementForm.reset();
    editingAnnouncementId = null;
    if (announcementSubmitBtn) {
      announcementSubmitBtn.textContent = 'Publish Announcement';
    }
  }

  function saveAnnouncements() {
    localStorage.setItem('adminAnnouncements', JSON.stringify(announcements));
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

      saveAnnouncements();
      resetAnnouncementForm();
      renderAnnouncements();
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
        saveAnnouncements();
        resetAnnouncementForm();
        renderAnnouncements();
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

  resetAnnouncementForm();
  renderAnnouncements();
});

