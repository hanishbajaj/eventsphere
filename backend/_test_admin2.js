const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const run = async () => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = "admin@eventsphere.com"');
        if (rows.length === 0) {
            console.log("admin not found in DB.");
        } else {
            console.log("DB hash:", rows[0].password);
            console.log("Match normal:", await bcrypt.compare('password123', rows[0].password));
        }
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
};
run();
