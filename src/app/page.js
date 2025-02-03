"use client";
import { useState, useEffect } from "react";
import { validateSQL, detectInjection } from "@/utils/sqlUtils";
import styles from "./page.module.css";

export default function Home() {
  const [query, setQuery] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [injectionWarnings, setInjectionWarnings] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    setTypingTimeout(
      setTimeout(() => {
        // Validación de la consulta SQL
        const isValid = validateSQL(e.target.value);
        const injections = detectInjection(e.target.value);
        
        // Mostrar resultados de la validación
        //setValidationResult(isValid ? "✅ Consulta SQL válida." : "❌ Consulta SQL inválida.");
        setInjectionWarnings(injections);
      }, 500)
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🛡️ Validador de Consultas SQL</h1>
      <p className={styles.subtitle}>
        Escribe tu consulta SQL y el sistema te avisará si es válida o si hay una posible inyección.
      </p>

      <textarea
        className={styles.textarea}
        value={query}
        onChange={handleQueryChange}
        placeholder="Ejemplo: SELECT * FROM users WHERE username = 'admin'"
      />

      {validationResult && <p className={styles.result}>{validationResult}</p>}
      {injectionWarnings.length > 0 && (
        <ul className={styles.warnings}>
          {injectionWarnings.map((warning, index) => (
            <li key={index} className={styles.warning}>
              🚨 {warning}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
