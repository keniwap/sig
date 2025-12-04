document.addEventListener('DOMContentLoaded', () => {
  // Authentication check
  const studentToken = localStorage.getItem('studentToken');
  if (!studentToken) {
    window.location.href = '../login.html';
    return;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  const refreshAnnouncements = document.getElementById('refreshAnnouncements');

  if (refreshAnnouncements) {
    refreshAnnouncements.addEventListener('click', () => {
      refreshAnnouncements.textContent = 'Refreshing...';
      refreshAnnouncements.disabled = true;
      
      setTimeout(() => {
        refreshAnnouncements.textContent = 'Refresh';
        refreshAnnouncements.disabled = false;
        alert('Announcements refreshed!');
      }, 1000);
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('studentToken');
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
});

