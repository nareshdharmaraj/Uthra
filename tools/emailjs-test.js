const EmailService = require('../backend/services/emailService');

(async () => {
  const publicKey = 'bWtCpA_B-HhGpKK3d';
  const ok = await EmailService.testConfiguration(publicKey);
  console.log('\nTest result:', ok ? 'OK' : 'NOT OK');
})();