const toggle = document.getElementById("themeToggle")
const sidebar = document.getElementById("sidebar")
const main = document.querySelector("main")
const body = document.body

function applyTheme(mode){
  if(mode === "dark"){
    // Dark Mode
    sidebar.classList.remove("sidebar-light")
    sidebar.classList.add("sidebar-dark")
    main.classList.remove("main-light")
    body.classList.remove("bg-white","text-black","light")
    body.classList.add("bg-[#0b0f19]","text-[#eaf0ff]")
    toggle.checked = true
  }else{
    // Light Mode
    sidebar.classList.remove("sidebar-dark")
    sidebar.classList.add("sidebar-light")
    main.classList.add("main-light")
    body.classList.remove("bg-[#0b0f19]","text-[#eaf0ff]")
    body.classList.add("bg-white","text-black","light")
    toggle.checked = false
  }
  localStorage.setItem("theme", mode)
}

(function(){
  const saved = localStorage.getItem("theme") || "light"
  applyTheme(saved)
})()

function toggleTheme() {
  toggle.checked = !toggle.checked
  applyTheme(toggle.checked ? "dark" : "light")
}

toggle.addEventListener("click", e => {
  e.stopPropagation()
  applyTheme(toggle.checked ? "dark" : "light")
})

// Function to apply theme styles to modal content
function applyModalTheme(modalElement) {
  if(!modalElement) return
  
  const isLightMode = document.body.classList.contains('light')
  const content = modalElement.querySelector('.modal-content')
  
  if(!content) return
  
  if(isLightMode) {
    // Apply light theme
    content.style.backgroundColor = '#ffffff'
    content.style.borderColor = '#e5e7eb'
    content.style.color = '#1f2937'
    
    // Style all text elements
    content.querySelectorAll('h2, h3, h4, p, label, span, div').forEach(el => {
      if(!el.classList.contains('sr-only')) {
        el.style.color = '#1f2937'
      }
    })
    
    // Style inputs
    content.querySelectorAll('input[type="text"], input[type="password"], input[type="tel"]').forEach(el => {
      el.style.backgroundColor = '#ffffff'
      el.style.borderColor = '#e5e7eb'
      el.style.color = '#1f2937'
    })
    
    // Style close button
    content.querySelectorAll('button').forEach(btn => {
      if(btn.textContent.includes('×')) {
        btn.style.color = '#6b7280'
      }
    })
  } else {
    // Apply dark theme (reset to default)
    content.style.backgroundColor = '#05070f'
    content.style.borderColor = 'rgba(255, 255, 255, 0.1)'
    content.style.color = '#eaf0ff'
    
    // Reset text elements
    content.querySelectorAll('h2, h3, h4, p, label, span, div').forEach(el => {
      if(!el.classList.contains('sr-only')) {
        el.style.color = ''
      }
    })
    
    // Reset inputs
    content.querySelectorAll('input[type="text"], input[type="password"], input[type="tel"]').forEach(el => {
      el.style.backgroundColor = ''
      el.style.borderColor = ''
      el.style.color = ''
    })
    
    // Reset buttons
    content.querySelectorAll('button').forEach(btn => {
      if(btn.textContent.includes('×')) {
        btn.style.color = ''
      }
    })
  }
}

// Modal Functions
function openModal(type) {
  if(type === 'changePassword') {
    const modal = document.getElementById('changePasswordModal')
    modal.classList.remove('hidden')
    applyModalTheme(modal)
  } else if(type === 'twoFactor') {
    const modal = document.getElementById('twoFactorModal')
    modal.classList.remove('hidden')
    applyModalTheme(modal)
  }
  document.body.style.overflow = 'hidden'
}

function closeModal(type) {
  if(type === 'changePassword') {
    const modal = document.getElementById('changePasswordModal')
    const form = document.getElementById('changePasswordForm')
    const success = document.getElementById('changePasswordSuccess')
    modal.classList.add('hidden')
    form.classList.remove('hidden')
    success.classList.add('hidden')
    // Clear inputs
    document.getElementById('currentPass').value = ''
    document.getElementById('newPass').value = ''
    document.getElementById('confirmPass').value = ''
  } else if(type === 'twoFactor') {
    const modal = document.getElementById('twoFactorModal')
    const form = document.getElementById('twoFactorForm')
    const success = document.getElementById('twoFactorSuccess')
    modal.classList.add('hidden')
    form.classList.remove('hidden')
    success.classList.add('hidden')
    // Clear inputs
    document.getElementById('phoneNumber').value = ''
  }
  document.body.style.overflow = 'auto'
}

function savePassword(event) {
  event.preventDefault()
  const newPass = document.getElementById('newPass').value.trim()
  const confirmPass = document.getElementById('confirmPass').value.trim()

  // Validation
  if(newPass.length < 8) {
    alert('Password must be at least 8 characters')
    return
  }

  if(newPass !== confirmPass) {
    alert('Passwords do not match')
    return
  }

  // Show success
  document.getElementById('changePasswordForm').classList.add('hidden')
  document.getElementById('changePasswordSuccess').classList.remove('hidden')

  setTimeout(() => {
    closeModal('changePassword')
  }, 2000)
}

function setupTwoFactor(event) {
  event.preventDefault()
  const phoneNumber = document.getElementById('phoneNumber').value.trim()

  // Validation
  if(phoneNumber.length < 10) {
    alert('Please enter a valid phone number')
    return
  }

  // Show success
  document.getElementById('twoFactorForm').classList.add('hidden')
  document.getElementById('twoFactorSuccess').classList.remove('hidden')

  setTimeout(() => {
    closeModal('twoFactor')
  }, 2000)
}

