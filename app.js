/**
 * AutomatAR - Interactive Mechanical Engineering Learning Platform
 * Clean Version - No Assembly Animations
 * Version 3.0 - Streamlined Architecture
 */

/********************************************
 * GLOBAL CONSTANTS AND STATE
 ********************************************/


const SCREENS = {
  HOME: "HOME",
  KIT_DETAIL: "KITDETAIL",
  AR: "AR",
  MANUALS: "MANUALS",
  MODELS: "MODELS",
  AI: "AI",
  CREATE: "CREATE"
};

// Global application state
const AppState = {
  currentScreen: SCREENS.HOME,
  selectedKit: null,
  arActive: false,
  videoManager: null,
  createManager: null
};

window.AppState = AppState;

// Kit scenarios data
const scenarios = [
  {
    name: "Cam-A",
    identifierTag: 0,
    desc: `Cam-A illustrates how cams convert rotational motion into linear oscillatory motion. 
The cam's surface can be contoured (circular, elliptical, etc.) to create different motion 
in the follower as the cam rotates. The cam mechanism's ability to produce precise, complex 
motion from simple rotational input makes it invaluable in mechanical design.`,
    objects: [{ tag: 6, stl: "sea_models/stringray.stl" }]
  },
  {
    name: "Cam-C",
    identifierTag: 1,
    desc: `Cam-C illustrates how cams convert rotational motion to arranged, paused (intermittent) motion. 
It's a rotating drive wheel (driver) with a pin engaging slots in a driven wheel (Geneva wheel). 
This engagement causes precise timing & indexing. Between steps, the Geneva wheel remains locked 
in place.`,
    objects: [{ tag: 7, stl: "sea_models/jellyfish.stl" }]
  },
  {
    name: "Crank",
    identifierTag: 2,
    desc: `Crank kit illustrates how a crank mechanism converts rotational motion into linear reciprocating motion. 
A rotating arm (the crank) pushes/pulls a connecting rod, creating back-and-forth movement.`,
    objects: [{ tag: 8, stl: "sea_models/dolphin.stl" }]
  },
  {
    name: "Gear-A",
    identifierTag: 3,
    desc: `Gear-A demonstrates how bevel gears transfer rotational motion between perpendicular shafts, 
turning horizontal circular motion into vertical. Bevel gears have cone-shaped teeth meeting at 90°.`,
    objects: [{ tag: 9, stl: "sea_models/octopus.stl" }]
  },
  {
    name: "Gear-B",
    identifierTag: 4,
    desc: `Gear-B shows how gear alignment & shape affect torque/speed, even with a constant driver. 
The driver's turning changes load distribution, resulting in dynamic acceleration/deceleration.`,
    objects: [{ tag: 10, stl: "sea_models/fishes.stl" }]
  },
  {
    name: "Gear-C",
    identifierTag: 5,
    desc: `Gear-C is a worm gear system that converts rotational motion while significantly reducing speed & 
increasing torque. A screw-like worm drives a worm wheel, transferring motion at 90°.`,
    objects: [{ tag: 11, stl: "sea_models/sea_turtle.stl" }]
  }
];

// Extended scenarios for AR (including marine models)
const extendedScenarios = [
  ...scenarios,
  {
    name: "Octopus Baby Exotic T 0409195159",
    identifierTag: 15,
    desc: "An adorable baby exotic octopus, with texture from 0409195159.",
    objects: [{ tag:15, stl: "octopus_baby_exotic_t_0409195159_texture.stl" }]
  },
  {
    name: "Octopus Exotic Tropic 0409194610",
    identifierTag: 7,
    desc: "A colorful tropical octopus from 0409194610.",
    objects: [{ tag: 7, stl: "octopus_exotic_tropic_0409194610_texture.stl" }]
  },
  {
    name: "Coral Reef Fish Uniqu 0409193350",
    identifierTag: 8,
    desc: "A unique coral reef fish (3350).",
    objects: [{ tag: 8, stl: "coral_reef_fish_uniqu_0409193350_texture.stl" }]
  },
  {
    name: "Marine Animal Exotic 0409191724",
    identifierTag: 9,
    desc: "An exotic marine creature, ID 1724.",
    objects: [{ tag: 9, stl: "marine_animal_exotic__0409191724_texture.stl" }]
  },
  {
    name: "Jellyfish Exotic Trop 0409193559",
    identifierTag: 10,
    desc: "An exotic tropical jellyfish, ID 3559.",
    objects: [{ tag: 10, stl: "jellyfish_exotic_trop_0409193559_texture.stl" }]
  },
  {
    name: "Fish Tropical 0409190013",
    identifierTag: 31,
    desc: "A final tropical fish, ID 0013.",
    objects: [{ tag: 31, stl: "fish_tropical_0409190013_texture.stl" }]
  }
];

/********************************************
 * UTILITY FUNCTIONS
 ********************************************/

class Utils {
  static $(id) {
    return document.getElementById(id);
  }

  static showElement(element) {
    if (typeof element === 'string') element = Utils.$(element);
    if (element) element.style.display = 'block';
  }

  static hideElement(element) {
    if (typeof element === 'string') element = Utils.$(element);
    if (element) element.style.display = 'none';
  }

  static addClass(element, className) {
    if (typeof element === 'string') element = Utils.$(element);
    if (element) element.classList.add(className);
  }

  static removeClass(element, className) {
    if (typeof element === 'string') element = Utils.$(element);
    if (element) element.classList.remove(className);
  }

  static scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  static log(message, type = 'info') {
    const styles = {
      info: 'color: #2196F3',
      success: 'color: #4CAF50',
      warning: 'color: #FF9800',
      error: 'color: #f44336'
    };
    console.log(`%c[AutomatAR] ${message}`, styles[type]);
  }
}

/********************************************
 * VIDEO OPTIMIZATION
 ********************************************/

class VideoManager {
  constructor() {
    this.videos = new Map();
    this.observer = null;
    this.init();
  }

  init() {
    this.setupVideos();
    this.setupIntersectionObserver();
    Utils.log('Video Manager initialized', 'success');
  }

  setupVideos() {
    const videos = document.querySelectorAll('.kit-video, .kit-detail-video');
    videos.forEach(video => {
      video.setAttribute('loading', 'lazy');
      
      video.addEventListener('loadstart', () => {
        video.setAttribute('data-loading', 'true');
      });
      
      video.addEventListener('canplay', () => {
        video.removeAttribute('data-loading');
      });
      
      video.addEventListener('error', () => {
        Utils.log(`Video failed to load: ${video.src}`, 'error');
        this.handleVideoError(video);
      });

      this.videos.set(video, { playing: false, visible: false });
    });
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        const videoData = this.videos.get(video);
        
        if (!videoData) return;

        if (entry.isIntersecting) {
          videoData.visible = true;
          this.playVideo(video);
        } else {
          videoData.visible = false;
          this.pauseVideo(video);
        }
      });
    }, { threshold: 0.1, rootMargin: '50px' });

    this.videos.forEach((_, video) => {
      this.observer.observe(video);
    });
  }

  playVideo(video) {
    const videoData = this.videos.get(video);
    if (video.paused && video.readyState >= 2 && !videoData.playing) {
      video.play().then(() => {
        videoData.playing = true;
      }).catch(e => {
        Utils.log(`Video autoplay failed: ${e.message}`, 'warning');
      });
    }
  }

  pauseVideo(video) {
    const videoData = this.videos.get(video);
    if (!video.paused && videoData.playing) {
      video.pause();
      videoData.playing = false;
    }
  }

  pauseAll() {
    this.videos.forEach((data, video) => {
      this.pauseVideo(video);
    });
  }

  resumeVisibleVideos() {
    this.videos.forEach((data, video) => {
      const rect = video.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible && video.paused && video.readyState >= 2) {
        video.play().catch(e => Utils.log('Video resume failed', 'warning'));
      }
    });
  }

  handleVideoError(video) {
    video.style.display = 'none';
    const placeholder = video.nextElementSibling;
    if (placeholder && placeholder.classList.contains('placeholder-img')) {
      placeholder.style.display = 'block';
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.videos.clear();
  }
}

/********************************************
 * SCREEN MANAGEMENT SYSTEM
 ********************************************/

class ScreenManager {
  constructor() {
    this.screens = new Map();
    this.currentScreen = SCREENS.HOME;
    this.init();
  }

  init() {
    this.registerScreens();
    Utils.log('Screen Manager initialized', 'success');
  }

  registerScreens() {
    this.screens.set(SCREENS.HOME, {
      element: Utils.$('homeScreen'),
      show: () => this.showHomeScreen(),
      hide: () => this.hideHomeScreen()
    });

    this.screens.set(SCREENS.KIT_DETAIL, {
      element: Utils.$('kitDetailScreen'),
      show: (kitId) => this.showKitDetailScreen(kitId),
      hide: () => this.hideKitDetailScreen()
    });

    this.screens.set(SCREENS.AR, {
      element: Utils.$('arScreen'),
      show: () => this.showARScreen(),
      hide: () => this.hideARScreen()
    });

    this.screens.set(SCREENS.MANUALS, {
      element: Utils.$('manualsScreen'),
      show: () => this.showManualsScreen(),
      hide: () => this.hideManualsScreen()
    });

    this.screens.set(SCREENS.MODELS, {
      element: Utils.$('modelsScreen'),
      show: () => this.showModelsScreen(),
      hide: () => this.hideModelsScreen()
    });

    this.screens.set(SCREENS.AI, {
      element: Utils.$('aiScreen'),
      show: () => this.showAIScreen(),
      hide: () => this.hideAIScreen()
    });

    this.screens.set(SCREENS.CREATE, {
      element: Utils.$('createScreen'),
      show: () => this.showCreateScreen(),
      hide: () => this.hideCreateScreen()
    });
  }

  switchTo(screenName, ...args) {
    Utils.log(`Switching to screen: ${screenName}`);
    
    // Hide current screen
    const currentScreenData = this.screens.get(this.currentScreen);
    if (currentScreenData && currentScreenData.hide) {
      currentScreenData.hide();
    }

    // Show new screen
    const newScreenData = this.screens.get(screenName);
    if (newScreenData && newScreenData.show) {
      newScreenData.show(...args);
      this.currentScreen = screenName;
      AppState.currentScreen = screenName;
    } else {
      Utils.log(`Screen not found: ${screenName}`, 'error');
    }
  }

  hideAllScreens() {
    Utils.hideElement('mainHeader');
    Utils.hideElement('homeScreen');
    Utils.hideElement('kitDetailScreen');
    Utils.hideElement('arScreen');
    Utils.removeClass('manualsScreen', 'active');
    Utils.removeClass('modelsScreen', 'active');
    Utils.removeClass('aiScreen', 'active');
    Utils.removeClass('createScreen', 'active');
  }

  showHomeScreen() {
    this.hideAllScreens();
    Utils.showElement('mainHeader');
    Utils.showElement('homeScreen');
    
    Utils.scrollToTop();
    
    setTimeout(() => {
      if (AppState.videoManager) {
        AppState.videoManager.resumeVisibleVideos();
      }
    }, 200);
  }

  hideHomeScreen() {
    if (AppState.videoManager) {
      AppState.videoManager.pauseAll();
    }
  }

  showKitDetailScreen(kitId) {
    this.hideAllScreens();
    
    const kit = scenarios[kitId];
    if (kit) {
      const titleEl = Utils.$('kit-detail-title');
      const descEl = Utils.$('kitDetailDesc');
      
      if (titleEl) titleEl.textContent = kit.name;
      if (descEl) descEl.textContent = kit.desc;

      const video = Utils.$('kitDetailVideo');
      if (video) {
        const source = video.querySelector('source');
        if (source) {
          source.src = `videos/kit${kitId + 1}.mp4`;
          video.load();
        }
        
        video.addEventListener('loadeddata', function() {
          const placeholder = Utils.$('kitDetailImg');
          if (placeholder) placeholder.style.display = 'none';
        });
      }
      
      AppState.selectedKit = kitId;
    }
    
    Utils.showElement('kitDetailScreen');
  }

  hideKitDetailScreen() {
    // Cleanup if needed
  }

  showARScreen() {
    this.hideAllScreens();
    Utils.showElement('arScreen');
    
    // Show initial overlay
    Utils.removeClass('arInitialOverlay', 'hidden');
  }

  hideARScreen() {
    // Cleanup AR resources if needed
    if (window.arManager) {
      window.arManager.cleanup();
    }
  }

  showManualsScreen() {
    this.hideAllScreens();
    Utils.addClass('manualsScreen', 'active');
  }

  hideManualsScreen() {
    // Cleanup if needed
  }

  showModelsScreen() {
    this.hideAllScreens();
    Utils.addClass('modelsScreen', 'active');
  }

  hideModelsScreen() {
    // Cleanup if needed
  }

  showAIScreen() {
    this.hideAllScreens();
    Utils.addClass('aiScreen', 'active');
  }

  hideAIScreen() {
    // Cleanup if needed
  }

  showCreateScreen() {
    this.hideAllScreens();
    Utils.addClass('createScreen', 'active');
    
    // Initialize create manager if not already done
    if (!AppState.createManager) {
      AppState.createManager = new CreateManager();
    }
    AppState.createManager.init();
  }

  hideCreateScreen() {
    if (AppState.createManager) {
      AppState.createManager.cleanup();
    }
  }
}

/********************************************
 * ANIMATION CREATION SYSTEM
 ********************************************/

