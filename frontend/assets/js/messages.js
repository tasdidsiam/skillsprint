let lastSeen = Date.now() - 30*60*1000
let currentChat = null
let activeChatName = null
let activeChatProject = null
let selectedFile = null
let previewHTML = ''
let messageQueue = []
let isProcessing = false
let batchTimer = null

let activeChatKey = null
let lastSeenTimes = {} // Store separate last seen time for each chat
let isGlobalMuted = false // Global mute all messages

// DOM Elements - Initialize after DOM is loaded
let chatHeader, emptyState, chatBox, inputArea, presenceStatus

function initDOMElements() {
  chatHeader = document.getElementById('chatHeader')
  emptyState = document.getElementById('emptyState')
  chatBox = document.getElementById('chatBox')
  inputArea = document.getElementById('inputArea')
  presenceStatus = document.getElementById('presenceStatus')
}

// Chat list management
let chatList = [
  { name: 'NovaTech', project: 'Frontend Landing Page', lastMessageTime: Date.now() - 10*60*1000, unread: 0, isOnline: false, isTyping: false, isMuted: false, isArchived: false, isPinned: false, isBlocked: false },
  { name: 'TechNova', project: 'React Dashboard UI', lastMessageTime: Date.now() - 25*60*1000, unread: 0, isOnline: false, isTyping: false, isMuted: false, isArchived: false, isPinned: false, isBlocked: false },
  { name: 'AutoFlow Systems', project: 'Python Automation Script', lastMessageTime: Date.now() - 45*60*1000, unread: 0, isOnline: false, isTyping: false, isMuted: false, isArchived: false, isPinned: false, isBlocked: false }
]

// Track current view: 'all', 'unread', 'archived'
let currentChatView = 'all'

// Initialize chatStore with default messages for all chats
let chatStore = {
  'NovaTech_Frontend Landing Page': `<div class="max-w-lg bg-white/10 px-4 py-2 rounded-xl">Hello! We reviewed your profile and want to discuss project details.</div>`,
  'TechNova_React Dashboard UI': `<div class="max-w-lg bg-white/10 px-4 py-2 rounded-xl">Hello! We reviewed your profile and want to discuss project details.</div>`,
  'AutoFlow Systems_Python Automation Script': `<div class="max-w-lg bg-white/10 px-4 py-2 rounded-xl">Hello! We reviewed your profile and want to discuss project details.</div>`
}

// Store which chat each message belongs to
let messageChats = {}

function renderChatList() {
  const container = document.getElementById('chatListContainer')
  if (!container) {
    console.error('chatListContainer not found')
    return
  }
  
  let html = ''
  
  // Initialize DOM elements if not already done
  if (!chatHeader) initDOMElements()
  
  // Separate pinned and unpinned chats
  const pinnedChats = chatList.filter(c => c.isPinned)
  const unpinnedChats = chatList.filter(c => !c.isPinned)
  
  // Sort both by lastMessageTime (most recent first)
  pinnedChats.sort((a, b) => b.lastMessageTime - a.lastMessageTime)
  unpinnedChats.sort((a, b) => b.lastMessageTime - a.lastMessageTime)
  
  // Combine: pinned first, then unpinned
  const sortedChats = [...pinnedChats, ...unpinnedChats]
  
  // Filter chats based on current view
  let filteredChats = sortedChats.filter(chat => {
    if (currentChatView === 'all') return !chat.isArchived
    if (currentChatView === 'unread') return chat.unread > 0 && !chat.isArchived
    if (currentChatView === 'archived') return chat.isArchived
    return true
  })
  
  for (let chat of filteredChats) {
    const isActive = activeChatKey === `${chat.name}_${chat.project}`
    const timeAgo = getTimeAgo(chat.lastMessageTime)
    const chatKey = `${chat.name}_${chat.project}`
    let lastMsg = 'No messages yet'
    
    // Extract LAST message only
    if (chatStore[chatKey]) {
      const div = document.createElement('div')
      div.innerHTML = chatStore[chatKey]
      
      // Get message containers (divs with bg-white or bg-gradient)
      const msgContainers = Array.from(div.querySelectorAll('div')).filter(d => {
        const className = d.className || ''
        return (className.includes('bg-white') || className.includes('bg-gradient')) && !d.querySelector('div.flex')
      })
      
      if (msgContainers.length > 0) {
        const lastContainer = msgContainers[msgContainers.length - 1]
        // Get direct text content without nested time div
        let text = ''
        for (let node of lastContainer.childNodes) {
          if (node.nodeType === 3) { // Text node
            text += node.textContent
          } else if (node.nodeType === 1 && node.tagName === 'DIV' && node.className.includes('text-')) {
            // Skip time divs
            continue
          } else if (node.nodeType === 1) {
            text += node.innerText || ''
          }
        }
        text = text.trim()
        lastMsg = text.substring(0, 30)
        if (text.length > 30) lastMsg += '...'
      }
    }
    
    const badge = (chat.isMuted || isGlobalMuted) && chat.unread > 0 ? 
      '<span class="px-2 py-0.5 text-xs rounded-full bg-gray-500 text-white font-semibold">' + chat.unread + ' new message' + (chat.unread > 1 ? 's' : '') + '</span>' : 
      !chat.isMuted && !isGlobalMuted && chat.unread > 0 ? 
      '<span class="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white font-semibold">' + chat.unread + ' new message' + (chat.unread > 1 ? 's' : '') + '</span>' : ''
    const pinIcon = chat.isPinned ? '<span>📌</span>' : ''
    const muteIcon = chat.isMuted ? '<span>🔇</span>' : ''
    const blockedIcon = chat.isBlocked ? '<span>🚫</span>' : ''
    
    const activeClass = isActive ? 'bg-gradient-to-r from-[#6a7cff]/20 to-[#22d3ee]/20 border border-[#6a7cff]/30' : 'bg-white/5'
    const activeTextClass = isActive ? 'text-[#22d3ee]' : ''
    const menuId = 'menu-' + chat.name.replace(/\s/g, '') + '-' + chat.project.replace(/\s/g, '')
    
    // Add light theme styling for better visibility
    const lightThemeStyle = 'style="border: 1px solid #374151; box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);"'
    
    html += '<div class="p-5 rounded-xl ' + activeClass + ' hover:bg-white/10 transition group relative" ' + lightThemeStyle + '>' +
      '<div onclick="openChat(\'' + chat.name + '\',\'' + chat.project + '\')" class="cursor-pointer">' +
      '<div class="flex items-start justify-between mb-3">' +
      '<h3 class="font-semibold text-base ' + activeTextClass + '">' + chat.name + '</h3>' +
      '<span class="text-xs text-[#9aa4ff] mr-2">' + timeAgo + '</span>' +
      '</div>' +
      '<div class="flex items-center justify-between">' +
      '<p class="text-sm text-[#bfc8ff] truncate flex-1">' + lastMsg + '</p>' +
      '<div class="flex gap-1 items-center">' + muteIcon + pinIcon + blockedIcon + '</div>' +
      '</div>' +
      '<div class="flex items-center justify-between mt-2">' + badge + '</div>' +
      '</div>' +
      '<div class="absolute top-2 right-2">' +
      '<button onclick="toggleChatMenu(\'' + chat.name + '\',\'' + chat.project + '\',event)" class="p-1 text-lg">⋮</button>' +
      '<div id="' + menuId + '" class="chat-menu hidden absolute right-0 mt-1 bg-gray-800 rounded-lg shadow-lg border border-white/10 z-50">' +
      '<button onclick="togglePin(\'' + chat.name + '\',\'' + chat.project + '\',event)" class="block w-full text-left px-4 py-2 hover:bg-white/10 text-sm text-[#bfc8ff]">' +
      (chat.isPinned ? 'Unpin' : 'Pin') + '</button>' +
      '<button onclick="toggleMute2(\'' + chat.name + '\',\'' + chat.project + '\',event)" class="block w-full text-left px-4 py-2 hover:bg-white/10 text-sm text-[#bfc8ff]">' +
      (chat.isMuted ? 'Unmute' : 'Mute') + '</button>' +
      '<button onclick="archiveChat(\'' + chat.name + '\',\'' + chat.project + '\',event)" class="block w-full text-left px-4 py-2 hover:bg-white/10 text-sm text-[#bfc8ff]">' +
      (chat.isArchived ? 'Unarchive' : 'Archive') + '</button>' +
      '<button onclick="deleteChat(\'' + chat.name + '\',\'' + chat.project + '\',event)" class="block w-full text-left px-4 py-2 hover:bg-white/10 text-sm text-[#bfc8ff]">Delete chat</button>' +
      '<button onclick="blockChat(\'' + chat.name + '\',\'' + chat.project + '\',event)" class="block w-full text-left px-4 py-2 hover:bg-white/10 text-sm text-red-400">' +
      (chat.isBlocked ? 'Unblock' : 'Block') + '</button>' +
      '</div></div></div>'
  }
  
  container.innerHTML = html
}

