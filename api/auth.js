import { db, auth } from './firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default async function handler(req, res) {
  console.log("📥 Request received:", req.body);

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { action, email, password, name } = req.body;

    if (!action || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (action === 'login') {
      await handleLogin(email, password, res);
    } else if (action === 'signup') {
      if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required for signup' });
      }
      await handleSignup(email, password, name, res);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
  } catch (error) {
    console.error("🔥 Server error:", error.message);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}

// ✅ Improved Login
async function handleLogin(email, password, res) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return res.status(200).json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Error logging in:", error.message);

    return res.status(401).json({
      success: false,
      message: `Login failed: ${error.message}`,
    });
  }
}

// ✅ Improved Signup
async function handleSignup(email, password, name, res) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user in Firestore
    await addDoc(collection(db, 'users'), {
      uid: user.uid,
      email: user.email,
      name,
    });

    return res.status(201).json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name,
      },
    });
  } catch (error) {
    console.error("❌ Error signing up:", error.message);

    return res.status(400).json({
      success: false,
      message: `Signup failed: ${error.message}`,
    });
  }
}
