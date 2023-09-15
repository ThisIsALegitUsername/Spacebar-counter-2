var text = document.querySelector("#times");
var hits = 0;

function sethits(hitsx) {
  hits = hitsx;
  text.innerHTML = hits;
}

function save(){
  localStorage.setItem("hits", hits);
}

function load(){
  sethits(localStorage.getItem("hits"));
}

load();

document.body.onkeyup = function(e) {
  if(e.keyCode == 32 ) {
    e.preventDefault();
    hits++;
    sethits(hits);
  }
}