class CreateManager {
  constructor() {
    // Supabase configuration - using official docs format
    this.supabaseUrl = 'https://ztsqvqngifqwcoufptve.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0c3F2cW5naWZxd2NvdWZwdHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTY1MDksImV4cCI6MjA2NTQ3MjUwOX0.Q-SIWniCEdKhlUjOBxcgezlAx6QSgB6LYLpGdFr_eo0';
    this.supabase = null;
    
    // Camera and animation state
    this.stream = null;
    this.frames = [];
    this.isPlaying = false;
    this.currentFrame = 0;
    this.animSpeed = 500;
    this.animInterval = null;
    this.detectedMarkers = [];
    this.markerHistory = new Map();
    
    // Initialize Supabase
    this.initSupabase();
  }

  async initSupabase() {
    try {
      // Check if Supabase is loaded
      if (typeof window.supabase === 'undefined') {
        throw new Error('Supabase library not loaded. Add <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> to your HTML head.');
      }

      // Create client following official docs
      this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });

      console.log('✅ Supabase client created');

      // Test connection immediately
      await this.testConnection();
      
      // Setup storage
      await this.setupStorage();

    } catch (error) {
      console.error('❌ Supabase initialization failed:', error);
      this.showStatus('Supabase connection failed');
    }
  }

  async testConnection() {
    try {
      console.log('🔌 Testing Supabase connection...');
      
      // Simple test query following docs format
      const { data, error } = await this.supabase
        .from('animations')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.error('❌ Connection test failed:', error);
        throw new Error(`Database connection failed: ${error.message}`);
      }

      console.log('✅ Supabase connection successful');
      return true;
    } catch (error) {
      console.error('❌ Connection test error:', error);
      throw error;
    }
  }

  async setupStorage() {
    try {
      console.log('🪣 Setting up storage bucket...');
      
      // List buckets to check if ours exists
      const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
      
      if (listError) {
        console.warn('Storage list error:', listError);
        return;
      }

      const bucketExists = buckets?.find(bucket => bucket.id === 'animation-frames');
      
      if (!bucketExists) {
        // Create bucket following docs
        const { data, error } = await this.supabase.storage.createBucket('animation-frames', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg'],
          fileSizeLimit: 10485760 // 10MB
        });

        if (error) {
          console.warn('Storage bucket creation error:', error);
        } else {
          console.log('✅ Storage bucket created');
        }
      } else {
        console.log('✅ Storage bucket exists');
      }
    } catch (error) {
      console.warn('Storage setup warning:', error);
    }
  }

  // =============================================
  // SUPABASE OPERATIONS - Following Official Docs
  // =============================================

  async saveAnimation(animationData) {
    try {
      console.log('💾 Saving animation:', animationData.name);

      // Insert following official docs format
      const { data, error } = await this.supabase
        .from('animations')
        .insert([
          {
            name: animationData.name,
            frame_count: animationData.frame_count,
            frame_rate: animationData.frame_rate,
            marker_tags: animationData.marker_tags,
            metadata: animationData.metadata
          }
        ])
        .select();

      if (error) {
        console.error('❌ Insert error:', error);
        throw new Error(`Save failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from insert');
      }

      console.log('✅ Animation saved:', data[0]);
      return data[0];

    } catch (error) {
      console.error('❌ Save animation failed:', error);
      throw error;
    }
  }

  async loadAnimations() {
    try {
      console.log('📥 Loading animations...');

      // Select following official docs format
      const { data, error } = await this.supabase
        .from('animations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Load error:', error);
        throw new Error(`Load failed: ${error.message}`);
      }

      console.log('✅ Animations loaded:', data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ Load animations failed:', error);
      throw error;
    }
  }

  async deleteAnimation(animationId) {
    try {
      console.log('🗑️ Deleting animation:', animationId);

      // Get animation first to clean up files
      const { data: animation } = await this.supabase
        .from('animations')
        .select('frame_urls')
        .eq('id', animationId)
        .single();

      // Delete files from storage
      if (animation?.frame_urls?.length > 0) {
        const filePaths = animation.frame_urls.map(frame => 
          `${animationId}/frame_${frame.frame_index + 1}.png`
        );
        
        const { error: storageError } = await this.supabase.storage
          .from('animation-frames')
          .remove(filePaths);

        if (storageError) {
          console.warn('Storage cleanup warning:', storageError);
        }
      }

      // Delete record following docs format
      const { error } = await this.supabase
        .from('animations')
        .delete()
        .eq('id', animationId);

      if (error) {
        console.error('❌ Delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }

      console.log('✅ Animation deleted');
      return true;

    } catch (error) {
      console.error('❌ Delete animation failed:', error);
      throw error;
    }
  }

  async uploadFrames(animationId, frames) {
    try {
      console.log('📤 Uploading frames for animation:', animationId);
      
      const frameUrls = [];
      
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        
        try {
          this.showStatus(`Uploading frame ${i + 1}/${frames.length}...`);

          // Convert base64 to blob
          const blob = this.dataURLToBlob(frame.url);
          const fileName = `${animationId}/frame_${i + 1}.png`;
          
          // Upload following docs format
          const { data, error } = await this.supabase.storage
            .from('animation-frames')
            .upload(fileName, blob, {
              cacheControl: '3600',
              upsert: true
            });

          if (error) {
            console.error(`Frame ${i + 1} upload error:`, error);
            continue;
          }

          // Get public URL following docs format
          const { data: publicUrlData } = this.supabase.storage
            .from('animation-frames')
            .getPublicUrl(fileName);

          frameUrls.push({
            frame_index: i,
            url: publicUrlData.publicUrl,
            cell_index: frame.cellIndex,
            timestamp: frame.timestamp,
            markers: frame.markers || []
          });

          console.log(`✅ Frame ${i + 1} uploaded`);

        } catch (frameError) {
          console.error(`Frame ${i + 1} failed:`, frameError);
        }
      }
      
      console.log(`📋 Uploaded ${frameUrls.length}/${frames.length} frames`);
      return frameUrls;

    } catch (error) {
      console.error('❌ Upload frames failed:', error);
      throw error;
    }
  }

  async updateAnimationFrames(animationId, frameUrls) {
    try {
      console.log('🔄 Updating animation with frame URLs...');

      // Update following docs format
      const { data, error } = await this.supabase
        .from('animations')
        .update({ frame_urls: frameUrls })
        .eq('id', animationId)
        .select();

      if (error) {
        console.error('❌ Update error:', error);
        throw new Error(`Update failed: ${error.message}`);
      }

      console.log('✅ Animation updated with frame URLs');
      return data[0];

    } catch (error) {
      console.error('❌ Update animation failed:', error);
      throw error;
    }
  }

  async getAnimationByMarker(markerId) {
    try {
      console.log('🔍 Getting animation by marker:', markerId);

      // Query following docs format with array contains
      const { data, error } = await this.supabase
        .from('animations')
        .select('*')
        .contains('marker_tags', [markerId])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Query error:', error);
        return null;
      }

      const result = data && data.length > 0 ? data[0] : null;
      console.log(result ? '✅ Animation found' : '❌ No animation found');
      return result;

    } catch (error) {
      console.error('❌ Get animation by marker failed:', error);
      return null;
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  dataURLToBlob(dataURL) {
    try {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (error) {
      console.error('Blob conversion failed:', error);
      throw error;
    }
  }

  // =============================================
  // MAIN SAVE TO LIBRARY METHOD
  // =============================================

  async saveToLibrary() {
    if (this.frames.length === 0) {
      this.showStatus('No frames to save');
      return;
    }

    const name = prompt('Enter animation name:', `Animation ${Date.now()}`);
    if (!name) return;

    this.showStatus('Saving to cloud...');

    try {
      // Check Supabase is ready
      if (!this.supabase) {
        throw new Error('Supabase not initialized');
      }

      // Collect marker tags
      const detectedTags = new Set();
      this.frames.forEach(frame => {
        if (frame.markers) {
          frame.markers.forEach(marker => detectedTags.add(marker.id));
        }
      });

      const tags = Array.from(detectedTags).sort();

      // Prepare animation data
      const animationData = {
        name: name.trim(),
        frame_count: this.frames.length,
        frame_rate: 1000 / this.animSpeed,
        marker_tags: tags,
        metadata: {
          totalFrames: this.frames.length,
          frameRate: 1000 / this.animSpeed,
          createdAt: Date.now(),
          markerCount: detectedTags.size,
          captureType: 'golden_squares'
        }
      };

      // Step 1: Save animation record
      this.showStatus('Creating animation record...');
      const savedAnimation = await this.saveAnimation(animationData);

      // Step 2: Upload frames
      this.showStatus('Uploading frames...');
      const frameUrls = await this.uploadFrames(savedAnimation.id, this.frames);

      // Step 3: Update with frame URLs
      this.showStatus('Finalizing...');
      await this.updateAnimationFrames(savedAnimation.id, frameUrls);

      // Success
      const tagInfo = tags.length > 0 
        ? ` with markers: ${tags.join(', ')}`
        : ' (no markers detected)';
      
      this.showStatus(`✅ "${name}" saved to cloud${tagInfo}`);
      console.log('🎉 Complete animation saved successfully!');

    } catch (error) {
      console.error('❌ Save to library failed:', error);
      this.showStatus(`❌ Save failed: ${error.message}`);
      
      // Show user-friendly error
      if (error.message.includes('fetch')) {
        alert('Network error: Check your internet connection and try again.');
      } else if (error.message.includes('table')) {
        alert('Database error: Please make sure the animations table exists in Supabase.');
      } else {
        alert(`Save failed: ${error.message}`);
      }
    }
  }

  // =============================================
  // LIBRARY MANAGEMENT
  // =============================================

  async openLibrary() {
    try {
      this.showStatus('Loading animation library...');

      // Check Supabase is ready
      if (!this.supabase) {
        throw new Error('Supabase not initialized');
      }

      const animations = await this.loadAnimations();
      this.showStatus('Library loaded');
      this.createLibraryModal(animations);

    } catch (error) {
      console.error('❌ Failed to load library:', error);
      this.showStatus(`❌ Failed to load library: ${error.message}`);
      
      // Show user-friendly error
      if (error.message.includes('fetch')) {
        alert('Network error: Check your internet connection and try again.');
      } else if (error.message.includes('table')) {
        alert('Database error: Please make sure the animations table exists in Supabase.');
      } else {
        alert(`Failed to load library: ${error.message}`);
      }
    }
  }

  createLibraryModal(animations = []) {
    const existing = document.getElementById('libModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'libModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: rgba(0,0,0,0.9);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      color: white;
      overflow-y: auto;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(145deg, #9C27B0, #673AB7);
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 10;
    `;

    header.innerHTML = `
      <h2 style="margin: 0; font-size: 1.5rem;">Cloud Animation Library</h2>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <span style="background: rgba(255,255,255,0.2); padding: 0.4rem 0.8rem; border-radius: 16px; font-size: 0.9rem;">
          ${animations.length} saved
        </span>
        <button onclick="document.getElementById('libModal').remove()" 
                style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 0.6rem 1rem; border-radius: 6px; cursor: pointer;">
          Close
        </button>
      </div>
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    `;

    if (animations.length === 0) {
      content.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.7);">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">☁️</div>
          <h3 style="margin-bottom: 1rem;">No animations in cloud yet</h3>
          <p>Create and save animations to see them here.</p>
          <div style="background: rgba(76, 175, 80, 0.1); border: 1px solid #4CAF50; border-radius: 8px; padding: 1rem; margin-top: 1rem; text-align: left;">
            <strong>✅ Connection successful!</strong><br>
            Your Supabase database is working correctly. Start capturing animations to populate your library.
          </div>
        </div>
      `;
    } else {
      this.renderLibraryContent(content, animations);
    }

    modal.appendChild(header);
    modal.appendChild(content);
    document.body.appendChild(modal);

    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  }

  renderLibraryContent(container, animations) {
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    `;

    animations.forEach(animation => {
      const card = this.createAnimationCard(animation);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  createAnimationCard(animation) {
    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1rem;
      border: 1px solid rgba(255,255,255,0.2);
      transition: all 0.3s ease;
    `;

    const preview = document.createElement('div');
    preview.style.cssText = `
      width: 100%;
      height: 120px;
      background: rgba(0,0,0,0.3);
      border-radius: 8px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.5);
      font-size: 0.9rem;
    `;

    if (animation.frame_urls && animation.frame_urls.length > 0) {
      const img = document.createElement('img');
      img.src = animation.frame_urls[0].url;
      img.style.cssText = `width: 100%; height: 100%; object-fit: cover;`;
      img.onerror = () => preview.textContent = 'Preview unavailable';
      preview.appendChild(img);
    } else {
      preview.textContent = 'No preview available';
    }

    const info = document.createElement('div');
    info.innerHTML = `
      <h3 style="margin: 0 0 0.5rem 0; color: white; font-size: 1.1rem;">${animation.name}</h3>
      <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 1rem;">
        ${animation.frame_count} frames • ${(animation.frame_rate || 2).toFixed(1)} FPS<br>
        <span style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">
          ${new Date(animation.created_at).toLocaleDateString()}
        </span>
      </div>
    `;

    if (animation.marker_tags && animation.marker_tags.length > 0) {
      const tags = document.createElement('div');
      tags.style.cssText = `display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 1rem;`;
      
      animation.marker_tags.forEach(tag => {
        const badge = document.createElement('span');
        badge.style.cssText = `
          background: #FF9800; color: white; padding: 0.2rem 0.5rem; 
          border-radius: 10px; font-size: 0.7rem; font-weight: 600;
        `;
        badge.textContent = `ID:${tag}`;
        tags.appendChild(badge);
      });
      
      info.appendChild(tags);
    }

    const actions = document.createElement('div');
    actions.style.cssText = `display: flex; gap: 0.5rem;`;

    const deleteBtn = document.createElement('button');
    deleteBtn.style.cssText = `
      flex: 1; background: #f44336; color: white; border: none; 
      padding: 0.6rem; border-radius: 6px; cursor: pointer; font-weight: 600;
    `;
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => this.deleteAnimationFromLibrary(animation.id);

    actions.appendChild(deleteBtn);
    card.appendChild(preview);
    card.appendChild(info);
    card.appendChild(actions);

    return card;
  }

  async deleteAnimationFromLibrary(animationId) {
    if (!confirm('Delete this animation from cloud storage?')) return;

    try {
      this.showStatus('Deleting animation...');
      await this.deleteAnimation(animationId);
      
      const modal = document.getElementById('libModal');
      if (modal) {
        modal.remove();
        this.openLibrary();
      }
      
      this.showStatus('Animation deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      this.showStatus('Delete failed');
      alert(`Delete failed: ${error.message}`);
    }
  }

  // =============================================
  // CAMERA AND CAPTURE (keeping existing methods)
  // =============================================

  async init() {
    await this.initCamera();
    this.setupControls();
    this.initMarkerDetection();
    this.setupBackButton();
  }

  async initCamera() {
    const video = document.getElementById('createVideo');
    if (!video) return;

    try {
      this.showStatus('Starting camera...');
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      
      video.srcObject = this.stream;
      await video.play();
      this.showStatus('Camera ready - Point at markers and capture');
      
      const captureBtn = document.getElementById('createCapture');
      if (captureBtn) captureBtn.disabled = false;
    } catch (err) {
      this.showStatus('Camera failed - Check permissions');
      console.error('Camera error:', err);
    }
  }

  setupControls() {
    const captureBtn = document.getElementById('createCapture');
    const clearBtn = document.getElementById('createClear');
    const playBtn = document.getElementById('createPlayPause');
    const resetBtn = document.getElementById('createResetAnim');
    const speedSlider = document.getElementById('createSpeedSlider');
    const libraryBtn = document.getElementById('animLibraryTopBtn');

    if (captureBtn) captureBtn.onclick = () => this.capture();
    if (clearBtn) clearBtn.onclick = () => this.clearAll();
    if (playBtn) playBtn.onclick = () => this.togglePlay();
    if (resetBtn) resetBtn.onclick = () => this.reset();
    if (speedSlider) speedSlider.oninput = () => this.updateSpeed();
    if (libraryBtn) libraryBtn.onclick = () => this.openLibrary();
  }

  initMarkerDetection() {
    try {
      if (typeof AR !== 'undefined') {
        this.detector = new AR.Detector();
      }
    } catch (error) {
      console.log('Marker detection unavailable');
    }
  }

  setupBackButton() {
    const backBtn = document.getElementById('closeCreateBtn');
    if (backBtn) {
      this.backButtonHandler = (e) => {
        e.preventDefault();
        this.cleanup();
        if (window.App && window.App.screenManager) {
          window.App.screenManager.switchTo('HOME');
        } else {
          document.getElementById('createScreen').style.display = 'none';
          document.getElementById('homeScreen').style.display = 'block';
        }
      };
      backBtn.addEventListener('click', this.backButtonHandler);
    }
  }

  detectMarkers(imageData) {
    if (!this.detector) return [];
    try {
      const markers = this.detector.detect(imageData);
      markers.forEach(marker => {
        const id = marker.id;
        if (!this.markerHistory.has(id)) {
          this.markerHistory.set(id, { count: 0, lastSeen: Date.now() });
        }
        const history = this.markerHistory.get(id);
        history.count++;
        history.lastSeen = Date.now();
      });
      return markers;
    } catch (error) {
      return [];
    }
  }

  capture() {
    const video = document.getElementById('createVideo');
    if (!video || video.readyState < 2) {
      this.showStatus('Camera not ready');
      return;
    }

    this.showStatus('Capturing 3 golden squares...');

    try {
      const displayWidth = video.clientWidth;
      const displayHeight = video.clientHeight;
      const videoAspect = video.videoWidth / video.videoHeight;
      const displayAspect = displayWidth / displayHeight;
      
      let visibleWidth, visibleHeight, offsetX, offsetY;
      
      if (videoAspect > displayAspect) {
        visibleHeight = video.videoHeight;
        visibleWidth = video.videoHeight * displayAspect;
        offsetX = (video.videoWidth - visibleWidth) / 2;
        offsetY = 0;
      } else {
        visibleWidth = video.videoWidth;
        visibleHeight = video.videoWidth / displayAspect;
        offsetX = 0;
        offsetY = (video.videoHeight - visibleHeight) / 2;
      }

      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = video.videoWidth;
      fullCanvas.height = video.videoHeight;
      const fullCtx = fullCanvas.getContext('2d');
      fullCtx.drawImage(video, 0, 0);

      const imageData = fullCtx.getImageData(0, 0, fullCanvas.width, fullCanvas.height);
      const detectedMarkers = this.detectMarkers(imageData);
      
      this.detectedMarkers = detectedMarkers.map(marker => ({
        id: marker.id,
        corners: marker.corners,
        confidence: marker.confidence || 1,
        timestamp: Date.now()
      }));

      const cellW = Math.floor(visibleWidth / 3);
      const cellH = Math.floor(visibleHeight / 2);
      
      const goldenCells = [
        { col: 0, row: 1, name: 'Golden Square 1' },
        { col: 1, row: 1, name: 'Golden Square 2' },
        { col: 2, row: 1, name: 'Golden Square 3' }
      ];
      
      goldenCells.forEach((cell, index) => {
        const cellCanvas = document.createElement('canvas');
        cellCanvas.width = cellW;
        cellCanvas.height = cellH;
        const cellCtx = cellCanvas.getContext('2d');
        
        const sourceX = offsetX + (cell.col * cellW);
        const sourceY = offsetY + (cell.row * cellH);
        const clampedW = Math.min(cellW, video.videoWidth - sourceX);
        const clampedH = Math.min(cellH, video.videoHeight - sourceY);
        
        cellCtx.drawImage(video, sourceX, sourceY, clampedW, clampedH, 0, 0, cellW, cellH);
        cellCtx.strokeStyle = '#FFD700';
        cellCtx.lineWidth = 3;
        cellCtx.strokeRect(0, 0, cellW, cellH);
        cellCtx.fillStyle = '#FFD700';
        cellCtx.font = 'bold 16px Arial';
        cellCtx.fillText(`G${index + 1}`, 10, 25);
        
        this.frames.push({
          id: this.frames.length,
          url: cellCanvas.toDataURL('image/png'),
          timestamp: Date.now(),
          cellIndex: index,
          cellName: cell.name,
          markers: this.detectedMarkers.slice(),
          isGoldenSquare: true
        });
      });

      this.updateDisplay();
      this.startAnimation();
      
      const markerInfo = detectedMarkers.length > 0 
        ? ` | Markers: ${detectedMarkers.map(m => m.id).join(', ')}`
        : '';
      
      this.showStatus(`Captured 3 golden squares${markerInfo}`);
    } catch (err) {
      console.error('Capture error:', err);
      this.showStatus('Capture failed');
    }
  }

  updateDisplay() {
    const resultsSection = document.getElementById('createResultsSection');
    const animSection = document.getElementById('createAnimSection');
    const clearBtn = document.getElementById('createClear');
    
    if (resultsSection) resultsSection.style.display = 'block';
    if (animSection) animSection.style.display = 'block';
    if (clearBtn) clearBtn.style.display = 'inline-block';
    
    this.renderFrames();
  }

  renderFrames() {
    const results = document.getElementById('createResults');
    if (!results) return;

    results.innerHTML = '';

    const markerSummary = this.createMarkerSummary();
    if (markerSummary) results.appendChild(markerSummary);

    const container = document.createElement('div');
    container.style.cssText = `
      display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;
      margin-bottom: 1rem; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 12px;
    `;

    this.frames.forEach((frame, index) => {
      const frameDiv = document.createElement('div');
      frameDiv.style.cssText = `
        position: relative; cursor: pointer; border: 2px solid rgba(255,255,255,0.3);
        border-radius: 8px; overflow: hidden; transition: all 0.3s ease;
      `;

      const img = document.createElement('img');
      img.src = frame.url;
      img.style.cssText = `width: 80px; height: 60px; object-fit: cover; display: block;`;

      const label = document.createElement('div');
      label.style.cssText = `
        position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8);
        color: white; font-size: 0.7rem; text-align: center; padding: 2px; font-weight: 600;
      `;
      label.textContent = index + 1;

      if (frame.markers && frame.markers.length > 0) {
        const markerBadge = document.createElement('div');
        markerBadge.style.cssText = `
          position: absolute; top: 2px; right: 2px; background: #FF9800; color: white;
          border-radius: 50%; width: 16px; height: 16px; font-size: 0.6rem;
          display: flex; align-items: center; justify-content: center; font-weight: bold;
        `;
        markerBadge.textContent = frame.markers.length;
        frameDiv.appendChild(markerBadge);
      }

      frameDiv.onclick = () => this.downloadFrame(frame, index);
      frameDiv.appendChild(img);
      frameDiv.appendChild(label);
      container.appendChild(frameDiv);
    });

    const saveBtn = document.createElement('button');
    saveBtn.style.cssText = `
      padding: 0.8rem 1.5rem; background: #9C27B0; color: white; border: none;
      border-radius: 8px; cursor: pointer; font-weight: 600; width: 100%; margin-top: 1rem;
    `;
    saveBtn.textContent = `Save to Cloud Library`;
    saveBtn.onclick = () => this.saveToLibrary();

    results.appendChild(container);
    results.appendChild(saveBtn);
  }

  createMarkerSummary() {
    const allMarkers = new Set();
    this.frames.forEach(frame => {
      if (frame.markers) {
        frame.markers.forEach(marker => allMarkers.add(marker.id));
      }
    });

    if (allMarkers.size === 0) return null;

    const summary = document.createElement('div');
    summary.style.cssText = `
      background: rgba(255, 152, 0, 0.2); border: 1px solid rgba(255, 152, 0, 0.3);
      border-radius: 8px; padding: 1rem; margin-bottom: 1rem; text-align: center;
    `;

    const title = document.createElement('div');
    title.style.cssText = `color: #FF9800; font-weight: 600; margin-bottom: 0.5rem;`;
    title.textContent = 'Detected Markers';

    const markerList = document.createElement('div');
    markerList.style.cssText = `display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;`;

    Array.from(allMarkers).sort((a, b) => a - b).forEach(markerId => {
      const badge = document.createElement('span');
      badge.style.cssText = `
        background: #FF9800; color: white; padding: 0.3rem 0.6rem;
        border-radius: 12px; font-size: 0.8rem; font-weight: 600;
      `;
      badge.textContent = `ID: ${markerId}`;
      markerList.appendChild(badge);
    });

    summary.appendChild(title);
    summary.appendChild(markerList);
    return summary;
  }

  startAnimation() {
    if (this.frames.length === 0) return;

    const animFrame = document.getElementById('createAnimFrame');
    const overlay = document.getElementById('createAnimOverlay');
    
    if (overlay) overlay.style.display = 'none';
    if (animFrame) animFrame.src = this.frames[0].url;

    this.currentFrame = 0;
    this.isPlaying = true;
    
    const playBtn = document.getElementById('createPlayPause');
    if (playBtn) {
      playBtn.textContent = '⏸ Pause';
      playBtn.disabled = false;
    }
    
    const resetBtn = document.getElementById('createResetAnim');
    if (resetBtn) resetBtn.disabled = false;
    
    const speedSlider = document.getElementById('createSpeedSlider');
    if (speedSlider) speedSlider.disabled = false;

    this.animInterval = setInterval(() => {
      if (this.isPlaying && this.frames.length > 0) {
        this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        if (animFrame) animFrame.src = this.frames[this.currentFrame].url;
      }
    }, this.animSpeed);
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    const playBtn = document.getElementById('createPlayPause');
    if (playBtn) {
      playBtn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
    }
  }

  reset() {
    this.currentFrame = 0;
    this.isPlaying = false;
    
    const playBtn = document.getElementById('createPlayPause');
    if (playBtn) playBtn.textContent = '▶ Play';
    
    const animFrame = document.getElementById('createAnimFrame');
    if (animFrame && this.frames.length > 0) {
      animFrame.src = this.frames[0].url;
    }
  }

  updateSpeed() {
    const slider = document.getElementById('createSpeedSlider');
    const display = document.getElementById('createSpeedDisplay');
    
    if (slider) {
      this.animSpeed = parseInt(slider.value);
      if (display) display.textContent = this.animSpeed + 'ms';
      
      if (this.isPlaying) {
        clearInterval(this.animInterval);
        this.animInterval = setInterval(() => {
          if (this.isPlaying && this.frames.length > 0) {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            const animFrame = document.getElementById('createAnimFrame');
            if (animFrame) animFrame.src = this.frames[this.currentFrame].url;
          }
        }, this.animSpeed);
      }
    }
  }

  downloadFrame(frame, index) {
    const a = document.createElement('a');
    a.download = `frame_${index + 1}.png`;
    a.href = frame.url;
    a.click();
  }

  clearAll() {
    clearInterval(this.animInterval);
    this.isPlaying = false;
    this.currentFrame = 0;
    this.frames = [];
    this.detectedMarkers = [];

    const results = document.getElementById('createResults');
    if (results) results.innerHTML = '';
    
    const animFrame = document.getElementById('createAnimFrame');
    if (animFrame) animFrame.src = '';
    
    const overlay = document.getElementById('createAnimOverlay');
    if (overlay) overlay.style.display = 'flex';
    
    const playBtn = document.getElementById('createPlayPause');
    if (playBtn) {
      playBtn.textContent = '▶ Play';
      playBtn.disabled = true;
    }
    
    const resetBtn = document.getElementById('createResetAnim');
    if (resetBtn) resetBtn.disabled = true;
    
    const speedSlider = document.getElementById('createSpeedSlider');
    if (speedSlider) speedSlider.disabled = true;

    const resultsSection = document.getElementById('createResultsSection');
    const animSection = document.getElementById('createAnimSection');
    const clearBtn = document.getElementById('createClear');
    
    if (resultsSection) resultsSection.style.display = 'none';
    if (animSection) animSection.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'none';
  }

  showStatus(message) {
    const status = document.getElementById('createStatus');
    if (status) status.textContent = message;
  }

  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    clearInterval(this.animInterval);
    
    const backBtn = document.getElementById('closeCreateBtn');
    if (backBtn && this.backButtonHandler) {
      backBtn.removeEventListener('click', this.backButtonHandler);
    }
    
    this.frames = [];
    this.detectedMarkers = [];
  }
}
/********************************************
 * AR MANAGER WITH ANIMATION INTEGRATION
 ********************************************/

/********************************************
 * COMPLETE AR MANAGER WITH ANIMATION SELECTION
 ********************************************/

class ARManager {
  constructor() {
    // Core AR components
    this.video = null;
    this.canvas = null;
    this.context = null;
    this.detector = null;
    this.posit = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.isInitialized = false;
    this.modelSize = 35.0;
    this.stlLoader = null;
    this.stlCache = new Map();
    
    // Detection and tracking
    this.lastFrameMarkers = [];
    this.scenarioConfidence = {};
    this.CONFIDENCE_THRESHOLD = 3;
    this.lastActiveIdentifierTag = null;
    
    // 2D Overlay Animation System
    this.overlayContainer = null;
    this.activeOverlays = new Map();
    this.animationIntervals = new Map();
    
    // Animation Library Cache
    this.animationLibrary = new Map();
    this.animationsLoaded = false;
    this.loadingAnimations = false;
    
    // Animation Selection System
    this.markerAnimationPreferences = new Map();
    this.animationsByMarker = new Map();
    this.selectorMenu = null;
    this.isMenuVisible = false;
    this.currentMarkerForSelection = null;
    this.settingsButton = null;
    
    // Currently detected markers tracking
    this.currentlyDetectedMarkers = new Map(); // markerId -> marker object
    this.markersWithMultipleAnimations = new Map(); // markerId -> animations array
  }

  async init() {
    if (this.isInitialized) return;

    try {
      this.initElements();
      this.initDetector();
      await this.initCamera();
      this.initRenderer();
      this.initSTLLoader();
      this.initOverlaySystem();
      this.initAnimationSelector();
      
      // Load animations from cloud
      await this.loadAnimationsFromCloud();
      
      this.startRenderLoop();
      
      this.isInitialized = true;
      Utils.log('Complete ARManager with Animation Selection initialized successfully', 'success');
    } catch (error) {
      Utils.log(`AR initialization failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /********************************************
   * CORE AR INITIALIZATION METHODS
   ********************************************/

  initElements() {
    this.video = Utils.$('video');
    this.canvas = Utils.$('canvas');
    
    if (!this.video || !this.canvas) {
      throw new Error('AR video or canvas elements not found');
    }
    
    this.context = this.canvas.getContext('2d');
  }

  initDetector() {
    if (typeof AR === 'undefined' || typeof POS === 'undefined') {
      throw new Error('AR detection libraries not loaded');
    }
    
    this.detector = new AR.Detector();
    this.posit = new POS.Posit(this.modelSize, this.canvas.width);
    
    // Initialize scenario confidence tracking
    extendedScenarios.forEach(scenario => {
      this.scenarioConfidence[scenario.identifierTag] = 0;
    });
    
    for (let i = 6; i <= 31; i++) {
      this.scenarioConfidence[i] = 0;
    }
  }

  async initCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API not supported');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      this.video.srcObject = stream;
      await this.video.play();
      
      Utils.log('AR camera initialized', 'success');
    } catch (error) {
      throw new Error(`Camera access failed: ${error.message}`);
    }
  }

  initRenderer() {
    if (typeof THREE === 'undefined') {
      throw new Error('Three.js not loaded');
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetAspect = 16 / 9;
    const viewportAspect = viewportWidth / viewportHeight;
    
    let renderWidth, renderHeight;
    if (viewportAspect > targetAspect) {
      renderHeight = viewportHeight;
      renderWidth = Math.round(renderHeight * targetAspect);
    } else {
      renderWidth = viewportWidth;
      renderHeight = Math.round(renderWidth / targetAspect);
    }

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setSize(renderWidth, renderHeight);

    const threeContainer = Utils.$('threeContainer');
    if (threeContainer) {
      threeContainer.appendChild(this.renderer.domElement);
    }

    // Setup video texture and background
    this.videoTexture = new THREE.Texture(this.video);
    this.videoTexture.minFilter = THREE.LinearFilter;

    this.backgroundScene = new THREE.Scene();
    this.backgroundCamera = new THREE.Camera();

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.68, 2.4),
      new THREE.MeshBasicMaterial({ 
        map: this.videoTexture, 
        depthTest: false, 
        depthWrite: false 
      })
    );
    plane.material.side = THREE.DoubleSide;
    plane.position.z = -1;
    this.backgroundScene.add(this.backgroundCamera);
    this.backgroundScene.add(plane);

    // Setup main scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, renderWidth / renderHeight, 1, 1000);
    this.scene.add(this.camera);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x666666);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(0, 0, 1);
    this.scene.add(directionalLight);

    window.CV_RENDER_WIDTH = renderWidth;
    window.CV_RENDER_HEIGHT = renderHeight;

    Utils.log('AR renderer initialized', 'success');
  }

  initSTLLoader() {
    if (typeof THREE.STLLoader === 'undefined') {
      Utils.log('STL Loader not available', 'warning');
      return;
    }
    this.stlLoader = new THREE.STLLoader();
  }

  initOverlaySystem() {
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.id = 'arAnimationOverlay';
    this.overlayContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 15;
    `;
    
    const threeContainer = Utils.$('threeContainer');
    if (threeContainer) {
      threeContainer.appendChild(this.overlayContainer);
      Utils.log('2D Animation Overlay System initialized', 'success');
    }
  }

  /********************************************
   * ANIMATION SELECTION SYSTEM
   ********************************************/

  initAnimationSelector() {
    this.createSelectorMenu();
    this.createSettingsButton();
    this.loadUserPreferences();
    Utils.log('Animation Selection System initialized', 'success');
  }

  createSelectorMenu() {
    this.selectorMenu = document.createElement('div');
    this.selectorMenu.id = 'animationSelectorMenu';
    this.selectorMenu.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(145deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 20, 0.95));
      border: 2px solid #FF8C00;
      border-radius: 16px;
      padding: 1.5rem;
      z-index: 3000;
      display: none;
      color: white;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 140, 0, 0.3);
      backdrop-filter: blur(10px);
      max-width: 500px;
      max-height: 70vh;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(255, 140, 0, 0.3);
    `;

    header.innerHTML = `
      <h3 style="margin: 0; color: #FF8C00; font-size: 1.3rem; font-weight: 600;">Choose Animation</h3>
      <button onclick="window.App.arManager.hideAnimationMenu()" 
              style="background: rgba(255, 140, 0, 0.2); border: 1px solid #FF8C00; color: #FF8C00; 
                     width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; 
                     transition: all 0.3s ease;" 
              onmouseover="this.style.background='#FF8C00'; this.style.color='white';"
              onmouseout="this.style.background='rgba(255, 140, 0, 0.2)'; this.style.color='#FF8C00';">×</button>
    `;

    const subtitle = document.createElement('p');
    subtitle.id = 'animationSelectorSubtitle';
    subtitle.style.cssText = `
      margin: 0.5rem 0 0 0;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      line-height: 1.4;
    `;

    const content = document.createElement('div');
    content.id = 'animationSelectorContent';
    content.style.cssText = `
      display: grid;
      gap: 0.8rem;
      margin-top: 1rem;
    `;

    this.selectorMenu.appendChild(header);
    this.selectorMenu.appendChild(subtitle);
    this.selectorMenu.appendChild(content);

    const arScreen = document.getElementById('arScreen');
    if (arScreen) {
      arScreen.appendChild(this.selectorMenu);
    }

    // Close menu when clicking outside
    this.selectorMenu.onclick = (e) => {
      if (e.target === this.selectorMenu) {
        this.hideAnimationMenu();
      }
    };
  }

  createSettingsButton() {
    this.settingsButton = document.createElement('button');
    this.settingsButton.innerHTML = '⚙️';
    this.settingsButton.title = 'Animation Preferences';
    this.settingsButton.style.cssText = `
      background: rgba(156, 39, 176, 0.9);
      color: white;
      border: 2px solid #9C27B0;
      width: 100%;
      height: 50px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.2rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      text-transform: uppercase;
      font-weight: 700;
    `;

    this.settingsButton.onmouseover = () => {
      this.settingsButton.style.transform = 'translateY(-2px)';
      this.settingsButton.style.background = '#9C27B0';
      this.settingsButton.style.boxShadow = '0 6px 18px rgba(156, 39, 176, 0.4)';
    };

    this.settingsButton.onmouseout = () => {
      this.settingsButton.style.transform = 'translateY(0)';
      this.settingsButton.style.background = 'rgba(156, 39, 176, 0.9)';
      this.settingsButton.style.boxShadow = '0 4px 12px rgba(156, 39, 176, 0.3)';
    };

    this.settingsButton.onclick = () => this.handleSettingsButtonClick();

    // Add text to the button
    const buttonText = document.createElement('span');
    buttonText.textContent = 'Animation Settings';
    buttonText.style.fontSize = '0.8rem';
    buttonText.style.fontWeight = '700';
    
    this.settingsButton.appendChild(buttonText);

    // Find the AR sidebar and add the button before the debug button
    const arSidebar = document.querySelector('.ar-sidebar');
    const debugButton = document.getElementById('debugSideBtn');
    
    if (arSidebar && debugButton) {
      // Insert the animation settings button before the debug button
      arSidebar.insertBefore(this.settingsButton, debugButton);
    } else if (arSidebar) {
      // If no debug button found, add to end of sidebar
      arSidebar.appendChild(this.settingsButton);
    } else {
      // Fallback: add to AR screen
      const arScreen = document.getElementById('arScreen');
      if (arScreen) {
        arScreen.appendChild(this.settingsButton);
      }
    }
  }

  /********************************************
   * ANIMATION LIBRARY MANAGEMENT
   ********************************************/

  async loadAnimationsFromCloud() {
    if (this.animationsLoaded || this.loadingAnimations) {
      console.log('⏭️ Animations already loaded or loading...');
      return;
    }

    this.loadingAnimations = true;
    Utils.log('Loading animations from cloud for AR...', 'info');

    try {
      const createManager = this.getCreateManager();
      
      if (!createManager || !createManager.supabase) {
        Utils.log('CreateManager or Supabase not available, skipping animation loading', 'warning');
        this.loadingAnimations = false;
        return;
      }

      const animations = await createManager.loadAnimations();
      
      if (!animations || animations.length === 0) {
        Utils.log('No animations found in cloud', 'info');
        this.animationsLoaded = true;
        this.loadingAnimations = false;
        return;
      }
      
      // Clear existing caches
      this.animationLibrary.clear();
      this.animationsByMarker.clear();
      
      // Process and cache animations
      let successCount = 0;
      for (const animation of animations) {
        try {
          if (animation.marker_tags && animation.marker_tags.length > 0) {
            const processedAnimation = this.processAnimationData(animation);
            this.animationLibrary.set(animation.id, processedAnimation);
            
            // Group animations by marker tags
            animation.marker_tags.forEach(tag => {
              const markerId = this.normalizeMarkerId(tag);
              
              if (!this.animationsByMarker.has(markerId)) {
                this.animationsByMarker.set(markerId, []);
              }
              
              this.animationsByMarker.get(markerId).push({
                ...processedAnimation,
                id: animation.id
              });
            });
            
            Utils.log(`Cached animation "${animation.name}" with markers: ${animation.marker_tags.join(', ')}`, 'success');
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to process animation "${animation.name}":`, error);
        }
      }
      
      this.animationsLoaded = true;
      Utils.log(`Loaded ${successCount}/${animations.length} animations for AR`, 'success');
      Utils.log(`Grouped animations by ${this.animationsByMarker.size} unique markers`, 'info');
      
    } catch (error) {
      Utils.log(`Failed to load animations: ${error.message}`, 'error');
    } finally {
      this.loadingAnimations = false;
    }
  }

  processAnimationData(animation) {
    const frames = [];
    
    if (animation.frame_urls && Array.isArray(animation.frame_urls)) {
      frames.push(...animation.frame_urls.map(frameData => ({
        url: frameData.url,
        cellIndex: frameData.cell_index || 0,
        timestamp: frameData.timestamp || Date.now(),
        markers: frameData.markers || []
      })));
    }
    
    return {
      id: animation.id,
      name: animation.name,
      frames: frames,
      tags: animation.marker_tags,
      metadata: {
        frameCount: animation.frame_count,
        frameRate: animation.frame_rate || 2,
        createdAt: animation.created_at,
        ...animation.metadata
      }
    };
  }

  getCreateManager() {
    if (window.AppState && window.AppState.createManager) {
      return window.AppState.createManager;
    }
    if (window.App && window.App.createManager) {
      return window.App.createManager;
    }
    if (window.createManager) {
      return window.createManager;
    }
    return null;
  }

  normalizeMarkerId(markerId) {
    if (typeof markerId === 'string') {
      return parseInt(markerId, 10);
    }
    return markerId;
  }

  async refreshAnimations() {
    Utils.log('Refreshing animation cache...', 'info');
    this.animationsLoaded = false;
    this.animationLibrary.clear();
    this.animationsByMarker.clear();
    
    // Stop all active animations
    this.animationIntervals.forEach(intervalId => clearInterval(intervalId));
    this.animationIntervals.clear();
    this.activeOverlays.forEach(animState => animState.element.remove());
    this.activeOverlays.clear();
    
    await this.loadAnimationsFromCloud();
  }

  /********************************************
   * ANIMATION SELECTION LOGIC
   ********************************************/

  getAnimationForMarker(markerId) {
    try {
      const normalizedId = this.normalizeMarkerId(markerId);
      const animations = this.animationsByMarker.get(normalizedId);

      if (!animations || animations.length === 0) {
        // Remove from multiple animations tracking if it was there
        this.markersWithMultipleAnimations.delete(normalizedId);
        return null;
      }

      if (animations.length === 1) {
        // Only one animation available - use it directly
        this.markersWithMultipleAnimations.delete(normalizedId);
        return animations[0];
      }

      // Multiple animations available - track this marker but don't show menu automatically
      this.markersWithMultipleAnimations.set(normalizedId, animations);

      // Check user preference
      const preferredAnimationId = this.markerAnimationPreferences.get(normalizedId);
      
      if (preferredAnimationId) {
        const preferredAnimation = animations.find(anim => anim.id === preferredAnimationId);
        if (preferredAnimation) {
          return preferredAnimation;
        }
      }

      // No preference set - return first animation as default (menu will only show when button pressed)
      return animations[0];
      
    } catch (error) {
      Utils.log(`Error getting animation for marker ${markerId}: ${error.message}`, 'error');
      return null;
    }
  }

  showAnimationSelectionMenu(markerId, animations) {
    // Only show selection menu if there are multiple animations
    if (!animations || animations.length <= 1) {
      return;
    }

    if (this.isMenuVisible && this.currentMarkerForSelection === markerId) {
      return; // Menu already open for this marker
    }

    this.currentMarkerForSelection = markerId;
    this.isMenuVisible = true;

    // Update subtitle
    const subtitle = document.getElementById('animationSelectorSubtitle');
    if (subtitle) {
      subtitle.textContent = `Multiple animations available for Marker ID: ${markerId}. Select your preferred animation (menu stays open for easy switching):`;
    }

    // Determine which animation is currently selected
    const currentPreference = this.markerAnimationPreferences.get(markerId);
    let currentlySelectedAnimation = null;
    
    if (currentPreference) {
      currentlySelectedAnimation = animations.find(anim => anim.id === currentPreference);
    }
    
    // If no preference or preference not found, default to first animation
    if (!currentlySelectedAnimation) {
      currentlySelectedAnimation = animations[0];
    }

    // Clear and populate content
    const content = document.getElementById('animationSelectorContent');
    content.innerHTML = '';

    animations.forEach((animation) => {
      const isCurrentlySelected = animation.id === currentlySelectedAnimation.id;
      const optionCard = this.createAnimationOptionCard(animation, markerId, isCurrentlySelected);
      content.appendChild(optionCard);
    });

    // Show menu with animation
    this.selectorMenu.style.display = 'block';
    this.selectorMenu.style.opacity = '0';
    this.selectorMenu.style.transform = 'translate(-50%, -50%) scale(0.8)';
    this.selectorMenu.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      this.selectorMenu.style.opacity = '1';
      this.selectorMenu.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);

    Utils.log(`Showing animation selection menu for marker ${markerId} with ${animations.length} options, currently selected: ${currentlySelectedAnimation.name}`, 'info');
  }

  showNoAnimationsMessage(markerId) {
    // Create temporary "no animations" notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 69, 0, 0.9);
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      z-index: 2500;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      opacity: 0;
      transition: all 0.3s ease;
    `;
    
    notification.textContent = `No animations available for Marker ID: ${markerId}`;
    
    const arScreen = document.getElementById('arScreen');
    if (arScreen) {
      arScreen.appendChild(notification);
    } else {
      document.body.appendChild(notification);
    }
    
    // Show with animation
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(-50%) translateY(10px)';
    }, 10);
    
    // Auto-hide after 2 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(-50%) translateY(-10px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);

    Utils.log(`No animations found for marker ${markerId}`, 'info');
  }

  createAnimationOptionCard(animation, markerId, isSelected = false) {
    const card = document.createElement('div');
    card.className = 'animation-option-card';
    card.style.cssText = `
      background: ${isSelected ? 'rgba(255, 140, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
      border: 2px solid ${isSelected ? '#FF8C00' : 'rgba(255, 255, 255, 0.1)'};
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      gap: 1rem;
      align-items: center;
    `;

    card.onmouseover = () => {
      if (!card.classList.contains('selected')) {
        card.style.background = 'rgba(255, 140, 0, 0.1)';
        card.style.borderColor = 'rgba(255, 140, 0, 0.5)';
      }
    };

    card.onmouseout = () => {
      if (!card.classList.contains('selected')) {
        card.style.background = 'rgba(255, 255, 255, 0.05)';
        card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }
    };

    // Preview image container with selection button in TOP-LEFT corner
    const preview = document.createElement('div');
    preview.className = 'animation-preview';
    preview.style.cssText = `
      width: 80px; height: 60px; background: rgba(0, 0, 0, 0.3); border-radius: 8px;
      display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;
      position: relative;
    `;

    // Selection button positioned in TOP-LEFT corner of preview (camera view)
    const selectionButton = document.createElement('div');
    selectionButton.className = 'selection-indicator';
    selectionButton.style.cssText = `
      position: absolute;
      top: 4px;
      left: 4px;
      width: 20px;
      height: 20px;
      border: 3px solid ${isSelected ? '#FF8C00' : 'rgba(255, 140, 0, 0.8)'};
      border-radius: 50%;
      background: ${isSelected ? '#FF8C00' : 'transparent'};
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      z-index: 10;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
      cursor: pointer;
    `;

    if (isSelected) {
      const checkmark = document.createElement('div');
      checkmark.style.cssText = `
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      `;
      selectionButton.appendChild(checkmark);
      card.classList.add('selected');
    }

    if (animation.frames && animation.frames.length > 0 && animation.frames[0].url) {
      const img = document.createElement('img');
      img.src = animation.frames[0].url;
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 6px;';
      img.onerror = () => {
        preview.innerHTML = '<span style="color: rgba(255,255,255,0.5); font-size: 0.8rem;">No Preview</span>';
        preview.appendChild(selectionButton); // Re-add button after error
      };
      preview.appendChild(img);
    } else {
      preview.innerHTML = '<span style="color: rgba(255,255,255,0.5); font-size: 0.8rem;">No Preview</span>';
    }

    // Add selection button to TOP-LEFT of preview
    preview.appendChild(selectionButton);

    // Animation info
    const info = document.createElement('div');
    info.style.cssText = 'flex: 1; min-width: 0;';

    const name = document.createElement('div');
    name.textContent = animation.name || 'Unnamed Animation';
    name.style.cssText = 'font-weight: 600; color: white; margin-bottom: 0.3rem; font-size: 1rem;';

    const details = document.createElement('div');
    details.style.cssText = 'color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; line-height: 1.3;';

    const frameCount = animation.frames ? animation.frames.length : 0;
    const frameRate = animation.metadata?.frameRate || 2;
    const createdAt = animation.metadata?.createdAt ? 
      new Date(animation.metadata.createdAt).toLocaleDateString() : 'Unknown';

    details.innerHTML = `${frameCount} frames • ${frameRate.toFixed(1)} FPS<br>
      <span style="font-size: 0.75rem; opacity: 0.8;">Created: ${createdAt}</span>`;

    info.appendChild(name);
    info.appendChild(details);
    
    card.appendChild(preview);
    card.appendChild(info);

    card.onclick = () => this.selectAnimation(markerId, animation.id, card);

    return card;
  }

  selectAnimation(markerId, animationId, selectedCard) {
    // Update preference
    this.markerAnimationPreferences.set(markerId, animationId);
    this.saveUserPreferences();

    // Update UI to show new selection
    const content = document.getElementById('animationSelectorContent');
    const cards = content.querySelectorAll('.animation-option-card');
    
    cards.forEach(card => {
      // Find the indicator (positioned absolutely in the preview container)
      const preview = card.querySelector('.animation-preview');
      const indicator = preview ? preview.querySelector('.selection-indicator') : null;
      
      if (card === selectedCard) {
        // Selected card styling
        card.style.background = 'rgba(255, 140, 0, 0.2)';
        card.style.borderColor = '#FF8C00';
        card.classList.add('selected');
        
        // Update indicator for selected state
        if (indicator) {
          indicator.style.borderColor = '#FF8C00';
          indicator.style.background = '#FF8C00';
          indicator.innerHTML = '<div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>';
        }
      } else {
        // Unselected card styling
        card.style.background = 'rgba(255, 255, 255, 0.05)';
        card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        card.classList.remove('selected');
        
        // Update indicator for unselected state
        if (indicator) {
          indicator.style.borderColor = 'rgba(255, 255, 255, 0.6)';
          indicator.style.background = 'transparent';
          indicator.innerHTML = '';
        }
      }
    });

    // Get animation name for feedback
    const animations = this.animationsByMarker.get(markerId);
    const selectedAnimation = animations.find(anim => anim.id === animationId);
    const animationName = selectedAnimation ? selectedAnimation.name : 'animation';

    Utils.log(`Selected animation ${animationId} for marker ${markerId}`, 'success');

    // Show brief feedback that the selection changed
    this.showSelectionFeedback(markerId, animationName);

    // Immediately refresh the animation without closing the menu
    this.stop2DAnimation(markerId);
    
    // The new animation will start on the next frame when the marker is detected again
    // Menu stays open for further selections if needed
  }

  showSelectionFeedback(markerId, animationName) {
    // Create brief feedback notification
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 15%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(76, 175, 80, 0.9);
      color: white;
      padding: 0.8rem 1.5rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      z-index: 3500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(5px);
      opacity: 0;
      transition: all 0.3s ease;
    `;
    
    feedback.textContent = `✓ Now playing: ${animationName}`;
    
    const arScreen = document.getElementById('arScreen');
    if (arScreen) {
      arScreen.appendChild(feedback);
    } else {
      document.body.appendChild(feedback);
    }
    
    // Show with animation
    setTimeout(() => {
      feedback.style.opacity = '1';
      feedback.style.transform = 'translateX(-50%) translateY(5px)';
    }, 10);
    
    // Auto-hide after 1.5 seconds
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translateX(-50%) translateY(-5px)';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }, 1500);
  }

  hideAnimationMenu() {
    if (!this.isMenuVisible) return;

    this.selectorMenu.style.opacity = '0';
    this.selectorMenu.style.transform = 'translate(-50%, -50%) scale(0.8)';
    
    setTimeout(() => {
      this.selectorMenu.style.display = 'none';
      this.isMenuVisible = false;
      this.currentMarkerForSelection = null;
    }, 300);
  }

  handleSettingsButtonClick() {
    // Check for currently detected markers with multiple animations
    const markersWithMultiple = Array.from(this.markersWithMultipleAnimations.keys());
    
    if (markersWithMultiple.length === 0) {
      // No markers with multiple animations detected
      this.showNoMultipleAnimationsMessage();
      return;
    }
    
    if (markersWithMultiple.length === 1) {
      // Only one marker with multiple animations - show selection menu directly
      const markerId = markersWithMultiple[0];
      const animations = this.markersWithMultipleAnimations.get(markerId);
      this.showAnimationSelectionMenu(markerId, animations);
      return;
    }
    
    // Multiple markers with multiple animations - show marker selection menu
    this.showMarkerSelectionMenu(markersWithMultiple);
  }

  showNoMultipleAnimationsMessage() {
    let message = 'No markers with multiple animations detected.';
    
    if (this.currentlyDetectedMarkers.size === 0) {
      message = 'No markers detected. Point camera at a marker first.';
    } else {
      const detectedIds = Array.from(this.currentlyDetectedMarkers.keys());
      message = `Detected markers (${detectedIds.join(', ')}) don't have multiple animations available.`;
    }
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 152, 0, 0.9);
      color: white;
      padding: 1.2rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      z-index: 3500;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      opacity: 0;
      transition: all 0.3s ease;
      max-width: 400px;
      text-align: center;
    `;
    
    notification.textContent = message;
    
    const arScreen = document.getElementById('arScreen');
    if (arScreen) {
      arScreen.appendChild(notification);
    } else {
      document.body.appendChild(notification);
    }
    
    // Show with animation
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(-50%) translateY(10px)';
    }, 10);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(-50%) translateY(-10px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  showMarkerSelectionMenu(markerIds) {
    const existingMenu = document.getElementById('markerSelectionMenu');
    if (existingMenu) {
      existingMenu.remove();
    }

    const markerMenu = document.createElement('div');
    markerMenu.id = 'markerSelectionMenu';
    markerMenu.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(145deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 20, 0.95));
      border: 2px solid #FF8C00;
      border-radius: 16px;
      padding: 2rem;
      z-index: 3000;
      color: white;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 140, 0, 0.3);
      backdrop-filter: blur(10px);
      max-width: 500px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const header = document.createElement('div');
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="margin: 0; color: #FF8C00; font-size: 1.4rem;">Choose Marker</h3>
        <button onclick="document.getElementById('markerSelectionMenu').remove()" 
                style="background: rgba(255, 140, 0, 0.2); border: 1px solid #FF8C00; color: #FF8C00; 
                       width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 1.2rem;">×</button>
      </div>
      <p style="margin: 0 0 1.5rem 0; color: rgba(255, 255, 255, 0.8); line-height: 1.4;">
        Multiple markers with animation choices detected. Select which marker to configure:
      </p>
    `;

    const content = document.createElement('div');
    content.style.cssText = 'display: grid; gap: 1rem;';

    markerIds.forEach(markerId => {
      const animations = this.markersWithMultipleAnimations.get(markerId);
      const selectedAnimationId = this.markerAnimationPreferences.get(markerId);
      const selectedAnimation = selectedAnimationId ? 
        animations.find(a => a.id === selectedAnimationId) : animations[0];

      const markerCard = document.createElement('div');
      markerCard.style.cssText = `
        background: rgba(255, 140, 0, 0.1);
        border: 2px solid rgba(255, 140, 0, 0.3);
        border-radius: 12px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;

      markerCard.onmouseover = () => {
        markerCard.style.background = 'rgba(255, 140, 0, 0.2)';
        markerCard.style.borderColor = '#FF8C00';
      };

      markerCard.onmouseout = () => {
        markerCard.style.background = 'rgba(255, 140, 0, 0.1)';
        markerCard.style.borderColor = 'rgba(255, 140, 0, 0.3)';
      };

      markerCard.innerHTML = `
        <div>
          <div style="color: white; font-weight: 600; margin-bottom: 0.3rem;">Marker ID: ${markerId}</div>
          <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">
            Current: ${selectedAnimation.name} (${animations.length} available)
          </div>
        </div>
        <div style="color: #FF8C00; font-size: 1.2rem;">→</div>
      `;

      markerCard.onclick = () => {
        document.getElementById('markerSelectionMenu').remove();
        this.showAnimationSelectionMenu(markerId, animations);
      };

      content.appendChild(markerCard);
    });

    markerMenu.appendChild(header);
    markerMenu.appendChild(content);
    document.body.appendChild(markerMenu);

    markerMenu.onclick = (e) => {
      if (e.target === markerMenu) markerMenu.remove();
    };
  }

  resetMarkerPreference(markerId) {
    // Remove current preference to trigger selection menu on next scan
    this.markerAnimationPreferences.delete(markerId);
    this.saveUserPreferences();
    
    // Close settings menu
    const settingsMenu = document.getElementById('animationSettingsMenu');
    if (settingsMenu) {
      settingsMenu.remove();
    }
    
    // Stop current animation and show selection menu if animations exist
    this.stop2DAnimation(markerId);
    const animations = this.animationsByMarker.get(markerId);
    if (animations && animations.length > 1) {
      // Show selection menu immediately
      setTimeout(() => {
        this.showAnimationSelectionMenu(markerId, animations);
      }, 300);
    }
    
    Utils.log(`Reset animation preference for marker ${markerId} - selection menu will appear on next scan`, 'info');
  }

  saveUserPreferences() {
    try {
      const preferences = {};
      this.markerAnimationPreferences.forEach((animationId, markerId) => {
        preferences[markerId] = animationId;
      });
      localStorage.setItem('automatAR_animationPreferences', JSON.stringify(preferences));
    } catch (error) {
      Utils.log('Failed to save user preferences', 'warning');
    }
  }

  loadUserPreferences() {
    try {
      const saved = localStorage.getItem('automatAR_animationPreferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        Object.entries(preferences).forEach(([markerId, animationId]) => {
          this.markerAnimationPreferences.set(parseInt(markerId), animationId);
        });
        Utils.log(`Loaded ${Object.keys(preferences).length} animation preferences`, 'info');
      }
    } catch (error) {
      Utils.log('Failed to load user preferences', 'warning');
    }
  }

  /********************************************
   * 2D ANIMATION OVERLAY SYSTEM
   ********************************************/

  start2DAnimation(markerId, animation, marker) {
    this.stop2DAnimation(markerId);

    Utils.log(`Starting 2D animation "${animation.name}" for marker ${markerId}`, 'success');

    const overlay = document.createElement('div');
    overlay.className = 'ar-animation-overlay';
    overlay.style.cssText = `
      position: absolute;
      width: 200px;
      height: 200px;
      border-radius: 8px;
      overflow: hidden;
      display: none;
      transition: all 0.3s ease;
    `;

    const img = document.createElement('img');
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
    `;

    overlay.appendChild(img);
    this.overlayContainer.appendChild(overlay);

    const animState = {
      element: overlay,
      img: img,
      animation: animation,
      currentFrame: 0,
      marker: marker
    };

    this.activeOverlays.set(markerId, animState);

    const frameInterval = 1000 / (animation.metadata.frameRate || 2);
    const intervalId = setInterval(() => {
      this.updateOverlayFrame(markerId);
    }, frameInterval);

    this.animationIntervals.set(markerId, intervalId);

    this.positionOverlay(markerId, marker);
    this.updateOverlayFrame(markerId);
  }

  updateOverlayFrame(markerId) {
    const animState = this.activeOverlays.get(markerId);
    if (!animState) return;

    animState.currentFrame = (animState.currentFrame + 1) % animState.animation.frames.length;
    
    const currentFrame = animState.animation.frames[animState.currentFrame];
    if (currentFrame && currentFrame.url) {
      animState.img.src = currentFrame.url;
    }
  }

  positionOverlay(markerId, marker) {
    const animState = this.activeOverlays.get(markerId);
    if (!animState || !marker) return;

    try {
      const centerX = marker.corners.reduce((sum, c) => sum + c.x, 0) / 4;
      const centerY = marker.corners.reduce((sum, c) => sum + c.y, 0) / 4;

      const container = Utils.$('threeContainer');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scaleX = rect.width / this.canvas.width;
      const scaleY = rect.height / this.canvas.height;

      const screenX = centerX * scaleX;
      const screenY = centerY * scaleY;

      animState.element.style.left = (screenX - 100) + 'px';
      animState.element.style.top = (screenY - 100) + 'px';
      animState.element.style.display = 'block';
      
    } catch (error) {
      animState.element.style.display = 'none';
    }
  }

  stop2DAnimation(markerId) {
    const intervalId = this.animationIntervals.get(markerId);
    if (intervalId) {
      clearInterval(intervalId);
      this.animationIntervals.delete(markerId);
    }

    const animState = this.activeOverlays.get(markerId);
    if (animState) {
      animState.element.remove();
      this.activeOverlays.delete(markerId);
    }
  }

  updateAllAnimations() {
    this.activeOverlays.forEach((animState, markerId) => {
      if (animState.marker) {
        this.positionOverlay(markerId, animState.marker);
      }
    });
  }

  /********************************************
   * 3D MODEL SYSTEM
   ********************************************/

  getDirectModelForMarker(markerId) {
    // Direct mapping of marker IDs to 3D models
    const directModelMap = {
      0: "sea_models/stringray.stl",
      1: "sea_models/jellyfish.stl", 
      2: "sea_models/dolphin.stl",
      3: "sea_models/octopus.stl",
      4: "sea_models/fishes.stl",
      5: "sea_models/sea_turtle.stl",
      6: "sea_models/stringray.stl",
      7: "octopus_exotic_tropic_0409194610_texture.stl",
      8: "coral_reef_fish_uniqu_0409193350_texture.stl", 
      9: "marine_animal_exotic__0409191724_texture.stl",
      10: "jellyfish_exotic_trop_0409193559_texture.stl",
      11: "sea_models/sea_turtle.stl",
      15: "octopus_baby_exotic_t_0409195159_texture.stl",
      31: "fish_tropical_0409190013_texture.stl"
    };
    
    return directModelMap[markerId] || null;
  }

  placeObject(marker, stlRelativePath) {
    if (!this.stlLoader) return;

    const stlFullPath = `models/${stlRelativePath}`;
    
    const corners = marker.corners.map(corner => ({
      x: corner.x - (this.canvas.width / 2),
      y: (this.canvas.height / 2) - corner.y
    }));

    const pose = this.posit.pose(corners);

    this.loadSTL(stlFullPath, (geometry) => {
      geometry.computeBoundingBox();
      const min = geometry.boundingBox.min;
      const max = geometry.boundingBox.max;
      const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
      const offset = center.clone().multiplyScalar(-1);

      if (geometry.isBufferGeometry) {
        geometry.translate(offset.x, offset.y, offset.z);
      } else {
        const mat = new THREE.Matrix4().makeTranslation(offset.x, offset.y, offset.z);
        geometry.applyMatrix(mat);
      }

      const material = new THREE.MeshPhongMaterial({ color: 0xD4A574 });
      const mesh = new THREE.Mesh(geometry, material);

      const scaleFactor = 0.05 * this.modelSize * 0.02;
      mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

      const r = pose.bestRotation;
      mesh.rotation.x = -Math.asin(-r[1][2]);
      mesh.rotation.y = -Math.atan2(r[0][2], r[2][2]);
      mesh.rotation.z = Math.atan2(r[1][0], r[1][1]);

      mesh.position.x = pose.bestTranslation[0];
      mesh.position.y = pose.bestTranslation[1];
      mesh.position.z = -pose.bestTranslation[2];

      this.scene.add(mesh);
    });
  }

  loadSTL(path, callback) {
    if (this.stlCache.has(path)) {
      callback(this.stlCache.get(path));
      return;
    }

    this.stlLoader.load(path, (geometry) => {
      this.stlCache.set(path, geometry);
      callback(geometry);
    }, undefined, (error) => {
      Utils.log(`STL load failed: ${path}`, 'error');
    });
  }

  /********************************************
   * CORE AR RENDERING AND SCENE MANAGEMENT
   ********************************************/

  startRenderLoop() {
    const render = () => {
      requestAnimationFrame(render);
      this.tick();
    };
    render();
  }

  tick() {
    if (this.video.readyState !== this.video.HAVE_ENOUGH_DATA) return;

    try {
      this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      if (this.videoTexture) this.videoTexture.needsUpdate = true;

      const markers = this.detector.detect(imageData);

      this.updateScene(markers);
      this.updateAllAnimations();

      this.renderer.autoClear = false;
      this.renderer.clear();
      this.renderer.render(this.backgroundScene, this.backgroundCamera);
      this.renderer.render(this.scene, this.camera);

      this.lastFrameMarkers = markers.slice();
      this.updateDebugInfo(markers);
    } catch (error) {
      Utils.log(`AR render error: ${error.message}`, 'error');
    }
  }

  updateScene(markers) {
    // Clear existing 3D objects (keep lights and camera)
    while (this.scene.children.length > 3) {
      this.scene.remove(this.scene.children[3]);
    }

    const markerMap = new Map();
    markers.forEach(marker => markerMap.set(marker.id, marker));

    // Update currently detected markers tracking
    this.currentlyDetectedMarkers.clear();
    markers.forEach(marker => {
      this.currentlyDetectedMarkers.set(marker.id, marker);
    });

    // Stop animations for markers that are no longer visible
    for (let markerId of this.activeOverlays.keys()) {
      if (!markerMap.has(markerId)) {
        this.stop2DAnimation(markerId);
      }
    }

    // Update confidence for visible scenarios
    const visibleScenarioIDs = [];
    extendedScenarios.forEach(scenario => {
      if (markerMap.has(scenario.identifierTag)) {
        visibleScenarioIDs.push(scenario.identifierTag);
      }
    });

    // Update confidence tracking
    for (let sid in this.scenarioConfidence) {
      if (visibleScenarioIDs.includes(parseInt(sid))) {
        this.scenarioConfidence[sid]++;
      } else {
        this.scenarioConfidence[sid] = 0;
      }
    }

    // Find best scenario
    let bestScenarioID = null;
    let bestConfidence = 0;
    for (let sid in this.scenarioConfidence) {
      const confidence = this.scenarioConfidence[sid];
      if (confidence >= this.CONFIDENCE_THRESHOLD && confidence > bestConfidence) {
        bestConfidence = confidence;
        bestScenarioID = parseInt(sid);
      }
    }

    if (bestScenarioID !== null) {
      this.lastActiveIdentifierTag = bestScenarioID;
    }

    // Process each detected marker
    markers.forEach(marker => {
      const markerId = marker.id;
      
      // Check for animations first
      const animation = this.getAnimationForMarker(markerId);
      
      if (animation) {
        // Display 2D animation overlay
        if (!this.activeOverlays.has(markerId)) {
          this.start2DAnimation(markerId, animation, marker);
        } else {
          // Update position for existing animation
          this.positionOverlay(markerId, marker);
          const animState = this.activeOverlays.get(markerId);
          if (animState) {
            animState.marker = marker;
          }
        }
      } else {
        // Fall back to 3D models if no animation
        const directModel = this.getDirectModelForMarker(markerId);
        if (directModel) {
          this.placeObject(marker, directModel);
        } else {
          // Legacy scenario-based system
          const activeScenario = extendedScenarios.find(s => s.identifierTag === bestScenarioID);
          if (activeScenario) {
            activeScenario.objects.forEach(obj => {
              const scenarioMarker = markerMap.get(obj.tag);
              if (scenarioMarker && scenarioMarker.id === markerId) {
                this.placeObject(scenarioMarker, obj.stl);
              }
            });
          }
        }
      }
    });

    this.updateKitInfo(markers);
  }

  updateKitInfo(markers) {
    const kitNameEl = Utils.$('arKitName');
    const kitDescEl = Utils.$('arKitDesc');

    if (markers.length > 0) {
      const markerInfos = [];
      let animationCount = 0;
      let modelCount = 0;
      let multipleAvailable = 0;
      let noAnimationCount = 0;
      
      markers.forEach(marker => {
        const animations = this.animationsByMarker.get(marker.id);
        if (animations && animations.length > 0) {
          if (animations.length > 1) {
            multipleAvailable++;
            const selected = this.markerAnimationPreferences.get(marker.id);
            const selectedAnim = animations.find(a => a.id === selected);
            markerInfos.push(`${selectedAnim ? selectedAnim.name : animations[0].name} (${animations.length} available) - ID: ${marker.id}`);
          } else {
            markerInfos.push(`Animation: "${animations[0].name}" (ID: ${marker.id})`);
          }
          animationCount++;
        } else {
          // Check if it's a known 3D model scenario
          const activeScenario = extendedScenarios.find(s => s.identifierTag === marker.id);
          if (activeScenario) {
            markerInfos.push(`Model: ${activeScenario.name} (ID: ${marker.id})`);
            modelCount++;
          } else {
            markerInfos.push(`Marker ID: ${marker.id} (no content)`);
            noAnimationCount++;
          }
        }
      });

      if (kitNameEl) kitNameEl.textContent = markerInfos.join(', ');
      if (kitDescEl) {
        let description = '';
        
        if (animationCount > 0) {
          description += `${animationCount} animation(s)`;
        }
        
        if (modelCount > 0) {
          if (description) description += ' and ';
          description += `${modelCount} 3D model(s)`;
        }
        
        if (!description) {
          description = 'No content available for detected markers';
        } else {
          description = `Displaying ${description}`;
        }
        
        if (multipleAvailable > 0) {
          description += ` • ${multipleAvailable} marker(s) have multiple animations`;
        }
        
        if (noAnimationCount > 0) {
          description += ` • ${noAnimationCount} marker(s) have no animations`;
        }
        
        if (this.animationLibrary.size > 0) {
          description += ` • ${this.animationLibrary.size} animations cached`;
        }
        
        kitDescEl.textContent = description;
      }
    } else {
      if (kitNameEl) kitNameEl.textContent = 'No markers detected';
      if (kitDescEl) {
        let description = 'Point your camera at a marker to see content';
        if (this.animationLibrary.size > 0) {
          description += ` • ${this.animationLibrary.size} animations ready`;
        }
        kitDescEl.textContent = description;
      }
    }
  }

  updateDebugInfo(markers) {
    const overlay = Utils.$('debugOverlay');
    if (!overlay || !overlay.classList.contains('visible')) return;

    const debugCanvas = Utils.$('debugCanvas');
    const markerInfo = Utils.$('markerInfo');
    
    if (debugCanvas) {
      const debugCtx = debugCanvas.getContext('2d');
      debugCtx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
      debugCtx.drawImage(this.canvas, 0, 0);

      debugCtx.strokeStyle = 'lime';
      debugCtx.lineWidth = 2;
      markers.forEach(marker => {
        const c = marker.corners;
        debugCtx.beginPath();
        debugCtx.moveTo(c[0].x, c[0].y);
        debugCtx.lineTo(c[1].x, c[1].y);
        debugCtx.lineTo(c[2].x, c[2].y);
        debugCtx.lineTo(c[3].x, c[3].y);
        debugCtx.closePath();
        debugCtx.stroke();

        debugCtx.fillStyle = 'yellow';
        debugCtx.font = '12px Arial';
        const animation = this.getAnimationForMarker(marker.id);
        const text = animation ? `ID:${marker.id} (ANIM)` : `ID:${marker.id}`;
        debugCtx.fillText(text, c[0].x, c[0].y - 5);
      });
    }

    if (markerInfo) {
      let text = markers.length === 0 ? 'No markers detected.\n' : '';
      text += `Active 2D animations: ${this.activeOverlays.size}\n`;
      text += `Animation cache: ${this.animationLibrary.size}\n`;
      markers.forEach(marker => {
        const animation = this.getAnimationForMarker(marker.id);
        if (animation) {
          text += `Marker ID ${marker.id} - Playing: "${animation.name}"\n`;
        } else {
          text += `Marker ID ${marker.id} - 3D Model\n`;
        }
      });
      markerInfo.textContent = text;
    }
  }

  /********************************************
   * PUBLIC AR INTERFACE METHODS
   ********************************************/

  startExperience() {
    Utils.addClass('arInitialOverlay', 'hidden');
    if (!this.isInitialized) {
      this.init().catch(error => {
        Utils.log(`Failed to start AR: ${error.message}`, 'error');
        NotificationManager.show('Failed to start AR experience', 'error');
      });
    } else {
      // Refresh animations in case new ones were created
      this.refreshAnimations().catch(error => {
        Utils.log(`Failed to refresh animations: ${error.message}`, 'warning');
      });
    }
  }

  toggleDebug() {
    const overlay = Utils.$('debugOverlay');
    if (overlay) {
      overlay.classList.toggle('visible');
      const canvas = Utils.$('canvas');
      if (canvas) {
        canvas.style.display = overlay.classList.contains('visible') ? 'block' : 'none';
      }
    }
  }

  handleResize() {
    if (!this.renderer || !this.camera) return;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetAspect = 16 / 9;
    const viewportAspect = viewportWidth / viewportHeight;
    
    let renderWidth, renderHeight;
    if (viewportAspect > targetAspect) {
      renderHeight = viewportHeight;
      renderWidth = Math.round(renderHeight * targetAspect);
    } else {
      renderWidth = viewportWidth;
      renderHeight = Math.round(renderWidth / targetAspect);
    }
    
    this.renderer.setSize(renderWidth, renderHeight);
    this.camera.aspect = renderWidth / renderHeight;
    this.camera.updateProjectionMatrix();
    
    window.CV_RENDER_WIDTH = renderWidth;
    window.CV_RENDER_HEIGHT = renderHeight;
  }

  cleanup() {
    this.animationIntervals.forEach(intervalId => clearInterval(intervalId));
    this.animationIntervals.clear();
    this.activeOverlays.clear();
    
    // Clear animation caches
    this.animationLibrary.clear();
    this.animationsByMarker.clear();
    this.animationsLoaded = false;
    this.loadingAnimations = false;
    
    // Clear marker tracking
    this.currentlyDetectedMarkers.clear();
    this.markersWithMultipleAnimations.clear();
    
    // Clean up selection menu
    if (this.selectorMenu) {
      this.selectorMenu.remove();
      this.selectorMenu = null;
    }
    
    if (this.settingsButton) {
      this.settingsButton.remove();
      this.settingsButton = null;
    }
    
    this.isMenuVisible = false;
    this.currentMarkerForSelection = null;
    
    if (this.overlayContainer) {
      this.overlayContainer.remove();
      this.overlayContainer = null;
    }

    if (this.video && this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(track => track.stop());
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    this.stlCache.clear();
    this.isInitialized = false;
    
    Utils.log('Complete ARManager cleaned up', 'info');
  }
}

/********************************************
 * PDF MANAGER
 ********************************************/

// FIXED: Direct download without file existence check
class PDFManager {
  static downloadManual(manualNumber) {
    const kitNames = {
      '1': 'Cam-A Rotational Motion Manual',
      '2': 'Cam-C Intermittent Motion Manual',
      '3': 'Crank Reciprocating Motion Manual',
      '4': 'Gear-A Bevel Gears Manual',
      '5': 'Gear-B Variable Speed Manual',
      '6': 'Gear-C Worm Gears Manual'
    };

    const pdfPath = `manuels/${manualNumber}.pdf`;
    const kitName = kitNames[manualNumber] || 'Manual';

    try {
      // Create download link immediately (no file check)
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfPath;
      downloadLink.download = `AutomatAR_${kitName.replace(/\s+/g, '_')}.pdf`;
      downloadLink.target = '_blank'; // Fallback for browsers that don't support download
      
      // Add to DOM temporarily and trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Show success notification
      NotificationManager.show(`Downloading ${kitName}...`, 'success');
      Utils.log(`Download initiated: ${kitName}`, 'success');
      
    } catch (error) {
      Utils.log(`Download failed: ${error.message}`, 'error');
      NotificationManager.show('Download failed. Please try again.', 'error');
    }
  }

  // Alternative method with error handling after download attempt
  static downloadManualWithErrorHandling(manualNumber) {
    const kitNames = {
      '1': 'Cam-A Rotational Motion Manual',
      '2': 'Cam-C Intermittent Motion Manual',
      '3': 'Crank Reciprocating Motion Manual',
      '4': 'Gear-A Bevel Gears Manual',
      '5': 'Gear-B Variable Speed Manual',
      '6': 'Gear-C Worm Gears Manual'
    };

    const pdfPath = `manuels/${manualNumber}.pdf`;
    const kitName = kitNames[manualNumber] || 'Manual';

    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfPath;
    downloadLink.download = `AutomatAR_${kitName.replace(/\s+/g, '_')}.pdf`;
    downloadLink.target = '_blank';
    
    // Handle download errors
    downloadLink.onerror = function() {
      NotificationManager.show(`${kitName} not found. Please contact support.`, 'error');
      Utils.log(`Manual not found: ${pdfPath}`, 'error');
    };
    
    // Handle successful download start
    downloadLink.onclick = function() {
      NotificationManager.show(`Downloading ${kitName}...`, 'success');
      Utils.log(`Download started: ${kitName}`, 'success');
    };
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}

// SIMPLE VERSION: Just direct download
function downloadManualPDF(manualNumber) {
  const kitNames = {
    '1': 'Cam-A_Manual',
    '2': 'Cam-C_Manual', 
    '3': 'Crank_Manual',
    '4': 'Gear-A_Manual',
    '5': 'Gear-B_Manual',
    '6': 'Gear-C_Manual'
  };

  const pdfPath = `manuels/${manualNumber}.pdf`;
  const fileName = `AutomatAR_${kitNames[manualNumber] || 'Manual'}.pdf`;

  // Create and trigger download
  const a = document.createElement('a');
  a.href = pdfPath;
  a.download = fileName;
  a.target = '_blank';
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Show notification
  console.log(`Download initiated: ${fileName}`);
  if (typeof NotificationManager !== 'undefined') {
    NotificationManager.show(`Downloading ${fileName}...`, 'success');
  }
}

// ALTERNATIVE: Open in new tab if download fails
function downloadOrOpenManual(manualNumber) {
  const pdfPath = `manuels/${manualNumber}.pdf`;
  
  // Try download first
  const downloadLink = document.createElement('a');
  downloadLink.href = pdfPath;
  downloadLink.download = `AutomatAR_Manual_${manualNumber}.pdf`;
  
  // If download doesn't work, it will open in new tab due to target="_blank"
  downloadLink.target = '_blank';
  
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  console.log(`Manual ${manualNumber} download/open initiated`);
}

// DEBUGGING VERSION: Check what's happening
function debugDownloadManual(manualNumber) {
  const pdfPath = `manuels/${manualNumber}.pdf`;
  
  console.log('=== DOWNLOAD DEBUG ===');
  console.log('Manual Number:', manualNumber);
  console.log('PDF Path:', pdfPath);
  console.log('Full URL:', window.location.origin + '/' + pdfPath);
  console.log('Current Location:', window.location.href);
  
  // Test if we can access the file
  const img = new Image();
  img.onload = function() {
    console.log('✅ File exists and is accessible');
    proceedWithDownload();
  };
  img.onerror = function() {
    console.log('❌ File not accessible as image, trying direct download anyway...');
    proceedWithDownload();
  };
  img.src = pdfPath;
  
  function proceedWithDownload() {
    const a = document.createElement('a');
    a.href = pdfPath;
    a.download = `Manual_${manualNumber}.pdf`;
    a.target = '_blank';
    
    console.log('Download link created:', a);
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    console.log('Download triggered');
  }
}

// FALLBACK: If nothing works, open in new window
function openManualInNewWindow(manualNumber) {
  const pdfPath = `manuels/${manualNumber}.pdf`;
  window.open(pdfPath, '_blank');
  console.log(`Opened manual ${manualNumber} in new window`);
}
/********************************************
 * MODEL DOWNLOAD MANAGER
 ********************************************/

class ModelManager {
  static downloadModel(modelNumber) {
    const kitNames = {
      '1': 'Cam-A 3D Model',
      '2': 'Cam-C 3D Model',
      '3': 'Crank 3D Model',
      '4': 'Gear-A 3D Model',
      '5': 'Gear-B 3D Model',
      '6': 'Gear-C 3D Model',
      '7': 'Base Platform Model'
    };

    const modelPath = `kits-stl/${modelNumber}.stl`;
    const kitName = kitNames[modelNumber] || '3D Model';

    fetch(modelPath, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          const downloadLink = document.createElement('a');
          downloadLink.href = modelPath;
          downloadLink.download = `AutomatAR_${kitName.replace(/\s+/g, '_')}.stl`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          NotificationManager.show(`${kitName} downloaded successfully!`, 'success');
          Utils.log(`Downloaded: ${kitName}`, 'success');
        } else {
          NotificationManager.show(`${kitName} file not found. Please contact support.`, 'error');
        }
      })
      .catch(error => {
        Utils.log(`Download failed: ${error.message}`, 'error');
        NotificationManager.show('Download failed. Please check your connection and try again.', 'error');
      });
  }
}

/********************************************
 * NOTIFICATION MANAGER
 ********************************************/

class NotificationManager {
  static show(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const colors = {
      success: '#4CAF50',
      error: '#f44336',
      warning: '#FF9800',
      info: '#2196F3'
    };

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-weight: 600;
      max-width: 300px;
      word-wrap: break-word;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }
}

/********************************************
 * EVENT HANDLER MANAGER
 ********************************************/

class EventHandlerManager {
  static init() {
    this.setupNavigationHandlers();
    this.setupModalHandlers();
    this.setupARHandlers();
    this.setupKeyboardShortcuts();
    Utils.log('Event handlers initialized', 'success');
  }

  static setupNavigationHandlers() {
    const handlers = [
      { id: 'createBtn', action: () => App.screenManager.switchTo(SCREENS.CREATE) },
      { id: 'manualsBtn', action: () => App.screenManager.switchTo(SCREENS.MANUALS) },
      { id: 'openARBtn', action: () => App.screenManager.switchTo(SCREENS.AR) },
      { id: 'createOpenARBtn', action: () => App.screenManager.switchTo(SCREENS.AR) },
      { id: 'modelsBtn', action: () => App.screenManager.switchTo(SCREENS.MODELS) },
      { id: 'aiBtn', action: () => App.screenManager.switchTo(SCREENS.AI) },
      
      { id: 'kitBackHomeBtn', action: () => App.screenManager.switchTo(SCREENS.HOME) },
      { id: 'backHomeBtn', action: () => App.screenManager.switchTo(SCREENS.HOME) },
      { id: 'closeManualsBtn', action: () => App.screenManager.switchTo(SCREENS.HOME) },
      { id: 'closeModelsBtn', action: () => App.screenManager.switchTo(SCREENS.HOME) },
      { id: 'closeCreateBtn', action: () => App.screenManager.switchTo(SCREENS.HOME) },
      
      { id: 'closePdfViewer', action: () => PDFManager.close() }
    ];

    handlers.forEach(({ id, action }) => {
      const element = Utils.$(id);
      if (element) {
        element.onclick = action;
        Utils.log(`Handler set for ${id}`, 'success');
      } else {
        Utils.log(`Element not found: ${id}`, 'warning');
      }
    });

    const aiCloseButton = document.querySelector('.ai-close-button');
    if (aiCloseButton) {
      aiCloseButton.onclick = () => {
        Utils.log('AI close button clicked');
        App.screenManager.switchTo(SCREENS.HOME);
      };
      Utils.log('AI close button handler set', 'success');
    } else {
      Utils.log('AI close button not found', 'warning');
    }

    window.closeAI = () => {
      Utils.log('closeAI function called');
      App.screenManager.switchTo(SCREENS.HOME);
    };

    window.showAIScreen = () => {
      App.screenManager.switchTo(SCREENS.AI);
    };
  }

  static setupModalHandlers() {
    const modals = [
      { id: 'pdfViewerModal', closeAction: () => PDFManager.close() },
      { id: 'createScreen', closeAction: () => App.screenManager.switchTo(SCREENS.HOME) }
    ];

    modals.forEach(({ id, closeAction }) => {
      const modal = Utils.$(id);
      if (modal) {
        modal.onclick = function(e) {
          if (e.target === this) {
            closeAction();
          }
        };
      }
    });
  }

  static setupARHandlers() {
    const arHandlers = [
      { id: 'arStartButton', action: () => App.arManager.startExperience() },
      { id: 'debugSideBtn', action: () => App.arManager.toggleDebug() },
      { id: 'arHelpBtn', action: () => this.toggleARHelp() },
      { id: 'arInstructionsClose', action: () => this.toggleARHelp() }
    ];

    arHandlers.forEach(({ id, action }) => {
      const element = Utils.$(id);
      if (element) {
        element.onclick = action;
      }
    });
  }

  static setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'h':
        case 'H':
          if (e.ctrlKey || e.metaKey) return;
          App.screenManager.switchTo(SCREENS.HOME);
          break;
        case 'a':
        case 'A':
          if (e.ctrlKey || e.metaKey) return;
          App.screenManager.switchTo(SCREENS.AR);
          break;
        case 'Escape':
          this.handleEscape();
          break;
      }
    });
  }

  static handleEscape() {
    if (Utils.$('pdfViewerModal').classList.contains('active')) {
      PDFManager.close();
    } else if (App.screenManager.currentScreen !== SCREENS.HOME) {
      App.screenManager.switchTo(SCREENS.HOME);
    }
  }

  static toggleARHelp() {
    const overlay = Utils.$('arInstructionsOverlay');
    if (overlay) {
      overlay.classList.toggle('visible');
    }
  }
}

