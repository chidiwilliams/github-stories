let tries = 0;

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
  const stories = Array.prototype.slice
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

  console.log(stories);
}, 1000);
