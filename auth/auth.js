(function () {
  "use strict";

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
  var togglePass = document.getElementById("togglePass");

  var mode = "login";
  var busy = false;

  function emit(event, data) {
    if (typeof cef !== "undefined" && cef.emit) {
      cef.emit(event, String(data));
    }
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function hideError() {
    errorEl.hidden = true;
  }

  function setLoading(state) {
    busy = state;
    submitBtn.disabled = state;
    btnText.textContent = state
      ? "..."
      : mode === "login"
        ? "Войти"
        : "Зарегистрироваться";
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

  if (typeof cef !== "undefined" && cef.on) {
    cef.on("auth:init", function (args) {
      var parts = String(args || "").trim().split(/\s+/);
      nicknameEl.value = parts[0] || "Player";
      setMode(parts[1] === "register" ? "register" : "login");
    });

    cef.on("auth:error", function (msg) {
      setLoading(false);
      showError(msg || "Ошибка");
    });

    cef.on("auth:success", function () {
      setLoading(false);
    });
  }

  switchBtn.onclick = function () {
    if (!busy) setMode(mode === "login" ? "register" : "login");
  };

  togglePass.onclick = function () {
    var show = passwordEl.type === "password";
    passwordEl.type = show ? "text" : "password";
    password2El.type = show ? "text" : "password";
  };

  form.onsubmit = function (e) {
    e.preventDefault();
    if (busy) return;

    var pass = passwordEl.value;
    var pass2 = password2El.value;
    hideError();

    if (pass.length < 4) {
      showError("Пароль не короче 4 символов");
      return;
    }
    if (mode === "register" && pass !== pass2) {
      showError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    emit("auth:submit", mode + " " + pass);
  };

  setTimeout(function () {
    passwordEl.focus();
  }, 200);
})();