/********************************************
 * MAIN APPLICATION CLASS
 ********************************************/

class AutomatARApp {
  constructor() {
    this.screenManager = null;
    this.videoManager = null;
    this.arManager = null;
    this.createManager = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      Utils.log('Initializing AutomatAR Application...', 'info');
      
      // Initialize core systems
      this.screenManager = new ScreenManager();
      this.videoManager = new VideoManager();
      this.arManager = new ARManager();
      
      // Initialize CreateManager immediately for AR animation support
      this.createManager = new CreateManager();
      AppState.createManager = this.createManager;
      
      // Store references in global state
      AppState.videoManager = this.videoManager;
      
      // Set up event handlers
      EventHandlerManager.init();
      
      // Start with home screen
      this.screenManager.switchTo(SCREENS.HOME);
      
      // Make functions globally available
      this.setupGlobalFunctions();
      
      // Setup window resize handler for AR
      window.addEventListener('resize', () => {
        if (this.arManager) {
          this.arManager.handleResize();
        }
      });
      
      this.isInitialized = true;
      Utils.log('AutomatAR Application initialized successfully!', 'success');
      
    } catch (error) {
      Utils.log(`Application initialization failed: ${error.message}`, 'error');
      NotificationManager.show('Application failed to initialize', 'error');
    }
  }

  setupGlobalFunctions() {
    // Make core functions globally available for backward compatibility
    window.showHomeScreen = () => this.screenManager.switchTo(SCREENS.HOME);
    window.showKitDetail = (kitId) => this.screenManager.switchTo(SCREENS.KIT_DETAIL, kitId);
    window.showARScreen = () => this.screenManager.switchTo(SCREENS.AR);
    window.showManualsScreen = () => this.screenManager.switchTo(SCREENS.MANUALS);
    window.showModelsScreen = () => this.screenManager.switchTo(SCREENS.MODELS);
    window.showAIScreen = () => this.screenManager.switchTo(SCREENS.AI);
    window.showCreateScreen = () => this.screenManager.switchTo(SCREENS.CREATE);
    
    // Manual and model functions
    window.openManual = (manualNumber) => PDFManager.openManual(manualNumber);
    window.downloadModel = (modelNumber) => ModelManager.downloadModel(modelNumber);
    
    // AR functions
    window.startARExperience = () => this.arManager.startExperience();
    window.toggleDebugOverlay = () => this.arManager.toggleDebug();
    
    // Legacy AR initialization function
    window.initAR = () => this.arManager.init();
    
    // Legacy functions for compatibility
    window.downloadManual = (kitType) => {
      const manualMap = {
        'cam-a': '1', 'cam-c': '2', 'crank': '3',
        'gear-a': '4', 'gear-b': '5', 'gear-c': '6'
      };
      if (manualMap[kitType]) {
        PDFManager.openManual(manualMap[kitType]);
      }
    };
    
    // AI interface functions (simplified)
    window.closeAI = () => this.screenManager.switchTo(SCREENS.HOME);
    
    // Create screen functions
    window.cleanupCreateCamera = () => {
      if (this.createManager) {
        this.createManager.cleanup();
      }
    };
    
    // Video optimization functions
    window.initVideoOptimization = () => {
      Utils.log('Video optimization already handled by VideoManager', 'info');
    };
    
    window.pauseAllVideos = () => {
      if (this.videoManager) {
        this.videoManager.pauseAll();
      }
    };
    
    window.resumeVisibleVideos = () => {
      if (this.videoManager) {
        this.videoManager.resumeVisibleVideos();
      }
    };
    
    // Original setupUI function for compatibility
    window.setupUI = () => {
      Utils.log('UI setup already handled by EventHandlerManager', 'info');
    };
    
    // Toggle AR instructions overlay
    window.toggleARInstructionsOverlay = () => {
      EventHandlerManager.toggleARHelp();
    };
    
    Utils.log('Global functions setup complete', 'success');
  }

  destroy() {
    if (this.videoManager) this.videoManager.destroy();
    if (this.arManager) this.arManager.cleanup();
    if (this.createManager) this.createManager.cleanup();
    
    Utils.log('Application destroyed', 'info');
  }
}