function stripHtml(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

function getTimeAgo(timestamp) {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function moveChatolTop(name, project) {
  const chatKey = `${name}_${project}`
  const chatIndex = chatList.findIndex(c => `${c.name}_${c.project}` === chatKey)
  
  if (chatIndex !== -1) {
    const chat = chatList[chatIndex]
    // Check if chat is blocked - don't allow new messages
    if (chat.isBlocked) {
      return
    }
    chat.lastMessageTime = Date.now()
    // Auto-unarchive if archived
    if (chat.isArchived) {
      chat.isArchived = false
    }
    chatList.splice(chatIndex, 1)
    chatList.unshift(chat)
    renderChatList()
  }
}

function updateSidebarUnreadBadge() {
  const totalUnread = isGlobalMuted ? 0 : chatList.reduce((sum, chat) => sum + (chat.isMuted ? 0 : chat.unread), 0)
  const badge = document.getElementById('sidebarUnreadBadge')
  
  if (totalUnread > 0) {
    badge.textContent = totalUnread
    badge.classList.remove('hidden')
  } else {
    badge.classList.add('hidden')
  }
}

// Toggle mute for a chat
function toggleMute(name, project, event) {
  event.stopPropagation()
  const chatIndex = chatList.findIndex(c => c.name === name && c.project === project)
  if (chatIndex !== -1) {
    chatList[chatIndex].isMuted = !chatList[chatIndex].isMuted
    renderChatList()
    updateSidebarUnreadBadge()
  }
}

// Toggle chat menu (3-dot dropdown)
function toggleChatMenu(name, project, event) {
  event.stopPropagation()
  const menuId = `menu-${name.replace(/\s/g, '')}-${project.replace(/\s/g, '')}`
  const menu = document.getElementById(menuId)
  if (menu) {
    menu.classList.toggle('hidden')
  }
  // Close other menus
  document.querySelectorAll('[id^="menu-"]').forEach(m => {
    if (m.id !== menuId) m.classList.add('hidden')
  })
}

// Toggle pin
function togglePin(name, project, event) {
  event.stopPropagation()
  const chatIndex = chatList.findIndex(c => c.name === name && c.project === project)
  if (chatIndex !== -1) {
    chatList[chatIndex].isPinned = !chatList[chatIndex].isPinned
    renderChatList()
  }
}

// Toggle mute from menu
function toggleMute2(name, project, event) {
  event.stopPropagation()
  const chatIndex = chatList.findIndex(c => c.name === name && c.project === project)
  if (chatIndex !== -1) {
    chatList[chatIndex].isMuted = !chatList[chatIndex].isMuted
    renderChatList()
    updateSidebarUnreadBadge()
  }
}

// Archive chat
function archiveChat(name, project, event) {
  event.stopPropagation()
  const chatIndex = chatList.findIndex(c => c.name === name && c.project === project)
  if (chatIndex !== -1) {
    chatList[chatIndex].isArchived = !chatList[chatIndex].isArchived
    if (chatList[chatIndex].isArchived) {
      chatList[chatIndex].unread = 0
    }
    renderChatList()
    updateSidebarUnreadBadge()
  }
}

// Block/Unblock chat
function blockChat(name, project, event) {
  event.stopPropagation()
  const chatIndex = chatList.findIndex(c => c.name === name && c.project === project)
  if (chatIndex !== -1) {
    chatList[chatIndex].isBlocked = !chatList[chatIndex].isBlocked
    const menu = document.getElementById(`menu-${name.replace(/\s+/g, '-')}-${project.replace(/\s+/g, '-')}`)
    if (menu) menu.classList.add('hidden')
    renderChatList()
    // If this is the active chat, update message input state
    if (activeChatName === name && activeChatProject === project) {
      if (chatList[chatIndex].isBlocked) {
        inputArea.innerHTML = '<div class="text-center text-red-400 py-4">You have blocked this chat. Unblock to send messages.</div>'
      } else {
        // Restore normal input
        inputArea.innerHTML = `
          <div class="flex items-center gap-2.5">
            <label for="fileUpload" class="cursor-pointer p-2.5 text-lg rounded-lg bg-white/5 hover:bg-white/10 transition flex-shrink-0">📎</label>
            <input id="fileUpload" type="file" class="hidden" onchange="handleFile(this)">
            <button onclick="toggleEmojiPicker(event)" class="p-2.5 text-lg rounded-lg bg-white/5 hover:bg-white/10 transition flex-shrink-0">😊</button>
            <button onclick="startVoiceRecord(event)" class="p-2.5 text-lg rounded-lg bg-white/5 hover:bg-white/10 transition flex-shrink-0 font-semibold w-11 h-11 flex items-center justify-center" id="voiceBtn">🎤</button>
            <input id="messageInput" type="text" placeholder="Type a message..." class="flex-1 px-4 py-2.5 text-sm rounded-lg bg-white/5 outline-none focus:bg-white/10 transition border border-white/10 focus:border-white/20">
            <button onclick="sendMessage()" class="px-6 py-2.5 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold flex-shrink-0 hover:shadow-lg transition">Send</button>
          </div>
        `
        
        // Attach enter key listener
        setTimeout(() => {
          const input = document.getElementById('messageInput')
          if (input) {
            input.addEventListener('keypress', function(e) {
              if (e.key === 'Enter') {
                e.preventDefault()
                sendMessage()
              }
            })
          }
        }, 0)
      }
    }
  }
}
// Delete all messages from chat
function deleteAllMessages(name, project, event) {
  event.stopPropagation()
  
  if (!confirm('Delete all messages? This cannot be undone.')) {
    return
  }
  
  const chatKey = name + '_' + project
  chatStore[chatKey] = ''
  
  // Close menu
  const menu = document.getElementById('menu-' + name.replace(/\s+/g, '-') + '-' + project.replace(/\s+/g, '-'))
  if (menu) menu.classList.add('hidden')
  
  // If this is the active chat, update display
  if (activeChatKey === chatKey) {
    chatBox.innerHTML = ''
  }
  
  renderChatList()
}

// Delete chat completely
function deleteChat(name, project, event) {
  event.stopPropagation()
  
  if (!confirm('Delete \"' + name + '\" chat completely? This cannot be undone.')) {
    return
  }
  
  const chatKey = name + '_' + project
  const chatIndex = chatList.findIndex(c => c.name === name && c.project === project)
  
  if (chatIndex !== -1) {
    // Remove from chatList
    chatList.splice(chatIndex, 1)
    
    // Delete chat messages
    delete chatStore[chatKey]
    delete lastSeenTimes[chatKey]
    
    // Close menu
    const menu = document.getElementById('menu-' + name.replace(/\s+/g, '-') + '-' + project.replace(/\s+/g, '-'))
    if (menu) menu.classList.add('hidden')
    
    // If this was the active chat, close it
    if (activeChatKey === chatKey) {
      currentChat = null
      activeChatKey = null
      chatHeader.classList.add('hidden')
      chatBox.classList.add('hidden')
      inputArea.classList.add('hidden')
      emptyState.classList.remove('hidden')
    }
    
    renderChatList()
    updateSidebarUnreadBadge()
  }
}

// Delete all chats
function deleteAllChats() {
  if (!confirm('Delete all chats? This cannot be undone.')) {
    return
  }
  
  // Clear all chats
  chatList = []
  chatStore = {}
  lastSeenTimes = {}
  
  // Close active chat
  currentChat = null
  activeChatKey = null
  activeChatName = null
  activeChatProject = null
  chatHeader.classList.add('hidden')
  chatBox.classList.add('hidden')
  inputArea.classList.add('hidden')
  emptyState.classList.remove('hidden')
  
  // Refresh UI
  renderChatList()
  updateSidebarUnreadBadge()
}

// Change chat view
function changeChatView(view) {
  currentChatView = view
  // Update button styles - remove active styles from all buttons
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.classList.remove('bg-blue-500/30', 'border-blue-500/50', 'border', 'text-white', 'font-semibold')
    btn.classList.add('opacity-60')
  })
  // Add active styles to selected button
  const activeBtn = document.querySelector(`[data-view="${view}"]`)
  if (activeBtn) {
    activeBtn.classList.add('bg-blue-500/30', 'border', 'border-blue-500/50', 'text-white', 'font-semibold')
    activeBtn.classList.remove('opacity-60')
  }
  renderChatList()
}

