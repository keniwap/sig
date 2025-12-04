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

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  function updateStats() {
    // Get data from localStorage or initialize with defaults
    let members = JSON.parse(localStorage.getItem('adminMembers') || '[]');
    let announcements = JSON.parse(localStorage.getItem('adminAnnouncements') || '[]');
    let sessions = JSON.parse(localStorage.getItem('adminSessions') || '[]');

    // Initialize with default data if empty
    if (members.length === 0) {
      members = [
        {
          id: 'mem-1',
          name: 'Alex Garcia',
          studentNumber: '2024-0001',
          program: 'BS Computer Science',
          status: 'active',
          participation: 92
        },
        {
          id: 'mem-2',
          name: 'Bianca Flores',
          studentNumber: '2024-0007',
          program: 'BS Information Technology',
          status: 'pending',
          participation: 54
        },
        {
          id: 'mem-3',
          name: 'Carl Mendoza',
          studentNumber: '2024-0020',
          program: 'BS Computer Science',
          status: 'active',
          participation: 88
        },
        {
          id: 'mem-4',
          name: 'Diana Cruz',
          studentNumber: '2024-0034',
          program: 'BS Information Systems',
          status: 'inactive',
          participation: 12
        },
        {
          id: 'mem-5',
          name: 'Ethan Perez',
          studentNumber: '2024-0042',
          program: 'BS Computer Science',
          status: 'pending',
          participation: 40
        }
      ];
      localStorage.setItem('adminMembers', JSON.stringify(members));
    }

    if (announcements.length === 0) {
      announcements = [
        {
          id: 'ann-1',
          title: 'CodeLab: React Basics Workshop',
          body: 'Join us this Saturday for an intensive React workshop covering hooks, components, and state management.',
          category: 'event',
          visibility: 'members',
          date: '2024-11-08',
          author: 'Admin Team'
        },
        {
          id: 'ann-2',
          title: 'Hackathon Briefing Session',
          body: 'Mandatory briefing on November 12 for all hackathon participants. We will cover team formation and project rules.',
          category: 'urgent',
          visibility: 'members',
          date: '2024-11-05',
          author: 'Admin Team'
        },
        {
          id: 'ann-3',
          title: 'Membership Fee Reminder',
          body: 'Membership fees are due by the end of this month. Settle payments to remain in good standing.',
          category: 'general',
          visibility: 'public',
          date: '2024-11-01',
          author: 'Finance Committee'
        }
      ];
      localStorage.setItem('adminAnnouncements', JSON.stringify(announcements));
    }

    if (sessions.length === 0) {
      sessions = [
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
      ];
      localStorage.setItem('adminSessions', JSON.stringify(sessions));
    }

    if (totalMembersEl) {
      totalMembersEl.textContent = members.length || 0;
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
    }
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

  updateStats();
});

