const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const demoAccounts = [
  { id: 'b79e5d78-4e75-8505-e758-018e52460001', role: 'buyer', name: 'Buyer User', email: 'buyer@eventsphere.com', password: 'Buyer123!', color: 'e05c5c' },
  { id: 'b79e5d78-4e75-8505-e758-018e52460002', role: 'organizer', name: 'Organizer User', email: 'organizer@eventsphere.com', password: 'Organizer1!', color: '5c8ce0' },
  { id: 'b79e5d78-4e75-8505-e758-018e52460003', role: 'sponsor', name: 'Sponsor User', email: 'sponsor@eventsphere.com', password: 'Sponsor1!', color: '4caf7d', company: 'Acme Corp', budget: 100000.00 },
  { id: 'b79e5d78-4e75-8505-e758-018e52460004', role: 'admin', name: 'Admin User', email: 'admin@eventsphere.com', password: 'Admin123!', color: 'c9a84c' },
];

const run = async () => {
    try {
        for (const acc of demoAccounts) {
            const hash = await bcrypt.hash(acc.password, 10);
            const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(acc.name)}&background=${acc.color}&color=fff`;
            
            // Upsert / Update logic
            const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [acc.email]);
            if (rows.length > 0) {
                 await pool.query('UPDATE users SET password = ?, avatar = ? WHERE email = ?', [hash, avatar, acc.email]);
                 console.log("Updated", acc.email);
            } else {
                 await pool.query('INSERT INTO users SET ?', [{
                     id: acc.id,
                     name: acc.name,
                     email: acc.email,
                     password: hash,
                     role: acc.role,
                     company: acc.company || null,
                     avatar: avatar,
                     banned: 0,
                     budget: acc.budget || null
                 }]);
                 console.log("Inserted", acc.email);
            }
        }
        console.log("✅ Credentials and broken images fixed.");
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
};
run();
