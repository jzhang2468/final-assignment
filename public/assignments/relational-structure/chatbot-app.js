(function () {
  const functionName = "chatWithAtlas";
  const region = "us-central1";
  const requiredConfigKeys = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId"
  ];

  document.addEventListener("DOMContentLoaded", initAgent);

  function initAgent() {
    const status = document.getElementById("agent-status");
    const form = document.getElementById("agent-form");
    const input = document.getElementById("agent-input");
    const send = document.getElementById("agent-send");
    const messages = document.getElementById("agent-messages");

    if (!status || !form || !input || !send || !messages) {
      return;
    }

    if (!hasUsableConfig(window.FIREBASE_WEB_CONFIG)) {
      setStatus(status, "Add Firebase config to enable the agent", "needs-setup");
      return;
    }

    if (!window.firebase || !firebase.auth || !firebase.functions) {
      setStatus(status, "Firebase Auth or Functions did not load", "error");
      return;
    }

    const firebaseApp = getFirebaseApp();
    const auth = firebaseApp.auth ? firebaseApp.auth() : firebase.auth();
    const functions = firebaseApp.functions ? firebaseApp.functions(region) : firebase.functions();
    const chatWithAtlas = functions.httpsCallable(functionName);

    auth.signInAnonymously()
      .then(() => {
        setStatus(status, "Secure Firebase agent ready", "ready");
        setFormDisabled(input, send, false);
      })
      .catch(() => {
        setStatus(status, "Enable anonymous Firebase Auth", "needs-setup");
        appendMessage(messages, "error", "Anonymous sign-in is not enabled yet. Turn on Anonymous Authentication in Firebase before using the chatbot.");
      });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitQuestion({ input, send, status, messages, chatWithAtlas });
    });
  }

  function getFirebaseApp() {
    if (firebase.apps && firebase.apps.length > 0) {
      return firebase.app();
    }

    return firebase.initializeApp(window.FIREBASE_WEB_CONFIG);
  }

  function hasUsableConfig(config) {
    if (!config) {
      return false;
    }

    return requiredConfigKeys.every((key) => {
      const value = config[key];
      return (
        typeof value === "string" &&
        value.trim().length > 0 &&
        !value.includes("PASTE_YOUR") &&
        !value.includes("your-")
      );
    });
  }

  async function submitQuestion({ input, send, status, messages, chatWithAtlas }) {
    const userMessage = input.value.trim();

    if (!userMessage) {
      return;
    }

    appendMessage(messages, "user", userMessage);
    input.value = "";
    setStatus(status, "Thinking through Firebase...", "thinking");
    setFormDisabled(input, send, true);

    try {
      const result = await chatWithAtlas({ message: userMessage });
      const reply = result && result.data && result.data.reply
        ? result.data.reply
        : "The agent returned an empty response.";

      appendMessage(messages, "agent", reply);
      setStatus(status, "Secure Firebase agent ready", "ready");
    } catch (error) {
      const message = readableFunctionError(error);
      appendMessage(messages, "error", message);
      setStatus(status, shortStatus(error), "needs-setup");
    } finally {
      setFormDisabled(input, send, false);
      input.focus();
    }
  }

  function appendMessage(container, role, text) {
    const item = document.createElement("div");
    const label = document.createElement("span");
    const body = document.createElement("p");

    item.className = `agent-message is-${role}`;
    label.className = "agent-message-label";
    label.textContent = role === "user" ? "You" : role === "error" ? "Setup note" : "Atlas agent";
    body.textContent = text;

    item.append(label, body);
    container.append(item);
    container.scrollTop = container.scrollHeight;
  }

  function readableFunctionError(error) {
    if (!error || !error.code) {
      return "The Firebase agent could not be reached yet. Check that the Firebase Function is deployed.";
    }

    if (error.code === "functions/not-found") {
      return "Deploy the chatWithAtlas Firebase Function before this GitHub Pages site can answer questions.";
    }

    if (error.code === "functions/unauthenticated") {
      return "Firebase sign-in is required. Enable Anonymous Authentication in the Firebase console.";
    }

    if (error.code === "functions/failed-precondition") {
      return "Add the OPENAI_API_KEY Firebase secret and redeploy the Function.";
    }

    if (error.code === "functions/resource-exhausted") {
      return "The demo's daily chat limit has been reached. Try again later.";
    }

    if (error.message) {
      return error.message;
    }

    return "The chatbot is not fully configured yet.";
  }

  function shortStatus(error) {
    if (error && error.code === "functions/resource-exhausted") {
      return "Daily agent limit reached";
    }

    return "Finish Firebase Function setup";
  }

  function setFormDisabled(input, send, disabled) {
    input.disabled = disabled;
    send.disabled = disabled;
  }

  function setStatus(status, message, state) {
    status.textContent = message;
    status.dataset.state = state;
  }
})();
