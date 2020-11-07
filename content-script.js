let tries = 0;

let stories;
let storyList = [];
let storyViewIntervalId = null;
let progressBarIntervalId = null;
let automaticSliderIntervalId = null;

const AUTOMATIC_SCROLL_DELAY = 5000;
const PROGRESS_BAR_UPDATE_DELAY = 100;
const UPDATE_PROGRESS_BAR_VALUE = 100 / ((AUTOMATIC_SCROLL_DELAY / PROGRESS_BAR_UPDATE_DELAY) - 5) ;

const handle = setInterval(() => {
  let dashboardCards;
  try {
    dashboardCards = document
      .getElementById('dashboard')
      .querySelector('div[data-repository-hovercards-enabled]').children;
  } catch (error) {
    if (tries++ === 10) {
      console.log('dashboard did not load');
      clearInterval(handle);
      return;
    }
    console.log('dashboard not loaded, retrying...');
    return;
  }

  clearInterval(handle);
  stories = Array.prototype.slice
    .call(dashboardCards)
    .filter((element) => element.nodeName === 'DIV')
    .map((element) => ({
      userImageURL: element.querySelector('.avatar.avatar-user').src,
      userName: element.querySelector('a[data-hovercard-type="user"].text-bold')
        .textContent,
      action: element
        .querySelector('div.d-flex.flex-items-baseline')
        .textContent.split('\n')
        .filter((str) => str.trim() !== '')
        .map((str) => str.trim())[1],
      repoOrUserName: element.querySelector('div.Box a.text-bold').textContent,
      repoOrUserURL: element.querySelector('div.Box a.text-bold').href,
    }));

  const batchStories = [];
  stories.forEach((story) => {
    let index = 0;
    const belongsToBatch = batchStories.some((batchStory, idx) => {
      if(batchStory[0].userName === story.userName)
      {
        index = idx;
        return true
      }
    })
    if(belongsToBatch){
      batchStories[index].push(story)
    }else{
      batchStories.push([ story ])  
    }
  });

  storyList = [...batchStories];

  const storyListView = getStoryListView({ stories: storyList });
  document.querySelector('.news').prepend(getStoryViewer());
  document.querySelector('.news').prepend(storyListView);

}, 1000);

function onClickStoryBtn(event) {
  const path = event.path;
  const buttonElem = path.find((element) => element.className === 'user-story');
  const storyID = buttonElem.getAttribute('story-id');


  const batchStory = storyList[storyID];
  updateSingleStoryView(batchStory[0], storyID, 0);
}

function getStoryListView({ stories }) {
  const storyListWrapperElem = document.createElement('div');
  storyListWrapperElem.classList.add('stories-list-wrapper');

  const storyListElement = document.createElement('div');
  storyListElement.classList.add('stories-list');

  stories.forEach((singleStoryBatch, index) => {
    let story = singleStoryBatch[0];

    const userStoryElem = document.createElement('div');
    userStoryElem.classList.add('user-story');
    userStoryElem.setAttribute('story-id', index);

    {
      const btnElem = document.createElement('button');
      {
        const imgElem = document.createElement('img');
        imgElem.src = story.userImageURL;
        imgElem.alt = story.userName;
        imgElem.classList.add('user-story-img');
        btnElem.appendChild(imgElem);
      }
      btnElem.addEventListener('click', onClickStoryBtn);
      userStoryElem.appendChild(btnElem);
    }

    {
      const userStoryNameElem = document.createElement('div');
      userStoryNameElem.classList.add('user-story-name');
      userStoryNameElem.innerText = story.userName;
      userStoryElem.appendChild(userStoryNameElem);
    }

    storyListElement.appendChild(userStoryElem);
  });

  storyListWrapperElem.appendChild(storyListElement);

  return storyListWrapperElem;
}

