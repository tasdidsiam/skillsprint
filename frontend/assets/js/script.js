  const darkModeToggle = document.getElementById('darkModeToggle');

  // Dark/Light Mode Toggle - Default is Light Mode
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