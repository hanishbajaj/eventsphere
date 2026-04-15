const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'routes', 'auth.js');
let d = fs.readFileSync(p, 'utf8');
d = d.replace("`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=c9a84c`", "`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c9a84c&color=fff`");
fs.writeFileSync(p, d);
console.log("Updated auth.js avatar generation");