// Close modal when clicking outside
document.getElementById('changePasswordModal')?.addEventListener('click', function(e) {
  if(e.target === this) closeModal('changePassword')
})

document.getElementById('twoFactorModal')?.addEventListener('click', function(e) {
  if(e.target === this) closeModal('twoFactor')
})

// Menu active state handler
let isManualScrolling = false

function setActiveMenu(index) {
  const menuItems = document.querySelectorAll('.menu-item')
  menuItems.forEach((item, i) => {
    if(i === index) {
      item.classList.add('bg-gradient-to-r', 'from-[#6a7cff]', 'to-[#22d3ee]', 'text-black', 'font-medium')
      item.classList.remove('hover:bg-white/10')
    } else {
      item.classList.remove('bg-gradient-to-r', 'from-[#6a7cff]', 'to-[#22d3ee]', 'text-black', 'font-medium')
      item.classList.add('hover:bg-white/10')
    }
  })
}

// Connected Accounts Management
let connectedAccounts = {
  google: false,
  apple: false,
  microsoft: false
};

// Load connected accounts from localStorage
function loadConnectedAccounts() {
  const saved = localStorage.getItem('connectedAccounts');
  if (saved) {
    connectedAccounts = JSON.parse(saved);
    updateAccountUI();
  }
}

// Update UI based on connected accounts
function updateAccountUI() {
  Object.keys(connectedAccounts).forEach(account => {
    const statusElement = document.getElementById(`${account}Status`);
    const button = document.getElementById(`${account}Btn`);
    
    if (connectedAccounts[account]) {
      statusElement.textContent = 'Connected';
      statusElement.className = 'text-green-400 text-sm';
      button.textContent = 'Disconnect';
      button.onclick = function() { disconnectAccount(account); };
      button.classList.remove('from-[#6a7cff]', 'to-[#22d3ee]');
      button.classList.add('bg-red-600/50', 'hover:bg-red-600/70');
    } else {
      statusElement.textContent = 'Not connected';
      statusElement.className = 'text-white/40 text-sm';
      button.textContent = 'Connect';
      button.onclick = function() { connectAccount(account); };
      button.classList.add('from-[#6a7cff]', 'to-[#22d3ee]');
      button.classList.remove('bg-red-600/50', 'hover:bg-red-600/70');
    }
  });
}

// Connect a social account
function connectAccount(provider) {
  // Check if already connected
  if (connectedAccounts[provider]) {
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} is already connected!`);
    return;
  }

  console.log(`Connecting ${provider}...`);
  
  // TODO: Implement actual OAuth connection
  // For now, simulate connection
  alert(`Connecting to ${provider.toUpperCase()}...\n\nBackend OAuth integration needed.`);
  
  // Simulate successful connection
  connectedAccounts[provider] = true;
  localStorage.setItem('connectedAccounts', JSON.stringify(connectedAccounts));
  updateAccountUI();
}

// Disconnect a social account
function disconnectAccount(provider) {
  if (!connectedAccounts[provider]) {
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} is not connected!`);
    return;
  }

  const confirmed = confirm(`Are you sure you want to disconnect ${provider.toUpperCase()}? You can add it back anytime.`);
  
  if (confirmed) {
    connectedAccounts[provider] = false;
    localStorage.setItem('connectedAccounts', JSON.stringify(connectedAccounts));
    updateAccountUI();
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} disconnected successfully!`);
  }
}

// Initialize connected accounts on page load
window.addEventListener('load', loadConnectedAccounts);

// Scroll Spy - Simple and reliable scroll detection
const sectionIds = ['appearance', 'security', 'connected-accounts', 'notifications', 'language']

function updateActiveMenuByScroll() {
  if (isManualScrolling) return
  
  let activeIndex = 0
  let minDistance = Infinity
  
  sectionIds.forEach((id, index) => {
    const element = document.getElementById(id)
    if (!element) return
    
    const rect = element.getBoundingClientRect()
    
    // Check if section is visible in viewport
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      // Calculate distance from viewport top (150px offset for better detection)
      const distance = Math.abs(rect.top - 150)
      
      if (distance < minDistance) {
        minDistance = distance
        activeIndex = index
      }
    }
  })
  
  setActiveMenu(activeIndex)
}

// Scroll event listener with immediate response
let scrollTimeout
let rafId
window.addEventListener('scroll', () => {
  // Cancel previous animation frame
  if (rafId) cancelAnimationFrame(rafId)
  
  // Immediate update using requestAnimationFrame for smooth UI
  rafId = requestAnimationFrame(() => {
    updateActiveMenuByScroll()
  })
  
  // Also set a throttled backup
  clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    updateActiveMenuByScroll()
  }, 100)
}, { passive: true })

// Initial call
updateActiveMenuByScroll()

// Override menu buttons to disable scroll spy during manual navigation
document.querySelectorAll('.menu-item').forEach((btn, index) => {
  const originalOnclick = btn.getAttribute('onclick')
  btn.setAttribute('onclick', `
    isManualScrolling = true;
    setActiveMenu(${index});
    document.getElementById('${sectionIds[index]}').scrollIntoView({behavior:'smooth'});
    setTimeout(() => { isManualScrolling = false }, 1000);
  `)
})