/********************************************
 * APPLICATION BOOTSTRAP AND COMPATIBILITY
 ********************************************/

// Global app instance
const App = new AutomatARApp();

// Legacy AR functions for compatibility
function initAR() {
  App.arManager.init();
}

function startARExperience() {
  App.arManager.startExperience();
}

function toggleDebugOverlay() {
  App.arManager.toggleDebug();
}

// Legacy screen functions
function showHomeScreen() {
  App.screenManager.switchTo(SCREENS.HOME);
}

function showKitDetailScreen(kitID) {
  App.screenManager.switchTo(SCREENS.KIT_DETAIL, kitID);
}

function showKitDetail(kitID) {
  App.screenManager.switchTo(SCREENS.KIT_DETAIL, kitID);
}

function showARScreen() {
  App.screenManager.switchTo(SCREENS.AR);
}

function showManualsScreen() {
  App.screenManager.switchTo(SCREENS.MANUALS);
}

function showModelsScreen() {
  App.screenManager.switchTo(SCREENS.MODELS);
}

function showAIScreen() {
  App.screenManager.switchTo(SCREENS.AI);
}

function showCreateScreen() {
  App.screenManager.switchTo(SCREENS.CREATE);
}

// Legacy utility functions
function openManual(manualNumber) {
  PDFManager.openManual(manualNumber);
}

