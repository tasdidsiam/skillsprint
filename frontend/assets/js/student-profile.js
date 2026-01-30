// Theme Management - Load saved theme from localStorage
(function() {
  const savedTheme = localStorage.getItem('theme') || 'light'
  const sidebar = document.getElementById('sidebar')
  const main = document.querySelector('main')
  const body = document.body
  
  if (savedTheme === 'light') {
    body.classList.add('light')
    body.classList.remove('bg-[#0b0f19]', 'text-[#eaf0ff]')
    body.classList.add('bg-white', 'text-black')
    
    if (sidebar) {
      sidebar.classList.add('sidebar-light')
      sidebar.classList.remove('sidebar-dark')
    }
    
    if (main) {
      main.classList.add('light-mode')
    }
  } else {
    body.classList.remove('light')
    body.classList.add('bg-[#0b0f19]', 'text-[#eaf0ff]')
    body.classList.remove('bg-white', 'text-black')
    
    if (sidebar) {
      sidebar.classList.add('sidebar-dark')
      sidebar.classList.remove('sidebar-light')
    }
    
    if (main) {
      main.classList.remove('light-mode')
    }
  }
})()

function previewAvatar(input){
  const file = input.files[0]
  if(file){
    document.getElementById('avatarPreview').src = URL.createObjectURL(file)
  }
}

function addSkill(){
  const input = document.getElementById("skillInput")
  const value = input.value.trim()
  if(!value) return

  const span = document.createElement("span")
  span.className = "px-3 py-1 rounded-full bg-white/10 text-sm cursor-pointer hover:bg-red-500/20 transition"
  span.innerText = value
  span.onclick = () => span.remove()

  document.getElementById("skillsWrap").appendChild(span)
  input.value = ""
}

document.getElementById("skillInput").addEventListener("keydown", function(e){
  if(e.key === "Enter"){
    e.preventDefault()
    addSkill()
  }
})

function changeEmail(){
  const currentEmail = document.getElementById("emailField").value || "tasdid@example.com"
  document.getElementById("currentEmail").value = currentEmail
  document.getElementById("newEmailInput").value = ""
  document.getElementById("emailError").classList.add("hidden")
  document.getElementById("emailModal").classList.add('modal-visible')
  document.getElementById("emailModal").classList.remove('modal-hidden')
}

function closeEmailModal(){
  const emailModal = document.getElementById("emailModal")
  if (emailModal) {
    emailModal.classList.add('modal-hidden')
    emailModal.classList.remove('modal-visible')
  }
}

