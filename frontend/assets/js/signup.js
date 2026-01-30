  let userRole = 'student'; // Track selected role

  const studentBtn = document.getElementById('studentBtn');
  const employerBtn = document.getElementById('employerBtn');
  const emailInput = document.getElementById('emailInput');

  function setRole(role) {
    userRole = role; // Store selected role
    if (role === 'student') {
      studentBtn.className = 'flex-1 py-2 rounded-lg bg-gradient-to-r from-[#6a7cff] to-[#22d3ee] text-black font-semibold transition';
      employerBtn.className = 'flex-1 py-2 rounded-lg text-[#eaf0ff] hover:bg-white/10 transition';
      emailInput.placeholder = 'Student Email';
    } else {
      employerBtn.className = 'flex-1 py-2 rounded-lg bg-gradient-to-r from-[#6a7cff] to-[#22d3ee] text-black font-semibold transition';
      studentBtn.className = 'flex-1 py-2 rounded-lg text-[#eaf0ff] hover:bg-white/10 transition';
      emailInput.placeholder = 'Employer Email';
    }
  }

  // Social Signup Functions
  function signupWithGoogle() {
    localStorage.setItem('signupRole', userRole);
    // TODO: Implement Google OAuth for signup
    console.log('Sign up with Google as ' + userRole);
    alert('Google signup coming soon for ' + userRole.toUpperCase());
  }

  function signupWithApple() {
    localStorage.setItem('signupRole', userRole);
    // TODO: Implement Apple OAuth for signup
    console.log('Sign up with Apple as ' + userRole);
    alert('Apple signup coming soon for ' + userRole.toUpperCase());
  }

  function signupWithMicrosoft() {
    localStorage.setItem('signupRole', userRole);
    // TODO: Implement Microsoft OAuth for signup
    console.log('Sign up with Microsoft as ' + userRole);
    alert('Microsoft signup coming soon for ' + userRole.toUpperCase());
  }

  // Add click listeners to social signup buttons
  document.querySelectorAll('.social-signup-btn').forEach((btn, index) => {
    if (index === 0) { // Google button
      btn.addEventListener('click', signupWithGoogle);
    } else if (index === 1) { // Apple button
      btn.addEventListener('click', signupWithApple);
    } else if (index === 2) { // Microsoft button
      btn.addEventListener('click', signupWithMicrosoft);
    }
  });
  
  // Form submission with validation
  const signupForm = document.getElementById('signupForm');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const firstNameInput = document.getElementById('firstNameInput');
  const lastNameInput = document.getElementById('lastNameInput');
  const passwordInput = document.getElementById('passwordInput');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');
  const togglePassword = document.getElementById('togglePassword');
  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
  const eyeIcon = document.getElementById('eyeIcon');
  const eyeIconConfirm = document.getElementById('eyeIconConfirm');
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');
  const matchStatus = document.getElementById('matchStatus');
  const matchIcon = document.getElementById('matchIcon');
  const matchText = document.getElementById('matchText');

  // Password strength checker
  function checkPasswordStrength(password) {
    if (password.length === 0) {
      strengthBar.style.width = '0%';
      strengthText.textContent = '';
      strengthBar.className = 'password-strength-bar';
      return;
    }

    let strength = 0;
    
    // Check length
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    
    // Check for uppercase
    if (/[A-Z]/.test(password)) strength += 15;
    
    // Check for numbers
    if (/[0-9]/.test(password)) strength += 15;
    
    // Check for special characters
    if (/[!@#$%^&*]/.test(password)) strength += 20;

    // Determine strength level
    let text = '';
    strengthBar.className = 'password-strength-bar';
    
    if (strength < 30) {
      text = '🔴 Too short password';
      strengthBar.classList.add('strength-too-short');
      strengthBar.style.width = '30%';
    } else if (strength < 60) {
      text = '🟡 Medium password';
      strengthBar.classList.add('strength-medium');
      strengthBar.style.width = '60%';
    } else {
      text = '🟢 Strong password';
      strengthBar.classList.add('strength-strong');
      strengthBar.style.width = '100%';
    }

    strengthText.textContent = text;
  }

  // Password match checker
  function checkPasswordMatch() {
    const newPass = passwordInput.value.trim();
    const confirmPass = confirmPasswordInput.value.trim();

    if (confirmPass.length === 0) {
      matchStatus.style.display = 'none';
      return;
    }

    matchStatus.style.display = 'flex';

    if (newPass === confirmPass && confirmPass.length > 0) {
      matchIcon.textContent = '✓';
      matchIcon.className = 'password-match-icon match-success';
      matchText.textContent = 'Password match';
      matchText.className = 'match-success';
    } else {
      matchIcon.textContent = '✗';
      matchIcon.className = 'password-match-icon match-error';
      matchText.textContent = "Password didn't match";
      matchText.className = 'match-error';
    }
  }

  // Event listeners for password strength and matching
  passwordInput.addEventListener('input', function() {
    checkPasswordStrength(this.value);
    checkPasswordMatch();
  });

  confirmPasswordInput.addEventListener('input', function() {
    checkPasswordMatch();
  });
  
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
  
  // Confirm password visibility toggle
  toggleConfirmPassword.addEventListener('click', function(e) {
    e.preventDefault();
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    
    // Update eye icon
    if (type === 'text') {
      eyeIconConfirm.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
      eyeIconConfirm.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
  });
  
  // Simulated database of registered emails (for frontend validation)
  const registeredEmails = ['test@gmail.com', 'user@example.com', 'admin@skillsprint.com'];
  
  signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    
    // Validation: Check if all fields are filled
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      errorText.textContent = 'Please fill in all fields.';
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
    
    // Validation: Check if email already registered
    if (registeredEmails.includes(email.toLowerCase())) {
      errorText.textContent = 'এই ইমেইলটি আগে থেকেই রেজিস্টার করা আছে। অন্য ইমেইল দিয়ে চেষ্টা করুন।';
      errorMessage.classList.remove('hidden');
      return;
    }
    
    // Validation: Check first and last name length
    if (firstName.length < 2 || lastName.length < 2) {
      errorText.textContent = 'First and Last name must be at least 2 characters.';
      errorMessage.classList.remove('hidden');
      return;
    }
    
    // Validation: Check password length
    if (password.length < 6) {
      errorText.textContent = 'Password must be at least 6 characters long.';
      errorMessage.classList.remove('hidden');
      return;
    }
    
    // Validation: Check if passwords match
    if (password !== confirmPassword) {
      errorText.textContent = 'Passwords do not match. Please try again.';
      errorMessage.classList.remove('hidden');
      return;
    }
    
    // Hide error message if all validations pass
    errorMessage.classList.add('hidden');
    
    // Store user role and signup data
    localStorage.setItem('signupRole', userRole);
    localStorage.setItem('signupEmail', email);
    localStorage.setItem('signupName', firstName + ' ' + lastName);
    
    // TODO: Send signup request to backend with role information
    console.log('Signup attempt:', { firstName, lastName, email, password, role: userRole });
    
    // Show success message
    showSuccessMessage();
  });

  // Function to show success message
  function showSuccessMessage() {
    const signupFormContainer = document.getElementById('signupFormContainer');
    const successStep = document.getElementById('successStep');
    const roleDisplay = document.getElementById('roleDisplay');
    
    // Update role display text
    roleDisplay.textContent = userRole.charAt(0).toUpperCase() + userRole.slice(1);
    
    // Smooth fade out animation for form
    signupFormContainer.style.transition = 'all 0.4s ease-out';
    signupFormContainer.style.opacity = '0';
    signupFormContainer.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      signupFormContainer.classList.add('hidden');
      successStep.classList.remove('hidden');
    }, 400);
  }
  
  // Dark/Light Mode Toggle - Checked = Dark Mode, Unchecked = Light Mode
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