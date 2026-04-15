const bcrypt = require('bcryptjs');

const run = async () => {
    const hash2y = "$2y$12$R.S.Y6E/ZlR17nO53P.84uD63X5bKqHReiV2eH/QeA6L78yv5Xq3i";
    
    // Replace $2y$ with $2a$ and check
    try {
        const match = await bcrypt.compare('password123', hash2y.replace(/^\$2[y|b]\$/, '$2a$'));
        console.log("Match for password123 with $2y replacement:", match);
    } catch(err) {
        console.error("Match $2y replacement failed", err.message);
    }
}
run();