function submitEmailChange(){
  const newEmail = document.getElementById("newEmailInput").value.trim()
  const errorDiv = document.getElementById("emailError")
  const errorText = document.getElementById("emailErrorText")
  
  if(!newEmail){
    errorText.textContent = "Please enter your new email address"
    errorDiv.classList.remove("hidden")
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if(!emailRegex.test(newEmail)){
    errorText.textContent = "Please enter a valid email address"
    errorDiv.classList.remove("hidden")
    return
  }
  
  // Email changed successfully
  document.getElementById("emailField").value = newEmail
  document.getElementById("emailModal").classList.add("hidden")
  
  // Show success modal
  showEmailSuccessModal(newEmail)
}

function showEmailSuccessModal(newEmail){
  document.getElementById("successEmailDisplay").textContent = newEmail
  document.getElementById("emailSuccessModal").classList.remove("hidden")
  
  // Focus on close button and allow Enter key
  setTimeout(() => {
    const closeBtn = document.querySelector("#emailSuccessModal button")
    if(closeBtn) closeBtn.focus()
  }, 100)
}

function closeEmailSuccessModal(){
  document.getElementById("emailSuccessModal").classList.add("hidden")
}

function showToast(){
  const toast = document.getElementById("toast")
  toast.classList.remove("hidden")
  setTimeout(()=> toast.classList.add("hidden"), 2500)
}

// Ratings System
let ratings = JSON.parse(localStorage.getItem('profileRatings')) || []

// Dummy ratings data (for demonstration)
function generateDummyRatings() {
  const reviewData = [
    { employer: 'TechCorp Ltd.', rating: 5, comment: 'Excellent work! Very professional and delivered on time.', date: '2 weeks ago' },
    { employer: 'Digital Solutions Inc.', rating: 4, comment: 'Good communication and quality code. Minor improvements in documentation.', date: '1 month ago' },
    { employer: 'StartupX', rating: 5, comment: 'Amazing developer! Highly recommended for any project.', date: '1 month ago' },
    { employer: 'Web Design Studio', rating: 5, comment: 'Perfect UI implementation. Great attention to detail.', date: '2 months ago' },
    { employer: 'Mobile Apps Co.', rating: 4, comment: 'Good work overall. Fast learner and responsive to feedback.', date: '2 months ago' },
  ]
  
  ratings = reviewData
  localStorage.setItem('profileRatings', JSON.stringify(ratings))
  updateRatingsDisplay()
}

function updateRatingsDisplay() {
  if (ratings.length === 0) {
    document.getElementById('reviewsList').innerHTML = '<p class="text-center text-[#bfc8ff] text-sm py-8">No reviews yet</p>'
    document.getElementById('overallRating').textContent = '0.0'
    document.getElementById('totalRatings').textContent = '0 reviews'
    document.getElementById('overallStars').innerHTML = ''
    document.getElementById('profileRating').textContent = '0.0'
    document.getElementById('profileReviewCount').textContent = '0 reviews'
    document.getElementById('profileStars').innerHTML = ''
    return
  }

  // Calculate overall rating
  const avgRating = (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
  document.getElementById('overallRating').textContent = avgRating
  document.getElementById('profileRating').textContent = avgRating

  // Generate overall stars
  const starCount = Math.round(avgRating)
  let starsHTML = ''
  for (let i = 0; i < 5; i++) {
    starsHTML += i < starCount ? '⭐' : '☆'
  }
  document.getElementById('overallStars').innerHTML = starsHTML
  document.getElementById('profileStars').innerHTML = starsHTML

  // Update total reviews count
  const reviewText = `${ratings.length} review${ratings.length > 1 ? 's' : ''}`
  document.getElementById('totalRatings').textContent = reviewText
  document.getElementById('profileReviewCount').textContent = reviewText

  // Calculate rating distribution
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  ratings.forEach(r => counts[r.rating]++)

  // Update bars
  for (let i = 5; i >= 1; i--) {
    const percentage = (counts[i] / ratings.length) * 100
    document.getElementById(`bar${i}`).style.width = percentage + '%'
    document.getElementById(`count${i}`).textContent = counts[i]
  }

  // Display reviews
  const reviewsList = document.getElementById('reviewsList')
  reviewsList.innerHTML = ratings.map(review => `
    <div class="bg-white/5 border border-white/10 rounded-xl p-4">
      <div class="flex items-start justify-between mb-2">
        <div>
          <p class="font-medium text-sm">${review.employer}</p>
          <p class="text-xs text-[#bfc8ff]">${review.date}</p>
        </div>
        <div class="flex gap-1">
          ${Array(review.rating).fill('⭐').join('')}${Array(5 - review.rating).fill('☆').join('')}
        </div>
      </div>
      <p class="text-sm text-[#bfc8ff] leading-relaxed">${review.comment}</p>
    </div>
  `).join('')
}

// Initialize ratings on page load
if (ratings.length === 0) {
  generateDummyRatings()
} else {
  updateRatingsDisplay()
}

function showToast(){
  const toast = document.getElementById("toast")
  toast.classList.remove("hidden")
  setTimeout(()=> toast.classList.add("hidden"), 2500)
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
})()

// Email input - Allow Enter key to submit
document.addEventListener('DOMContentLoaded', function(){
  const newEmailInput = document.getElementById("newEmailInput")
  if(newEmailInput){
    newEmailInput.addEventListener('keypress', function(e){
      if(e.key === 'Enter'){
        e.preventDefault()
        submitEmailChange()
      }
    })
  }
  
  // All profile form fields - Allow Enter key to save
  const profileInputs = [
    "nameField", "emailField", "phoneField", "locationField",
    "bioField", "skillsField", "instituteField", "degreeField",
    "githubField", "portfolioField"
  ]
  
  profileInputs.forEach(id => {
    const input = document.getElementById(id)
    if(input){
      input.addEventListener('keypress', function(e){
        if(e.key === 'Enter'){
          e.preventDefault()
          showToast()
        }
      })
    }
  })
})()

// ========================================
// SIMPLE EMAIL MANAGEMENT
// ========================================
// Store user email
let userEmail = localStorage.getItem('userEmail') || 'john@example.com'

// Display email on page load
function initializeEmail() {
  const emailField = document.getElementById('emailField')
  const currentEmail = document.getElementById('currentEmail')
  
  if (emailField) emailField.value = userEmail
  if (currentEmail) currentEmail.value = userEmail
}

// Close modal
function closeEmailModal() {
  const modal = document.getElementById('emailModal')
  if (modal) {
    modal.classList.add('modal-hidden')
    modal.classList.remove('modal-visible')
  }
}

// Submit email change
function submitEmailChange() {
  const newEmail = document.getElementById('newEmailInput').value.trim()
  const errorDiv = document.getElementById('emailError')
  
  if (!newEmail || !newEmail.includes('@')) {
    if (errorDiv) errorDiv.classList.remove('hidden')
    return
  }
  
  // Save and close
  userEmail = newEmail
  localStorage.setItem('userEmail', userEmail)
  document.getElementById('emailField').value = newEmail
  
  if (document.getElementById('emailModal')) {
    document.getElementById('emailModal').classList.add('modal-hidden')
    document.getElementById('emailModal').classList.remove('modal-visible')
  }
  
  // Show success
  document.getElementById('successEmailDisplay').textContent = newEmail
  document.getElementById('emailSuccessModal').classList.remove('hidden')
}

// Close success modal
function closeEmailSuccessModal() {
  const modal = document.getElementById('emailSuccessModal')
  if (modal) modal.classList.add('hidden')
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeEmail()
})