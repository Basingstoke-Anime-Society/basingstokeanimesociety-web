function setupVoting() {
  for (let alertButton of document.getElementsByClassName('vote-alert')) {
    alertButton.addEventListener('click', (evt) => {
      document.getElementById('reveal-alert-dororo').classList.add('reveal--show')
    });
  }
}