// Toggle global mute all messages
function toggleGlobalMute() {
  isGlobalMuted = !isGlobalMuted
  const btn = document.getElementById('muteAllBtn')
  if (btn) {
    btn.textContent = isGlobalMuted ? 'Unmute all messages' : 'Mute all messages'
  }
  // Close the menu
  const menu = document.getElementById('globalChatMenu')
  if (menu) {
    menu.classList.add('hidden')
  }
  renderChatList()
  updateSidebarUnreadBadge()
}

// Read all messages (mark all as read)
function readAllMessages() {
  chatList.forEach(chat => {
    chat.unread = 0
  })
  // Close the menu
  const menu = document.getElementById('globalChatMenu')
  if (menu) {
    menu.classList.add('hidden')
  }
  renderChatList()
  updateSidebarUnreadBadge()
}

// Toggle chat menu for global actions
function toggleGlobalMenu(event) {
  event.stopPropagation()
  const menu = document.getElementById('globalChatMenu')
  if (menu) {
    menu.classList.toggle('hidden')
  }
}

// Delete all messages from all chats
function deleteAllMessagesGlobal() {
  if (!confirm('Delete all messages from all chats? This cannot be undone.')) {
    return
  }
  
  // Clear all chats and messages
  chatList = []
  chatStore = {}
  lastSeenTimes = {}
  
  // Close active chat if any
  currentChat = null
  activeChatKey = null
  activeChatName = null
  activeChatProject = null
  if (chatHeader) chatHeader.classList.add('hidden')
  if (chatBox) chatBox.classList.add('hidden')
  if (inputArea) inputArea.classList.add('hidden')
  if (emptyState) emptyState.classList.remove('hidden')
  
  // Close the menu
  const menu = document.getElementById('globalChatMenu')
  if (menu) {
    menu.classList.add('hidden')
  }
  
  renderChatList()
  updateSidebarUnreadBadge()
}
// Initialize chat list on page load (after DOM is ready)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      initDOMElements()
      renderChatList()
    }, 10)
  })
} else {
  setTimeout(function() {
    initDOMElements()
    renderChatList()
  }, 10)
}

