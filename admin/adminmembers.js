document.addEventListener('DOMContentLoaded', () => {
  // Authentication check
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    window.location.href = '../login.html';
    return;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  const memberSearchInput = document.getElementById('memberSearch');
  const memberTableBody = document.getElementById('memberTableBody');
  const filterProgram = document.getElementById('filterProgram');
  const filterStatus = document.getElementById('filterStatus');
  const filterParticipation = document.getElementById('filterParticipation');
  const clearFiltersBtn = document.getElementById('clearFilters');

  // Load members from localStorage or initialize empty array
  let members = JSON.parse(localStorage.getItem('adminMembers') || '[]');
  
  // If no members, initialize with empty array (remove sample data)
  if (!Array.isArray(members)) {
    members = [];
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

  function saveMembers() {
    localStorage.setItem('adminMembers', JSON.stringify(members));
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
        saveMembers();
      } else if (action === 'message-member') {
        alert('Messaging functionality will be integrated with backend.');
        return;
      } else if (action === 'suspend-member') {
        const confirmed = confirm('Suspend this member?');
        if (!confirmed) return;
        members[memberIndex].status = 'inactive';
        saveMembers();
      } else if (action === 'reactivate-member') {
        members[memberIndex].status = 'active';
        saveMembers();
      } else if (action === 'view-member') {
        // Navigate to student view page with student ID
        window.location.href = `viewstudent.html?id=${id}`;
        return;
      }

      applyFilters();
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

  updateProgramFilter();
  applyFilters();
});

