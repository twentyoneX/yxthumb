<div class="tool-section">
  <h2>YouTube / Twitter Video Downloader</h2>
  <p style="margin-bottom: 20px; color: #666;">Download videos from YouTube and Twitter (X). Paste the URL below.</p>
  
  <div>
    <input 
      class="form-control" 
      id="videoURL" 
      placeholder="Paste YouTube or Twitter video URL here" 
      type="text"
    />
    <button type="button" class="btn" id="downloadVideoButton">Get Download Link</button>
  </div>

  <div id="loadingIndicator" style="display: none; margin-top: 20px; text-align: center;">
    <p style="color: #CC0000; font-weight: bold;">⏳ Processing video...</p>
  </div>

  <div id="downloadResult" style="display: none; margin-top: 20px; padding: 20px; background: #f0f0f0; border-radius: 6px;">
    <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Download Options:</h3>
    
    <div id="youtubeDownload" style="display: none;">
      <div id="videoInfo" style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 6px;">
        <img id="videoThumbnail" src="" alt="Video Thumbnail" style="max-width: 100%; border-radius: 4px; margin-bottom: 10px;" />
        <h4 id="videoTitle" style="color: #333; margin: 0;"></h4>
      </div>
      <p style="color: #666; margin-bottom: 15px;">Choose video quality to download:</p>
      <div id="qualityOptions" style="display: flex; flex-direction: column; gap: 10px;">
        <!-- Quality buttons will be inserted here -->
      </div>
    </div>
    
    <div id="twitterDownload" style="display: none;">
      <p style="color: #666; margin-bottom: 15px;">Choose a download service:</p>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <a id="twLink1" href="#" target="_blank" class="btn" style="display: inline-block; margin: 0; text-decoration: none;">
          Download via SSSTwitter
        </a>
        <a id="twLink2" href="#" target="_blank" class="btn" style="display: inline-block; margin: 0; text-decoration: none; background-color: #0066cc;">
          Download via TWMate
        </a>
      </div>
      <p style="margin-top: 15px; font-size: 13px; color: #999; font-style: italic;">
        Twitter downloads use redirect services. Direct download coming soon!
      </p>
    </div>

    <div id="errorMessage" style="display: none; padding: 15px; background: #ffebee; border-radius: 6px; color: #c62828;">
      <strong>Error:</strong> <span id="errorText"></span>
    </div>
  </div>



  <div style="margin-top: 30px; text-align: left;">
    <h3 style="color: #333; margin-bottom: 15px;">Features:</h3>
    <ul style="padding-left: 20px; color: #666;">
      <li style="margin-bottom: 8px;"><strong>YouTube</strong> - Direct downloads in multiple qualities (with Vercel API)</li>
      <li style="margin-bottom: 8px;"><strong>Twitter (X)</strong> - Redirect to trusted download services</li>
    </ul>
    
    <h3 style="color: #333; margin-top: 20px; margin-bottom: 15px;">How to Use:</h3>
    <ol style="padding-left: 20px; color: #666;">
      <li style="margin-bottom: 8px;">Copy the video URL from YouTube or Twitter</li>
      <li style="margin-bottom: 8px;">Paste it into the input field above</li>
      <li style="margin-bottom: 8px;">Click "Get Download Link"</li>
      <li style="margin-bottom: 8px;">Choose your preferred quality and download</li>
    </ol>
  </div>
</div>

