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
  var skinName = document.getElementById("skinName");
  var btnPrev = document.getElementById("btnPrev");
  var btnNext = document.getElementById("btnNext");
  var btnPick = document.getElementById("btnPick");

  var mode = "login";
  var busy = false;

  // ID скина → название
  var SKIN_NAMES = {
    134: "Бездомный 1",
    135: "Бездомный 2",
    136: "Бездомный 3",
    137: "Бездомный 4",
    200: "Бездомный 5",
    212: "Бездомный 6",
    213: "Бездомный 7",
    230: "Бездомный 8",
    239: "Бездомный 9"
  };

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

  function updateSkinName(id) {
    skinName.textContent = SKIN_NAMES[id] || ("Бездомный");
  }

  function showSkinPanel(id) {
    panelAuth.classList.add("hide");
    fade.classList.add("on");
    setTimeout(function () {
      panelAuth.hidden = true;
      panelSkin.hidden = false;
      updateSkinName(id || 134);
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

    cef.on("auth:success", function () {
      setLoading(false);
      panelAuth.classList.add("hide");
      fade.classList.add("on");
    });

    cef.on("auth:skin", function (id) {
      setLoading(false);
      showSkinPanel(parseInt(id, 10) || 134);
    });

    cef.on("skin:update", function (id) {
      updateSkinName(parseInt(id, 10) || 134);
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
