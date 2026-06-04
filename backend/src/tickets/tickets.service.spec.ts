jest.mock('qrcode', () => ({ toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,qr') }));

import { TicketsService } from './tickets.service';
import * as QRCode from 'qrcode';

describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(() => {
    service = new TicketsService({} as any);
  });

  it('adds QR data URLs to the user tickets', async () => {
    const orderBy = jest.fn().mockResolvedValue([
      {
        id: 1,
        qrCode: '2a01f8e1-5f4d-4b9e-9f34-000000000001',
        status: 'active',
        eventName: 'FOMO Night',
      },
    ]);
    const where = jest.fn().mockReturnValue({ orderBy });
    const innerJoin = jest.fn().mockReturnValue({ where });
    const from = jest.fn().mockReturnValue({ innerJoin });
    (service as any).db = { select: jest.fn().mockReturnValue({ from }) };

    const result = await service.findMyTickets(7);

    expect(result[0].qrCodeDataUrl).toBe('data:image/png;base64,qr');
    expect(QRCode.toDataURL).toHaveBeenCalled();
  });
});
