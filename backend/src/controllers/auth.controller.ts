import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, User } from '../types';
import { config } from '../config';
import { dbManager } from '../db/db';

export const login = (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required.',
    });
  }

  const db = dbManager.read();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password.',
    });
  }

  // Generate JWT Token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...safeUser } = user;

  res.status(200).json({
    success: true,
    message: 'Authentication successful.',
    token,
    user: safeUser,
  });
};

export const register = (req: AuthenticatedRequest, res: Response) => {
  const { email, password, name, role = 'tenant-admin', tenantId, tenantName } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: 'Email, password, and name are required.',
    });
  }

  const db = dbManager.read();
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({
      success: false,
      error: `User with email ${email} already exists.`,
    });
  }

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email,
    name,
    role,
    passwordHash: password,
    tenantId,
    tenantName,
    preferences: { density: 'cozy', defaultTab: 'overview' },
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  dbManager.write(db);

  const token = jwt.sign(
    {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tenantId: newUser.tenantId,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...safeUser } = newUser;

  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    token,
    user: safeUser,
  });
};

export const getMe = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }

  const { passwordHash: _, ...safeUser } = req.user;
  res.status(200).json({
    success: true,
    user: safeUser,
  });
};

export const updateProfile = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }

  const { name, password, preferences, tenantName } = req.body;
  const db = dbManager.read();
  const user = db.users.find(u => u.id === req.user!.id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  if (name) user.name = name;
  if (password) user.passwordHash = password;
  if (tenantName) user.tenantName = tenantName;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };
  user.updatedAt = new Date().toISOString();

  dbManager.write(db);

  const { passwordHash: _, ...safeUser } = user;
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    user: safeUser,
  });
};

export const getTenants = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({
    success: true,
    data: db.tenants,
  });
};
