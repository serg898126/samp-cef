(function () {
  "use strict";

  var fade = document.getElementById("fade");
  var panelAuth = document.getElementById("panelAuth");
  var panelSkin = document.getElementById("panelSkin");
  var form = document.getElementById("authForm");
  var nicknameEl = document.getElementById("nickname");
  var passwordEl = document.getElementById("password");
  var password2El = document.getElementById("password2");
  var confirmField = document.getElementById("confirmField");
  var submitBtn = document.getElementById("submitBtn");
  var btnText = document.getElementById("btnText");
  var errorEl = document.getElementById("error");
  var subtitle = document.getElementById("subtitle");
  var switchText = document.getElementById("switchText");
  var switchBtn = document.getElementById("switchBtn");
  var skinId = document.getElementById("skinId");
  var btnPrev = document.getElementById("btnPrev");
  var btnNext = document.getElementById("btnNext");
  var btnPick = document.getElementById("btnPick");

  var mode = "login";
  var busy = false;

  function emit(ev, data) {
    if (typeof cef !== "undefined" && cef.emit) cef.emit(ev, String(data || ""));
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }
  function hideError() { errorEl.hidden = true; }

  function setLoading(state) {
    busy = state;
    submitBtn.disabled = state;
    btnText.textContent = state ? "..." : (mode === "login" ? "Войти" : "Зарегистрироваться");
  }

  function setMode(next) {
    mode = next;
    hideError();
    passwordEl.value = "";
    password2El.value = "";
    if (mode === "login") {
      subtitle.textContent = "Вход в аккаунт";
      btnText.textContent = "Войти";
      confirmField.hidden = true;
      switchText.textContent = "Нет аккаунта?";
      switchBtn.textContent = "Регистрация";
    } else {
      subtitle.textContent = "Создание персонажа";
      btnText.textContent = "Зарегистрироваться";
      confirmField.hidden = false;
      switchText.textContent = "Уже есть аккаунт?";
      switchBtn.textContent = "Войти";
    }
  }

  function showSkinPanel(id) {
    panelAuth.classList.add("hide");
    fade.classList.add("on");
    setTimeout(function () {
      panelAuth.hidden = true;
      panelSkin.hidden = false;
      skinId.textContent = String(id || "77");
      fade.classList.remove("on");
      panelSkin.classList.remove("hide");
    }, 450);
  }

  if (typeof cef !== "undefined" && cef.on) {
    cef.on("auth:init", function (args) {
      var p = String(args || "").trim().split(/\s+/);
      nicknameEl.value = p[0] || "Player";
      setMode(p[1] === "register" ? "register" : "login");
    });

    cef.on("auth:error", function (msg) {
      setLoading(false);
      showError(msg || "Ошибка");
    });

    // успешный логин — только затемнение, сервер сам закроет
    cef.on("auth:success", function () {
      setLoading(false);
      panelAuth.classList.add("hide");
      fade.classList.add("on");
    });

    // регистрация — переход к выбору скина в том же CEF
    cef.on("auth:skin", function (id) {
      setLoading(false);
      showSkinPanel(id);
    });

    cef.on("skin:update", function (id) {
      skinId.textContent = String(id || "");
    });
  }

  switchBtn.onclick = function () {
    if (!busy) setMode(mode === "login" ? "register" : "login");
  };

  form.onsubmit = function (e) {
    e.preventDefault();
    if (busy) return;
    var pass = passwordEl.value;
    var pass2 = password2El.value;
    hideError();
    if (pass.length < 4) { showError("Пароль не короче 4 символов"); return; }
    if (mode === "register" && pass !== pass2) { showError("Пароли не совпадают"); return; }
    setLoading(true);
    emit("auth:submit", mode + " " + pass);
  };

  btnPrev.onclick = function () { emit("skin:prev"); };
  btnNext.onclick = function () { emit("skin:next"); };
  btnPick.onclick = function () {
    panelSkin.classList.add("hide");
    fade.classList.add("on");
    setTimeout(function () { emit("skin:confirm"); }, 400);
  };

  setTimeout(function () { passwordEl.focus(); }, 200);
})();
