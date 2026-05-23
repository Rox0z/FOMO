<div class="login-wrapper">

  <!-- BACKGROUND FX -->
  <div class="bg-gradient"></div>
  <div class="bg-noise"></div>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>

  <!-- CARD -->
  <div class="login-card">

    <div class="card-inner">

      <!-- HEADER -->
      <div class="header">
        <h1>Admin Login</h1>
        <p class="subtitle">Acesso restrito ao painel</p>
      </div>

      <!-- FORM -->
      <form (ngSubmit)="onLogin()" #loginForm="ngForm">

        <!-- EMAIL -->
        <div class="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            [(ngModel)]="email"
            required
            placeholder="admin@email.com"
          />
        </div>

        <!-- PASSWORD -->
        <div class="form-group">
          <label>Password</label>

          <div class="password-wrap">
            <input
              [type]="showPassword ? 'text' : 'password'"
              name="password"
              [(ngModel)]="password"
              required
              placeholder="••••••••"
            />

            <span class="toggle" (click)="togglePassword()">
              👁
            </span>
          </div>
        </div>

        <!-- ERROR -->
        <div *ngIf="errorMessage" class="error">
          {{ errorMessage }}
        </div>

        <!-- BUTTON -->
        <button type="submit" [disabled]="isLoading">
          {{ isLoading ? 'A entrar...' : 'Entrar' }}
        </button>

      </form>

    </div>
  </div>
</div>
