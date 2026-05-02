const admin = require('firebase-admin');

const isFirebaseConfigured = () =>
  Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );

const getFirebaseApp = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  if (!isFirebaseConfigured()) {
    throw new Error(
      'Missing Firebase Admin environment variables. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
};

const getFirebaseAuth = () => getFirebaseApp().auth();

module.exports = {
  getFirebaseAuth,
  isFirebaseConfigured,
};
