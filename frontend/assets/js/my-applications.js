const searchInput=document.getElementById('searchInput')
const statusFilter=document.getElementById('statusFilter')
const apps=document.querySelectorAll('.app-card')
const noData=document.getElementById('noData')

function filterApps(){
const search=searchInput.value.toLowerCase()
const status=statusFilter.value
let visible=0

apps.forEach(app=>{
const text=app.innerText.toLowerCase()
const appStatus=app.dataset.status
const matchSearch=text.includes(search)
const matchStatus=!status||appStatus===status

if(matchSearch&&matchStatus){
app.style.display='block'
visible++
}else{
app.style.display='none'
}
})

noData.classList.toggle('hidden',visible!==0)
}

searchInput.addEventListener('input',filterApps)
statusFilter.addEventListener('change',filterApps)

function toggleProfileMenu(){
document.getElementById('profileMenu').classList.toggle('hidden')
}

document.addEventListener('click',function(e){
const menu=document.getElementById('profileMenu')
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
  const count = Math.floor(Math.random() * 5) + 3
  const newNotifications = []
  
  for (let i = 0; i < count; i++) {
    const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)]
    const hoursAgo = Math.floor(Math.random() * 48) + 1
    const time = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`
    const isRead = Math.random() > 0.5
    
    newNotifications.push({
      ...template,
      time,
      read: isRead,
      timestamp: Date.now() - (hoursAgo * 3600000)
    })
  }
  
  notifications = newNotifications.sort((a, b) => b.timestamp - a.timestamp)
  localStorage.setItem('notifications', JSON.stringify(notifications))
  updateNotificationUI()
}

function updateNotificationUI() {
  const badge = document.getElementById('notificationBadge')
  const list = document.getElementById('notificationList')
  const menu = document.getElementById('notificationMenu')
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  if (unreadCount === 0 || !menu.classList.contains('hidden')) {
    badge.style.display = 'none'
  } else {
    badge.textContent = unreadCount
    badge.style.display = 'flex'
  }
  
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

function handleNotificationClick(index) {
  if (notifications[index] && !notifications[index].read) {
    notifications[index].read = true
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }
  
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

generateDummyNotifications()

function toggleProfileMenu(){
  document.getElementById('profileMenu').classList.toggle('hidden')
  document.getElementById('notificationMenu').classList.add('hidden')
  document.getElementById('notificationSettings').classList.add('hidden')
}

document.addEventListener('click', function(e){
  if(!e.target.closest('.relative')){
    document.getElementById('profileMenu').classList.add('hidden')
  }
})