function closePdfViewer() {
  PDFManager.close();
}

function downloadModel(modelNumber) {
  ModelManager.downloadModel(modelNumber);
}

function downloadManual(kitType) {
  const manualMap = {
    'cam-a': '1', 'cam-c': '2', 'crank': '3',
    'gear-a': '4', 'gear-b': '5', 'gear-c': '6'
  };
  if (manualMap[kitType]) {
    PDFManager.openManual(manualMap[kitType]);
  }
}

// Legacy video functions
function pauseAllVideos() {
  if (App.videoManager) {
    App.videoManager.pauseAll();
  }
}

function resumeVisibleVideos() {
  if (App.videoManager) {
    App.videoManager.resumeVisibleVideos();
  }
}

function initVideoOptimization() {
  Utils.log('Video optimization handled by VideoManager', 'info');
}

// Legacy create screen functions
function cleanupCreateCamera() {
  if (App.createManager) {
    App.createManager.cleanup();
  }
}

function captureAssemblyStep() {
  if (App.createManager) {
    App.createManager.capture();
  }
}

function clearAllCreateFrames() {
  if (App.createManager) {
    App.createManager.clearAll();
  }
}

function toggleCreateAnimation() {
  if (App.createManager) {
    App.createManager.togglePlay();
  }
}

