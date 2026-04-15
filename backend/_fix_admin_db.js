const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const run = async () => {
    try {
        const hash = await bcrypt.hash('password123', 10);
        console.log("New hash:", hash);
        await pool.query('UPDATE users SET password = ? WHERE email = ?', [hash, 'admin@eventsphere.com']);
        console.log("Database updated for admin@eventsphere.com");
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
};
run();
