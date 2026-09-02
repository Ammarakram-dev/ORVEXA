"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("orvexa_user");

    if (user) {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      return;
    }

    if (mode === "signup" && !name) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const user = {
        name: mode === "signup" ? name : email.split("@")[0],
        email,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("orvexa_user", JSON.stringify(user));
      router.push("/");
    }, 600);
  };

  return (
    <main className="auth-page">
      <div className="glow glow-one" />
      <div className="glow glow-two" />

      <section className="auth-container">
        <div className="brand-section">
          <div className="brand">
            <div className="brand-logo">
              <div className="logo-core" />
              <div className="logo-ring ring-one" />
              <div className="logo-ring ring-two" />
            </div>

            <div>
              <h2>ORVEXA</h2>
              <span>ACTION INTELLIGENCE</span>
            </div>
          </div>

          <div className="brand-content">
            <div className="status">
              <span />
              INTELLIGENCE CORE ONLINE
            </div>

            <h1>
              Intent.
              <br />
              <em>Action.</em>
              <br />
              Outcome.
            </h1>

            <p>
              Transform objectives into structured missions, executable actions
              and verified outcomes.
            </p>

            <div className="steps">
              <div className="step">
                <strong>01</strong>
                <div>
                  <b>Understand</b>
                  <small>Resolve intent</small>
                </div>
              </div>

              <div className="step">
                <strong>02</strong>
                <div>
                  <b>Orchestrate</b>
                  <small>Plan execution</small>
                </div>
              </div>

              <div className="step">
                <strong>03</strong>
                <div>
                  <b>Verify</b>
                  <small>Prove outcomes</small>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-footer">
            ORVEXA v3.0
            <span>INTELLIGENCE / EXECUTION / VERIFICATION</span>
          </div>
        </div>

        <div className="form-section">
          <div className="form-top">
            <span>OPERATOR ACCESS</span>
            <div />
            <small>SECURE</small>
          </div>

          <div className="form-content">
            <div className="mobile-brand">
              <div className="brand-logo small">
                <div className="logo-core" />
                <div className="logo-ring ring-one" />
                <div className="logo-ring ring-two" />
              </div>

              <div>
                <h2>ORVEXA</h2>
                <span>ACTION INTELLIGENCE</span>
              </div>
            </div>

            <div className="heading">
              <span className="eyebrow">
                {mode === "signin" ? "RETURNING OPERATOR" : "NEW OPERATOR"}
              </span>

              <h3>
                {mode === "signin" ? "Welcome back." : "Create your workspace."}
              </h3>

              <p>
                {mode === "signin"
                  ? "Continue operating your intelligence workspace."
                  : "Create your ORVEXA intelligence workspace."}
              </p>
            </div>

            <div className="tabs">
              <button
                type="button"
                className={mode === "signin" ? "active" : ""}
                onClick={() => setMode("signin")}
              >
                Sign in
              </button>

              <button
                type="button"
                className={mode === "signup" ? "active" : ""}
                onClick={() => setMode("signup")}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {mode === "signup" && (
                <label>
                  <span>Operator name</span>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    required
                  />
                </label>
              )}

              <label>
                <span>Email address</span>
                <input
                  type="email"
                  placeholder="operator@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                <span>Password</span>

                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </label>

              <button className="submit" type="submit" disabled={loading}>
                <span>
                  {loading
                    ? "INITIALIZING..."
                    : mode === "signin"
                      ? "ENTER ORVEXA"
                      : "CREATE WORKSPACE"}
                </span>

                <b>{loading ? "◌" : "→"}</b>
              </button>
            </form>

            <div className="local-mode">
              <div className="local-dot">
                <span />
              </div>

              <div>
                <strong>LOCAL INTELLIGENCE MODE</strong>
                <p>Workspace data is stored locally in this browser.</p>
              </div>
            </div>
          </div>

          <div className="form-footer">
            <span>
              <i />
              SYSTEM READY
            </span>

            <span>ORVEXA / AUTHENTICATION</span>
          </div>
        </div>
      </section>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background: #07070a;
          color: #f5f2f8;
          font-family: Arial, Helvetica, sans-serif;
        }

        .glow {
          position: fixed;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.12;
        }

        .glow-one {
          top: -250px;
          left: -180px;
          background: #9b5de5;
        }

        .glow-two {
          right: -220px;
          bottom: -240px;
          background: #e85aad;
        }

        .auth-container {
          width: min(1150px, 100%);
          min-height: 680px;
          display: grid;
          grid-template-columns: 1fr 0.85fr;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          background: rgba(12, 11, 16, 0.96);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.55);
          animation: appear 0.7s ease;
        }

        .brand-section {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          border-right: 1px solid rgba(255, 255, 255, 0.07);
          background:
            radial-gradient(
              circle at 20% 45%,
              rgba(168, 85, 247, 0.09),
              transparent 35%
            ),
            #0c0b10;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .brand-logo {
          width: 42px;
          height: 42px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-logo span,
        .brand-logo div {
          position: absolute;
          border-radius: 50%;
        }

        .logo-core {
          width: 9px;
          height: 9px;
          background: #c084fc;
          box-shadow: 0 0 20px #c084fc;
          animation: pulse 2s infinite;
        }

        .logo-ring {
          border: 1px solid rgba(192, 132, 252, 0.3);
        }

        .ring-one {
          width: 24px;
          height: 24px;
          animation: rotate 5s linear infinite;
        }

        .ring-two {
          width: 40px;
          height: 40px;
          border-color: rgba(244, 114, 182, 0.14);
          animation: rotateReverse 8s linear infinite;
        }

        .brand h2 {
          margin: 0;
          font-size: 18px;
          letter-spacing: 3px;
        }

        .brand span {
          display: block;
          margin-top: 5px;
          color: #67616f;
          font-size: 7px;
          letter-spacing: 2px;
        }

        .brand-content {
          max-width: 500px;
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 11px;
          border: 1px solid rgba(163, 230, 53, 0.15);
          border-radius: 30px;
          color: #a3e635;
          font-size: 8px;
          letter-spacing: 1.4px;
        }

        .status span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #a3e635;
          box-shadow: 0 0 10px #a3e635;
          animation: pulse 1.7s infinite;
        }

        .brand-content h1 {
          margin: 28px 0 20px;
          font-size: clamp(58px, 6vw, 82px);
          line-height: 0.88;
          letter-spacing: -5px;
        }

        .brand-content h1 em {
          font-style: normal;
          background: linear-gradient(100deg, #c084fc, #f472b6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .brand-content > p {
          max-width: 430px;
          margin: 0;
          color: #77717e;
          font-size: 12px;
          line-height: 1.8;
        }

        .steps {
          display: flex;
          gap: 26px;
          margin-top: 38px;
        }

        .step {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .step strong {
          color: #c084fc;
          font-family: monospace;
          font-size: 8px;
        }

        .step b {
          display: block;
          font-size: 9px;
        }

        .step small {
          color: #55505b;
          font-family: monospace;
          font-size: 7px;
        }

        .brand-footer,
        .form-footer {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          color: #514c57;
          font-family: monospace;
          font-size: 7px;
          letter-spacing: 1px;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px;
        }

        .form-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 35px;
          color: #817b88;
          font-family: monospace;
          font-size: 7px;
          letter-spacing: 1.5px;
        }

        .form-top div {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
        }

        .form-top small {
          color: #48434d;
          font-size: 6px;
        }

        .form-content {
          width: 100%;
          max-width: 400px;
          margin: auto;
          animation: slideUp 0.7s ease 0.1s both;
        }

        .mobile-brand {
          display: none;
        }

        .eyebrow {
          color: #ad8dc0;
          font-family: monospace;
          font-size: 7px;
          letter-spacing: 1.5px;
        }

        .heading h3 {
          margin: 12px 0 8px;
          font-size: 34px;
          letter-spacing: -1.5px;
        }

        .heading p {
          margin: 0;
          color: #6f6976;
          font-size: 10px;
          line-height: 1.7;
        }

        .tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px;
          margin: 28px 0 22px;
          padding: 4px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.02);
        }

        .tabs button {
          height: 36px;
          border: 0;
          border-radius: 6px;
          color: #65606c;
          background: transparent;
          cursor: pointer;
          font-size: 9px;
          font-weight: 700;
        }

        .tabs button.active {
          color: #f5f2f8;
          background: rgba(192, 132, 252, 0.08);
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        label > span {
          color: #807986;
          font-family: monospace;
          font-size: 7px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        input {
          width: 100%;
          height: 50px;
          padding: 0 14px;
          outline: none;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 9px;
          color: #f4f0f7;
          background: rgba(255, 255, 255, 0.018);
          font: inherit;
          font-size: 10px;
          transition: 0.2s ease;
        }

        input:focus {
          border-color: rgba(192, 132, 252, 0.4);
          box-shadow: 0 0 0 3px rgba(192, 132, 252, 0.04);
        }

        input::placeholder {
          color: #45414a;
        }

        .password-field {
          position: relative;
        }

        .password-field input {
          padding-right: 65px;
        }

        .password-field button {
          position: absolute;
          right: 6px;
          top: 6px;
          height: 38px;
          padding: 0 9px;
          border: 0;
          border-radius: 6px;
          color: #625c68;
          background: transparent;
          cursor: pointer;
          font-family: monospace;
          font-size: 7px;
        }

        .password-field button:hover {
          color: #c084fc;
        }

        .submit {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 52px;
          margin-top: 5px;
          padding: 0 17px;
          border: 1px solid rgba(192, 132, 252, 0.2);
          border-radius: 9px;
          color: white;
          background: linear-gradient(100deg, #7448a6, #a84f99, #c3568c);
          cursor: pointer;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.4px;
          box-shadow: 0 15px 30px rgba(126, 72, 156, 0.15);
          transition: 0.25s ease;
        }

        .submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(126, 72, 156, 0.22);
        }

        .submit:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .submit b {
          font-size: 17px;
          font-weight: 400;
        }

        .local-mode {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 18px;
          padding: 11px;
          border: 1px solid rgba(255, 255, 255, 0.045);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.012);
        }

        .local-dot {
          width: 27px;
          height: 27px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 1px solid rgba(163, 230, 53, 0.12);
          border-radius: 7px;
        }

        .local-dot span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #a3e635;
          box-shadow: 0 0 10px #a3e635;
        }

        .local-mode strong {
          display: block;
          color: #85808c;
          font-family: monospace;
          font-size: 7px;
          letter-spacing: 0.8px;
        }

        .local-mode p {
          margin: 3px 0 0;
          color: #514c57;
          font-size: 8px;
        }

        .form-footer {
          width: 100%;
          max-width: 400px;
          margin: 30px auto 0;
        }

        .form-footer i {
          display: inline-block;
          width: 5px;
          height: 5px;
          margin-right: 5px;
          border-radius: 50%;
          background: #a3e635;
          box-shadow: 0 0 8px #a3e635;
        }

        @keyframes appear {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }

        @keyframes rotate {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes rotateReverse {
          to {
            transform: rotate(-360deg);
          }
        }

        @media (max-width: 850px) {
          .auth-container {
            grid-template-columns: 1fr;
            max-width: 600px;
          }

          .brand-section {
            display: none;
          }

          .form-section {
            padding: 40px;
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 35px;
          }

          .mobile-brand .brand-logo {
            width: 36px;
            height: 36px;
          }

          .mobile-brand .ring-one {
            width: 21px;
            height: 21px;
          }

          .mobile-brand .ring-two {
            width: 34px;
            height: 34px;
          }

          .mobile-brand .logo-core {
            width: 8px;
            height: 8px;
          }
        }

        @media (max-width: 500px) {
          .auth-page {
            padding: 12px;
          }

          .auth-container {
            border-radius: 18px;
          }

          .form-section {
            padding: 28px 18px;
          }

          .heading h3 {
            font-size: 29px;
          }

          .form-footer {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </main>
  );
}
