<!-- admin-pannel.html -->
<div class="admin-wrapper">

  <div class="bg-gradient"></div>
  <div class="bg-noise"></div>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>

  <div class="admin-card">
    <div class="card-inner">

      <div class="header">
        <div class="title-section">
          <h1>Admin Panel</h1>
          <p class="subtitle">Gestão de sistema</p>
        </div>
        <button class="btn-logout" (click)="logout()">
        <span>Sair</span>
        <i class="icon-exit"></i> </button>
      </div>
      
      <!-- TABS -->
      <div class="tabs">
        <button (click)="setTab('users')" [class.active]="activeTab === 'users'">Users</button>
        <button (click)="setTab('vendors')" [class.active]="activeTab === 'vendors'">Vendors</button>
        <button (click)="setTab('events')" [class.active]="activeTab === 'events'">Eventos</button>
      </div>

      <!-- STATUS -->
      <p *ngIf="loading">A carregar...</p>
      <p *ngIf="error" class="error">{{ error }}</p>

      <!-- USERS -->
      <div *ngIf="activeTab === 'users'" class="table-wrap">
        <table>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Ações</th>
          </tr>

          <tr *ngFor="let user of users">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge">
                {{ user.active ? 'Ativo' : 'Bloqueado' }}
              </span>
            </td>
            <td>
              <button
                *ngIf="user.active"
                class="btn reject"
                (click)="banUser(user)">
                Banir
              </button>

              <button
                *ngIf="!user.active"
                class="btn approve"
                (click)="unbanUser(user)">
                Desbanir
              </button>
            </td>
          </tr>
        </table>
      </div>

      <!-- VENDORS -->
      <div *ngIf="activeTab === 'vendors'" class="table-wrap">
        <table>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Ações</th>
          </tr>

          <tr *ngFor="let vendor of vendors">
            <td>{{ vendor.name }}</td>
            <td>{{ vendor.email }}</td>
            <td>
              <span class="badge">
                {{ vendor.active ? 'Aprovado' : 'Pendente' }}
              </span>
            </td>
            <td>
              <button
                *ngIf="!vendor.active"
                class="btn approve"
                (click)="approveVendor(vendor)">
                Aprovar
              </button>
            </td>
          </tr>
        </table>
      </div>

      <!-- EVENTS -->
      <div *ngIf="activeTab === 'events'" class="table-wrap">
        <table>
          <tr>
            <th>Nome</th>
            <th>Local</th>
            <th>Data</th>
          </tr>

          <tr *ngFor="let event of events">
            <td>{{ event.name }}</td>
            <td>{{ event.location }}</td>
            <td>{{ event.date | date:'dd/MM/yyyy' }}</td>
          </tr>
        </table>
      </div>

    </div>
  </div>
</div>