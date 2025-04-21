import express from 'express'
import prisma from '../prismaClient.js'
import { z } from 'zod'

const router = express.Router()

// Define Zod schema
const schoolSchema = z.object({
    name: z.string().trim().min(1, { message: "Name is required" }),
    address: z.string().trim().min(1, { message: "Address is required" }),
    latitude: z.number().min(-90).max(90, { message: "Latitude must be between -90 and 90" }),
    longitude: z.number().min(-180).max(180, { message: "Longitude must be between -180 and 180" })
});

router.post('/addSchool', async (req, res) => {
    try {
        // Validate the request body
        const validatedData = schoolSchema.parse(req.body);

        const school = await prisma.school.create({
            data: validatedData
        });

        res.status(201).json(school);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: err.errors.map(e => ({
                    field: e.path[0],
                    issue: e.message
                }))
            });
        }

        console.error(err.message);
        res.status(503).json({ message: "Service unavailable" });
    }
});

// Zod schema for query parameters
const listSchoolsQuerySchema = z.object({
    userLatitude: z.coerce.number()
        .min(-90, { message: "userLatitude must be between -90 and 90" })
        .max(90),
    userLongitude: z.coerce.number()
        .min(-180, { message: "userLongitude must be between -180 and 180" })
        .max(180)
});

router.get('/listSchools', async (req, res) => {
    try {
        // Validate and coerce query params to numbers
        const { userLatitude, userLongitude } = listSchoolsQuerySchema.parse(req.query);

        const schools = await prisma.school.findMany();

        // Haversine formula to calculate distance
        const toRadians = (degrees) => degrees * (Math.PI / 180);
        const haversineDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Earth's radius in km
            const dLat = toRadians(lat2 - lat1);
            const dLon = toRadians(lon2 - lon1);

            const a = Math.sin(dLat / 2) ** 2 +
                      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                      Math.sin(dLon / 2) ** 2;

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        const sortedSchools = schools.map(school => {
            const distance = haversineDistance(
                userLatitude,
                userLongitude,
                school.latitude,
                school.longitude
            );
            return { ...school, distance };
        }).sort((a, b) => a.distance - b.distance);

        res.json(sortedSchools);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: err.errors.map(e => ({
                    field: e.path[0],
                    issue: e.message
                }))
            });
        }

        console.error(err.message);
        res.status(503).json({ message: "Service unavailable" });
    }
});

export default router;