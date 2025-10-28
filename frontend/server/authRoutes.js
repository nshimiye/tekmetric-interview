export function registerAuthRoutes(app, { readAuthStore, writeAuthStore }) {
  if (!app) {
    throw new Error('registerAuthRoutes requires an express app instance');
  }
  if (typeof readAuthStore !== 'function' || typeof writeAuthStore !== 'function') {
    throw new Error('registerAuthRoutes requires readAuthStore and writeAuthStore functions');
  }

  // Mock login endpoint
  app.post('/api/auth/login', async (req, res, next) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }
    try {
      const store = await readAuthStore();
      const users = Array.isArray(store.users) ? store.users : [];
      const normalizedEmail = email.trim().toLowerCase();
      const match = users.find(
        (u) => u.email.trim().toLowerCase() === normalizedEmail && u.password === password
      );
      if (!match) {
        res.status(401).json({ message: 'Invalid email or password.' });
        return;
      }
      store.currentUser = { id: match.id, name: match.name, email: match.email };
      await writeAuthStore(store);
      res.json({ user: store.currentUser });
    } catch (error) {
      next(error);
    }
  });

  // Mock register endpoint
  app.post('/api/auth/register', async (req, res, next) => {
    const { name, email, password } = req.body ?? {};
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required.' });
      return;
    }
    try {
      const store = await readAuthStore();
      const users = Array.isArray(store.users) ? store.users : [];
      const normalizedEmail = email.trim().toLowerCase();
      if (users.some((u) => u.email.trim().toLowerCase() === normalizedEmail)) {
        res.status(409).json({ message: 'An account with that email already exists.' });
        return;
      }
      const newUser = {
        id: `user-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
        name: name.trim(),
        email: normalizedEmail,
        password: password.trim(),
      };
      users.push(newUser);
      store.users = users;
      store.currentUser = { id: newUser.id, name: newUser.name, email: newUser.email };
      await writeAuthStore(store);
      res.json({ user: store.currentUser });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/auth/users', async (_req, res, next) => {
    try {
      const store = await readAuthStore();
      const users = Array.isArray(store.users) ? store.users : [];
      res.json({ users });
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/auth/users', async (req, res, next) => {
    const { users } = req.body ?? {};

    try {
      const store = await readAuthStore();
      store.users = Array.isArray(users) ? users : [];
      await writeAuthStore(store);
      res.json({ users: store.users });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/auth/session', async (_req, res, next) => {
    try {
      const store = await readAuthStore();
      res.json({ user: store.currentUser ?? null });
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/auth/session', async (req, res, next) => {
    const { user } = req.body ?? {};

    try {
      const store = await readAuthStore();
      store.currentUser = user ?? null;
      await writeAuthStore(store);
      res.json({ user: store.currentUser });
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/auth/session', async (_req, res, next) => {
    try {
      const store = await readAuthStore();
      store.currentUser = null;
      await writeAuthStore(store);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
}
