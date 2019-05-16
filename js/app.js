const CLIENT_ID = '189290402962-nth9nphie7uiq1jamsc7ulfv1uuqjf1j.apps.googleusercontent.com';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

// DOM Selectors
const hero = document.querySelector('.hero-not-logged');
const nav = document.querySelector('.black');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelField = document.getElementById('channel-field');
const videoContainer = document.getElementById('video-container');

const defaultChannel = 'realmadridcf';

// Form submit and change channel
channelForm.addEventListener('submit', e => {
  e.preventDefault();

  const channel = channelField.value;

  getChannel(channel);
});

// Load auth2 library
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

// Init API client library and set up sign in listeners
function initClient() {
  gapi.client
    .init({
      discoveryDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES
    })
    .then(() => {
      // Listen for sign in state changes
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      // Handle initial sign in state
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      loginButton.onclick = handleAuthClick;
      logoutButton.onclick = handleSignoutClick;
    });
}

// Update UI sign in state changes
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    loginButton.style.display = 'none';
    logoutButton.style.visibility = 'visible';
    content.style.display = 'block';
    videoContainer.style.display = 'block';
    nav.style.display = 'block';
    hero.style.display = 'none';
    getChannel(defaultChannel);
  } else {
    loginButton.style.display = 'block';
    logoutButton.style.visibility = 'hidden';
    content.style.display = 'none';
    videoContainer.style.display = 'none';
    nav.style.display = 'none';
    hero.style.display = 'block';


  }
}

// Handle login
function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

// Handle logout
function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();
}

// Display channel data
function showChannelData(data) {
  const channelData = document.getElementById('channel-data');
  channelData.innerHTML = data;
}

function clearInputField(){
  document.getElementById('channel-field').value = '';
}

// Get channel from API
function getChannel(channel) {
  gapi.client.youtube.channels
    .list({
      part: 'snippet,contentDetails,statistics, brandingSettings',
      forUsername: channel
    })
    .then(response => {
      console.log(response);
      const channel = response.result.items[0];

      const output = `
      <p class="white-text text-darken-2 flow-text">Now that you are logged in, go ahead and search for your favurite YouTube channels and get their information. The default channel is set to Real Madrid's because I love football and Real Madrid is the best football team! but feel free to check other channels. Make sure it's not fcbarcelona! </p>
        <ul class="collection center-align">

          <li class="collection-item banner-image">
            <img src="${channel.brandingSettings.image.bannerImageUrl}">
          </li>

          <li class="collection-item">
            <h4> ${channel.snippet.title} </h4>
          </li>

          <li class="collection-item">
            <img src="${channel.snippet.thumbnails.medium.url}">
            <br>
            <a class="btn amber darken-4" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}"> Visit ${channel.snippet.title} on YouTube </a>
          </li>

          <li class="collection-item">
            <h5>Channel Description </h5>
            <p> ${channel.snippet.description}</p>
          </li>

          <li class="collection-item">
            <h5>Subscribers </h5>
            <p>${numberWithCommas(channel.statistics.subscriberCount)}</p>
          </li>

          <li class="collection-item">
            <h5> Total Views </h5>
            <p>${numberWithCommas(channel.statistics.viewCount)}</p>
          </li>

          <li class="collection-item">
            <h5> Number of Videos </h5>
            <p>${numberWithCommas(channel.statistics.videoCount)}</p>
          </li>

        </ul>

      `;

      showChannelData(output);

      const playlistId = channel.contentDetails.relatedPlaylists.uploads;
      
      requestChannelPlaylist(playlistId);

      clearInputField();
    })
    .catch(err => alert('No Channel By That Name'));
}

// Add commas to number
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function requestChannelPlaylist(playlistId){
 const requestOptions = {
   playlistId: playlistId,
   part: 'snippet',
   maxResults: 10
 };

 const request = gapi.client.youtube.playlistItems.list(requestOptions);

 request.execute(response => {
  console.log(response);
  const playListItems = response.result.items;
  if(playListItems){
    let output = `<h4 class="center-align">Latest Videos</h4>
    <hr>
    `;

    playListItems.forEach(item => {
      const videoId = item.snippet.resourceId.videoId;

      output += `
        <div class="col m4 s12">
        <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      `;
    });

    videoContainer.innerHTML = output;

  } else {
    videoContainer.innerHTML = 'No videos to show!'
  }
 })
}