function resetCreateAnimation() {
  if (App.createManager) {
    App.createManager.reset();
  }
}

function updateCreateAnimationSpeed() {
  if (App.createManager) {
    App.createManager.updateSpeed();
  }
}

// Legacy AR instructions function
function toggleARInstructionsOverlay() {
  EventHandlerManager.toggleARHelp();
}

// Legacy AI functions (simplified)
function closeAI() {
  App.screenManager.switchTo(SCREENS.HOME);
}

// Legacy setup function
function setupUI() {
  Utils.log('UI setup handled by EventHandlerManager', 'info');
}

// Initialize when DOM is ready or immediately if already loaded
function initializeApplication() {
  // Set up legacy window.onload behavior
  window.onload = function() {
    App.init();
  };
  
  // If document is already ready, initialize immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
}

// Handle page unload
window.addEventListener('beforeunload', () => App.destroy());

// Make app globally available for debugging
window.AutomatAR = App;
window.App = App;

// Export for modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    AutomatARApp, 
    Utils, 
    SCREENS, 
    ScreenManager, 
    VideoManager, 
    CreateManager,
    ARManager,
    PDFManager,
    ModelManager,
    NotificationManager,
    EventHandlerManager
  };
}

// Start the application
initializeApplication();

Utils.log('AutomatAR Application fully loaded - Clean Version (No Assembly Animations)', 'success');
