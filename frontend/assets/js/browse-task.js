const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const deadlineFilter = document.getElementById("deadlineFilter");
const cards = document.querySelectorAll(".task-card");
const noData = document.getElementById("noData");

function filterTasks(){
  const search = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const deadline = deadlineFilter.value;
  let visible = 0;

  cards.forEach(card => {
    const title = card.dataset.title;
    const cat = card.dataset.category;
    const days = parseInt(card.dataset.deadline);

    let show = true;

    if(search && !title.includes(search)) show = false;
    if(category !== "all" && cat !== category) show = false;

    if(deadline !== "all"){
      if(deadline === "soon" && days > 3) show = false;
      if(deadline === "mid" && (days < 4 || days > 7)) show = false;
      if(deadline === "late" && days < 8) show = false;
    }

    card.style.display = show ? "flex" : "none";
    if(show) visible++;
  });

  noData.classList.toggle("hidden", visible !== 0);
}

searchInput.addEventListener("keyup", filterTasks);
categoryFilter.addEventListener("change", filterTasks);
deadlineFilter.addEventListener("change", filterTasks);

function toggleProfileMenu(){
  document.getElementById('profileMenu').classList.toggle('hidden')
}

document.addEventListener('click', function(e){
  const menu = document.getElementById('profileMenu')
  if(!e.target.closest('.relative')){
    menu.classList.add('hidden')
  }
})
const sidebar = document.getElementById("sidebar")
const main = document.querySelector("main")
const body = document.body

function applyTheme(mode){
  if(mode === "dark"){
    sidebar.classList.remove("light-mode","sidebar-light")
    sidebar.classList.add("sidebar-dark")
    main?.classList.remove("light-mode")
    body.classList.remove("bg-white", "text-black")
    body.classList.add("bg-[#0b0f19]", "text-[#eaf0ff]")
  }else{
    sidebar.classList.add("light-mode","sidebar-light")
    sidebar.classList.remove("sidebar-dark")
    main?.classList.add("light-mode")
    body.classList.remove("bg-[#0b0f19]", "text-[#eaf0ff]")
    body.classList.add("bg-white", "text-black")
  }
  localStorage.setItem("theme", mode)
}

// Load saved theme on page load
(function(){
  const saved = localStorage.getItem("theme") || "light"
  applyTheme(saved)
  updateToggleSwitch(saved)
})()

// Toggle theme from menu
function toggleThemeMenu(event) {
  event.stopPropagation()
  const currentTheme = localStorage.getItem("theme") || "dark"
  const newTheme = currentTheme === "dark" ? "light" : "dark"
  applyTheme(newTheme)
  updateToggleSwitch(newTheme)
}

// Update toggle switch appearance
function updateToggleSwitch(mode) {
  const toggle = document.getElementById("darkModeToggle")
  if(toggle) {
    toggle.checked = mode === "dark"
  }
}

function toggleNotificationMenu(){
  const menu = document.getElementById('notificationMenu')
  const badge = document.getElementById('notificationBadge')
  
  menu.classList.toggle('hidden')
  document.getElementById('profileMenu').classList.add('hidden')
  document.getElementById('notificationSettings').classList.add('hidden')
  
  // Hide badge when notification menu is opened
  if (!menu.classList.contains('hidden')) {
    badge.style.display = 'none'
  }
}

function toggleNotificationSettings(event) {
  event.stopPropagation()
  document.getElementById('notificationSettings').classList.toggle('hidden')
}

// Notification System
let notifications = JSON.parse(localStorage.getItem('notifications')) || []
let currentTab = 'all'

// Dummy notification templates
const notificationTemplates = [
  { title: 'New Task Available', message: 'A new React development task matches your skills', icon: '📋', link: 'browse-task.html' },
  { title: 'Application Accepted', message: 'Your application for UI/UX Design was accepted', icon: '✅', link: 'my-applications.html' },
  { title: 'Project Deadline', message: 'Your project "Website Redesign" is due in 2 days', icon: '⏰', link: 'active-projects.html' },
  { title: 'Payment Received', message: 'You received $250 for completed task', icon: '💰', link: 'settings.html' },
  { title: 'New Message', message: 'Client sent you a message about the project', icon: '💬', link: 'messages.html' },
  { title: 'Task Completed', message: 'You successfully completed "Python Automation Script"', icon: '🎉', link: 'active-projects.html' },
  { title: 'Profile Viewed', message: '5 employers viewed your profile today', icon: '👀', link: 'student-profile.html' },
  { title: 'Skill Badge Earned', message: 'You earned a badge for completing 10 tasks', icon: '🏆', link: 'portfolio.html' },
  { title: 'Review Posted', message: 'A client posted a 5-star review for your work', icon: '⭐', link: 'student-profile.html' },
  { title: 'Invitation Received', message: 'You were invited to a private project', icon: '📨', link: 'browse-task.html' }
]