// Also try immediate render in case DOM is ready
setTimeout(function() {
  if (!chatHeader) {
    initDOMElements()
    if (chatHeader) {
      renderChatList()
    }
  }
}, 100)

function formatTime(t){return new Date(t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}

function setLastSeen(){
  const time = lastSeenTimes[activeChatKey] || (Date.now() - 30*60*1000)
  presenceStatus.innerText = "Last seen at " + formatTime(time)
}

function setOnline(){ presenceStatus.innerText = "Online" }
function setTyping(){ presenceStatus.innerText = "Typing..." }

function openChat(name, project) {
  currentChat = name
  activeChatKey = name + "_" + project
  activeChatName = name
  activeChatProject = project

  // Check if this user has blocked me
  const chatIndex = chatList.findIndex(c => `${c.name}_${c.project}` === activeChatKey)
  const blockedByThem = chatIndex !== -1 && chatList[chatIndex].blockedByThem
  const isBlocked = chatIndex !== -1 && chatList[chatIndex].isBlocked
  
  // If blocked by them, show unavailable message
  if (blockedByThem) {
    chatHeader.innerText = "User unavailable"
    chatHeader.classList.remove('hidden')
    emptyState.classList.add('hidden')
    chatBox.classList.remove('hidden')
    chatBox.innerHTML = '<div class="flex items-center justify-center h-full"><div class="text-center"><div class="text-6xl mb-4">🚫</div><div class="text-xl font-semibold text-red-400">User Unavailable</div><div class="text-sm text-gray-400 mt-2">This user is not available. You cannot send messages or view their information.</div></div></div>'
    inputArea.classList.remove('hidden')
    inputArea.innerHTML = '<div class="text-center text-gray-500 py-4">You cannot message this user</div>'
    inputArea.style.pointerEvents = 'none'
    return
  }

  chatHeader.innerText = name + " • " + project
  chatHeader.classList.remove('hidden')
  emptyState.classList.add('hidden')
  chatBox.classList.remove('hidden')
  inputArea.classList.remove('hidden')
  
  // Show appropriate input area based on block status
  if (isBlocked) {
    inputArea.innerHTML = '<div class="text-center text-red-400 py-4 font-semibold">🚫 আপনি এই চ্যাটকে ব্লক করেছেন। এখন কোনো মেসেজ পাঠানো যাবে না।</div>'
    inputArea.style.pointerEvents = 'none'
  } else {
    inputArea.style.pointerEvents = 'auto'
    inputArea.innerHTML = `
      <div class="flex items-center gap-2.5">
        <label for="fileUpload" class="cursor-pointer p-2.5 text-lg rounded-lg bg-white/5 hover:bg-white/10 transition flex-shrink-0">📎</label>
        <input id="fileUpload" type="file" class="hidden" onchange="handleFile(this)">
        <button onclick="toggleEmojiPicker(event)" class="p-2.5 text-lg rounded-lg bg-white/5 hover:bg-white/10 transition flex-shrink-0">😊</button>
        <button onclick="startVoiceRecord(event)" class="p-2.5 text-lg rounded-lg bg-white/5 hover:bg-white/10 transition flex-shrink-0 font-semibold w-11 h-11 flex items-center justify-center" id="voiceBtn">🎤</button>
        <input id="messageInput" type="text" placeholder="Type a message..." class="flex-1 px-4 py-2.5 text-sm rounded-lg bg-white/5 outline-none focus:bg-white/10 transition border border-white/10 focus:border-white/20">
        <button onclick="sendMessage()" class="px-6 py-2.5 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold flex-shrink-0 hover:shadow-lg transition">Send</button>
      </div>
    `
    
    // Attach enter key listener to newly created input
    setTimeout(() => {
      const input = document.getElementById('messageInput')
      if (input) {
        input.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault()
            sendMessage()
          }
        })
      }
    }, 0)
  }

  // Hide message preview when opening chat
  const previewArea = document.getElementById('messagePreviewArea')
  if (previewArea) previewArea.classList.add('hidden')

  // Clear unread count for this chat (even if blocked by them)
  if (chatIndex !== -1) {
    chatList[chatIndex].unread = 0
    renderChatList()
    updateSidebarUnreadBadge()
  }

  // Initialize last seen time for this chat if not exists (random time)
  if (!lastSeenTimes[activeChatKey]) {
    const randomMinutesAgo = Math.floor(Math.random() * 30) + 1 // 1-30 minutes ago
    lastSeenTimes[activeChatKey] = Date.now() - randomMinutesAgo * 60 * 1000
  }

  // Load old messages even if blocked by them
  if (!blockedByThem) {
    chatBox.innerHTML = chatStore[activeChatKey] || `<div class="max-w-lg bg-white/10 px-4 py-2 rounded-xl">Hello! We reviewed your profile and want to discuss project details.</div>`
    setLastSeen()
  } else {
    // Show old messages but add unavailable message at the end
    chatBox.innerHTML = (chatStore[activeChatKey] || `<div class="max-w-lg bg-white/10 px-4 py-2 rounded-xl">Hello! We reviewed your profile and want to discuss project details.</div>`) + '<div class="flex justify-center my-4"><div class="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs">This user is no longer available</div></div>'
  }
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function sendMessage() {
  if (!currentChat) return

  // Check if this chat is blocked or if they blocked me - just return, don't show alert
  const chatIndex = chatList.findIndex(c => `${c.name}_${c.project}` === activeChatKey)
  if (chatIndex !== -1 && chatList[chatIndex].isBlocked) {
    return
  }
  if (chatIndex !== -1 && chatList[chatIndex].blockedByThem) {
    return
  }

  const input = document.getElementById('messageInput')
  const msg = input.value.trim()

  if (!msg && !selectedFile) return

  const time = getTime()
  const id = "msg_" + Date.now()

  if (msg) {
    chatBox.innerHTML += `
      <div class="flex justify-end">
        <div id="${id}" class="max-w-lg bg-gradient-to-r from-[#6a7cff] to-[#22d3ee]
        text-black px-4 py-2 rounded-xl relative">
          ${msg}
          <div class="text-[10px] text-black/70 text-right mt-1">
            ${time} <span class="tick">✓</span>
          </div>
        </div>
      </div>`
  }

  if (selectedFile) {
    document.getElementById('filePreview')?.remove()

    chatBox.innerHTML += `
      <div class="flex justify-end">
        <div id="${id}" class="relative">
          ${previewHTML}
          <div class="text-[10px] text-white/50 text-right mt-1">
            ${time} <span class="tick">✓</span>
          </div>
        </div>
      </div>`

    selectedFile = null
    previewHTML = ''
    fileUpload.value = ''
  }

  input.value = ''
  chatBox.scrollTop = chatBox.scrollHeight

  chatStore[activeChatKey] = chatBox.innerHTML

  // Move this chat to top of the list
  const [name, ...projectParts] = activeChatKey.split('_')
  const project = projectParts.join('_')
  moveChatolTop(name, project)

  // Store which chat this message belongs to
  messageChats[id] = activeChatKey
  messageQueue.push({id: id, chatKey: activeChatKey})
  
  // Clear existing timer and start new one
  // This waits 2 seconds for more messages before processing
  clearTimeout(batchTimer)
  batchTimer = setTimeout(() => {
    processQueue()
  }, 2000)
}

