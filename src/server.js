const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
    console.log(`🚀 Object Storage API server running on port ${env.port}`);
    console.log(`📁 Endpoint: ${env.aws.endpoint}`);
    console.log(`🌍 Health check: http://localhost:${env.port}/health`);
    console.log(`📚 API Documentation: http://localhost:${env.port}/api-docs`);
});
