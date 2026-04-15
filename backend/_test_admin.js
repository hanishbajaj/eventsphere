const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const run = async () => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', ['admin@eventsphere.com']);
        if (rows.length === 0) {
            console.log("Admin not found in DB.");
            return;
        }
        const user = rows[0];
        console.log("User:", user.email, "Hash:", user.password, "Role:", user.role);

        // test password123
        const match1 = await bcrypt.compare('password123', user.password);
        console.log("Match for password123:", match1);

        // test Admin123!
        const match2 = await bcrypt.compare('Admin123!', user.password);
        console.log("Match for Admin123!:", match2);
        
        // test $2b replacement to $2a
        const match3 = await bcrypt.compare('password123', user.password.replace(/^\$2b\$/, '$2a$'));
        console.log("Match 2b replacement for password123:", match3);
    } catch(err) {
        console.error("Error", err);
    }
    process.exit(0);
}
run();
