const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Object Storage API',
      version: '1.0.0',
      description: 'Express.js API for ClawCloud object storage with S3-compatible interface',
    },
    components: {
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error description',
            },
          },
        },
        FileUploadResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'File uploaded successfully',
            },
            data: {
              type: 'object',
              properties: {
                filename: {
                  type: 'string',
                  example: 'example.jpg',
                },
                key: {
                  type: 'string',
                  example: '1635123456789-example.jpg',
                },
                url: {
                  type: 'string',
                  example: 'https://objectstorageapi.ap-southeast-1.clawcloudrun.com/my-bucket/1635123456789-example.jpg',
                },
                bucket: {
                  type: 'string',
                  example: 'my-bucket',
                },
                size: {
                  type: 'integer',
                  example: 102400,
                },
                mimetype: {
                  type: 'string',
                  example: 'image/jpeg',
                },
              },
            },
          },
        },
        MultipleFileUploadResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Uploaded 3 of 3 files',
            },
            data: {
              type: 'object',
              properties: {
                bucket: {
                  type: 'string',
                  example: 'my-bucket',
                },
                successful: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      filename: {
                        type: 'string',
                        example: 'file1.jpg',
                      },
                      key: {
                        type: 'string',
                        example: '1635123456789-abc123-file1.jpg',
                      },
                      url: {
                        type: 'string',
                        example: 'https://objectstorageapi.ap-southeast-1.clawcloudrun.com/my-bucket/1635123456789-abc123-file1.jpg',
                      },
                      size: {
                        type: 'integer',
                        example: 102400,
                      },
                      mimetype: {
                        type: 'string',
                        example: 'image/jpeg',
                      },
                    },
                  },
                },
                failed: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: false,
                      },
                      filename: {
                        type: 'string',
                        example: 'failed-file.jpg',
                      },
                      error: {
                        type: 'string',
                        example: 'Upload failed: Error message',
                      },
                    },
                  },
                },
                summary: {
                  type: 'object',
                  properties: {
                    total: {
                      type: 'integer',
                      example: 3,
                    },
                    successful: {
                      type: 'integer',
                      example: 2,
                    },
                    failed: {
                      type: 'integer',
                      example: 1,
                    },
                  },
                },
              },
            },
          },
        },
        BucketsResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            buckets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  Name: {
                    type: 'string',
                    example: 'my-bucket',
                  },
                  CreationDate: {
                    type: 'string',
                    format: 'date-time',
                    example: '2023-10-30T10:00:00.000Z',
                  },
                },
              },
            },
          },
        },
        ObjectsResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            bucket: {
              type: 'string',
              example: 'my-bucket',
            },
            objects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  Key: {
                    type: 'string',
                    example: '1635123456789-example.jpg',
                  },
                  LastModified: {
                    type: 'string',
                    format: 'date-time',
                    example: '2023-10-30T10:00:00.000Z',
                  },
                  Size: {
                    type: 'integer',
                    example: 102400,
                  },
                  StorageClass: {
                    type: 'string',
                    example: 'STANDARD',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./server.js'], // paths to files containing OpenAPI definitions
};

module.exports = swaggerJsdoc(options);