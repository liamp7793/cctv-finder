import { db } from '../../src/firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  console.log("Request received:", req.body);

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      console.log("CORS preflight check passed");
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      console.log("Invalid HTTP method");
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { action, email, password, name } = req.body;
    console.log("Received data:", { action, email, password, name });

    if (!action || !email || !password) {
      console.log("Missing required fields");
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (action === 'login') {
      console.log("Attempting login...");
      await handleLogin(email, password, res);
    } else if (action === 'signup') {
      if (!name) {
        console.log("Name is required for signup");
        return res.status(400).json({ success: false, message: 'Name is required for signup' });
      }
      console.log("Attempting signup...");
      await handleSignup(email, password, name, res);
    } else {
      console.log("Invalid action");
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
  } catch (error) {
    console.error("🔥 Server error:", error);
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}

// ✅ Handle Login
async function handleLogin(email, password, res) {
  try {
    console.log("Connecting to Firestore for login...");
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), where('password', '==', password));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("Invalid credentials");
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = snapshot.docs[0].data();
    console.log("Login successful for user:", user.email);

    return res.status(200).json({
      success: true,
      user: {
        id: snapshot.docs[0].id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("❌ Error logging in:", error);
    return res.status(500).json({ success: false, message: `Error logging in: ${error.message}` });
  }
}

// ✅ Handle Signup
async function handleSignup(email, password, name, res) {
  try {
    console.log("Connecting to Firestore for signup...");
    const usersRef = collection(db, 'users');

    console.log("Checking if user already exists...");
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      console.log("Email already registered");
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    console.log("Creating new user...");
    const newUser = {
      email,
      password,
      name,
    };

    const docRef = await addDoc(usersRef, newUser);

    console.log("Signup successful for user:", newUser.email);

    return res.status(201).json({
      success: true,
      user: {
        id: docRef.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error("❌ Error signing up:", error);
    return res.status(500).json({ success: false, message: `Error signing up: ${error.message}` });
  }
}
