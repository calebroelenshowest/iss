// This is the javascript file used in index.html

const registerListeners = () => { // Listeners (Events)
  // Subscribe POST disabled: No need.

  let subscribePopup = document.querySelector(".js-popup-open");
  subscribePopup.addEventListener("click", togglePopup);

  let popupClosebtn = document.querySelector(".js-popup-close");
  popupClosebtn.addEventListener("click", togglePopup);

  let subscribeBtn = document.querySelector(".js-popup-subscribe");
  subscribeBtn.addEventListener("click", togglePopup);

  let openAppbtn = document.querySelector(".js-open-app");
  openAppbtn.addEventListener("click", function () {
    window.location = window.location.href.replace("/index.html", "/app.html");
  });
};

const togglePopup = () => {
  let popupDiv = document.querySelector(".js-popup");
  popupDiv.classList.toggle("u-hide");
};

const init = () => {
  console.info("DOMContent Loaded");
  registerListeners();
};

document.addEventListener("DOMContentLoaded", init);