document.getElementById("messageInput").addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
})

function handleFile(input) {
  // Check if blocked
  const chatIndex = chatList.findIndex(c => `${c.name}_${c.project}` === activeChatKey)
  if (chatIndex !== -1 && chatList[chatIndex].isBlocked) {
    return
  }
  
  if (!input.files.length) return

  const file = input.files[0]
  const url = URL.createObjectURL(file)
  selectedFile = file

  if (file.type.startsWith("image/")) {
    previewHTML = `<img src="${url}" onclick="openImage('${url}')"
      class="max-w-xs rounded-xl border border-white/10 cursor-pointer hover:opacity-80 transition">`
  } else {
    previewHTML = `<a href="${url}" download="${file.name}"
      class="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/20 transition">
      📎 <span>${file.name}</span></a>`
  }

  document.getElementById('filePreview')?.remove()

  chatBox.innerHTML += `
    <div id="filePreview" class="flex justify-end">
      <div class="bg-white/5 border border-white/10 rounded-2xl px-3 py-2 max-w-xs">
        ${previewHTML}
        <div class="flex items-center justify-between mt-1 text-[11px] text-[#9aa4ff]">
          <span>Ready to send</span>
          <span class="animate-pulse">↵ Enter</span>
        </div>
      </div>
    </div>`

  chatBox.scrollTop = chatBox.scrollHeight
  chatStore[activeChatKey] = chatBox.innerHTML
}

/* ---------- TYPING DOT ANIMATION ---------- */

function showTypingBubble(){
  removeTypingBubble()

  const bubble = document.createElement("div")
  bubble.id = "typingBubble"
  bubble.className = "flex justify-start mt-2"

  bubble.innerHTML = `
    <div class="typing-dots">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  `

  chatBox.appendChild(bubble)

  chatBox.scrollTop = chatBox.scrollHeight
}

function removeTypingBubble(){
  document.getElementById('typingBubble')?.remove()
}

/* ---------- IMAGE MODAL ---------- */

function openImage(url) {
  const modal = document.getElementById('imgModal')
  const modalImg = document.getElementById('modalImg')
  modalImg.src = url
  modal.classList.remove('hidden')
  modal.classList.add('flex')
}

function closeImageModal() {
  const modal = document.getElementById('imgModal')
  modal.classList.add('hidden')
  modal.classList.remove('flex')
}

// Close modal when clicking outside image
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('imgModal')
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeImageModal()
      }
    })
  }
})

// Close modal with ESC key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeImageModal()
  }
})

