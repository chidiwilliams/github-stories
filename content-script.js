let tries = 0;

let stories;

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
  updateSingleStoryView( story);
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
  storyViewerCloseBtn.addEventListener('click', handleCloseStoryViewerBtnClick);

  return storyViewWrapperElem
}


function handleCloseStoryViewerBtnClick(event){
  document.querySelector('.story-view-wrapper').classList.add("hidden");
}


function updateSingleStoryView(story){
  const storyViewer = document.querySelector('.story-view-wrapper');
  const image = storyViewer.querySelector('.story-view-user-img')
  const name = storyViewer.querySelector('.story-view-user-name')
  const contentAction = storyViewer.querySelector('.story-view-content-action')
  const contentObject = storyViewer.querySelector('.story-view-content-object').firstElementChild
  image.src = story.userImageURL;
  name.innerText = story.userName;
  name.href = "https://github.com/" +story.userName
  contentAction.innerText = story.action;
  contentObject.innerText = story.repoOrUserName
  contentObject.href = story.repoOrUserURL

  document.querySelector('.story-view-wrapper').classList.remove("hidden")
}



