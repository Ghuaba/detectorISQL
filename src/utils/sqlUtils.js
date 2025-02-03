// sqlUtils.js

// Patrones léxicos
const LEXICAL_PATTERNS = [
  { pattern: /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|RENAME|TRUNCATE|UNION|AND|OR|WHERE|LIKE|EXISTS|BETWEEN|NULL|TRUE|FALSE|HAVING|GROUP BY|ORDER BY|LIMIT|FROM|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL OUTER JOIN|EXCEPT|INTERSECT|IN|IS|NOT|HAVING|DISTINCT|AS|TABLE|DATABASE|GRANT|REVOKE|SHOW|DESCRIBE|COLUMN|TABLES|ROWS)\b/i, type: 'KEYWORD' },
  { pattern: /[=<>!]+/i, type: 'OPERATOR' },
  { pattern: /'[^']*'/i, type: 'LITERAL' },
  { pattern: /"[^"]*"/i, type: 'LITERAL' },
  { pattern: /(--.*$|\/\*.*?\*\/)/i, type: 'COMMENT' },
  { pattern: /[a-zA-Z_][a-zA-Z0-9_]*/i, type: 'IDENTIFIER' },
  { pattern: /\d+/i, type: 'NUMBER' },
  { pattern: /\s+/i, type: null }  // Espacios (ignorar)
];

// Reglas de detección de inyecciones
const DETECTION_PATTERNS = [
  { pattern: /UNION.*SELECT/i, type: 'INJECTION_UNION' },
  { pattern: /OR\s+1\s*=\s*1|OR\s+'[^']+'\s*=\s*'[^']+'/i, type: 'INJECTION_ALWAYS_TRUE' },
  { pattern: /(AND|OR)\s*\d+\s*=\s*\d+/i, type: 'INJECTION_LOGIC' },
  { pattern: /--.*|\/\*.*?\*\//i, type: 'INJECTION_COMMENT' },
  { pattern: /\bDROP\b.*\bTABLE\b|\bINSERT\b.*\bINTO\b/i, type: 'INJECTION_COMMAND' },
  { pattern: /\bCONCAT\b|\bASCII\b|\bLENGTH\b|\bVERSION\b/i, type: 'INJECTION_FUNCTION' }
];

// Tokeniza la consulta SQL
function tokenize(sqlQuery) {
  let tokens = [];
  while (sqlQuery) {
    let match = null;
    for (const { pattern, type } of LEXICAL_PATTERNS) {
      match = sqlQuery.match(pattern);
      if (match) {
        if (type) {  // Evitar espacios en blanco
          tokens.push([type, match[0]]);
        }
        sqlQuery = sqlQuery.slice(match[0].length);
        break;
      }
    }
    if (!match) {
      sqlQuery = sqlQuery.slice(1);  // Avanza un carácter si no hay coincidencia
    }
  }
  return tokens;
}

// Detecta inyecciones SQL
function detectInjection(sqlQuery) {
  let detections = [];
  for (const { pattern, type } of DETECTION_PATTERNS) {
    if (pattern.test(sqlQuery)) {
      detections.push(type);
    }
  }
  return detections;
}

// Función principal para validar y detectar inyecciones
function validateSQL(sqlQuery) {
  const tokens = tokenize(sqlQuery);
  // Aquí puedes agregar reglas adicionales para validar la consulta SQL
  if (tokens.length < 4 || tokens[0][0].toUpperCase() !== "SELECT") return false;

  let fromIndex = tokens.findIndex(t => t[0].toUpperCase() === "FROM");
  if (fromIndex === -1 || fromIndex < 2) return false;

  return true;
}

// Función de detección y validación
function validateAndDetect(sqlQuery) {
  const isValid = validateSQL(sqlQuery);
  if (!isValid) {
    return ["POTENTIAL_SQL_INJECTION"];
  }

  const injectionWarnings = detectInjection(sqlQuery);
  if (injectionWarnings.length > 0) {
    return injectionWarnings;
  }

  return ["VALID_SQL"];
}

export { validateSQL, detectInjection, validateAndDetect };