function getStoryViewer(){
  const storyViewWrapperElem = document.createElement('div');
  storyViewWrapperElem.classList.add('story-view-wrapper');
  storyViewWrapperElem.classList.add('hidden');
  storyViewWrapperElem.innerHTML = `
  <div class="story-view">
  <div class="story-view-user">
  <div class="story-view-user-detail">
  <img
      src="https://avatars3.githubusercontent.com/u/13041443?s=64&v=4"
      class="story-view-user-img"
      alt="ahkohd"
    />
    <a href="https://github.com/ahkohd" class="story-view-user-name"
      >ahkohd</a
    >
  </div>
  <div class="story-view-user-action">
    x close
  </div>
    
  </div>

  <div class = "ex-progress-bar">
   
  </div>
  <div class="story-view-content">
    <div class="story-view-content-text">
      <div class="story-view-content-action">starred</div>
      <div class="story-view-content-object">
        <a href="https://github.com/vuejs/docs-next">vuejs/docs-next</a>
      </div>
    </div>

    <button class="story-view-prev"><</button>
    <button class="story-view-next">></button>
  </div>
  </div>
  `

  const storyViewerCloseBtn = storyViewWrapperElem.querySelector('.story-view-user-action');
  const storyViewPrevBtn = storyViewWrapperElem.querySelector('.story-view-prev');
  const storyViewNextBtn = storyViewWrapperElem.querySelector('.story-view-next');

  storyViewerCloseBtn.addEventListener('click', handleCloseStoryViewerBtnClick);
  storyViewPrevBtn.addEventListener('click', handleStoryViewPrevBtnClick);
  storyViewNextBtn.addEventListener('click', handleStoryViewNextBtnClick);

  return storyViewWrapperElem
}


function moveSlide(story, storyID, storyIndex){
  updateSingleStoryView(story, storyID, storyIndex)
}

function moveToNextSlide(storyID, storyIndex){
  if(storyIndex + 1 >= storyList[storyID].length){
    storyID++
    storyIndex = 0;
  }
  else  
    storyIndex++

  if(storyID >= storyList.length)
    return 
  
  moveSlide(storyList[storyID][storyIndex], storyID, storyIndex)
}
function moveToPrevSlide(storyID, storyIndex){
  if(storyIndex - 1 < 0){
    storyID--
    storyIndex = 0
  }
  else  
    storyIndex--
  if(storyID < 0  )
    return 

  moveSlide(storyList[storyID][storyIndex], storyID, storyIndex)
}


function handleStoryViewNextBtnClick(event){
  const storyViewer = document.querySelector('.story-view-wrapper');
  let storyID = parseInt(storyViewer.getAttribute('story-id'));
  let storyIndex = parseInt(storyViewer.getAttribute('story-index'));

  moveToNextSlide(storyID, storyIndex)
}


function handleStoryViewPrevBtnClick(event){
  const storyViewer = document.querySelector('.story-view-wrapper');
  let storyID = storyViewer.getAttribute('story-id');
  let storyIndex = storyViewer.getAttribute('story-index');

   moveToPrevSlide(storyID, storyIndex)
}


function handleCloseStoryViewerBtnClick(event){
  document.querySelector('.story-view-wrapper').classList.add("hidden");
  clearInterval(storyViewIntervalId)
  clearInterval(progressBarIntervalId)
}


function automaticSlideScrolling(){
  if(storyViewIntervalId)
    clearInterval(storyViewIntervalId)
  if(progressBarIntervalId)
    clearInterval(progressBarIntervalId)
  handleStoryViewNextBtnClick()

}

function updateProgressBarProgress(){
  const progressBar = document.querySelector('.ex-progress-bar').firstElementChild;
  const currValue = parseInt(progressBar.getAttribute("value"))
  progressBar.setAttribute("value", currValue + UPDATE_PROGRESS_BAR_VALUE)
}

function updateProgressBar(){
  let initialValue = 0;
  let progressBarContainer = document.querySelector('.ex-progress-bar');
  progressBarContainer.innerHTML = `<progress id="file" value="${initialValue}" max="100"> </progress>`;

  if(progressBarIntervalId)
    clearInterval(progressBarIntervalId)
  progressBarIntervalId = setInterval(updateProgressBarProgress , PROGRESS_BAR_UPDATE_DELAY)
}


function updateSingleStoryView(story, storyId, storyIndex){
  const storyViewer = document.querySelector('.story-view-wrapper');
  const image = storyViewer.querySelector('.story-view-user-img')
  const name = storyViewer.querySelector('.story-view-user-name')
  const contentAction = storyViewer.querySelector('.story-view-content-action')
  const contentObject = storyViewer.querySelector('.story-view-content-object').firstElementChild

  storyViewer.setAttribute('story-id', storyId);
  storyViewer.setAttribute('story-index', storyIndex)

  image.src = story.userImageURL;
  name.innerText = story.userName;
  name.href = "https://github.com/" + story.userName
  contentAction.innerText = story.action;
  contentObject.innerText = story.repoOrUserName
  contentObject.href = story.repoOrUserURL

  if(storyViewIntervalId)
    clearInterval(storyViewIntervalId)

  updateProgressBar(story, storyId, storyIndex)
  storyViewIntervalId = setInterval(automaticSlideScrolling, AUTOMATIC_SCROLL_DELAY)

  document.querySelector('.story-view-wrapper').classList.remove("hidden")
}



