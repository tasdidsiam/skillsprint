  const studentBtn = document.getElementById('studentBtn');
  const employerBtn = document.getElementById('employerBtn');
  const adminBtn = document.getElementById('adminBtn');
  const emailInput = document.getElementById('emailInput');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const toggleSwitch = document.getElementById('toggleSwitch');

  function setRole(role) {
    if (role === 'student') {
      studentBtn.className = 'flex-1 py-2 rounded-lg bg-gradient-to-r from-[#6a7cff] to-[#22d3ee] text-black font-semibold transition text-sm';
      employerBtn.className = 'flex-1 py-2 rounded-lg text-[#eaf0ff] hover:bg-white/10 transition text-sm';
      adminBtn.className = 'flex-1 py-2 rounded-lg text-[#eaf0ff] hover:bg-white/10 transition text-sm';
      emailInput.placeholder = 'Student Email';
      document.getElementById('socialLoginSection').style.display = 'block';
    } else if (role === 'employer') {
      employerBtn.className = 'flex-1 py-2 rounded-lg bg-gradient-to-r from-[#6a7cff] to-[#22d3ee] text-black font-semibold transition text-sm';
      studentBtn.className = 'flex-1 py-2 rounded-lg text-[#eaf0ff] hover:bg-white/10 transition text-sm';
      adminBtn.className = 'flex-1 py-2 rounded-lg text-[#eaf0ff] hover:bg-white/10 transition text-sm';
      emailInput.placeholder = 'Employer Email';
      document.getElementById('socialLoginSection').style.display = 'block';
    } else if (role === 'admin') {
      adminBtn.className = 'flex-1 py-2 rounded-lg bg-gradient-to-r from-[#6a7cff] to-[#22d3ee] text-black font-semibold transition text-sm';
      studentBtn.className = 'flex-1 py-2 rounded-lg text-[#eaf0ff] hover:bg-white/10 transition text-sm';
      employerBtn.className = 'flex-1 py-2 rounded-lg text-[#eaf0ff] hover:bg-white/10 transition text-sm';
      emailInput.placeholder = 'Admin Email';
      document.getElementById('socialLoginSection').style.display = 'none';
    }    
    // Update hidden role input
    document.getElementById('roleInput').value = role;
  }
  
  // Form submission with validation
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const passwordInput = document.getElementById('passwordInput');
  const togglePassword = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');
  
  // Password visibility toggle
  togglePassword.addEventListener('click', function(e) {
    e.preventDefault();
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Update eye icon
    if (type === 'text') {
      eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
      eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
  });
  
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validation: Check if fields are empty
    if (!email || !password) {
      errorText.textContent = 'Please enter both email and password.';
      errorMessage.classList.remove('hidden');
      return;
    }
    
    // Validation: Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorText.textContent = 'Please enter a valid email address.';
      errorMessage.classList.remove('hidden');
      return;
    }
    
    // Validation: Check password length (minimum 6 characters)
    if (password.length < 6) {
      errorText.textContent = 'Password must be at least 6 characters long.';
      errorMessage.classList.remove('hidden');
      return;
    }
    
    // Hide error message if all validations pass
    errorMessage.classList.add('hidden');
    
    // Get selected role
    const selectedRole = document.getElementById('roleInput').value;
    
    // Log login attempt with role (for debugging and Laravel integration)
    console.log('Login attempt:', { email, password, role: selectedRole });
    
    // TODO: For PHP Laravel Backend Integration:
    // Replace the code below with actual backend API call
    // POST to: /api/login or /login (your Laravel route)
    // Send: email, password, role
    // The backend will validate and redirect based on role:
    // - Student -> /student/dashboard
    // - Employer -> /employer/dashboard  
    // - Admin -> /admin/dashboard
    
    // Temporary Frontend Redirect (for testing before backend integration)
    // This will be replaced with backend authentication in Laravel
    if (selectedRole === 'student') {
      // Redirect to student dashboard
      setTimeout(() => {
        window.location.href = '../Student/student-dashboard.html';
      }, 500);
    } else if (selectedRole === 'employer') {
      // Redirect to employer dashboard (create this page later)
      // window.location.href = '../Employer/employer-dashboard.html';
      alert('Employer Dashboard - Coming Soon! (Create employer dashboard page)');
    } else if (selectedRole === 'admin') {
      // Redirect to admin dashboard (create this page later)
      // window.location.href = '../Admin/admin-dashboard.html';
      alert('Admin Dashboard - Coming Soon! (Create admin dashboard page)');
    }
    
    // When you implement Laravel backend, use fetch instead:
    /*
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: selectedRole })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('auth_token', data.token);
        // Redirect based on role
        window.location.href = data.redirect_url;
      } else {
        errorText.textContent = data.message || 'Login failed';
        errorMessage.classList.remove('hidden');
      }
    })
    .catch(error => {
      errorText.textContent = 'An error occurred. Please try again.';
      errorMessage.classList.remove('hidden');
      console.error('Error:', error);
    });
    */
  });
  
  // Dark/Light Mode Toggle
  darkModeToggle.addEventListener('change', function() {
    if (this.checked) {
      document.body.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  });
  
  // Load saved theme on page load
  window.addEventListener('load', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      darkModeToggle.checked = true;
      document.body.classList.remove('light');
    } else {
      darkModeToggle.checked = false;
      document.body.classList.add('light');
    }
  });

  // Social Login Functions
  let currentLoginRole = 'student';

  function loginWithGoogle() {
    localStorage.setItem('loginRole', currentLoginRole);
    // TODO: Implement Google OAuth for login
    console.log('Login with Google as ' + currentLoginRole);
    alert('Google login coming soon for ' + currentLoginRole.toUpperCase());
  }

  function loginWithApple() {
    localStorage.setItem('loginRole', currentLoginRole);
    // TODO: Implement Apple OAuth for login
    console.log('Login with Apple as ' + currentLoginRole);
    alert('Apple login coming soon for ' + currentLoginRole.toUpperCase());
  }

  function loginWithMicrosoft() {
    localStorage.setItem('loginRole', currentLoginRole);
    // TODO: Implement Microsoft OAuth for login
    console.log('Login with Microsoft as ' + currentLoginRole);
    alert('Microsoft login coming soon for ' + currentLoginRole.toUpperCase());
  }

  // Update currentLoginRole when role changes
  const originalSetRole = setRole;
  setRole = function(role) {
    currentLoginRole = role;
    originalSetRole(role);
  };

  // Add click listeners to social login buttons
  document.querySelectorAll('.social-login-btn').forEach((btn, index) => {
    if (index === 0) { // Google button
      btn.addEventListener('click', loginWithGoogle);
    } else if (index === 1) { // Apple button
      btn.addEventListener('click', loginWithApple);
    } else if (index === 2) { // Microsoft button
      btn.addEventListener('click', loginWithMicrosoft);
    }
  });