  const darkModeToggle = document.getElementById('darkModeToggle');

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

  // Step navigation
  function showStep(stepNumber) {
    // Handle success step (step 4)
    if (stepNumber === 4) {
      document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
      document.getElementById('successStep').classList.remove('hidden');
      return;
    }

    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('step' + stepNumber).classList.remove('hidden');

    // Update step indicators
    for (let i = 1; i <= 3; i++) {
      const step = document.getElementById('stepNum' + i);
      if (i === stepNumber) {
        step.classList.remove('inactive');
        step.classList.add('active');
      } else if (i < stepNumber) {
        step.classList.remove('inactive');
        step.classList.add('active');
      } else {
        step.classList.remove('active');
        step.classList.add('inactive');
      }
    }

    // Update connectors
    if (stepNumber > 1) {
      document.getElementById('connector1').classList.add('active');
    } else {
      document.getElementById('connector1').classList.remove('active');
    }
    if (stepNumber > 2) {
      document.getElementById('connector2').classList.add('active');
    } else {
      document.getElementById('connector2').classList.remove('active');
    }
  }

  // Step 1: Email Validation
  document.getElementById('emailForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('emailInput').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    if (!email) {
      errorText.textContent = 'Please enter your email address.';
      errorMessage.classList.remove('hidden');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorText.textContent = 'Please enter a valid email address.';
      errorMessage.classList.remove('hidden');
      return;
    }

    errorMessage.classList.add('hidden');
    console.log('Password reset requested for:', email);
    // TODO: Send email verification request to backend
    showStep(2);
  });

  // Step 2: Code Input with auto-focus
  const codeInputs = document.querySelectorAll('#codeForm input[type="text"]');
  codeInputs.forEach((input, index) => {
    input.addEventListener('input', function(e) {
      if (this.value && index < codeInputs.length - 1) {
        codeInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !this.value && index > 0) {
        codeInputs[index - 1].focus();
      }
    });
  });

  document.getElementById('codeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const code = Array.from(codeInputs).map(input => input.value).join('');
    const errorMessage = document.getElementById('errorMessage2');
    const errorText = document.getElementById('errorText2');

    if (code.length !== 6) {
      errorText.textContent = 'Please enter all 6 digits.';
      errorMessage.classList.remove('hidden');
      return;
    }

    errorMessage.classList.add('hidden');
    console.log('Verification code submitted:', code);
    // TODO: Verify code with backend
    showStep(3);
  });

  function resendCode() {
    const successMessage = document.getElementById('successMessage2');
    const successText = document.getElementById('successText2');
    const errorMessage2 = document.getElementById('errorMessage2');
    
    // Hide error message if visible
    errorMessage2.classList.add('hidden');
    
    // Show success message
    successText.textContent = 'Verification code resent to your email!';
    successMessage.classList.remove('hidden');
    
    // Clear and reset code inputs
    codeInputs.forEach(input => input.value = '');
    codeInputs[0].focus();
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      successMessage.classList.add('hidden');
    }, 3000);
  }

  // Step 3: Password Reset with strength indicator
  const newPasswordInput = document.getElementById('newPasswordInput');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');
  const toggleNewPassword = document.getElementById('toggleNewPassword');
  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
  const eyeIcon1 = document.getElementById('eyeIcon1');
  const eyeIcon2 = document.getElementById('eyeIcon2');
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
    const newPass = newPasswordInput.value.trim();
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
  newPasswordInput.addEventListener('input', function() {
    checkPasswordStrength(this.value);
    checkPasswordMatch();
  });

  confirmPasswordInput.addEventListener('input', function() {
    checkPasswordMatch();
  });

  // Password visibility toggles
  toggleNewPassword.addEventListener('click', function(e) {
    e.preventDefault();
    const type = newPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    newPasswordInput.setAttribute('type', type);
    if (type === 'text') {
      eyeIcon1.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
      eyeIcon1.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
  });

  toggleConfirmPassword.addEventListener('click', function(e) {
    e.preventDefault();
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    if (type === 'text') {
      eyeIcon2.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
      eyeIcon2.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
  });

  document.getElementById('passwordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const errorMessage = document.getElementById('errorMessage3');
    const errorText = document.getElementById('errorText3');

    if (!newPassword || !confirmPassword) {
      errorText.textContent = 'Please fill in all fields.';
      errorMessage.classList.remove('hidden');
      return;
    }

    if (newPassword.length < 6) {
      errorText.textContent = 'Password must be at least 6 characters long.';
      errorMessage.classList.remove('hidden');
      return;
    }

    if (newPassword !== confirmPassword) {
      errorText.textContent = 'Passwords do not match.';
      errorMessage.classList.remove('hidden');
      return;
    }

    errorMessage.classList.add('hidden');
    console.log('Password reset with new password');
    // TODO: Send new password to backend
    
    // Show success and redirect
    showStep(4);
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 3000);
  });