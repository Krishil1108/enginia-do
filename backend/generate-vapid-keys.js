// Script to generate VAPID keys for push notifications
const webpush = require('web-push');

console.log('Generating new VAPID keys...\n');

const keys = webpush.generateVAPIDKeys();

console.log('=== VAPID Keys Generated ===');
console.log('Public Key:');
console.log(keys.publicKey);
console.log('\nPrivate Key:');
console.log(keys.privateKey);

console.log('\n=== Environment Variables ===');
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);

console.log('\n=== Usage Instructions ===');
console.log('1. Copy these keys to your production environment variables');
console.log('2. Update backend/routes/notifications.js to use process.env.VAPID_PUBLIC_KEY');
console.log('3. Update frontend/src/services/notificationService.js with the public key');
console.log('4. Never commit private keys to version control!');