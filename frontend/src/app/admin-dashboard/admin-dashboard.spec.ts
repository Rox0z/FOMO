import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminDashboard } from './admin-dashboard';
import { environment } from '../../environments/environment';

describe('AdminDashboard', () => {
  let component: AdminDashboard;
  let fixture: ComponentFixture<AdminDashboard>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [AdminDashboard],
      providers: [
        provideRouter([{ path: 'home', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
            snapshot: { params: {}, queryParams: {}, paramMap: { get: () => null } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboard);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  function bootstrapDashboard() {
    fixture.detectChanges();

    const overviewReq = httpMock.expectOne(`${environment.apiUrl}/admin/overview`);
    expect(overviewReq.request.method).toBe('GET');
    overviewReq.flush({ users: [], vendors: [], events: [], eventEdits: [] });

    const logsReq = httpMock.expectOne(`${environment.apiUrl}/admin/logs`);
    expect(logsReq.request.method).toBe('GET');
    logsReq.flush([]);

    const requestsReq = httpMock.expectOne(`${environment.apiUrl}/admin/requests`);
    expect(requestsReq.request.method).toBe('GET');
    requestsReq.flush({
      totalRequests: 0,
      breakdown: { vendorApproval: 0, publishingEvent: 0, updatingEvent: 0 },
    });

    fixture.detectChanges();
  }

  it('should create', () => {
    bootstrapDashboard();

    expect(component).toBeTruthy();
    expect(component.loading).toBe(false);
    expect(component.pendingRequests).toEqual([]);
  });
});