/* ---------- CHAT QUEUE SYSTEM ---------- */

function processQueue() {
  if (isProcessing || messageQueue.length === 0) return
  isProcessing = true

  // Collect ALL messages in queue as batch
  const batch = [...messageQueue]
  const batchChatKey = batch[0].chatKey // All messages in batch are from same chat
  messageQueue = []

  // Get the chat object to update its status
  const [name, ...projectParts] = batchChatKey.split('_')
  const project = projectParts.join('_')
  const chatIndex = chatList.findIndex(c => `${c.name}_${c.project}` === batchChatKey)

  // First tick after 2s for all messages
  setTimeout(() => {
    // Set online status for this chat
    if (chatIndex !== -1) {
      chatList[chatIndex].isOnline = true
    }
    // Only update UI if this is the active chat
    if (activeChatKey === batchChatKey) {
      presenceStatus.innerText = "Online"
    }

    setTimeout(() => {
      // Mark all batch messages with double tick
      batch.forEach(item => {
        const msgEl = document.getElementById(item.id)
        if (msgEl) msgEl.querySelector(".tick").innerHTML = "✓✓"
      })

      // Show typing bubble for this chat only
      setTimeout(() => {
        if (chatIndex !== -1) {
          chatList[chatIndex].isTyping = true
        }
        if (activeChatKey === batchChatKey) {
          presenceStatus.innerText = "Typing..."
          showTypingBubble()
        }

        // Response after 2s
        setTimeout(() => {
          removeTypingBubble()

          // Check if this chat is blocked - if blocked, don't show response
          if (chatIndex !== -1 && chatList[chatIndex].isBlocked) {
            isProcessing = false
            chatList[chatIndex].isTyping = false
            if (activeChatKey === batchChatKey) {
              presenceStatus.innerText = "Last seen at " + presenceStatus.innerText
            }
            return
          }

          const time = getTime()
          const responseText = "Thanks for the update! We'll review it shortly."

          // Add response to the correct chat store, not necessarily the active chat
          const responseMessage = `
            <div class="max-w-lg bg-white/10 px-4 py-2 rounded-xl mt-2">
              ${responseText}
              <div class="text-[10px] text-white/50 text-right mt-1">${time}</div>
            </div>`

          // Add to correct chat store
          if (!chatStore[batchChatKey]) chatStore[batchChatKey] = ''
          chatStore[batchChatKey] += responseMessage

          // Only update visible chatBox if this is the active chat
          if (activeChatKey === batchChatKey) {
            chatBox.innerHTML += responseMessage
            chatBox.scrollTop = chatBox.scrollHeight
            // Update chat list to show the response message
            renderChatList()
          } else {
            // Just increment unread count, no preview area
            if (chatIndex !== -1) {
              chatList[chatIndex].unread++
              renderChatList()
            }
            
            // Update sidebar badge
            updateSidebarUnreadBadge()
          }

          // Move this chat to top after receiving response
          moveChatolTop(name, project)

          setOnline()

          // Last seen update
          setTimeout(() => {
            lastSeenTimes[batchChatKey] = Date.now()
            // Only update UI if this is the active chat
            if (activeChatKey === batchChatKey) {
              setLastSeen()
            }
            
            // Reset online/typing status for this chat
            if (chatIndex !== -1) {
              chatList[chatIndex].isOnline = false
              chatList[chatIndex].isTyping = false
            }
            
            // Process next batch if any
            isProcessing = false
            
            if (messageQueue.length > 0) {
              setTimeout(() => {
                processQueue()
              }, 1000)
            }
          }, 10000)

        }, 2000)

      }, 2000)

    }, 2000)

  }, 2000)
}
function toggleProfileMenu(){document.getElementById('profileMenu').classList.toggle('hidden')}
document.addEventListener('click',function(e){if(!e.target.closest('.relative'))document.getElementById('profileMenu').classList.add('hidden')})
function toggleTheme(){
  document.body.classList.toggle("light")
}
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

// Random message system - chats will send random messages
const randomMessages = [
  "That sounds great!",
  "I agree completely",
  "Thanks for the update",
  "Let's discuss this",
  "Perfect timing!",
  "I'm interested",
  "Can you share more details?",
  "When can we connect?",
  "This looks promising",
  "Let's schedule a call",
  "Excited to work with you",
  "Your profile impressed us",
  "Great work!",
  "Looking forward to collaborating",
  "Let's move forward"
]

const companyNames = [
  'TechVision', 'DataFlow', 'CloudSync', 'NeuralNet', 'ByteForce', 
  'QuantumLabs', 'ZenTech', 'OmniCore', 'VelocityAI', 'StellarSoft',
  'PrimeCode', 'NovaTeam', 'EchoVault', 'FusionLabs', 'ApexGroup',
  'LogicPulse', 'SilverWeb', 'IronStack', 'GoldenPath', 'CrimsonShift'
]

const projectTypes = [
  'Web Development Project',
  'Mobile App Development',
  'AI/ML Implementation',
  'Data Analysis Project',
  'Cloud Migration',
  'UI/UX Design Project',
  'Backend Architecture',
  'DevOps Setup',
  'System Integration',
  'Software Modernization',
  'E-commerce Platform',
  'Social Media Platform',
  'Content Management System',
  'Real-time Analytics Dashboard',
  'API Development'
]

function generateRandomChat() {
  const randomCompany = companyNames[Math.floor(Math.random() * companyNames.length)]
  const randomProject = projectTypes[Math.floor(Math.random() * projectTypes.length)]
  const chatKey = `${randomCompany}_${randomProject}`
  
  // Check if this chat already exists
  if (chatList.some(c => `${c.name}_${c.project}` === chatKey)) {
    return null
  }
  
  // Create new chat object
  const newChat = {
    name: randomCompany,
    project: randomProject,
    lastMessageTime: Date.now(),
    unread: 1,
    isOnline: true,
    isTyping: false,
    isMuted: false,
    isArchived: false,
    isPinned: false,
    isBlocked: false
  }
  
  // Add initial message to chat store
  const initialMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)]
  chatStore[chatKey] = `<div class="max-w-lg bg-white/10 px-4 py-2 rounded-xl">${initialMsg}</div>`
  
  return newChat
}

