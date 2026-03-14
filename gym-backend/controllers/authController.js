const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { fullName, email, password, phone } = req.body;
    try {
        const pool = await poolPromise;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // По умолчанию ставим RoleID = 2 (Client)
        await pool.request()
            .input('name', sql.NVarChar, fullName)
            .input('email', sql.NVarChar, email)
            .input('pass', sql.NVarChar, hashedPassword)
            .input('phone', sql.NVarChar, phone)
            .query('INSERT INTO Users (FullName, Email, PasswordHash, Phone, RoleID) VALUES (@name, @email, @pass, @phone, 2)');

        res.status(201).json({ message: "User registered" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT u.*, r.RoleName FROM Users u JOIN Roles r ON u.RoleID = r.RoleID WHERE Email = @email');

        const user = result.recordset[0];
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.UserID, role: user.RoleName },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, user: { id: user.UserID, name: user.FullName, role: user.RoleName } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};