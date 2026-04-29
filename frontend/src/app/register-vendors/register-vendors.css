:host { display: block; width: 100%; height: 100%; }

.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #0d0d0d;
  font-family: 'Inter', sans-serif;
}

.bg-gradient {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 60% at 20% 50%, #5b2fff22 0%, transparent 60%),
              radial-gradient(ellipse 70% 70% at 80% 30%, #ff2f8822 0%, transparent 60%),
              radial-gradient(ellipse 90% 80% at 50% 80%, #2f8fff18 0%, transparent 60%);
  z-index: 0;
}

.bg-noise {
  position: absolute; inset: 0; opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 200px 200px; z-index: 0;
}

.orb {
  position: absolute; border-radius: 50%; filter: blur(80px);
  z-index: 0; animation: floatOrb 12s ease-in-out infinite;
}
.orb-1 { width:500px; height:500px; background: radial-gradient(circle, #6c3bff33 0%, transparent 70%); top:-100px; left:-150px; animation-delay:0s; }
.orb-2 { width:400px; height:400px; background: radial-gradient(circle, #ff3b8833 0%, transparent 70%); bottom:-80px; right:-100px; animation-delay:-4s; }
.orb-3 { width:300px; height:300px; background: radial-gradient(circle, #3b8fff22 0%, transparent 70%); top:50%; right:20%; animation-delay:-8s; }

@keyframes floatOrb {
  0%, 100% { transform: translate(0,0) scale(1); }
  33%       { transform: translate(30px,-20px) scale(1.05); }
  66%       { transform: translate(-20px,15px) scale(0.97); }
}

.login-wrapper {
  position: relative; z-index: 10;
  width: 100%; max-width: 400px; margin: 1.5rem;
  animation: cardIn 0.7s cubic-bezier(0.16,1,0.3,1) both;
}

@keyframes cardIn {
  from { opacity:0; transform: translateY(32px) scale(0.97); }
  to   { opacity:1; transform: translateY(0) scale(1); }
}

.login-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 2.25rem 2rem 1.75rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2);
  display: flex; flex-direction: column; align-items: center;
}

.brand { text-align:center; margin-bottom:1.6rem; animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
.brand .logo { width:130px; height:auto; fill:#111111; display:block; margin:0 auto 0.6rem; }
.brand p { font-size:0.72rem; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; color:#aaaaaa; margin:0; }

form { width: 100%; }

@keyframes fadeUp {
  from { opacity:0; transform: translateY(12px); }
  to   { opacity:1; transform: translateY(0); }
}

.input-group {
  position: relative; width: 100%; margin-bottom: 1rem;
  animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
}
.input-group:nth-child(1) { animation-delay:0.12s; }
.input-group:nth-child(2) { animation-delay:0.16s; }
.input-group:nth-child(3) { animation-delay:0.20s; }
.input-group:nth-child(4) { animation-delay:0.24s; }
.password-group { position: relative; }

label {
  position: absolute; left:14px; top:50%; transform:translateY(-50%);
  color:#bbbbbb; pointer-events:none; transition:0.25s ease;
  font-size:0.88rem; background:transparent;
}

input, select {
  width: 100%; padding: 0.78rem 2.5rem 0.78rem 1rem;
  border-radius: 10px; border: 1.5px solid #e0e0e0;
  background: #ffffff; font-size: 0.88rem; color: #222;
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box; font-family: inherit;
}

input::placeholder { color: transparent; }

input:focus, select:focus {
  border-color: #6c3bff;
  box-shadow: 0 0 0 3px rgba(108,59,255,0.1);
}

input:focus + label,
input:not(:placeholder-shown) + label {
  top:-8px; transform:translateY(0); left:10px;
  font-size:0.68rem; background:#ffffff; padding:0 4px; color:#6c3bff;
}

.toggle-password {
  position: absolute; right:14px; top:50%; transform:translateY(-50%);
  cursor:pointer; color:#cccccc; display:flex; align-items:center; transition:color 0.2s;
}
.toggle-password svg { width:18px; height:18px; }
.toggle-password:hover { color:#6c3bff; }

.phone-group {
  display:flex; gap:8px; align-items:center; margin-bottom:1rem;
  animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.18s both;
}

.phone-select-wrapper select {
  padding: 0.78rem 0.6rem; border-radius:10px;
  border:1.5px solid #e0e0e0; background:#ffffff;
  font-size:0.82rem; color:#444; outline:none; cursor:pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-width:130px; font-family:inherit; box-sizing:border-box;
}
.phone-select-wrapper select:focus {
  border-color:#6c3bff; box-shadow:0 0 0 3px rgba(108,59,255,0.1);
}

.phone-input-wrapper { flex:1; position:relative; }
.phone-input-wrapper input {
  width:100%; padding:0.78rem 1rem; border-radius:10px;
  border:1.5px solid #e0e0e0; background:#ffffff;
  font-size:0.88rem; color:#222; outline:none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing:border-box; font-family:inherit;
}
.phone-input-wrapper input:focus {
  border-color:#6c3bff; box-shadow:0 0 0 3px rgba(108,59,255,0.1);
}
.phone-input-wrapper label {
  position:absolute; left:14px; top:50%; transform:translateY(-50%);
  color:#bbbbbb; pointer-events:none; transition:0.25s ease;
  font-size:0.88rem; background:transparent;
}
.phone-input-wrapper input:focus + label,
.phone-input-wrapper input:not(:placeholder-shown) + label {
  top:-8px; transform:translateY(0); left:10px;
  font-size:0.68rem; background:#ffffff; padding:0 4px; color:#6c3bff;
}

.error-msg {
  background:#fff1f2; border:1px solid #fecdd3; border-radius:8px;
  padding:0.55rem 0.8rem; font-size:0.78rem; color:#e11d48;
  margin-bottom:0.85rem; text-align:center;
}

button[type="submit"] {
  width:100%; padding:0.85rem; border-radius:10px; border:none;
  cursor:pointer; font-size:0.92rem; font-weight:700; letter-spacing:0.06em;
  font-family:inherit; color:#fff;
  background: linear-gradient(135deg, #5a2ef5 0%, #7c55ff 100%);
  transition: transform 0.15s, box-shadow 0.2s, filter 0.2s;
  box-shadow: 0 4px 18px rgba(108,59,255,0.35);
  margin-top:0.25rem;
  animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.28s both;
}
button[type="submit"]:hover {
  transform:translateY(-1px);
  box-shadow:0 8px 24px rgba(108,59,255,0.45);
  filter:brightness(1.08);
}
button[type="submit"]:active { transform:translateY(0); }
button[type="submit"]:disabled {
  background:#c4b5fd; box-shadow:none; cursor:not-allowed; transform:none; filter:none;
}

.btn-spinner svg { animation:spin 0.8s linear infinite; display:block; margin:0 auto; }
@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }

.signup-text {
  text-align:center; font-size:0.8rem; color:#111111;
  margin:1.1rem 0 0;
  animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.32s both;
}
.signup-text a { color:#5a2ef5; font-weight:600; text-decoration:none; transition:color 0.2s; }
.signup-text a:hover { color:#7c55ff; text-decoration:underline; }

@media (max-width:480px) {
  .login-card { padding:1.75rem 1.25rem; }
  .brand .logo { width:110px; }
}
