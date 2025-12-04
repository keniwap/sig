function togglePasswordClick(e) {
  const btn = e.currentTarget;
  const wrapper = btn.closest('.password-toggle');
  if (!wrapper) return;
  const input = wrapper.querySelector('input');
  if (!input) return;

  const eye = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  const eyeOff = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.77 20.77 0 0 1 5.06-6.94"></path><path d="M1 1l22 22"></path><path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88"></path><path d="M14.12 14.12 9.88 9.88"></path></svg>';

  if (input.type === 'password') {
    input.type = 'text';
    btn.setAttribute('aria-label', 'Hide password');
    btn.innerHTML = eyeOff;
  } else {
    input.type = 'password';
    btn.setAttribute('aria-label', 'Show password');
    btn.innerHTML = eye;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Authentication check
  const studentToken = localStorage.getItem('studentToken');
  if (!studentToken) {
    window.location.href = '../login.html';
    return;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  const emailForm = document.getElementById('emailForm');
  const passwordForm = document.getElementById('passwordForm');
  const emailHeader = document.getElementById('emailHeader');
  const passwordHeader = document.getElementById('passwordHeader');
  
  // Toggle sections functionality
  function toggleSection(header, form, otherForm, otherHeader) {
    const isVisible = form.style.display !== 'none';
    
    // Hide both forms first
    emailForm.style.display = 'none';
    passwordForm.style.display = 'none';
    
    // Reset toggle icons
    const emailIcon = emailHeader.querySelector('.toggle-icon');
    const passwordIcon = passwordHeader.querySelector('.toggle-icon');
    if (emailIcon) emailIcon.textContent = '▼';
    if (passwordIcon) passwordIcon.textContent = '▼';
    
    // Remove active class from both headers
    emailHeader.classList.remove('active');
    passwordHeader.classList.remove('active');
    
    // If clicking the same section that's already open, close it
    // Otherwise, open the clicked section
    if (!isVisible) {
      form.style.display = 'grid';
      const icon = header.querySelector('.toggle-icon');
      if (icon) icon.textContent = '▲';
      header.classList.add('active');
    }
  }
  
  // Email header click
  if (emailHeader) {
    emailHeader.addEventListener('click', () => {
      toggleSection(emailHeader, emailForm, passwordForm, passwordHeader);
    });
  }
  
  // Password header click
  if (passwordHeader) {
    passwordHeader.addEventListener('click', () => {
      toggleSection(passwordHeader, passwordForm, emailForm, emailHeader);
    });
  }
  
  // Load current user data
  const currentEmail = localStorage.getItem('userEmail') || localStorage.getItem('username') || '';
  const currentPassword = localStorage.getItem('userPassword') || '';
  
  // Populate current email
  const currentEmailInput = document.getElementById('currentEmail');
  if (currentEmailInput) {
    currentEmailInput.value = currentEmail;
  }

  // Load account info
  const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
  const userName = localStorage.getItem('userName') || studentData.name || 'Student';
  
  // Update account information
  document.getElementById('infoName').textContent = userName;
  document.getElementById('infoStudentNumber').textContent = studentData.studentNumber || '2024-XXXXX';
  document.getElementById('infoProgram').textContent = studentData.program || 'BS Information Technology';
  document.getElementById('infoYearLevel').textContent = studentData.yearLevel || '1st Year';
  document.getElementById('infoCreatedDate').textContent = studentData.createdDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Email form submission
  if (emailForm) {
    emailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newEmail = document.getElementById('newEmail').value.trim();
      const confirmEmail = document.getElementById('confirmEmail').value.trim();

      if (!newEmail || !confirmEmail) {
        alert('Please fill in all fields.');
        return;
      }

      if (newEmail !== confirmEmail) {
        alert('Email addresses do not match.');
        return;
      }

      if (newEmail === currentEmail) {
        alert('New email must be different from current email.');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Update email (in a real app, this would be an API call)
      localStorage.setItem('userEmail', newEmail);
      localStorage.setItem('username', newEmail);
      currentEmailInput.value = newEmail;
      
      alert('Email updated successfully!');
      emailForm.reset();
      document.getElementById('newEmail').value = '';
      document.getElementById('confirmEmail').value = '';
    });
  }

  // Password form submission
  if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const currentPasswordInput = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (!currentPasswordInput || !newPassword || !confirmPassword) {
        alert('Please fill in all fields.');
        return;
      }

      // In a real app, verify current password with backend
      // For now, we'll just check if it's not empty
      if (!currentPasswordInput) {
        alert('Please enter your current password.');
        return;
      }

      if (newPassword.length < 8) {
        alert('New password must be at least 8 characters long.');
        return;
      }

      if (newPassword !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }

      if (currentPasswordInput === newPassword) {
        alert('New password must be different from current password.');
        return;
      }

      // Update password (in a real app, this would be an API call)
      localStorage.setItem('userPassword', newPassword);
      
      alert('Password updated successfully!');
      passwordForm.reset();
    });
  }

  // Logout button
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

