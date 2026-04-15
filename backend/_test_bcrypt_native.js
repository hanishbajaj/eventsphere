const bcrypt = require('bcrypt');

const run = async () => {
    const hash2y = "$2y$12$R.S.Y6E/ZlR17nO53P.84uD63X5bKqHReiV2eH/QeA6L78yv5Xq3i";
    
    // Check using native bcrypt
    try {
        const match = await bcrypt.compare('password123', hash2y);
        console.log("Native bcrypt Match for password123:", match);
    } catch(err) {
        console.error("Native match failed", err.message);
    }
}
run();
