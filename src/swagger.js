const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tripfit API',
      version: '1.0.0',
      description: '트립핏 백엔드 API 문서',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: '로컬 서버',
      },
      {
        url: 'https://tripfit-backend-6que.onrender.com',
        description: '배포 서버',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'], // 라우터 파일에서 주석 읽어옴
};

module.exports = swaggerJsdoc(options);