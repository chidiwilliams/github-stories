let tries = 0;

let stories;
let storyList = [];
let storyViewIntervalId = null;
let progressBarIntervalId = null;
let automaticSliderIntervalId = null;

const emojis = {
  starred: '⭐',
  'pushed to': '🚀',
  'started following': '🚶',
  forked: '🤓',
};

const AUTOMATIC_SCROLL_DELAY = 4200;
const PROGRESS_BAR_UPDATE_DELAY = 100;
const UPDATE_PROGRESS_BAR_VALUE =
  100 / (AUTOMATIC_SCROLL_DELAY / PROGRESS_BAR_UPDATE_DELAY - 5);
let storyViewOpen = false;

const handle = setInterval(() => {
  let dashboardCards;
  try {
    dashboardCards = document
      .getElementById('dashboard')
      .querySelector(
        'div[data-repository-hovercards-enabled]:not(.js-recent-activity-container)',
      ).children;
  } catch (error) {
    if (tries++ === 20) {
      clearInterval(handle);
      return;
    }
    return;
  }

  clearInterval(handle);
  stories = Array.prototype.slice
    .call(dashboardCards)
    .filter((element) => element.nodeName === 'DIV')
    .map((element) => {
      const [userName, action, repoOrUserName] = element.textContent
        .split('\n')
        .map((str) => str.trim())
        .filter((str) => str !== '');

      const themeID = Math.floor(Math.random() * 18); // 0 - 17

      return {
        userImageURL: element.querySelector('.avatar.avatar-user').src,
        userName,
        action,
        repoOrUserName,
        repoOrUserURL: getGithubURL(repoOrUserName),
        themeID,
      };
    })
    .filter(
      (story) =>
        story.action !== 'created a' &&
        !story.action.includes('and') &&
        !story.repoOrUserName.includes('repositories'),
    );

  const batchStories = [];
  stories.forEach((story) => {
    let index = 0;
    const belongsToBatch = batchStories.some((batchStory, idx) => {
      if (batchStory[0].userName === story.userName) {
        index = idx;
        return true;
      }
    });
    if (belongsToBatch) {
      batchStories[index].push(story);
    } else {
      batchStories.push([story]);
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
      btnElem.innerHTML = `<div class="img-wrapper">
  <img class="user-story-img" src="${story.userImageURL}" alt="${story.userName}" />
</div>
<div class="user-story-name f6">${story.userName}</div>`;
      btnElem.addEventListener('click', onClickStoryBtn);
      userStoryElem.appendChild(btnElem);
    }

    storyListElement.appendChild(userStoryElem);
  });

  storyListWrapperElem.appendChild(storyListElement);

  return storyListWrapperElem;
}

function getGithubURL(resource) {
  return `https://github.com/${resource}`;
}

function getStoryViewer() {
  const storyViewWrapperElem = document.createElement('div');
  storyViewWrapperElem.classList.add('story-view-wrapper', 'hidden');
  storyViewWrapperElem.innerHTML = `<div class="story-view">
  <div class="story-view-user">
    <div class="story-view-user-detail">
      <a class="story-view-user-img-link">
        <img src="" class="story-view-user-img" alt="" />
      </a>
      <a class="story-view-user-name"></a>
    </div>
  </div>

  <div class="ex-progress-bar"></div>
  <div class="story-view-content">
    <div class="story-view-content-text">
      <div>I <span class="story-view-content-action">starred</span></div>
      <div>
        <span class="story-view-content-object">
          <a href="${getGithubURL('vuejs/docs-next')}">vuejs/docs-next</a></span
        >!
      </div>
      <div class="story-view-content-emoji">⭐</div>
    </div>

    <button class="story-view-prev"><</button>
    <button class="story-view-next">></button>
    <button class="story-view-close-btn">
      <svg
        height="20px"
        viewBox="0 0 329.26933 329"
        width="20px"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m194.800781 164.769531 128.210938-128.214843c8.34375-8.339844 8.34375-21.824219 0-30.164063-8.339844-8.339844-21.824219-8.339844-30.164063 0l-128.214844 128.214844-128.210937-128.214844c-8.34375-8.339844-21.824219-8.339844-30.164063 0-8.34375 8.339844-8.34375 21.824219 0 30.164063l128.210938 128.214843-128.210938 128.214844c-8.34375 8.339844-8.34375 21.824219 0 30.164063 4.15625 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921875-2.089844 15.082031-6.25l128.210937-128.214844 128.214844 128.214844c4.160156 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921874-2.089844 15.082031-6.25 8.34375-8.339844 8.34375-21.824219 0-30.164063zm0 0"
        ></path>
      </svg>
    </button>
  </div>
</div>
`;

  const storyViewerCloseBtn = storyViewWrapperElem.querySelector(
    '.story-view-close-btn',
  );
  const storyViewPrevBtn = storyViewWrapperElem.querySelector(
    '.story-view-prev',
  );
  const storyViewNextBtn = storyViewWrapperElem.querySelector(
    '.story-view-next',
  );

  storyViewerCloseBtn.addEventListener('click', handleCloseStoryViewerBtnClick);
  storyViewPrevBtn.addEventListener('click', handleStoryViewPrevBtnClick);
  storyViewNextBtn.addEventListener('click', handleStoryViewNextBtnClick);

  document.addEventListener('keyup', onPressKey);
  window.addEventListener('resize', updateStoryViewWidth);

  return storyViewWrapperElem;
}

function updateStoryViewWidth() {
  const storyViewElem = document.querySelector('.story-view');

  const { height } = storyViewElem.getBoundingClientRect();
  storyViewElem.style.width = `${height / 1.77}px`;
}

function onPressKey(event) {
  if (storyViewOpen) {
    switch (event.key) {
      case 'Escape':
        closeStoryView();
        break;
      case 'ArrowLeft':
        handleStoryViewPrevBtnClick();
        break;
      case 'ArrowRight':
        handleStoryViewNextBtnClick();
        break;
    }
  }
}

function moveSlide(story, storyID, storyIndex) {
  updateSingleStoryView(story, storyID, storyIndex);
}

function moveToNextSlide(storyID, storyIndex) {
  if (storyIndex + 1 >= storyList[storyID].length) {
    storyID++;
    storyIndex = 0;
  } else storyIndex++;

  if (storyID >= storyList.length) return;

  moveSlide(storyList[storyID][storyIndex], storyID, storyIndex);
}
function moveToPrevSlide(storyID, storyIndex) {
  if (storyIndex - 1 < 0) {
    storyID--;
    storyIndex = 0;
  } else storyIndex--;
  if (storyID < 0) return;

  moveSlide(storyList[storyID][storyIndex], storyID, storyIndex);
}

function handleStoryViewNextBtnClick() {
  const storyViewer = document.querySelector('.story-view-wrapper');
  let storyID = parseInt(storyViewer.getAttribute('story-id'));
  let storyIndex = parseInt(storyViewer.getAttribute('story-index'));

  moveToNextSlide(storyID, storyIndex);
}

function handleStoryViewPrevBtnClick() {
  const storyViewer = document.querySelector('.story-view-wrapper');
  let storyID = storyViewer.getAttribute('story-id');
  let storyIndex = storyViewer.getAttribute('story-index');

  moveToPrevSlide(storyID, storyIndex);
}

function handleCloseStoryViewerBtnClick() {
  closeStoryView();
}

function closeStoryView() {
  document.querySelector('.story-view-wrapper').classList.add('hidden');
  clearInterval(storyViewIntervalId);
  clearInterval(progressBarIntervalId);
  storyViewOpen = false;
}

function automaticSlideScrolling() {
  if (storyViewIntervalId) clearInterval(storyViewIntervalId);
  if (progressBarIntervalId) clearInterval(progressBarIntervalId);
  handleStoryViewNextBtnClick();
}

function updateProgressBarProgress() {
  const progressBar = document.querySelector('.ex-progress-bar')
    .firstElementChild;
  const currValue = parseInt(progressBar.getAttribute('value'));
  progressBar.setAttribute(
    'value',
    String(currValue + UPDATE_PROGRESS_BAR_VALUE),
  );
}

function updateProgressBar() {
  let initialValue = 0;
  let progressBarContainer = document.querySelector('.ex-progress-bar');
  progressBarContainer.innerHTML = `<progress id="file" value="${initialValue}" max="100"> </progress>`;

  if (progressBarIntervalId) clearInterval(progressBarIntervalId);
  progressBarIntervalId = setInterval(
    updateProgressBarProgress,
    PROGRESS_BAR_UPDATE_DELAY,
  );
}

function updateSingleStoryView(story, storyId, storyIndex) {
  const storyViewer = document.querySelector('.story-view-wrapper');

  const imageLink = storyViewer.querySelector('.story-view-user-img-link');
  imageLink.href = getGithubURL(story.userName);

  const image = storyViewer.querySelector('.story-view-user-img');
  image.src = story.userImageURL;
  image.setAttribute('alt', story.userName);

  const name = storyViewer.querySelector('.story-view-user-name');
  name.href = getGithubURL(story.userName);
  name.innerText = story.userName;

  const content = storyViewer.querySelector('.story-view-content');
  content.setAttribute('theme', String(story.themeID));

  const contentAction = storyViewer.querySelector('.story-view-content-action');
  contentAction.innerText = story.action;

  const contentObject = storyViewer.querySelector('.story-view-content-object')
    .firstElementChild;
  contentObject.innerText = story.repoOrUserName;
  contentObject.href = story.repoOrUserURL;

  const contentEmoji = storyViewer.querySelector('.story-view-content-emoji');
  contentEmoji.innerText = emojis[story.action] || '';

  storyViewer.setAttribute('story-id', storyId);
  storyViewer.setAttribute('story-index', storyIndex);

  image.src = story.userImageURL;
  name.innerText = story.userName;
  name.href = getGithubURL(story.userName);

  if (storyViewIntervalId) clearInterval(storyViewIntervalId);

  updateProgressBar();
  storyViewIntervalId = setInterval(
    automaticSlideScrolling,
    AUTOMATIC_SCROLL_DELAY,
  );

  document.querySelector('.story-view-wrapper').classList.remove('hidden');
  storyViewOpen = true;

  updateStoryViewWidth();
}
