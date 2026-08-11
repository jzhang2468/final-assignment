(function () {
  const pollId = "relational-atlas-next-layer";
  const storageKey = `firebase-poll-vote:${pollId}`;
  const options = {
    images: "Archival images",
    voices: "Oral histories",
    materials: "Material timelines",
    fieldwork: "Fieldwork routes"
  };
  const requiredConfigKeys = [
    "apiKey",
    "authDomain",
    "databaseURL",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId"
  ];

  document.addEventListener("DOMContentLoaded", initPoll);

  function initPoll() {
    const status = document.getElementById("poll-status");
    const buttons = Array.from(document.querySelectorAll(".poll-option"));

    if (!status || buttons.length === 0) {
      return;
    }

    if (!hasUsableConfig(window.FIREBASE_WEB_CONFIG)) {
      setStatus(status, "Add Firebase config to collect responses", "needs-setup");
      setButtonsDisabled(buttons, true);
      return;
    }

    if (!window.firebase || !window.firebase.database) {
      setStatus(status, "Firebase scripts did not load", "error");
      setButtonsDisabled(buttons, true);
      return;
    }

    const firebaseApp = getFirebaseApp();
    const database = firebaseApp.database ? firebaseApp.database() : firebase.database();
    const votesRef = database.ref(`polls/${pollId}/votes`);
    const savedVote = window.localStorage.getItem(storageKey);

    initializeCounts(votesRef);
    listenForVoteChanges(votesRef);
    monitorConnection(database, status);

    if (savedVote && options[savedVote]) {
      markSelected(savedVote);
      setButtonsDisabled(buttons, true);
      setStatus(status, `This browser voted for ${options[savedVote]}`, "voted");
      return;
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => submitVote(button.dataset.option, votesRef, status, buttons));
    });
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

  function getFirebaseApp() {
    if (firebase.apps && firebase.apps.length > 0) {
      return firebase.app();
    }

    return firebase.initializeApp(window.FIREBASE_WEB_CONFIG);
  }

  function initializeCounts(votesRef) {
    Object.keys(options).forEach((option) => {
      votesRef.child(option).transaction((currentValue) => Number(currentValue || 0));
    });
  }

  function listenForVoteChanges(votesRef) {
    votesRef.on("value", (snapshot) => {
      const votes = snapshot.val() || {};
      let total = 0;

      Object.keys(options).forEach((option) => {
        const count = Number(votes[option] || 0);
        total += count;
        const countElement = document.getElementById(`count-${option}`);
        if (countElement) {
          countElement.textContent = count;
        }
      });

      document.getElementById("poll-total").textContent = total;
    });
  }

  function monitorConnection(database, status) {
    database.ref(".info/connected").on("value", (snapshot) => {
      if (window.localStorage.getItem(storageKey)) {
        return;
      }

      if (snapshot.val() === true) {
        setStatus(status, "Connected to Firebase", "connected");
      } else {
        setStatus(status, "Connecting to Firebase...", "pending");
      }
    });
  }

  function submitVote(option, votesRef, status, buttons) {
    if (!options[option] || window.localStorage.getItem(storageKey)) {
      return;
    }

    setButtonsDisabled(buttons, true);
    setStatus(status, "Saving vote...", "pending");

    votesRef
      .child(option)
      .transaction((currentValue) => Number(currentValue || 0) + 1)
      .then(() => {
        window.localStorage.setItem(storageKey, option);
        markSelected(option);
        setStatus(status, `Thanks - counted ${options[option]}`, "voted");
      })
      .catch(() => {
        setStatus(status, "Vote was not saved. Check database rules.", "error");
        setButtonsDisabled(buttons, false);
      });
  }

  function markSelected(option) {
    document.querySelectorAll(".poll-option").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.option === option);
    });
  }

  function setButtonsDisabled(buttons, disabled) {
    buttons.forEach((button) => {
      button.disabled = disabled;
    });
  }

  function setStatus(status, message, state) {
    status.textContent = message;
    status.dataset.state = state;
  }
})();
