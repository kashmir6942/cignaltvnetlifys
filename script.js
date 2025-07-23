class CignalPlayTV {
  constructor() {
    this.channels = window.CHANNELS_CONFIG || []
    this.currentChannel = null
    this.player = null
    this.theme = localStorage.getItem("cignal-theme") || "dark"
    this.testingInProgress = false

    // Authentication state
    this.currentUser = null
    this.isAuthenticated = false
    this.userPermissions = {
      CignalTV: ["One PH", "TV5 HD", "Nickelodeon", "Nick Jr", "Knowledge Channel", "Arirang"],
      CignalPlay: [], // All except restricted ones
      CignalAll: [], // All channels
    }
    this.restrictedForCignalPlay = ["TV Maria", "Bilyonaryo Channel", "HBO Hits", "HBO Signature", "tvN Premium"]

    // Valid credentials
    this.validCredentials = {
      CignalTV: "Freebie",
      CignalPlay: "Premium",
      CignalAll: "Allinone6",
    }

    // DOM elements
    this.video = document.getElementById("videoPlayer")
    this.videoOverlay = document.getElementById("videoOverlay")
    this.loadingSpinner = document.getElementById("loadingSpinner")
    this.currentChannelInfo = document.getElementById("currentChannelInfo")
    this.totalChannelsEl = document.getElementById("totalChannels")
    this.workingChannelsEl = document.getElementById("workingChannels")
    this.currentTimeEl = document.getElementById("currentTime")
    this.settingsModal = document.getElementById("settingsModal")
    this.searchModal = document.getElementById("searchModal")
    this.loginModal = document.getElementById("loginModal")
    this.settingsBtn = document.getElementById("settingsBtn")
    this.searchBtn = document.getElementById("searchBtn")
    this.profileBtn = document.getElementById("profileBtn")
    this.signOutBtn = document.getElementById("signOutBtn")
    this.closeSettings = document.getElementById("closeSettings")
    this.closeSearch = document.getElementById("closeSearch")
    this.closeLogin = document.getElementById("closeLogin")
    this.darkThemeBtn = document.getElementById("darkTheme")
    this.lightThemeBtn = document.getElementById("lightTheme")
    this.testAllBtn = document.getElementById("testAllBtn")
    this.searchInput = document.getElementById("searchInput")
    this.searchResults = document.getElementById("searchResults")
    this.loginForm = document.getElementById("loginForm")
    this.userInfo = document.getElementById("userInfo")
    this.userName = document.getElementById("userName")
    this.userPlan = document.getElementById("userPlan")

    this.init()
  }

  init() {
    this.initShaka()
    this.bindEvents()
    this.applyTheme()
    this.startTimer()
    this.checkSavedLogin()
    this.renderChannels()
    this.updateStats()
  }

  initShaka() {
    if (!window.shaka || !window.shaka.Player.isBrowserSupported()) {
      alert("Shaka Player not supported in this browser")
      return
    }
    this.player = new window.shaka.Player(this.video)
  }

  checkSavedLogin() {
    const savedUser = localStorage.getItem("cignal-user")
    const rememberMe = localStorage.getItem("cignal-remember") === "true"

    if (savedUser && rememberMe) {
      const userData = JSON.parse(savedUser)
      this.currentUser = userData.username
      this.isAuthenticated = true
      this.updateUserInterface()
    }
  }

  bindEvents() {
    // Settings modal
    this.settingsBtn.addEventListener("click", () => {
      this.settingsModal.style.display = "block"
    })

    this.closeSettings.addEventListener("click", () => {
      this.settingsModal.style.display = "none"
    })

    // Search modal
    this.searchBtn.addEventListener("click", () => {
      this.searchModal.style.display = "block"
      this.searchInput.focus()
    })

    this.closeSearch.addEventListener("click", () => {
      this.searchModal.style.display = "none"
    })

    // Login modal
    this.profileBtn.addEventListener("click", () => {
      if (!this.isAuthenticated) {
        this.loginModal.style.display = "block"
      }
    })

    this.closeLogin.addEventListener("click", () => {
      this.loginModal.style.display = "none"
    })

    // Login form
    this.loginForm.addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleLogin()
    })

    // Sign out
    this.signOutBtn.addEventListener("click", () => {
      this.handleSignOut()
    })

    // Theme buttons
    this.darkThemeBtn.addEventListener("click", () => {
      this.setTheme("dark")
    })

    this.lightThemeBtn.addEventListener("click", () => {
      this.setTheme("light")
    })

    // Test all button
    this.testAllBtn.addEventListener("click", () => {
      this.testAllChannels()
    })

    // Search input
    this.searchInput.addEventListener("input", (e) => {
      this.performSearch(e.target.value)
    })

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === this.settingsModal) {
        this.settingsModal.style.display = "none"
      }
      if (e.target === this.searchModal) {
        this.searchModal.style.display = "none"
      }
      if (e.target === this.loginModal) {
        this.loginModal.style.display = "none"
      }
    })

    // Volume slider
    const volumeSlider = document.getElementById("volumeSlider")
    if (volumeSlider) {
      volumeSlider.addEventListener("input", (e) => {
        if (this.video) {
          this.video.volume = e.target.value / 100
        }
      })
    }
  }

  handleLogin() {
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const rememberMe = document.getElementById("rememberMe").checked
    const errorEl = document.getElementById("loginError")

    // Validate credentials
    if (this.validCredentials[username] === password) {
      this.currentUser = username
      this.isAuthenticated = true

      // Save login if remember me is checked
      if (rememberMe) {
        localStorage.setItem("cignal-user", JSON.stringify({ username }))
        localStorage.setItem("cignal-remember", "true")
      } else {
        localStorage.removeItem("cignal-user")
        localStorage.removeItem("cignal-remember")
      }

      this.updateUserInterface()
      this.loginModal.style.display = "none"
      this.loginForm.reset()
      errorEl.style.display = "none"

      // Re-render channels with access control
      this.renderChannels()
    } else {
      errorEl.textContent = "Invalid username or password"
      errorEl.style.display = "block"
    }
  }

  handleSignOut() {
    this.currentUser = null
    this.isAuthenticated = false
    localStorage.removeItem("cignal-user")
    localStorage.removeItem("cignal-remember")

    this.updateUserInterface()
    this.renderChannels()

    // Stop current video
    if (this.player) {
      this.player.unload()
    }
    this.videoOverlay.classList.remove("hidden")
    this.updateCurrentChannelInfo({ name: "Select a channel", category: "local" })
  }

  updateUserInterface() {
    if (this.isAuthenticated) {
      this.userInfo.style.display = "flex"
      this.signOutBtn.style.display = "block"
      this.userName.textContent = this.currentUser

      const planNames = {
        CignalTV: "Freebie",
        CignalPlay: "Premium",
        CignalAll: "All-in-One",
      }
      this.userPlan.textContent = planNames[this.currentUser] || "Unknown"
    } else {
      this.userInfo.style.display = "none"
      this.signOutBtn.style.display = "none"
    }
  }

  hasChannelAccess(channelName) {
    if (!this.isAuthenticated) return false

    if (this.currentUser === "CignalAll") {
      return true
    } else if (this.currentUser === "CignalTV") {
      return this.userPermissions.CignalTV.includes(channelName)
    } else if (this.currentUser === "CignalPlay") {
      return !this.restrictedForCignalPlay.includes(channelName)
    }

    return false
  }

  setTheme(theme) {
    this.theme = theme
    localStorage.setItem("cignal-theme", theme)
    this.applyTheme()
  }

  applyTheme() {
    document.body.className = `theme-${this.theme}`

    // Update theme buttons
    this.darkThemeBtn.classList.toggle("active", this.theme === "dark")
    this.lightThemeBtn.classList.toggle("active", this.theme === "light")
  }

  startTimer() {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      if (this.currentTimeEl) {
        this.currentTimeEl.textContent = timeString
      }
    }

    updateTime()
    setInterval(updateTime, 1000)
  }

  renderChannels() {
    const categories = {
      local: document.getElementById("localChannels"),
      sports: document.getElementById("sportsChannels"),
      entertainment: document.getElementById("entertainmentChannels"),
      movies: document.getElementById("moviesChannels"),
      news: document.getElementById("newsChannels"),
      kids: document.getElementById("kidsChannels"),
      educational: document.getElementById("educationalChannels"),
      asian: document.getElementById("asianChannels"),
      exclusive: document.getElementById("exclusiveChannels"),
    }

    // Clear existing channels
    Object.values(categories).forEach((container) => {
      if (container) container.innerHTML = ""
    })

    // Group channels by category
    this.channels.forEach((channel, index) => {
      const container = categories[channel.category]
      if (!container) return

      const channelElement = this.createChannelElement(channel, index)
      container.appendChild(channelElement)
    })
  }

  createChannelElement(channel, index) {
    const channelDiv = document.createElement("div")
    const hasAccess = this.hasChannelAccess(channel.name)
    const isRestricted = this.isAuthenticated && !hasAccess

    channelDiv.className = `channel-item ${isRestricted ? "restricted" : ""}`
    channelDiv.innerHTML = `
      <img src="${channel.logo}" alt="${channel.name}" class="channel-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <div class="channel-logo" style="display: none;">${channel.name}</div>
      <div class="channel-name">${channel.name}</div>
      <div class="channel-status ${channel.status || "untested"}"></div>
    `

    channelDiv.addEventListener("click", () => {
      if (!this.isAuthenticated) {
        this.loginModal.style.display = "block"
        return
      }

      if (!hasAccess) {
        alert(`Access denied! Your ${this.currentUser} plan doesn't include this channel.`)
        return
      }

      this.selectChannel(channel, index)
    })

    return channelDiv
  }

  async selectChannel(channel, index) {
    if (!this.player || !this.video) return

    this.currentChannel = channel
    this.loadingSpinner.style.display = "block"
    this.videoOverlay.classList.add("hidden")

    // Update current channel info
    this.updateCurrentChannelInfo(channel)

    // Update active state
    document.querySelectorAll(".channel-item").forEach((item) => {
      item.classList.remove("active")
    })
    document.querySelectorAll(".channel-item")[index]?.classList.add("active")

    try {
      // Configure DRM
      if (channel.drm?.type === "clearkey") {
        this.player.configure({
          drm: {
            clearKeys: { [channel.drm.keyId]: channel.drm.key },
          },
        })
      } else if (channel.drm?.type === "widevine") {
        this.player.configure({
          drm: {
            servers: {
              "com.widevine.alpha": channel.drm.licenseUri,
            },
          },
        })
      } else {
        this.player.configure({
          drm: {
            clearKeys: {},
            servers: {},
          },
        })
      }

      await this.player.load(channel.manifest)

      // Update channel status
      channel.status = "working"
      this.updateChannelStatus(channel, "working")

      // Try to play
      this.video.muted = false
      await this.video.play()
    } catch (error) {
      console.error("Failed to load channel:", error)
      channel.status = "offline"
      this.updateChannelStatus(channel, "offline")
    } finally {
      this.loadingSpinner.style.display = "none"
      this.updateStats()
    }
  }

  updateCurrentChannelInfo(channel) {
    if (this.currentChannelInfo) {
      this.currentChannelInfo.innerHTML = `
        <div class="channel-logo">📺</div>
        <div class="channel-details">
            <h3>${channel.name}</h3>
            <p>${this.getCategoryLabel(channel.category)}</p>
            ${channel.drm?.type === "widevine" ? '<span style="font-size: 0.8em; color: #ffa500;">🔐 DRM Protected</span>' : ""}
        </div>
      `
    }
  }

  updateChannelStatus(channel, status) {
    const channelElements = document.querySelectorAll(".channel-item")
    channelElements.forEach((element) => {
      if (element.querySelector(".channel-name").textContent === channel.name) {
        const statusElement = element.querySelector(".channel-status")
        statusElement.className = `channel-status ${status}`
      }
    })
  }

  getCategoryLabel(category) {
    const labels = {
      local: "Local",
      movies: "Movies",
      news: "News",
      sports: "Sports",
      entertainment: "Entertainment",
      kids: "Kids",
      educational: "Educational",
      asian: "Asian & Foreign",
      exclusive: "CignalTV Exclusives",
    }
    return labels[category] || category
  }

  updateStats() {
    if (this.totalChannelsEl) {
      this.totalChannelsEl.textContent = this.channels.length
    }
    if (this.workingChannelsEl) {
      const workingCount = this.channels.filter((ch) => ch.status === "working").length
      this.workingChannelsEl.textContent = workingCount
    }
  }

  async testAllChannels() {
    if (this.testingInProgress) return

    this.testingInProgress = true
    this.testAllBtn.disabled = true
    this.testAllBtn.textContent = "Testing..."

    const progressElement = document.getElementById("testProgress")
    const progressFill = document.getElementById("progressFill")
    const testStatus = document.getElementById("testStatus")

    if (progressElement) progressElement.style.display = "block"

    for (let i = 0; i < this.channels.length; i++) {
      const channel = this.channels[i]
      if (testStatus) {
        testStatus.textContent = `Testing ${channel.name}... (${i + 1}/${this.channels.length})`
      }

      // Update channel status to testing
      channel.status = "testing"
      this.updateChannelStatus(channel, "testing")

      try {
        // Simple test - try to fetch the manifest
        const response = await fetch(channel.manifest, { method: "HEAD" })
        const status = response.ok ? "working" : "offline"

        channel.status = status
        this.updateChannelStatus(channel, status)
      } catch {
        channel.status = "offline"
        this.updateChannelStatus(channel, "offline")
      }

      const progress = ((i + 1) / this.channels.length) * 100
      if (progressFill) {
        progressFill.style.width = `${progress}%`
      }

      // Small delay to prevent overwhelming the servers
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    this.testingInProgress = false
    this.testAllBtn.disabled = false
    this.testAllBtn.textContent = "Start Testing"
    if (testStatus) {
      testStatus.textContent = "Testing completed!"
    }
    this.updateStats()

    const workingCount = this.channels.filter((ch) => ch.status === "working").length
    const offlineCount = this.channels.filter((ch) => ch.status === "offline").length

    alert(`Testing Complete!\n\nWorking: ${workingCount}\nOffline: ${offlineCount}`)

    setTimeout(() => {
      if (progressElement) progressElement.style.display = "none"
    }, 2000)
  }

  performSearch(query) {
    if (!query.trim()) {
      this.searchResults.innerHTML = ""
      return
    }

    const filteredChannels = this.channels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(query.toLowerCase()) ||
        channel.category.toLowerCase().includes(query.toLowerCase()),
    )

    this.searchResults.innerHTML = ""

    filteredChannels.forEach((channel, index) => {
      const hasAccess = this.hasChannelAccess(channel.name)
      const resultElement = document.createElement("div")
      resultElement.className = `search-result-item ${!this.isAuthenticated || !hasAccess ? "restricted" : ""}`
      resultElement.innerHTML = `
        <strong>${channel.name}</strong>
        <br>
        <small>${this.getCategoryLabel(channel.category)} • ${channel.status || "untested"}</small>
        ${
          !this.isAuthenticated
            ? '<br><small style="color: #dc3545;">🔒 Sign in required</small>'
            : !hasAccess
              ? '<br><small style="color: #dc3545;">🔒 Not available in your plan</small>'
              : ""
        }
      `

      resultElement.addEventListener("click", () => {
        if (!this.isAuthenticated) {
          this.searchModal.style.display = "none"
          this.loginModal.style.display = "block"
          return
        }

        if (!hasAccess) {
          alert(`Access denied! Your ${this.currentUser} plan doesn't include this channel.`)
          return
        }

        this.selectChannel(channel, this.channels.indexOf(channel))
        this.searchModal.style.display = "none"
      })

      this.searchResults.appendChild(resultElement)
    })

    if (filteredChannels.length === 0) {
      this.searchResults.innerHTML = '<div class="search-result-item">No channels found</div>'
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new CignalPlayTV()
})
