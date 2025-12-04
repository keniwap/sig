document.addEventListener('DOMContentLoaded', () => {
  // Authentication check
  const studentToken = localStorage.getItem('studentToken');
  if (!studentToken) {
    window.location.href = '../login.html';
    return;
  }

  // Load and display student name
  const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
  const userName = localStorage.getItem('userName') || studentData.name || 'Student';
  const welcomeMessage = document.getElementById('welcomeMessage');
  if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome back, ${userName}!`;
  }

  // Update account status with student data
  const studentNameEl = document.getElementById('studentName');
  if (studentNameEl) {
    studentNameEl.textContent = userName;
  }
  
  if (studentData.studentNumber) {
    const studentNumberEl = document.getElementById('studentNumber');
    if (studentNumberEl) studentNumberEl.textContent = studentData.studentNumber;
  }
  if (studentData.program) {
    const studentProgramEl = document.getElementById('studentProgram');
    if (studentProgramEl) studentProgramEl.textContent = studentData.program;
  }
  if (studentData.yearLevel) {
    const yearLevelEl = document.getElementById('yearLevel');
    if (yearLevelEl) yearLevelEl.textContent = studentData.yearLevel;
  }
  if (studentData.createdDate) {
    const joinedDateEl = document.getElementById('joinedDate');
    if (joinedDateEl) joinedDateEl.textContent = studentData.createdDate;
  }

  // Navigation
  const overviewLink = document.querySelector('.sidebar-nav a[href="#overview"]');
  if (overviewLink) overviewLink.classList.add('active');

  // Account Status
  const paymentStatus = document.getElementById('paymentStatus');
  const paymentActions = document.getElementById('paymentActions');
  const payNowBtn = document.getElementById('payNowBtn');
  
  // Check payment status and show payment button if needed
  function checkPaymentStatus() {
    // Simulate checking payment status - replace with actual API call
    const isPaid = false; // Change to true to test paid status
    
    if (!isPaid) {
      paymentStatus.textContent = 'Pending Payment';
      paymentStatus.className = 'status-pending';
      if (paymentActions) paymentActions.style.display = 'block';
    } else {
      paymentStatus.textContent = 'Paid';
      paymentStatus.className = 'status-paid';
      if (paymentActions) paymentActions.style.display = 'none';
    }
  }
  
  checkPaymentStatus();
  
  if (payNowBtn) {
    payNowBtn.addEventListener('click', () => {
      alert('Payment gateway integration needed. This will redirect to payment page.');
      // window.location.href = 'payment.html';
    });
  }

  // Right rail elements
  const sessionList = document.getElementById('sessionList');
  const announcementList = document.getElementById('announcementList');
  const nextSessionDate = document.getElementById('nextSessionDate');
  const nextSessionTitle = document.getElementById('nextSessionTitle');
  const announcementCount = document.getElementById('announcementCount');
  const participationRate = document.getElementById('participationRate');
  const logoutBtn = document.getElementById('logoutBtn');
  const refreshAnnouncements = document.getElementById('refreshAnnouncements');

  // Initialize empty arrays - data will be loaded from backend
  const sessions = [];
  const announcements = [];

  // Update next session
  if (nextSessionDate && nextSessionTitle) {
    if (sessions.length > 0) {
      const nextSession = sessions[0];
      nextSessionDate.textContent = nextSession.date;
      nextSessionTitle.textContent = `${nextSession.title} • ${nextSession.type}`;
    } else {
      nextSessionDate.textContent = 'No upcoming sessions';
      nextSessionTitle.textContent = 'Check back later';
    }
  }

  // Update right rail session list
  if (sessionList) {
    if (sessions.length > 0) {
      sessionList.innerHTML = sessions.slice(0, 3).map(session =>
        `<li><strong>${session.date}</strong> – ${session.title} (${session.type})</li>`
      ).join('');
    } else {
      sessionList.innerHTML = '<li>No sessions scheduled</li>';
    }
  }

  // Update announcements count and right rail
  function updateAnnouncements() {
    if (announcementCount) {
      const newCount = announcements.filter(a => a.isNew).length;
      announcementCount.textContent = newCount || announcements.length;
    }
    
    if (announcementList) {
      if (announcements.length > 0) {
        announcementList.innerHTML = announcements.slice(0, 3).map(item =>
          `<li><strong>${item.title}</strong> <span>${item.date}</span></li>`
        ).join('');
      } else {
        announcementList.innerHTML = '<li>No announcements</li>';
      }
    }
  }
  
  updateAnnouncements();

  if (refreshAnnouncements) {
    refreshAnnouncements.addEventListener('click', () => {
      refreshAnnouncements.textContent = 'Refreshing...';
      setTimeout(() => {
        updateAnnouncements();
        refreshAnnouncements.textContent = 'Refresh';
        alert('Announcements refreshed!');
      }, 1000);
    });
  }

  // Participation rate
  if (participationRate) {
    participationRate.textContent = '0%';
  }

  // Schedule filtering
  const filterButtons = document.querySelectorAll('.filter-btn');
  const scheduleItems = document.querySelectorAll('.schedule-item');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      
      scheduleItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-type') === filter) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Sidebar navigation - highlight current page
  const currentPage = window.location.pathname.split('/').pop() || 'studentdashboard.html';
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'studentdashboard.html')) {
      link.classList.add('active');
    }
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        // Clear any session data
        localStorage.removeItem('studentToken');
        sessionStorage.clear();
        window.location.href = '../login.html';
      }
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

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

    // Close sidebar when clicking a link on mobile
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