<script type="text/javascript">
(function() {
  // Your Vercel API URL
  const API_URL = 'https://yxthumb.vercel.app';
  
  function generateDownloadLinks() {
    var videoURL = document.getElementById("videoURL").value.trim();
    
    if (!videoURL) {
      alert("Please enter a video URL");
      return;
    }
    
    // Check if it's a YouTube URL
    var youtubePatterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    
    // Check if it's a Twitter URL
    var twitterPatterns = [
      /(?:https?:\/\/)?(?:www\.)?twitter\.com\/(\w+)\/status\/(\d+)/,
      /(?:https?:\/\/)?(?:www\.)?x\.com\/(\w+)\/status\/(\d+)/
    ];
    
    var isYouTube = false;
    var isTwitter = false;
    
    // Check YouTube
    for (var i = 0; i < youtubePatterns.length; i++) {
      if (youtubePatterns[i].test(videoURL)) {
        isYouTube = true;
        break;
      }
    }
    
    // Check Twitter
    if (!isYouTube) {
      for (var j = 0; j < twitterPatterns.length; j++) {
        if (twitterPatterns[j].test(videoURL)) {
          isTwitter = true;
          break;
        }
      }
    }
    
    if (!isYouTube && !isTwitter) {
      alert("Please enter a valid YouTube or Twitter video URL");
      return;
    }
    
    if (isYouTube) {
      handleYouTubeDownload(videoURL);
    } else if (isTwitter) {
      handleTwitterDownload(videoURL);
    }
  }
  
  function handleYouTubeDownload(url) {
    // Show loading
    document.getElementById("loadingIndicator").style.display = "block";
    document.getElementById("downloadResult").style.display = "none";
    
    // Call Vercel API
    fetch(API_URL + '/api/download?url=' + encodeURIComponent(url) + '&type=youtube')
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        document.getElementById("loadingIndicator").style.display = "none";
        
        if (data.success) {
          displayYouTubeResults(data);
        } else {
          showError(data.message || "Failed to process video");
        }
      })
      .catch(function(error) {
        document.getElementById("loadingIndicator").style.display = "none";
        showError("Network error. Please try again or use the fallback method.");
        console.error("API Error:", error);
      });
  }
  
  function displayYouTubeResults(data) {
    document.getElementById("downloadResult").style.display = "block";
    document.getElementById("youtubeDownload").style.display = "block";
    document.getElementById("twitterDownload").style.display = "none";
    document.getElementById("errorMessage").style.display = "none";
    
    // Display video info
    document.getElementById("videoThumbnail").src = data.thumbnail;
    document.getElementById("videoTitle").textContent = data.title;
    
    // Display quality options
    var qualityContainer = document.getElementById("qualityOptions");
    qualityContainer.innerHTML = "";
    
    data.formats.forEach(function(format, index) {
      var button = document.createElement("a");
      button.href = format.url;
      button.className = "btn";
      button.style.display = "inline-block";
      button.style.margin = "0";
      button.style.textDecoration = "none";
      button.download = data.title + " - " + format.quality + "." + format.container;
      button.textContent = "Download " + format.quality + " (" + (format.filesize ? (format.filesize / 1024 / 1024).toFixed(2) + " MB" : "Size unknown") + ")";
      
      if (index === 0) button.style.backgroundColor = "#28a745";
      else if (index === 1) button.style.backgroundColor = "#0066cc";
      
      qualityContainer.appendChild(button);
    });
  }
  
  function handleTwitterDownload(url) {
    document.getElementById("downloadResult").style.display = "block";
    document.getElementById("twitterDownload").style.display = "block";
    document.getElementById("youtubeDownload").style.display = "none";
    document.getElementById("errorMessage").style.display = "none";
    
    // Set up Twitter redirect links
    document.getElementById("twLink1").href = "https://ssstwitter.com/?url=" + encodeURIComponent(url);
    document.getElementById("twLink2").href = "https://twmate.com/en2?url=" + encodeURIComponent(url);
  }
  
  function showError(message) {
    document.getElementById("downloadResult").style.display = "block";
    document.getElementById("errorMessage").style.display = "block";
    document.getElementById("youtubeDownload").style.display = "none";
    document.getElementById("twitterDownload").style.display = "none";
    document.getElementById("errorText").textContent = message;
  }
  
  document.getElementById("downloadVideoButton").onclick = generateDownloadLinks;
  
  // Allow Enter key to trigger download link generation
  document.getElementById("videoURL").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      generateDownloadLinks();
    }
  });
  
  // Clear inputs on page load/refresh
  window.addEventListener('load', function() {
    document.getElementById("videoURL").value = "";
    document.getElementById("downloadResult").style.display = "none";
    document.getElementById("loadingIndicator").style.display = "none";
  });
})();
</script>
