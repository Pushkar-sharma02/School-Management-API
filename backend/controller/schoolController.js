const db = require('../config/db');

// Add School API
exports.addSchool = (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    //  input
    if (!name || !address || typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ message: 'Invalid input data.' });
    }

    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    db.query(query, [name, address, latitude, longitude], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.', error: err });
        }
        res.status(201).json({ message: 'School added successfully.', schoolId: result.insertId });
    });
};

// all Schools API
exports.listSchools = (req, res) => {
    const { latitude, longitude } = req.query;

    if (typeof latitude === 'undefined' || typeof longitude === 'undefined') {
        return res.status(400).json({ message: 'Latitude and longitude are required.' });
    }

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    if (isNaN(userLat) || isNaN(userLng)) {
        return res.status(400).json({ message: 'Invalid latitude or longitude.' });
    }

    const query = 'SELECT * FROM schools';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        
        const schoolsWithDistance = results.map((school) => {
            const distance = Math.sqrt(
                Math.pow(school.latitude - userLat, 2) + Math.pow(school.longitude - userLng, 2)
            );
            return { ...school, distance };
        });

        schoolsWithDistance.sort((a, b) => a.distance - b.distance);

        res.json(schoolsWithDistance);
    });
};
