const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/forgot-password', {
      mobile: '9876543213',
      emailJSPublicKey: 'bWtCpA_B-HhGpKK3d'
    }, { timeout: 20000 });

    console.log('Response:', res.status, res.data);
  } catch (err) {
    if (err.response) console.error('Error response:', err.response.status, err.response.data);
    else console.error('Error:', err.message);
  }
})();