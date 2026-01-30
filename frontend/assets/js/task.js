  const modal = document.getElementById('applyModal');
  const formArea = document.getElementById('formArea');
  const successArea = document.getElementById('successArea');

  function openModal() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    formArea.classList.remove('hidden');
    successArea.classList.add('hidden');
  }

  function submitApplication(e) {
    e.preventDefault();
    formArea.classList.add('hidden');
    successArea.classList.remove('hidden');

    setTimeout(() => {
      closeModal();
    }, 2000);
  }

  function toggleProfileMenu(){
    document.getElementById('profileMenu').classList.toggle('hidden')
  }

  document.addEventListener('click', function(e){
    if(!e.target.closest('.relative')){
      document.getElementById('profileMenu').classList.add('hidden')
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
      body.classList.remove("bg-white", "text-black", "light-mode")
      body.classList.add("bg-[#0b0f19]", "text-[#eaf0ff]")
    }else{
      sidebar.classList.add("light-mode","sidebar-light")
      sidebar.classList.remove("sidebar-dark")
      main?.classList.add("light-mode")
      body.classList.remove("bg-[#0b0f19]", "text-[#eaf0ff]")
      body.classList.add("bg-white", "text-black", "light-mode")
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