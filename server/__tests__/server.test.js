const request = require('supertest');
const app = require('../app'); // Adjust the path as necessary

describe('Server Endpoints', () => {
    test('GET /api/example should respond with 200', async () => {
        const response = await request(app).get('/api/example');
        expect(response.statusCode).toBe(200);
    });

    test('POST /api/example should respond with 201', async () => {
        const response = await request(app).post('/api/example').send({ key: 'value' });
        expect(response.statusCode).toBe(201);
    });
});