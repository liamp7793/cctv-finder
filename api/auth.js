import { db } from '../../firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Handle CORS preflight request
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { action, email, password, name } = req.body;

  if (!action || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
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
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ✅ Handle Login
async function handleLogin(email, password, res) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email), where('password', '==', password));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const user = snapshot.docs[0].data();
  return res.status(200).json({
    success: true,
    user: {
      id: snapshot.docs[0].id,
      email: user.email,
      name: user.name,
    },
  });
}

// ✅ Handle Signup
async function handleSignup(email, password, name, res) {
  const usersRef = collection(db, 'users');

  // Check if email already exists
  const q = query(usersRef, where('email', '==', email));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // Create new user
  const newUser = {
    email,
    password,
    name,
  };

  const docRef = await addDoc(usersRef, newUser);

  return res.status(201).json({
    success: true,
    user: {
      id: docRef.id,
      email: newUser.email,
      name: newUser.name,
    },
  });
}
