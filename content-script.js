let tries = 0;

let stories;
let storyViewOpen = false;

const handle = setInterval(() => {
  let dashboardCards;
  try {
    dashboardCards = document
      .getElementById('dashboard')
      .querySelector('div[data-repository-hovercards-enabled]').children;
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

      return {
        userImageURL: element.querySelector('.avatar.avatar-user').src,
        userName,
        action,
        repoOrUserName,
        repoOrUserURL: getGithubURL(repoOrUserName),
      };
    });

  const uniqueStories = [];
  const storiesUserNames = {};
  stories.forEach((story, index) => {
    if (storiesUserNames[story.userName]) {
      return;
    }

    storiesUserNames[story.userName] = true;
    story.index = index;
    uniqueStories.push(story);
  });

  const storyListView = getStoryListView({ stories: uniqueStories });
  document.querySelector('.news').prepend(getStoryViewer());
  document.querySelector('.news').prepend(storyListView);
}, 1000);

function onClickStoryBtn(event) {
  const path = event.path;
  const buttonElem = path.find((element) => element.className === 'user-story');
  const storyID = buttonElem.getAttribute('story-id');
  console.log('open story ID', storyID);

  const story = stories[storyID];
  updateSingleStoryView(story);
}

function getStoryListView({ stories }) {
  const storyListWrapperElem = document.createElement('div');
  storyListWrapperElem.classList.add('stories-list-wrapper');

  const storyListElement = document.createElement('div');
  storyListElement.classList.add('stories-list');

  stories.forEach((story) => {
    const userStoryElem = document.createElement('div');
    userStoryElem.classList.add('user-story');
    userStoryElem.setAttribute('story-id', story.index);

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
        <img
          src=""
          class="story-view-user-img"
          alt=""
        />
      </a>
      <a class="story-view-user-name"
        ></a
      >
    </div>
  </div>

  <div class="story-view-content">
    <div class="story-view-content-text">
      <div class="story-view-content-action">starred</div>
      <div class="story-view-content-object">
        <a href="${getGithubURL('vuejs/docs-next')}">vuejs/docs-next</a>
      </div>
    </div>

    <button class="story-view-prev"><</button>
    <button class="story-view-next">></button>
    <button class="story-view-user-action">
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
    '.story-view-user-action',
  );
  storyViewerCloseBtn.addEventListener('click', handleCloseStoryViewerBtnClick);

  document.addEventListener('keyup', onPressEscKey);

  return storyViewWrapperElem;
}

function onPressEscKey(event) {
  if (storyViewOpen && event.key === 'Escape') {
    closeStoryView();
  }
}

function handleCloseStoryViewerBtnClick() {
  closeStoryView();
}

function closeStoryView() {
  document.querySelector('.story-view-wrapper').classList.add('hidden');
  storyViewOpen = false;
}

function updateSingleStoryView(story) {
  const storyViewer = document.querySelector('.story-view-wrapper');

  const imageLink = storyViewer.querySelector('.story-view-user-img-link');
  imageLink.href = getGithubURL(story.userName);

  const image = storyViewer.querySelector('.story-view-user-img');
  image.src = story.userImageURL;
  image.setAttribute('alt', story.userName);

  const name = storyViewer.querySelector('.story-view-user-name');
  name.href = getGithubURL(story.userName);
  name.innerText = story.userName;

  const contentAction = storyViewer.querySelector('.story-view-content-action');
  contentAction.innerText = story.action;

  const contentObject = storyViewer.querySelector('.story-view-content-object')
    .firstElementChild;
  contentObject.innerText = story.repoOrUserName;
  contentObject.href = story.repoOrUserURL;

  document.querySelector('.story-view-wrapper').classList.remove('hidden');
  storyViewOpen = true;
}
