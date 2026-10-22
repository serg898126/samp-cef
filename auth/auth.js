(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  var fade = $("fade");
  var panel = $("panel");
  var panelAuth = $("panelAuth");
  var panelSkin = $("panelSkin");
  var form = $("authForm");
  var nicknameEl = $("nickname");
  var passwordEl = $("password");
  var password2El = $("password2");
  var confirmWrap = $("confirmWrap");
  var capsWrap = $("capsWrap");
  var errorWrap = $("errorWrap");
  var strengthWrap = $("strengthWrap");
  var strength = $("strength");
  var strengthText = $("strengthText");
  var submitBtn = $("submitBtn");
  var btnText = $("btnText");
  var errorEl = $("error");
  var title = $("title");
  var subtitle = $("subtitle");
  var switchText = $("switchText");
  var switchBtn = $("switchBtn");
  var tabs = $("tabs");
  var tabLogin = $("tabLogin");
  var tabReg = $("tabReg");
  var eye1 = $("eye1");
  var skinId = $("skinId");
  var btnPrev = $("btnPrev");
  var btnNext = $("btnNext");
  var btnPick = $("btnPick");

  var mode = "login";
  var busy = false;
  var skinActive = false;
  var picked = false;
  var skinDir = "to-next";

  function emit(ev, data) {
    if (typeof cef !== "undefined" && cef.emit) cef.emit(ev, String(data || ""));
  }

  function setOpen(el, state) { el.classList.toggle("open", !!state); }

  function swapText(el, text) {
    el.classList.remove("swap");
    void el.offsetWidth;
    el.textContent = text;
    el.classList.add("swap");
  }

  /* ---------- ошибки ---------- */
  function showError(msg) {
    errorEl.textContent = msg;
    setOpen(errorWrap, true);
    errorEl.classList.remove("shake");
    void errorEl.offsetWidth;
    errorEl.classList.add("shake");
  }
  function hideError() {
    setOpen(errorWrap, false);
    passwordEl.parentNode.classList.remove("invalid");
    password2El.parentNode.classList.remove("invalid");
  }

  function setLoading(state) {
    busy = state;
    submitBtn.disabled = state;
    submitBtn.classList.toggle("loading", state);
    btnText.textContent = state ? "Подождите" : (mode === "login" ? "Войти" : "Зарегистрироваться");
  }

  /* ---------- надёжность пароля ---------- */
  var LEVELS = ["", "Слабый", "Средний", "Хороший", "Надёжный"];
  function updateStrength() {
    var show = mode === "register" && passwordEl.value.length > 0;
    setOpen(strengthWrap, show);
    if (!show) return;
    var p = passwordEl.value, s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 9) s++;
    if (/[a-zа-я]/i.test(p) && /\d/.test(p)) s++;
    if ((/[A-ZА-Я]/.test(p) && /[^\w\s]/.test(p)) || p.length >= 12) s++;
    if (s < 1) s = 1;
    strength.className = "strength s" + s;
    strengthText.textContent = LEVELS[s];
  }

  /* ---------- режимы ---------- */
  function setMode(next, silent) {
    var changed = next !== mode;
    mode = next;
    hideError();
    passwordEl.value = "";
    password2El.value = "";
    updateStrength();

    var reg = mode === "register";
    tabs.classList.toggle("reg", reg);
    tabLogin.classList.toggle("active", !reg);
    tabReg.classList.toggle("active", reg);

    setOpen(confirmWrap, reg);
    password2El.tabIndex = reg ? 0 : -1;
    passwordEl.placeholder = reg ? "Придумайте пароль" : "Введите пароль";

    if (changed || !silent) {
      swapText(title, reg ? "Создай аккаунт" : "С возвращением");
      swapText(subtitle, reg ? "Придумай пароль для персонажа" : "Войдите, чтобы продолжить");
    }
    if (!busy) btnText.textContent = reg ? "Зарегистрироваться" : "Войти";
    switchText.textContent = reg ? "Уже есть аккаунт?" : "Нет аккаунта?";
    switchBtn.textContent = reg ? "Войти" : "Регистрация";
  }

  /* ---------- скины ---------- */
  function setSkin(id) {
    skinId.textContent = String(id || "");
    skinId.classList.remove("to-next", "to-prev");
    void skinId.offsetWidth;
    skinId.classList.add(skinDir);
  }

  function showSkinPanel(id) {
    skinId.textContent = String(id || "77");
    panelAuth.classList.remove("active");
    panelAuth.classList.add("leave");
    panelSkin.classList.add("active");
    skinActive = true;
  }

  /* ---------- события от сервера ---------- */
  if (typeof cef !== "undefined" && cef.on) {
    cef.on("auth:init", function (args) {
      var p = String(args || "").trim().split(/\s+/);
      nicknameEl.value = p[0] || "Player";
      setMode(p[1] === "register" ? "register" : "login", true);
    });

    cef.on("auth:error", function (msg) {
      setLoading(false);
      passwordEl.parentNode.classList.add("invalid");
      showError(msg || "Ошибка");
      passwordEl.focus();
      passwordEl.select();
    });

    // успешный вход — плавное затемнение, сервер сам закроет
    cef.on("auth:success", function () {
      setLoading(false);
      panel.classList.add("hide");
      fade.classList.add("on");
    });

    // регистрация — переход к выбору скина
    cef.on("auth:skin", function (id) {
      setLoading(false);
      showSkinPanel(id);
    });

    cef.on("skin:update", function (id) {
      setSkin(id);
    });
  }

  /* ---------- UI ---------- */
  tabLogin.onclick = function () { if (!busy && mode !== "login") setMode("login"); };
  tabReg.onclick = function () { if (!busy && mode !== "register") setMode("register"); };
  switchBtn.onclick = function () {
    if (!busy) setMode(mode === "login" ? "register" : "login");
  };

  eye1.onclick = function () {
    var show = passwordEl.type === "password";
    passwordEl.type = show ? "text" : "password";
    password2El.type = show ? "text" : "password";
    eye1.classList.toggle("on", show);
    passwordEl.focus();
  };

  passwordEl.addEventListener("input", function () { hideError(); updateStrength(); });
  password2El.addEventListener("input", hideError);

  // Caps Lock
  function checkCaps(e) {
    if (e.getModifierState) setOpen(capsWrap, e.getModifierState("CapsLock"));
  }
  [passwordEl, password2El].forEach(function (el) {
    el.addEventListener("keydown", checkCaps);
    el.addEventListener("keyup", checkCaps);
    el.addEventListener("blur", function () { setOpen(capsWrap, false); });
  });

  form.onsubmit = function (e) {
    e.preventDefault();
    if (busy) return;
    var pass = passwordEl.value;
    var pass2 = password2El.value;
    hideError();

    if (pass.length < 4) {
      passwordEl.parentNode.classList.add("invalid");
      showError("Пароль не короче 4 символов");
      return;
    }
    if (mode === "register" && pass !== pass2) {
      password2El.parentNode.classList.add("invalid");
      showError("Пароли не совпадают");
      return;
    }
    setLoading(true);
    emit("auth:submit", mode + " " + pass);
  };

  /* ---------- выбор скина ---------- */
  function skinPrev() { if (!picked) { skinDir = "to-prev"; emit("skin:prev"); } }
  function skinNext() { if (!picked) { skinDir = "to-next"; emit("skin:next"); } }
  function skinPick() {
    if (picked) return;
    picked = true;
    panel.classList.add("hide");
    fade.classList.add("on");
    setTimeout(function () { emit("skin:confirm"); }, 550);
  }

  btnPrev.onclick = skinPrev;
  btnNext.onclick = skinNext;
  btnPick.onclick = skinPick;

  document.addEventListener("keydown", function (e) {
    if (!skinActive) return;
    if (e.key === "ArrowLeft") skinPrev();
    else if (e.key === "ArrowRight") skinNext();
    else if (e.key === "Enter") skinPick();
  });

  setTimeout(function () { passwordEl.focus(); }, 500);
})();
