const fs = require('fs');

const firebaseConfig = require('./firebase-applet-config.json');

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents`;

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    return { mapValue: { fields: toFirestoreFields(val) } };
  }
  return { stringValue: String(val) };
}

async function run() {
  console.log("Configuring connection for:", firebaseConfig.projectId, "with database:", firebaseConfig.firestoreDatabaseId);
  const testUser = {
    id: "test_usr_real_sim",
    name: "Simulation Real",
    email: "sim.real@hershield.app",
    passwordHash: "bcrypt_hash_goes_here",
    emailVerified: false,
    verificationToken: "some_verification_token_12345",
    verificationTokenExpiry: Date.now() + 3600000,
    usedVerificationTokens: [],
    createdAt: new Date().toISOString(),
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Simulation",
    settings: {
      locationSharingPreference: 'active_journey_only',
      saveJourneyHistory: true,
    }
  };

  const url = `${FIRESTORE_BASE}/users/${testUser.id}?key=${firebaseConfig.apiKey}`;
  const fields = toFirestoreFields(testUser);
  console.log("Sending PATCH request to:", url);
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
    console.log("Status Code:", res.status);
    const text = await res.text();
    console.log("Response Body:", text);
  } catch (err) {
    console.error("Fetch Exception:", err);
  }
}

run();
