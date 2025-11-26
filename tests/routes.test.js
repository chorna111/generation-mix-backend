const req=require('supertest')
const express=require('express')
const router=require('../routes/generationMix')
const app=express()
app.use('/api',router)
describe("router's test",()=>{
    test('GET /api should return health check on ',async()=>{
        const res=await req(app).get('/api')
        expect(res.status).toBe(200)
        expect(res.text).toBe('health check ok')
    })
    test('GET /dailyFuelsPercentage should return status 200', async () => {
    const res = await req(app).get('/api/dailyFuelsPercentage');
    expect(res.statusCode).toBe(200);
    const days = Object.keys(res.body);
    expect(days.length).toBeGreaterThan(0);
    for (const day of days) {
        expect(res.body[day]).toHaveProperty('cleanEnergyPerc');
    }
    });

    test('GET /optimalWindow/0 should return status 400', async () => {
    const res = await req(app).get('/api/optimalWindow/0');
    expect(res.statusCode).toBe(400);
  });

   test('GET /optimalWindow/3 should return  status 200', async () => {
    const res = await req(app).get('/api/optimalWindow/3');
    expect(res.statusCode).toBe(200);
  });


})