function addNewRandomChat() {
  const newChat = generateRandomChat()
  if (newChat) {
    // Check if this company is blocked
    const existingChat = chatList.find(c => c.name === newChat.name)
    if (existingChat && existingChat.isBlocked) {
      // Blocked chat cannot send new messages
      return
    }
    chatList.unshift(newChat) // Add to top
    renderChatList()
    updateSidebarUnreadBadge()
  }
}

// Start adding new random chats every 10 seconds
setInterval(() => {
  addNewRandomChat()
}, 10000)

// Emoji Picker
const emojis = ['😀', '😂', '😍', '🤔', '😎', '🎉', '🔥', '👍', '❤️', '✨', '🎵', '😴', '🚀', '💯', '🤝', '😢', '😡', '🙏', '💪', '🌟']

function toggleEmojiPicker(event) {
  event.stopPropagation()
  let picker = document.getElementById('emojiPicker')
  if (picker) {
    picker.classList.toggle('hidden')
  } else {
    createEmojiPicker()
  }
}

function createEmojiPicker() {
  const input = document.getElementById('messageInput')
  if (!input) return
  
  const picker = document.createElement('div')
  picker.id = 'emojiPicker'
  picker.className = 'absolute bottom-16 left-0 bg-gray-800 rounded-lg border border-white/10 p-3 grid grid-cols-5 gap-2 z-50 w-48'
  picker.innerHTML = emojis.map(emoji => `<button onclick="insertEmoji('${emoji}')" class="p-2 text-xl hover:bg-white/10 rounded transition">${emoji}</button>`).join('')
  
  const inputArea = document.getElementById('inputArea')
  if (inputArea) {
    inputArea.style.position = 'relative'
    inputArea.appendChild(picker)
  }
}

function insertEmoji(emoji) {
  // Check if blocked
  const chatIndex = chatList.findIndex(c => `${c.name}_${c.project}` === activeChatKey)
  if (chatIndex !== -1 && chatList[chatIndex].isBlocked) {
    return
  }
  
  const input = document.getElementById('messageInput')
  if (input) {
    input.value += emoji
    input.focus()
  }
}

// Voice Recording
let mediaRecorder = null
let audioChunks = []
let isRecording = false
let recordingStartTime = null
let recordingTimer = null

async function startVoiceRecord(event) {
  event.stopPropagation()
  
  // Check if blocked
  const chatIndex = chatList.findIndex(c => `${c.name}_${c.project}` === activeChatKey)
  if (chatIndex !== -1 && chatList[chatIndex].isBlocked) {
    return
  }
  
  const btn = document.getElementById('voiceBtn')
  const inputArea = document.getElementById('inputArea')
  
  if (isRecording) {
    // Stop recording
    mediaRecorder.stop()
    isRecording = false
    clearInterval(recordingTimer)
    btn.classList.remove('bg-red-500')
    btn.classList.add('bg-white/5')
    btn.innerText = '🎤'
    
    // Restore message input area
    inputArea.classList.remove('hidden')
    const previewArea = document.getElementById('voicePreviewArea')
    if (previewArea) previewArea.remove()
  } else {
    try {
      // Start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream)
      audioChunks = []
      recordingStartTime = Date.now()
      
      // Create audio context for waveform analysis
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 256
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        const duration = Math.floor((Date.now() - recordingStartTime) / 1000)
        insertVoiceMessage(audioUrl, duration)
        
        // Restore message input area
        inputArea.classList.remove('hidden')
        const previewArea = document.getElementById('voicePreviewArea')
        if (previewArea) previewArea.remove()
      }
      
      mediaRecorder.start()
      isRecording = true
      btn.classList.remove('bg-white/5')
      btn.classList.add('bg-red-500')
      
      // Hide message input and show voice preview
      inputArea.classList.add('hidden')
      
      // Create voice preview area
      const previewHTML = `
        <div id="voicePreviewArea" style="display: flex; gap: 12px; padding: 12px 16px; background: rgba(37, 99, 235, 0.2); border: 1px solid rgba(37, 99, 235, 0.5); border-radius: 12px; margin: 8px 0; align-items: center; align-self: flex-start; max-width: 350px;">
          <button onclick="cancelVoiceRecord()" style="background: none; border: none; font-size: 18px; cursor: pointer; color: white; flex-shrink: 0; padding: 4px;">✕</button>
          <div id="liveWaveform" style="height: 32px; flex: 1; background: rgba(255,255,255,0.05); border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 1px; padding: 4px; min-width: 120px;"></div>
          <div style="text-align: right; color: white; font-weight: 600; min-width: 35px;">
            <div id="recordingDuration" style="font-size: 12px;">0s</div>
          </div>
          <button onclick="sendVoiceMessage()" class="px-3 py-1 text-xs rounded-lg bg-gradient-to-r from-[#6a7cff] to-[#22d3ee] text-black font-semibold flex-shrink-0">Send</button>
        </div>
      `
      inputArea.insertAdjacentHTML('beforebegin', previewHTML)
      
      // Animate waveform during recording
      let waveContainer = document.getElementById('liveWaveform')
      let waveformBars = [] // Store the last 40 bars for scrolling effect
      
      recordingTimer = setInterval(() => {
        const seconds = Math.floor((Date.now() - recordingStartTime) / 1000)
        const durationEl = document.getElementById('recordingDuration')
        if (durationEl) durationEl.innerText = seconds + 's'
        
        // Draw waveform bars with scrolling effect
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)
        
        if (waveContainer) {
          // Get average frequency value from multiple points
          let avgValue = 0
          for (let i = 0; i < dataArray.length; i++) {
            avgValue += dataArray[i]
          }
          avgValue = (avgValue / dataArray.length) / 255
          
          // Add new bar to array and remove oldest if we have more than 40
          waveformBars.push(avgValue)
          if (waveformBars.length > 40) {
            waveformBars.shift()
          }
          
          // Render all bars
          waveContainer.innerHTML = ''
          for (let i = 0; i < waveformBars.length; i++) {
            const value = waveformBars[i]
            const bar = document.createElement('div')
            // Check if light mode is active
            const isLightMode = document.querySelector('main').classList.contains('light-mode')
            const barColor = isLightMode ? '#1f2937' : '#FFFFFF'
            bar.style.cssText = `width: 2px; height: ${Math.max(2, value * 28)}px; background: ${barColor}; border-radius: 1px; transition: height 0.1s ease;`
            waveContainer.appendChild(bar)
          }
        }
      }, 100)
    } catch (error) {
      console.error('Microphone access denied:', error)
      alert('Allow microphone access to record voice messages')
    }
  }
}

