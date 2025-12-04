document.addEventListener('DOMContentLoaded', () => {
  // Authentication check
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    window.location.href = '../login.html';
    return;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  const backBtn = document.getElementById('backBtn');
  
  // Get student ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');

  if (!studentId) {
    alert('No student ID provided. Redirecting to members page.');
    window.location.href = 'adminmembers.html';
    return;
  }

  // Load members from localStorage
  const members = JSON.parse(localStorage.getItem('adminMembers') || '[]');
  const student = members.find(m => m.id === studentId);

  if (!student) {
    alert('Student not found. Redirecting to members page.');
    window.location.href = 'adminmembers.html';
    return;
  }

  // Load sessions and announcements for stats
  const sessions = JSON.parse(localStorage.getItem('adminSessions') || '[]');
  const announcements = JSON.parse(localStorage.getItem('adminAnnouncements') || '[]');

  // Populate student data
  function populateStudentData() {
    // Update header
    const studentNameDisplay = document.getElementById('studentNameDisplay');
    if (studentNameDisplay) {
      studentNameDisplay.textContent = `Viewing profile: ${student.name}`;
    }

    // Update account status
    const memberStatus = document.getElementById('memberStatus');
    if (memberStatus) {
      memberStatus.textContent = student.status === 'active' ? 'Active Member' : 
                                student.status === 'pending' ? 'Pending Member' : 'Inactive Member';
      memberStatus.className = `status-badge ${student.status === 'active' ? 'active' : 
                                                      student.status === 'pending' ? 'pending' : 'inactive'}`;
    }

    document.getElementById('studentNumber').textContent = student.studentNumber || 'N/A';
    document.getElementById('studentProgram').textContent = student.program || 'N/A';
    document.getElementById('studentStatus').textContent = student.status ? 
      student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'N/A';
    document.getElementById('participationRate').textContent = `${student.participation || 0}%`;
    document.getElementById('participationRateStat').textContent = `${student.participation || 0}%`;

    // Update payment status (simulated - would come from backend)
    const paymentStatus = document.getElementById('paymentStatus');
    if (paymentStatus) {
      // Assume active members have paid
      if (student.status === 'active') {
        paymentStatus.textContent = 'Paid';
        paymentStatus.className = 'status-paid';
      } else {
        paymentStatus.textContent = 'Pending Payment';
        paymentStatus.className = 'status-pending';
      }
    }

    // Update sessions
    const nextSessionDate = document.getElementById('nextSessionDate');
    const nextSessionTitle = document.getElementById('nextSessionTitle');
    if (sessions.length > 0) {
      const now = new Date();
      const futureSessions = sessions
        .slice()
        .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`))
        .filter(session => new Date(`${session.date}T${session.startTime}`) >= now);

      if (futureSessions.length > 0) {
        const nextSession = futureSessions[0];
        const date = new Date(nextSession.date);
        nextSessionDate.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        nextSessionTitle.textContent = `${nextSession.title} • ${nextSession.type}`;
      } else {
        nextSessionDate.textContent = '—';
        nextSessionTitle.textContent = 'No upcoming sessions';
      }
    }

    // Update announcements count
    const announcementCount = document.getElementById('announcementCount');
    if (announcementCount) {
      announcementCount.textContent = announcements.length || 0;
    }

    // Update participation stats (simulated - would come from backend)
    const participation = student.participation || 0;
    const sessionsAttended = document.getElementById('sessionsAttended');
    const sessionsProgress = document.getElementById('sessionsProgress');
    const sessionsHelper = document.getElementById('sessionsHelper');
    const monthlyRate = document.getElementById('monthlyRate');
    const monthlyProgress = document.getElementById('monthlyProgress');
    const monthlyHelper = document.getElementById('monthlyHelper');
    const totalPoints = document.getElementById('totalPoints');

    // Simulate participation data based on participation rate
    const totalSessions = 10;
    const attended = Math.round((participation / 100) * totalSessions);
    
    if (sessionsAttended) sessionsAttended.textContent = `${attended} / ${totalSessions}`;
    if (sessionsProgress) sessionsProgress.style.width = `${participation}%`;
    if (sessionsHelper) {
      if (participation >= 100) {
        sessionsHelper.textContent = 'Perfect attendance!';
      } else if (participation >= 80) {
        sessionsHelper.textContent = `Attend ${totalSessions - attended} more sessions to reach 100%`;
      } else {
        sessionsHelper.textContent = 'Keep attending sessions to improve your rate';
      }
    }

    if (monthlyRate) monthlyRate.textContent = `${participation}%`;
    if (monthlyProgress) monthlyProgress.style.width = `${participation}%`;
    if (monthlyHelper) {
      if (participation >= 80) {
        monthlyHelper.textContent = 'Great job staying active this month';
      } else if (participation >= 50) {
        monthlyHelper.textContent = 'Good progress, keep it up!';
      } else {
        monthlyHelper.textContent = 'Try to attend more sessions';
      }
    }

    if (totalPoints) {
      // Calculate points based on participation (rough estimate)
      totalPoints.textContent = Math.round(participation * 2.5);
    }
  }

  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'adminmembers.html';
    });
  }

  // Logout button
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

  populateStudentData();
});

