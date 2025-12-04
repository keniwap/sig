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

document.addEventListener('DOMContentLoaded', function() {
    const yr = document.getElementById('year');
    if (yr) yr.textContent = new Date().getFullYear();
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const registerContainer = document.getElementById('registerContainer');
    const loginContainer = document.querySelector('.login-container');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (!username || !password) {
                alert('Please enter both username and password.');
                return;
            }
            
            // Check if user is admin (you can modify this logic based on your requirements)
            // For now, checking if username contains "admin" or email is admin@codex
            const isAdmin = username.toLowerCase().includes('admin') || 
                          username.toLowerCase() === 'admin@codex' ||
                          username.toLowerCase() === 'admin';
            
            // Store authentication token (in a real app, this would come from the backend)
            if (isAdmin) {
                localStorage.setItem('adminToken', 'authenticated');
                localStorage.setItem('userType', 'admin');
                localStorage.setItem('username', username);
                window.location.href = 'admin/admindashboard.html';
            } else {
                // Load student data if available
                const members = JSON.parse(localStorage.getItem('adminMembers') || '[]');
                const studentMember = members.find(m => 
                    m.studentNumber === username || 
                    (m.email && m.email.toLowerCase() === username.toLowerCase())
                );
                
                if (studentMember) {
                    localStorage.setItem('userName', studentMember.name);
                    const studentData = {
                        name: studentMember.name,
                        studentNumber: studentMember.studentNumber,
                        program: studentMember.program,
                        yearLevel: studentMember.yearLevel || '1st Year',
                        createdDate: studentMember.createdDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    };
                    localStorage.setItem('studentData', JSON.stringify(studentData));
                }
                
                localStorage.setItem('studentToken', 'authenticated');
                localStorage.setItem('userType', 'student');
                localStorage.setItem('username', username);
                window.location.href = 'student/studentdashboard.html';
            }
        });
    }

    if (showRegister && registerContainer && loginContainer) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginContainer.style.display = 'none';
            registerContainer.style.display = 'block';
            window.scrollTo({ top: 0 });
        });
    }

    if (showLogin && registerContainer && loginContainer) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerContainer.style.display = 'none';
            loginContainer.style.display = 'block';
            window.scrollTo({ top: 0 });
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('regName').value.trim();
            const studentNumber = document.getElementById('regStudentNumber').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const program = document.getElementById('regProgram').value.trim();
            const year = document.getElementById('regYear').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            // Store student data
            const studentData = {
                name: name,
                studentNumber: studentNumber,
                email: email,
                program: program,
                yearLevel: year === '1' ? '1st Year' : year === '2' ? '2nd Year' : year === '3' ? '3rd Year' : '4th Year',
                createdDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            };
            
            localStorage.setItem('studentData', JSON.stringify(studentData));
            localStorage.setItem('userEmail', email);
            localStorage.setItem('username', email);
            localStorage.setItem('userName', name);
            localStorage.setItem('userPassword', password);

            // Add to admin members list
            const members = JSON.parse(localStorage.getItem('adminMembers') || '[]');
            const newMember = {
                id: `mem-${Date.now()}`,
                name: name,
                studentNumber: studentNumber,
                email: email,
                program: program,
                yearLevel: year === '1' ? '1st Year' : year === '2' ? '2nd Year' : year === '3' ? '3rd Year' : '4th Year',
                status: 'pending',
                participation: 0,
                createdDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            };
            members.push(newMember);
            localStorage.setItem('adminMembers', JSON.stringify(members));

            alert('Registration successful! You can now login.');
            // Switch to login form
            if (showLogin && registerContainer && loginContainer) {
                registerContainer.style.display = 'none';
                loginContainer.style.display = 'block';
                window.scrollTo({ top: 0 });
            }
        });
    }
});

