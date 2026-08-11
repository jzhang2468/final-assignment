const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const openAiApiKey = defineSecret("OPENAI_API_KEY");
const databaseURL = process.env.FIREBASE_DATABASE_URL || "https://engagement-components-ef842-default-rtdb.firebaseio.com";
const dailyLimit = Number(process.env.AGENT_DAILY_LIMIT || 15);
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

admin.initializeApp({ databaseURL });

exports.chatWithAtlas = onCall({
  region: "us-central1",
  secrets: [openAiApiKey],
  timeoutSeconds: 30,
  memory: "256MiB",
  maxInstances: 5
}, async (request) => {
  const uid = request.auth && request.auth.uid;

  if (!uid) {
    throw new HttpsError("unauthenticated", "Sign in with Firebase before using the research agent.");
  }

  const message = normalizeMessage(request.data && request.data.message);

  if (!message) {
    throw new HttpsError("invalid-argument", "Message is required.");
  }

  const apiKey = openAiApiKey.value();

  if (!apiKey) {
    throw new HttpsError("failed-precondition", "OPENAI_API_KEY is not configured.");
  }

  const database = admin.database();
  await enforceDailyLimit(database, uid);

  const openAiResult = await askOpenAI(apiKey, message);
  const reply = extractResponseText(openAiResult);

  if (!reply) {
    throw new HttpsError("internal", "The agent returned no text.");
  }

  await logAgentUse(database, uid, message, reply, openAiResult.usage || null);

  return {
    reply,
    model: openAiResult.model || model
  };
});

function normalizeMessage(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, 800);
}

async function enforceDailyLimit(database, uid) {
  const today = new Date().toISOString().slice(0, 10);
  const usageRef = database.ref(`agentUsage/${today}/${uid}`);

  const result = await usageRef.transaction((currentValue) => {
    const count = Number(currentValue || 0);

    if (count >= dailyLimit) {
      return;
    }

    return count + 1;
  });

  if (!result.committed) {
    throw new HttpsError("resource-exhausted", "Daily chat limit reached.");
  }
}

async function askOpenAI(apiKey, message) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      instructions: [
        "You are a concise research guide for the Architectural Generations relational atlas.",
        "The atlas connects MoMA-listed architects only when their birth years are within six years; this does not prove collaboration, influence, mentorship, shared style, or shared philosophy.",
        "Never say that a cluster reveals or suggests collaboration, influence, mentorship, shared style, shared philosophy, or stylistic evolution unless the user provides separate evidence.",
        "When asked for an insight, focus on generational overlap, mapped NYC landmark traces, data gaps, and what evidence a researcher should collect next.",
        "Help visitors interpret generational proximity, the NYC landmark map extension, and possible archive or fieldwork layers.",
        "Do not invent unsupported facts. When evidence is missing, name the missing evidence and say what should be checked next.",
        "Keep the reply under 120 words and make it useful for a design research project."
      ].join(" "),
      input: message,
      max_output_tokens: 320,
      temperature: 0.2,
      store: false
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("OpenAI request failed", response.status, payload.error && payload.error.message);
    throw new HttpsError("internal", "OpenAI request failed.");
  }

  return payload;
}

function extractResponseText(payload) {
  if (payload && typeof payload.output_text === "string") {
    return payload.output_text.trim();
  }

  if (!payload || !Array.isArray(payload.output)) {
    return "";
  }

  return payload.output
    .flatMap((item) => Array.isArray(item.content) ? item.content : [])
    .map((content) => content.text || content.output_text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function logAgentUse(database, uid, message, reply, usage) {
  const today = new Date().toISOString().slice(0, 10);
  const logRef = database.ref(`agentLogs/${today}/${uid}`).push();

  await logRef.set({
    createdAt: admin.database.ServerValue.TIMESTAMP,
    model,
    messagePreview: preview(message),
    replyPreview: preview(reply),
    usage
  });
}

function preview(value) {
  return String(value || "").slice(0, 220);
}
