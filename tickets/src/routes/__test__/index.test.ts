import request from 'supertest';
import { app } from '../../app';
import jwt from 'jsonwebtoken';

let cookieSession: any;

beforeEach(async () => {
    process.env.JWT_KEY = "xyz";

    // Build a JWT payload: { id, email }
    const payload = {
        id: 'microservices',
        email: 'test@test.com'
    }
    // Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build the session object: {jwt, MY_JWT}
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // return cookie;
    cookieSession = [`session=${base64}`];
});

const createTicket = async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', cookieSession)
        .send({
            title: 'abc',
            price: 20
    });
}

it('can fetch a list of tickets', async () => {
    await createTicket();
    await createTicket();
    await createTicket();

    const response = await request(app).get('/api/tickets').send().expect(200);

    expect(response.body.length).toEqual(3);
});