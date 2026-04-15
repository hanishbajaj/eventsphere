const bcrypt = require('bcryptjs');

const run = async () => {
    // Generate a $2a$ hash with bcryptjs
    const hash = await bcrypt.hash('password123', 12);
    console.log("Generated hash:", hash);

    // Pretend it's $2b$
    const hash2b = hash.replace(/^\$2a\$/, '$2b$');
    console.log("Modified to $2b$:", hash2b);

    // Try to compare $2b$ using bcryptjs
    try {
        const match1 = await bcrypt.compare('password123', hash2b);
        console.log("Match 2b directly:", match1);
    } catch(err) {
        console.error("Match 2b failed", err.message);
    }

    // Try replacing $2b$ with $2a$
    try {
        const match2 = await bcrypt.compare('password123', hash2b.replace(/^\$2b\$/, '$2a$'));
        console.log("Match 2b replaced to 2a:", match2);
    } catch(err) {
        console.error("Match 2b replaced failed", err.message);
    }
}
run();
