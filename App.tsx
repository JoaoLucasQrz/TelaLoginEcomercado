import React, { useEffect, useState } from "react";

type LoginProps = {
  onLoginSuccess?: (user: { email: string; name?: string }) => void;
  authenticate?: (email: string, password: string) => Promise<{ name?: string }>;
};

const defaultAuthenticate = async (email: string, password: string) => {
  await new Promise((r) => setTimeout(r, 600));
  if (email.toLowerCase() === "user@exemplo.com" && password === "123456") return { name: "Cliente Exemplo" };
  const err: any = new Error("Credenciais inválidas");
  err.status = 401;
  throw err;
};

export default function Login({ onLoginSuccess, authenticate = defaultAuthenticate }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const remembered = localStorage.getItem("marketapp_remember_email");
      if (remembered) {
        setEmail(remembered);
        setRemember(true);
      }
    } catch {}
  }, []);

  const emailIsValid = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value.trim());
  };

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = "Digite seu e-mail, por favor.";
    else if (!emailIsValid(email)) errs.email = "Parece que o e-mail não é válido.";
    if (!password) errs.password = "Digite sua senha.";
    else if (password.length < 6) errs.password = "A senha precisa ter ao menos 6 caracteres.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormError(null);
    setInfoMessage(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await authenticate(email.trim(), password);
      if (remember) {
        try {
          localStorage.setItem("marketapp_remember_email", email.trim());
        } catch {}
      } else {
        try {
          localStorage.removeItem("marketapp_remember_email");
        } catch {}
      }
      setInfoMessage("Login realizado com sucesso — carregando seu painel...");
      onLoginSuccess?.({ email: email.trim(), name: user?.name });
    } catch (err: any) {
      if (err?.status === 401) setFormError("E-mail ou senha incorretos. Confira e tente novamente.");
      else setFormError("Ocorreu um erro ao conectar. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(-45deg, #2d6b3a, #4aa86b, #a9e7c9, #147a43)",
    backgroundSize: "400% 400%",
    animation: "gradientBG 12s ease infinite",
    color: "#05201a",
    position: "relative",
    overflow: "hidden",
    padding: 20,
    fontFamily: "'Inter', system-ui, sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    zIndex: 10,
    width: "100%",
    maxWidth: 420,
    padding: 32,
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: 20,
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    transition: "transform 0.3s ease",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(15, 64, 46, 0.18)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 6,
    fontSize: 13,
    color: "#064c36",
    fontWeight: 600,
  };

  const buttonPrimary: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #147a43, #0b4b32)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 15,
    transition: "all 0.2s ease",
  };

  const buttonSecondary: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(20,122,67,0.25)",
    background: "transparent",
    color: "#0b4b32",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.2s ease",
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
        @keyframes gradientBG {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }
        input:focus {
          border-color: #147a43 !important;
          box-shadow: 0 0 0 2px rgba(20, 122, 67, 0.2);
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        `}
      </style>

      <div style={cardStyle}>
        <h1 style={{ textAlign: "center", fontSize: 26, margin: 0, color: "#094427", fontWeight: 700 }}>
          EcoMarket
        </h1>
        <p style={{ textAlign: "center", marginTop: 8, marginBottom: 20, color: "#0b4b32", fontSize: 15 }}>
          Faça login para acessar suas compras, lista e histórico.
        </p>

        <form onSubmit={handleSubmit} noValidate aria-describedby={formError ? "form-error" : undefined}>
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="email" style={labelStyle}>E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={inputStyle}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            {fieldErrors.email && (
              <div id="email-error" role="alert" style={{ color: "#9b1c1c", fontSize: 13, marginTop: 6 }}>{fieldErrors.email}</div>
            )}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="password" style={labelStyle}>Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={inputStyle}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            {fieldErrors.password && (
              <div id="password-error" role="alert" style={{ color: "#9b1c1c", fontSize: 13, marginTop: 6 }}>{fieldErrors.password}</div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} disabled={loading} />
            <label htmlFor="remember" style={{ fontSize: 13, color: "#0b4b32" }}>Lembrar meu e-mail neste dispositivo</label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <button type="submit" disabled={loading} style={{ ...buttonPrimary, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>

          <div style={{ marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setInfoMessage("Enviamos um e-mail de recuperação (simulado). Verifique sua caixa de entrada.")}
              disabled={loading}
              style={buttonSecondary}
            >
              Esqueci minha senha
            </button>
          </div>

          {formError && (
            <div id="form-error" role="alert" style={{ color: "#9b1c1c", textAlign: "center", marginTop: 10, fontSize: 14 }}>{formError}</div>
          )}

          {infoMessage && (
            <div role="status" aria-live="polite" style={{ color: "#0b4b32", textAlign: "center", marginTop: 10, fontSize: 14 }}>{infoMessage}</div>
          )}
        </form>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <span style={{ fontSize: 14, color: "#094427" }}>Novo por aqui? </span>
          <button
            onClick={() => setInfoMessage("Abra uma conta com seu e-mail — fluxo de cadastro em breve.")}
            style={{ background: "transparent", border: "none", color: "#0b4b32", fontWeight: 700, cursor: "pointer" }}
          >
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
}
