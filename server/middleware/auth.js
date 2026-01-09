import jwt from 'jsonwebtoken';

// Middleware para verificar o token JWT
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de autenticação não fornecido' 
    });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ 
      error: 'Token inválido ou expirado' 
    });
  }
}

// Middleware para verificar se é admin (opcional, se tiver roles)
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso negado. Permissão de admin necessária' 
    });
  }
  next();
}