function cancelVoiceRecord() {
  if (isRecording) {
    mediaRecorder.stop()
    isRecording = false
    clearInterval(recordingTimer)
    const btn = document.getElementById('voiceBtn')
    btn.classList.remove('bg-red-500')
    btn.classList.add('bg-white/5')
    btn.innerText = '🎤'
    
    // Restore message input area
    const inputArea = document.getElementById('inputArea')
    inputArea.classList.remove('hidden')
    
    const previewArea = document.getElementById('voicePreviewArea')
    if (previewArea) previewArea.remove()
  }
}

function sendVoiceMessage() {
  if (isRecording) {
    mediaRecorder.stop()
    isRecording = false
    clearInterval(recordingTimer)
    const btn = document.getElementById('voiceBtn')
    btn.classList.remove('bg-red-500')
    btn.classList.add('bg-white/5')
    btn.innerText = '🎤'
  }
}

function insertVoiceMessage(audioUrl, duration) {
  const time = getTime()
  const voiceId = 'waveform_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  const playBtnId = 'playbtn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  const durationId = 'duration_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  const durationStr = duration < 60 ? duration + 's' : Math.floor(duration / 60) + ':' + String(duration % 60).padStart(2, '0')
  
  const voiceMessage = '<div style="display: flex; justify-content: flex-end; margin: 4px 0;"><div style="background: linear-gradient(to right, #2563eb, #0284c7); padding: 6px 12px; border-radius: 18px; max-width: 280px; width: 280px; display: flex; align-items: center; gap: 8px;"><button id="' + playBtnId + '" onclick="toggleVoicePlay(this)" style="background: none; border: none; font-size: 18px; cursor: pointer; color: white; flex-shrink: 0;">▶</button><div id="' + voiceId + '" style="height: 28px; flex: 1; margin: 0;"></div><div style="text-align: right;"><div id="' + durationId + '" style="color: #ffffff; font-size: 10px; font-weight: 600; min-width: 24px;">' + durationStr + '</div><div style="color: #ffffff; font-size: 9px;">' + time + '</div></div></div></div>'
  
  chatBox.insertAdjacentHTML('beforeend', voiceMessage)
  chatBox.scrollTop = chatBox.scrollHeight
  chatStore[activeChatKey] = chatBox.innerHTML
  
  // Initialize WaveSurfer for this voice message
  setTimeout(() => {
    import('https://cdn.jsdelivr.net/npm/wavesurfer.js@7/dist/wavesurfer.esm.js').then(module => {
      const WaveSurfer = module.default
      const container = document.getElementById(voiceId)
      
      // Only initialize if container exists
      if (!container) return
      
      // Check if light mode is active
      const isLightMode = document.querySelector('main').classList.contains('light-mode')
      const waveColor = isLightMode ? '#ffffff' : '#0284c7'
      const progressColor = isLightMode ? '#0f172a' : '#000000'
      
      const wavesurfer = WaveSurfer.create({
        container: '#' + voiceId,
        waveColor: waveColor,
        progressColor: progressColor,
        height: 28,
        url: audioUrl
      })
      
      // Store wavesurfer instance on button for access
      const playBtn = document.getElementById(playBtnId)
      const durationEl = document.getElementById(durationId)
      if (playBtn) {
        playBtn.wavesurfer = wavesurfer
        playBtn.durationEl = durationEl
        playBtn.totalDuration = duration
      }
      
      // Update duration display while playing
      wavesurfer.on('audioprocess', () => {
        if (wavesurfer.isPlaying() && durationEl) {
          const currentTime = Math.floor(wavesurfer.getCurrentTime())
          const remaining = duration - currentTime
          if (remaining > 0) {
            const remainingStr = remaining < 60 ? remaining + 's' : Math.floor(remaining / 60) + ':' + String(remaining % 60).padStart(2, '0')
            durationEl.innerHTML = remainingStr
          }
        }
      })
      
      wavesurfer.on('play', () => {
        if (playBtn) playBtn.innerHTML = '⏸'
      })
      
      wavesurfer.on('pause', () => {
        if (playBtn) playBtn.innerHTML = '▶'
      })
      
      wavesurfer.on('finish', () => {
        if (playBtn) playBtn.innerHTML = '▶'
        if (durationEl) durationEl.innerHTML = durationStr
      })
      
      wavesurfer.on('interaction', () => {
        wavesurfer.play()
      })
    })
  }, 0)
  
  // Move chat to top
  const [name, ...projectParts] = activeChatKey.split('_')
  const project = projectParts.join('_')
  moveChatolTop(name, project)
}

function toggleVoicePlay(btn) {
  if (btn.wavesurfer) {
    if (btn.wavesurfer.isPlaying()) {
      btn.wavesurfer.pause()
    } else {
      btn.wavesurfer.play()
    }
  }
}