function generateDummyNotifications() {
  // Backend notification format reference (use this when integrating with backend):
  // {
  //   "title": "New Task Available",
  //   "message": "React Developer needed for e-commerce project",
  //   "icon": "📋",
  //   "link": "browse-task.html?task_id=123",
  //   "time": "2 hours ago",
  //   "read": false,
  //   "timestamp": 1706496000000
  // }
  
  const count = Math.floor(Math.random() * 5) + 3 // Random 3-7 notifications
  const newNotifications = []
  
  for (let i = 0; i < count; i++) {
    const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)]
    const hoursAgo = Math.floor(Math.random() * 48) + 1
    const time = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`
    const isRead = Math.random() > 0.5 // 50% chance of being read
    
    newNotifications.push({
      ...template,
      time,
      read: isRead,
      timestamp: Date.now() - (hoursAgo * 3600000)
    })
  }
  
  // Sort by timestamp (newest first)
  notifications = newNotifications.sort((a, b) => b.timestamp - a.timestamp)
  localStorage.setItem('notifications', JSON.stringify(notifications))
  updateNotificationUI()
}

function updateNotificationUI() {
  const badge = document.getElementById('notificationBadge')
  const list = document.getElementById('notificationList')
  const menu = document.getElementById('notificationMenu')
  
  // Update badge with unread count
  const unreadCount = notifications.filter(n => !n.read).length
  
  // Only show badge if menu is closed and there are unread notifications
  if (unreadCount === 0 || !menu.classList.contains('hidden')) {
    badge.style.display = 'none'
  } else {
    badge.textContent = unreadCount
    badge.style.display = 'flex'
  }
  
  // Filter based on current tab
  const filteredNotifications = currentTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read)
  
  if (filteredNotifications.length === 0) {
    list.innerHTML = '<div class="px-5 py-8 text-center text-[#bfc8ff]"><p>No notifications</p></div>'
  } else {
    list.innerHTML = filteredNotifications.map((notif, index) => {
      const originalIndex = notifications.indexOf(notif)
      return `
        <div class="px-5 py-4 border-b border-white/5 hover:bg-white/5 transition cursor-pointer ${notif.read ? 'opacity-60' : ''}" onclick="handleNotificationClick(${originalIndex})">
          <div class="flex items-start gap-3">
            <span class="text-lg">${notif.icon}</span>
            <div class="flex-1">
              <p class="font-medium text-sm flex items-center gap-2">
                ${notif.title}
                ${!notif.read ? '<span class="w-2 h-2 bg-blue-500 rounded-full"></span>' : ''}
              </p>
              <p class="text-xs text-[#bfc8ff] mt-1">${notif.message}</p>
              <p class="text-xs text-[#6a7cff] mt-2">${notif.time}</p>
            </div>
          </div>
        </div>
      `
    }).join('')
  }
  
  localStorage.setItem('notifications', JSON.stringify(notifications))
}

function setNotificationTab(tab) {
  currentTab = tab
  
  const tabAll = document.getElementById('tabAll')
  const tabUnread = document.getElementById('tabUnread')
  
  if (tab === 'all') {
    tabAll.className = 'flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-[#6a7cff] to-[#22d3ee] text-black font-medium text-sm'
    tabUnread.className = 'flex-1 py-2 px-4 rounded-lg hover:bg-white/10 text-sm transition'
  } else {
    tabUnread.className = 'flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-[#6a7cff] to-[#22d3ee] text-black font-medium text-sm'
    tabAll.className = 'flex-1 py-2 px-4 rounded-lg hover:bg-white/10 text-sm transition'
  }
  
  updateNotificationUI()
}

function markAsRead(index) {
  if (notifications[index] && !notifications[index].read) {
    notifications[index].read = true
    updateNotificationUI()
  }
}

function handleNotificationClick(index) {
  // Mark notification as read
  if (notifications[index] && !notifications[index].read) {
    notifications[index].read = true
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }
  
  // Redirect to the notification's link
  if (notifications[index] && notifications[index].link) {
    window.location.href = notifications[index].link
  }
}

function markAllAsRead() {
  notifications.forEach(n => n.read = true)
  updateNotificationUI()
  document.getElementById('notificationSettings').classList.add('hidden')
}

function clearAllNotifications() {
  if (confirm('Are you sure you want to clear all notifications?')) {
    notifications = []
    updateNotificationUI()
    document.getElementById('notificationSettings').classList.add('hidden')
  }
}

function toggleProfileMenu(){
  document.getElementById('profileMenu').classList.toggle('hidden')
  document.getElementById('notificationMenu').classList.add('hidden')
  document.getElementById('notificationSettings').classList.add('hidden')
}

document.addEventListener('click', function(e){
  if(!e.target.closest('.relative')){
    document.getElementById('profileMenu').classList.add('hidden')
    document.getElementById('notificationMenu').classList.add('hidden')
    document.getElementById('notificationSettings').classList.add('hidden')
  }
})

// Initialize notifications on page load
if (notifications.length === 0) {
  generateDummyNotifications()
} else {
  updateNotificationUI()
}