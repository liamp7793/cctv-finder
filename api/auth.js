let USERS = [];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // Handle CORS preflight request
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
    handleLogin(email, password, res);
  } else if (action === 'signup') {
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required for signup' });
    }
    handleSignup(email, password, name, res);
  } else {
    return res.status(400).json({ success: false, message: 'Invalid action' });
  }
}

function handleLogin(email, password, res) {
  const user = USERS.find((user) => user.email === email && user.password === password);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}

function handleSignup(email, password, name, res) {
  const existingUser = USERS.find((user) => user.email === email);

  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const newUser = {
    id: `USER-${USERS.length + 1}`,
    email,
    password,
    name,
  };

  USERS.push(newUser);

  return res.status(201).json({
    success: true,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    },
  });
}
