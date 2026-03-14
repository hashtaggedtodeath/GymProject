const { sql, poolPromise } = require('../config/db');

exports.getAllTrainers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Trainers');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createTrainer = async (req, res) => {
    const { fullName, specialization, bio, photoUrl } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, fullName)
            .input('spec', sql.NVarChar, specialization)
            .input('bio', sql.NVarChar, bio)
            .input('photo', sql.NVarChar, photoUrl)
            .query('INSERT INTO Trainers (FullName, Specialization, Bio, PhotoURL) VALUES (@name, @spec, @bio, @photo)');
        res.status(201).json({ message: "Trainer added" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTrainer = async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Trainers WHERE TrainerID = @id');
        res.json({ message: "Trainer deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};