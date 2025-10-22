import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Tickets CRUD (e2e)', () => {
  let app: INestApplication;
  let createdTicketId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/tickets (POST)', () => {
    it('should create a new ticket', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({
          title: 'Production server down',
          description: 'The entire production system is offline and needs immediate attention'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Production server down');
          expect(res.body.status).toBe('OPEN');
          expect(res.body.priority).toMatch(/LOW|MEDIUM|HIGH|CRITICAL/);
          expect(res.body.urgencyScore).toBeGreaterThanOrEqual(0);
          expect(res.body.urgencyScore).toBeLessThanOrEqual(1);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
          
          createdTicketId = res.body.id;
        });
    });

    it('should reject ticket with title too short', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({
          title: 'Hi',
          description: 'This should fail validation because title is too short'
        })
        .expect(400);
    });

    it('should reject ticket with description too short', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({
          title: 'Valid title here',
          description: 'Short'
        })
        .expect(400);
    });

    it('should reject ticket with missing fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({
          title: 'Only title'
        })
        .expect(400);
    });

    it('should reject ticket with extra fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({
          title: 'Valid title',
          description: 'Valid description here',
          extraField: 'should be rejected'
        })
        .expect(400);
    });
  });

  describe('/api/v1/tickets (GET)', () => {
    it('should return list of tickets', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          
          // Verify structure of first ticket
          if (res.body.length > 0) {
            const ticket = res.body[0];
            expect(ticket).toHaveProperty('id');
            expect(ticket).toHaveProperty('title');
            expect(ticket).toHaveProperty('description');
            expect(ticket).toHaveProperty('status');
            expect(ticket).toHaveProperty('priority');
            expect(ticket).toHaveProperty('urgencyScore');
            expect(ticket).toHaveProperty('createdAt');
            expect(ticket).toHaveProperty('updatedAt');
          }
        });
    });

    it('should filter tickets by status OPEN', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets?status=OPEN')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((ticket: any) => {
            expect(ticket.status).toBe('OPEN');
          });
        });
    });

    it('should filter tickets by priority', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets?priority=CRITICAL')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          // May be empty if no critical tickets exist
        });
    });

    it('should filter by both status and priority', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets?status=OPEN&priority=LOW')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/api/v1/tickets/:id (GET)', () => {
    it('should return ticket by ID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/tickets/${createdTicketId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdTicketId);
          expect(res.body).toHaveProperty('title');
          expect(res.body).toHaveProperty('status');
        });
    });

    it('should return 404 for non-existent ticket', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);
    });

    it('should return 404 for invalid ticket ID', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets/invalid-id')
        .expect(404);
    });
  });

  describe('/api/v1/tickets/:id/status (PATCH)', () => {
    let testTicketId: string;

    beforeAll(async () => {
      // Create a ticket for status tests
      const response = await request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({
          title: 'Status test ticket',
          description: 'This ticket is for testing status transitions'
        });
      testTicketId = response.body.id;
    });

    it('should update ticket status to IN_PROGRESS', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/tickets/${testTicketId}/status`)
        .send({ status: 'IN_PROGRESS' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('IN_PROGRESS');
          expect(res.body.id).toBe(testTicketId);
        });
    });

    it('should update ticket status to RESOLVED', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/tickets/${testTicketId}/status`)
        .send({ status: 'RESOLVED' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('RESOLVED');
        });
    });

    it('should update ticket status to CLOSED', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/tickets/${testTicketId}/status`)
        .send({ status: 'CLOSED' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('CLOSED');
        });
    });

    it('should reject invalid status transition', () => {
      // Ticket is now CLOSED, cannot go to RESOLVED
      return request(app.getHttpServer())
        .patch(`/api/v1/tickets/${testTicketId}/status`)
        .send({ status: 'RESOLVED' })
        .expect(400);
    });

    it('should allow reopening closed ticket', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/tickets/${testTicketId}/status`)
        .send({ status: 'OPEN' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('OPEN');
        });
    });

    it('should reject invalid status value', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/tickets/${testTicketId}/status`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('should return 404 for non-existent ticket', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/tickets/non-existent-id/status')
        .send({ status: 'IN_PROGRESS' })
        .expect(404);
    });
  });

  describe('/api/v1/tickets/:id/reclassify (POST)', () => {
    let reclassifyTicketId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({
          title: 'Reclassify test',
          description: 'This ticket will be reclassified'
        });
      reclassifyTicketId = response.body.id;
    });

    it('should reclassify ticket urgency', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/tickets/${reclassifyTicketId}/reclassify`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(reclassifyTicketId);
          expect(res.body).toHaveProperty('urgencyScore');
          expect(res.body).toHaveProperty('priority');
          expect(res.body.urgencyScore).toBeGreaterThanOrEqual(0);
          expect(res.body.urgencyScore).toBeLessThanOrEqual(1);
        });
    });

    it('should return 404 for non-existent ticket', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tickets/non-existent-id/reclassify')
        .expect(404);
    });
  });

  describe('/api/v1/tickets/:id/close (PATCH)', () => {
    let closeTicketId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({
          title: 'Close test ticket',
          description: 'This ticket will be closed'
        });
      closeTicketId = response.body.id;
    });

    it('should close a ticket', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/tickets/${closeTicketId}/close`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('CLOSED');
          expect(res.body.id).toBe(closeTicketId);
        });
    });

    it('should return 400 when trying to close already closed ticket', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/tickets/${closeTicketId}/close`)
        .expect(400);
    });

    it('should return 404 for non-existent ticket', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/tickets/non-existent-id/close')
        .expect(404);
    });
  });

  describe('/api/v1/tickets/:id (DELETE)', () => {
    let deleteTicketId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({
          title: 'Delete test ticket',
          description: 'This ticket will be deleted'
        });
      deleteTicketId = response.body.id;
    });

    it('should delete ticket', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/tickets/${deleteTicketId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.deleted).toBe(true);
          expect(res.body.id).toBe(deleteTicketId);
        });
    });

    it('should return 404 when trying to get deleted ticket', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/tickets/${deleteTicketId}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/api/v1/tickets/${deleteTicketId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent ticket', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/tickets/non-existent-id')
        .expect(404);
    });
  });
});

