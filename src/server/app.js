// src/server/app.js (usando módulos ES)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import db from './db/config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());

// --- RUTAS DE AUTENTICACIÓN ---
app.post('/api/auth/register', async (req, res) => {
  const { email, phone_number, password, role } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (email, phone_number, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role`,
      [email, phone_number, passwordHash, role || 'patient']
    );

    const newUser = result.rows[0];

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'Usuario registrado con éxito', user: newUser, token });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email o número de teléfono ya registrado.' });
    }
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error interno del servidor durante el registro' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const result = await db.query(
      `SELECT id, email, phone_number, password_hash, role
       FROM users
       WHERE email = $1 OR phone_number = $1`,
      [identifier]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    res.json({ message: 'Inicio de sesión exitoso', user: { id: user.id, email: user.email, role: user.role }, token });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor durante el login' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

app.get('/api/patients', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Administrador o Doctor.' });
  }

  try {
    const result = await db.query('SELECT id, first_name, last_name, email, phone_number FROM patients');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  console.log('Recuerda que la base de datos debe estar levantada y las tablas creadas manualmente.');
});