let submitUser;

(() => {
  const socket = io();
  let hits = 0;
  let started = false;
  let timer;
  let timeLeft = 4;
  let countdown = 16;
  let timer2;
  let accessServerHitKey;

  function reverseExpression(expression) {
    const parts = expression.split(':');
    if (parts[1] != null) {
      return `${parts[1]}:${parts[0]}`;
    }
  }

  function updateLeaderboard() {
    fetch('./leaderboards.txt').then(response => {
      if (!response.ok) {
        throw new Error('not ok');
      }
      return response.text();
    }).then(data => {
      let spot = 1;
      let thirty = false;
      data.split(' ').forEach(v => {
        if (spot === data.split(' ').length || thirty)
          return;
        if (spot <= 30) {
          const spane = document.createElement("span");
          spane.innerHTML = '<span style="color: red;">' + spot + '. </span>' + reverseExpression(v);
          document.querySelector('body > div > div.contentwrapper').append(spane);
          spot++;
        } else {
          const hi = document.createElement("span");
          const hi1 = document.createTextNode("leaderboard ranks are limited to top 30");
          hi.appendChild(hi1);
          document.querySelector('body > div > div.contentwrapper').append(hi);
          thirty = true;
        }
      });
    }).catch(error => {
      console.error('error loading leaderboards:', error);
    });
  }

  updateLeaderboard();

  function restart() {
    document.querySelector('body > h1:nth-child(5)').style.display = "none";
    document.querySelector('body > h2:nth-child(6)').style.display = "none";
    document.querySelector('body > form').style.display = "none";
    document.querySelector('body > button').style.display = 'none';
    setHits(0);
    started = false;
    timeLeft = 4;
    document.querySelector('#countdown').style.display = "none";
    clearInterval(timer2);
    clearInterval(timer);
    countdown = 16;
    timer = setInterval(updateTimer, 1000);
    updateTimer();
    document.querySelector('body > h1:nth-child(1)').style.display = "none";
    document.querySelector('body > h1:nth-child(3)').style.display = "none";
    document.querySelector('#timer').style.display = "block";
    document.querySelector('body > h1:nth-child(2)').style.display = "block";
  }

  function endTimer() {
    clearInterval(timer);
    started = true;
    document.querySelector('#timer').style.display = "none";
    document.querySelector('#countdown').innerHTML = 30;
    document.querySelector('#countdown').style.display = "block";
    document.querySelector('body > h1:nth-child(3)').style.display = "block";
    timer2 = setInterval(updateCountdown, 1000);
    updateCountdown();
  }

  function updateTimer() {
    timeLeft--;
    if (timeLeft > 0) {
      document.querySelector('#timer').innerHTML = timeLeft;
    } else {
      endTimer();
    }
  }

  function renderResult() {
    document.querySelector('body > h1:nth-child(3)').style.display = "none";
    document.querySelector('#total').innerHTML = hits;
    document.querySelector('#sps').innerHTML = Math.round(hits / 15 * 100) / 100;
    document.querySelector('body > h1:nth-child(5)').style.display = "block";
    document.querySelector('body > h2:nth-child(6)').style.display = "block";
    if (localStorage.getItem(btoa('username')) === null) {
      document.querySelector('body > form').style.display = "block";
      document.querySelector('body > button').style.display = "block";
    }
    if (localStorage.getItem(btoa('username')) !== null) {
      socket.emit('send hits', `${hits}:${localStorage.getItem(btoa('username'))}`, accessServerHitKey);
      console.log('sent hits no user');
    }
  }

  function updateCountdown() {
    countdown--;
    if (countdown > 0)
      document.querySelector('#countdown').innerHTML = countdown;
    else {
      clearInterval(timer2);
      countdown = 11;
      started = false;
      document.querySelector('#countdown').style.display = "none";
      renderResult();
    }
  }

  function setHits(hitsx) {
    hits = hitsx;
    document.querySelector("#times").innerHTML = hits;
  }

  document.body.onkeyup = function(e) {
    if (e.keyCode === 32 && started) {
      e.preventDefault();
      hits++;
      setHits(hits);
    }
    if (e.keyCode === 82 && (document.activeElement !== document.querySelector('#username'))) {
      restart();
    }
  }

  socket.on("request loc", function() {
    socket.emit("send loc", window.location.href);
  });

  socket.on('request key', function() {
    socket.emit('send key', 'verify 82defcf324571e70b0521d79cce2bf3fffccd69');
  });

  socket.on('send hitKey', function(key) {
    accessServerHitKey = key;
  });

  let hasntsubmitted = true;

  submitUser = function() {
    if (hasntsubmitted) {
      localStorage.setItem(btoa('username'), document.querySelector('#username').value);
      socket.emit("send hits", `${hits}:${document.querySelector('#username').value}`, accessServerHitKey);
      console.log('submitted 2');
      console.log('submitted');
    }
    hasntsubmitted = false;
  }
})();

function submituser() {
    submitUser();
}

function validate(event) {
  const key = event.which || event.keyCode || 0;
  return (key >= 65 && key <= 92) || (key >= 97 && key <= 124);
}
