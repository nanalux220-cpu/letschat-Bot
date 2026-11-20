/*! LetsChat widget. Embed: <script src="https://YOUR-APP/widget.js" data-bot="BOT_ID" defer></script> */
(function () {
  if (window.__letschatLoaded) return;
  window.__letschatLoaded = true;

  var script = document.currentScript || document.querySelector("script[data-bot]");
  if (!script) return;
  var BOT = script.getAttribute("data-bot");
  var API = new URL(script.src).origin;
  if (!BOT) return;

  var KEY = "letschat:" + BOT;
  var state = { open: false, messages: [], busy: false, cfg: null };
  try {
    var saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (saved && Array.isArray(saved.messages)) state.messages = saved.messages;
  } catch (e) {}
  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify({ messages: state.messages.slice(-30) })); } catch (e) {}
  }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === "text") n.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function contrast(hex) {
    var h = (hex || "#1d4ed8").replace("#", "");
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 160 ? "#111827" : "#ffffff";
  }

  var CSS =
    ":host{all:initial}*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}" +
    ".bubble{position:fixed;right:20px;bottom:20px;width:60px;height:60px;border-radius:50%;border:0;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;z-index:2147483000}" +
    ".bubble svg{width:28px;height:28px}" +
    ".panel{position:fixed;right:20px;bottom:92px;width:370px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.25);display:none;flex-direction:column;overflow:hidden;z-index:2147483000;color:#111827}" +
    ".panel.open{display:flex}" +
    ".head{display:flex;align-items:center;gap:10px;padding:14px 16px}" +
    ".head img{width:36px;height:36px;border-radius:50%;object-fit:cover;background:#fff}" +
    ".head .t{font-weight:700;font-size:15px;flex:1}" +
    ".head button{background:transparent;border:0;font-size:22px;cursor:pointer;line-height:1}" +
    ".body{flex:1;overflow-y:auto;padding:14px;background:#f6f7f9;display:flex;flex-direction:column;gap:8px}" +
    ".m{max-width:85%;padding:9px 12px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}" +
    ".m.a{background:#fff;border:1px solid #e5e7eb;align-self:flex-start;border-bottom-left-radius:4px}" +
    ".m.u{align-self:flex-end;border-bottom-right-radius:4px}" +
    ".typing{opacity:.6;font-style:italic}" +
    ".actions{display:flex;gap:6px;padding:8px 12px 0;flex-wrap:wrap;background:#fff}" +
    ".chip{font-size:12px;border:1px solid #d1d5db;background:#fff;border-radius:999px;padding:6px 10px;cursor:pointer;color:#111827;text-decoration:none}" +
    ".chip.wa{background:#25d366;border-color:#25d366;color:#fff}" +
    ".foot{display:flex;gap:8px;padding:10px 12px 12px;background:#fff}" +
    ".foot input{flex:1;border:1px solid #d1d5db;border-radius:10px;padding:10px;font-size:14px;outline:none;color:#111827;background:#fff}" +
    ".foot button{border:0;border-radius:10px;padding:0 14px;font-weight:600;cursor:pointer}" +
    ".lead{padding:12px;background:#fff;border-top:1px solid #e5e7eb;display:none;flex-direction:column;gap:6px}" +
    ".lead.open{display:flex}" +
    ".lead input,.lead textarea{border:1px solid #d1d5db;border-radius:8px;padding:8px;font-size:13px;color:#111827;background:#fff}" +
    ".lead button{border:0;border-radius:8px;padding:9px;font-weight:600;cursor:pointer}" +
    "@media (max-width:480px){.panel{right:8px;left:8px;width:auto;bottom:84px;height:calc(100vh - 100px)}}";

  var host = el("div", { id: "letschat-root" });
  var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;
  root.appendChild(el("style", { text: CSS }));

  var bodyEl, inputEl, sendBtn, panel, leadBox, bubble;

  function render() {
    bodyEl.innerHTML = "";
    var c = state.cfg;
    if (c.welcome) bodyEl.appendChild(el("div", { class: "m a", text: c.welcome }));
    state.messages.forEach(function (m) {
      var n = el("div", { class: "m " + (m.role === "user" ? "u" : "a"), text: m.content });
      if (m.role === "user") { n.style.background = c.color; n.style.color = contrast(c.color); }
      bodyEl.appendChild(n);
    });
    if (state.busy) bodyEl.appendChild(el("div", { class: "m a typing", text: "Typing..." }));
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function send() {
    var text = (inputEl.value || "").trim();
    if (!text || state.busy) return;
    inputEl.value = "";
    state.messages.push({ role: "user", content: text.slice(0, 1000) });
    // Keep the history short and starting with a user message.
    var hist = state.messages.slice(-20);
    while (hist.length && hist[0].role !== "user") hist.shift();
    state.busy = true;
    render();
    fetch(API + "/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ botId: BOT, messages: hist }),
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) {
        state.messages.push({ role: "assistant", content: d.reply || "Sorry, something went wrong. Please try again." });
        if (d.error === "limit_reached") leadBox.classList.add("open");
      })
      .catch(function () {
        state.messages.push({ role: "assistant", content: "Sorry, I couldn't connect. Please try again." });
      })
      .then(function () { state.busy = false; save(); render(); });
  }

  function build(c) {
    var fg = contrast(c.color);
    bubble = el("button", { class: "bubble", "aria-label": "Open chat with " + c.name, onclick: toggle });
    bubble.style.background = c.color;
    bubble.innerHTML = '<svg viewBox="0 0 24 24" fill="' + fg + '"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z"/></svg>';

    var head = el("div", { class: "head" }, [
      c.logo ? el("img", { src: c.logo, alt: "" }) : null,
      el("div", { class: "t", text: c.name }),
      el("button", { "aria-label": "Close chat", text: "×", onclick: toggle }),
    ]);
    head.style.background = c.color;
    head.style.color = fg;
    head.lastChild.style.color = fg;

    bodyEl = el("div", { class: "body", role: "log", "aria-live": "polite" });

    var actions = el("div", { class: "actions" }, [
      el("button", { class: "chip", text: "Leave your details", onclick: function () { leadBox.classList.toggle("open"); } }),
      c.whatsapp
        ? el("a", { class: "chip wa", href: "https://wa.me/" + c.whatsapp, target: "_blank", rel: "noopener", text: "Chat on WhatsApp" })
        : null,
    ]);

    var lName = el("input", { placeholder: "Your name", maxlength: "100" });
    var lContact = el("input", { placeholder: "Email or phone *", maxlength: "150" });
    var lMsg = el("textarea", { placeholder: "How can we help?", rows: "2", maxlength: "1000" });
    var lBtn = el("button", { text: "Send details" });
    lBtn.style.background = c.color;
    lBtn.style.color = fg;
    lBtn.addEventListener("click", function () {
      if ((lContact.value || "").trim().length < 5) { lContact.focus(); return; }
      lBtn.disabled = true;
      fetch(API + "/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ botId: BOT, name: lName.value, contact: lContact.value, message: lMsg.value, page: location.href }),
      })
        .then(function (r) { return r.ok; })
        .catch(function () { return false; })
        .then(function (ok) {
          lBtn.disabled = false;
          state.messages.push({ role: "assistant", content: ok ? "Thanks! We've got your details and will be in touch soon." : "Sorry, that didn't send. Please try again." });
          if (ok) { leadBox.classList.remove("open"); lName.value = lContact.value = lMsg.value = ""; }
          save(); render();
        });
    });
    leadBox = el("div", { class: "lead" }, [lName, lContact, lMsg, lBtn]);

    inputEl = el("input", { placeholder: "Type your message...", maxlength: "1000", "aria-label": "Message" });
    inputEl.addEventListener("keydown", function (e) { if (e.key === "Enter") send(); });
    sendBtn = el("button", { text: "Send", onclick: send });
    sendBtn.style.background = c.color;
    sendBtn.style.color = fg;

    panel = el("div", { class: "panel", role: "dialog", "aria-label": c.name + " chat" }, [
      head, bodyEl, leadBox, actions, el("div", { class: "foot" }, [inputEl, sendBtn]),
    ]);
    root.appendChild(panel);
    root.appendChild(bubble);
    document.body.appendChild(host);
    render();
  }

  function toggle() {
    state.open = !state.open;
    panel.classList.toggle("open", state.open);
    if (state.open) setTimeout(function () { inputEl.focus(); }, 50);
  }

  function start() {
    fetch(API + "/api/bot/" + encodeURIComponent(BOT))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (c) {
        if (!c || !c.active) return; // not set up or not subscribed: show nothing
        state.cfg = c;
        build(c);
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
