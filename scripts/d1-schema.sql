CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  passwordHash TEXT,
  role TEXT DEFAULT 'EDITOR',
  active INTEGER DEFAULT 1,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  duration TEXT,
  modality TEXT,
  area TEXT,
  status TEXT DEFAULT 'ACTIVE',
  featured INTEGER DEFAULT 0,
  objectives TEXT,
  careerProfile TEXT,
  requirements TEXT,
  curriculum TEXT,
  schedule TEXT,
  location TEXT,
  metaTitle TEXT,
  metaDescription TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  video TEXT,
  startsAt TEXT,
  endsAt TEXT,
  time TEXT,
  location TEXT,
  speaker TEXT,
  registrationUrl TEXT,
  status TEXT DEFAULT 'UPCOMING',
  publication TEXT DEFAULT 'DRAFT',
  publishAt TEXT,
  metaTitle TEXT,
  metaDescription TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image TEXT,
  video TEXT,
  buttonText TEXT,
  url TEXT,
  startsAt TEXT,
  endsAt TEXT,
  "order" INTEGER DEFAULT 0,
  pages TEXT DEFAULT 'home',
  status TEXT DEFAULT 'DRAFT',
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  image TEXT,
  video TEXT,
  author TEXT,
  category TEXT,
  tags TEXT,
  status TEXT DEFAULT 'DRAFT',
  publishAt TEXT,
  metaTitle TEXT,
  metaDescription TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT,
  originalName TEXT,
  mimeType TEXT,
  url TEXT,
  size INTEGER,
  category TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  course TEXT,
  municipality TEXT,
  notes TEXT,
  status TEXT DEFAULT 'NEW',
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  image TEXT,
  video TEXT,
  buttonText TEXT,
  buttonUrl TEXT,
  enabled INTEGER DEFAULT 1,
  "order" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS audit (
  id TEXT PRIMARY KEY,
  userId TEXT,
  action TEXT,
  entity TEXT,
  entityId TEXT,
  details TEXT,
  ip TEXT,
  createdAt TEXT
);