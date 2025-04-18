const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Create a simple index.js file in the dist directory
const indexJsContent = `
const { Hono } = require('hono');
const { cors } = require('hono/cors');
const { logger } = require('hono/logger');
const { prettyJSON } = require('hono/pretty-json');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use(cors({
  origin: (origin) => {
    // Allow all origins by returning the origin itself
    return origin;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposeHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

// Root route handler
app.get('/', (c) => {
  console.log('Root route accessed');
  return c.json({
    message: 'Digital Rights Tool API',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Health check route
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// API Routes
// Auth routes
app.post('/api/auth/register', (c) => {
  // Mock successful registration
  return c.json({
    user: {
      id: 'mock-user-id',
      name: 'Mock User',
      email: 'mock@example.com'
    },
    token: 'mock-token'
  });
});

app.post('/api/auth/login', (c) => {
  // Mock successful login
  return c.json({
    user: {
      id: 'mock-user-id',
      name: 'Mock User',
      email: 'mock@example.com'
    },
    token: 'mock-token'
  });
});

app.get('/api/auth/profile', (c) => {
  // Mock user profile
  return c.json({
    user: {
      id: 'mock-user-id',
      name: 'Mock User',
      email: 'mock@example.com'
    }
  });
});

// Upload routes
app.post('/api/uploads', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file');
  const fileType = formData.get('fileType');
  
  // Mock successful upload with different file types
  const mockResponses = {
    'IMAGE': {
      id: 'mock-upload-id',
      userId: 'mock-user-id',
      fileType: 'IMAGE',
      fileName: 'mock-image.jpg',
      fileUrl: 'https://example.com/mock-image.jpg',
      contentType: 'image/jpeg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'PDF': {
      id: 'mock-upload-id-pdf',
      userId: 'mock-user-id',
      fileType: 'PDF',
      fileName: 'mock-document.pdf',
      fileUrl: 'https://example.com/mock-document.pdf',
      contentType: 'application/pdf',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'VIDEO': {
      id: 'mock-upload-id-video',
      userId: 'mock-user-id',
      fileType: 'VIDEO',
      fileName: 'mock-video.mp4',
      fileUrl: 'https://example.com/mock-video.mp4',
      contentType: 'video/mp4',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  return c.json({
    upload: mockResponses[fileType] || mockResponses['IMAGE']
  });
});

app.get('/api/uploads', (c) => {
  // Mock uploads list
  return c.json({
    uploads: [
      {
        id: 'mock-upload-1',
        userId: 'mock-user-id',
        fileType: 'IMAGE',
        fileName: 'sample-image.jpg',
        fileUrl: 'https://example.com/sample-image.jpg',
        contentType: 'image/jpeg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'mock-upload-2',
        userId: 'mock-user-id',
        fileType: 'ARTICLE',
        fileName: 'sample-article.txt',
        fileUrl: 'https://example.com/sample-article.txt',
        contentType: 'text/plain',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/uploads/:id', (c) => {
  // Mock single upload
  const id = c.req.param('id');
  return c.json({
    upload: {
      id,
      userId: 'mock-user-id',
      fileType: 'IMAGE',
      fileName: 'sample-image.jpg',
      fileUrl: 'https://example.com/sample-image.jpg',
      contentType: 'image/jpeg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
});

app.delete('/api/uploads/:id', (c) => {
  // Mock successful deletion
  return c.json({ success: true });
});

// Analysis routes
app.post('/api/analyses/:id', (c) => {
  // Mock successful analysis creation
  return c.json({
    analysis: {
      id: 'mock-analysis-id',
      uploadId: c.req.param('id'),
      licensingSummary: 'Analysis in progress...',
      riskScore: 0,
      createdAt: new Date().toISOString()
    }
  });
});

app.get('/api/analyses/:id', (c) => {
  // Mock analysis
  return c.json({
    analysis: {
      id: 'mock-analysis-id',
      uploadId: c.req.param('id'),
      upload: {
        id: c.req.param('id'),
        fileName: 'sample-image.jpg',
        fileType: 'IMAGE',
        fileUrl: 'https://example.com/sample-image.jpg',
        contentType: 'image/jpeg'
      },
      licensingSummary: 'This content is licensed under the MIT License, which allows for commercial use, modification, and distribution with minimal restrictions.',
      riskScore: 10,
      createdAt: new Date().toISOString()
    }
  });
});

// Request routes
app.post('/api/requests', async (c) => {
  const { question } = await c.req.json();
  
  // Mock responses based on the actual question
  const mockResponses = {
    'What are the fair use guidelines for using images in my educational blog?': {
      id: 'mock-request-1',
      userId: 'mock-user-id',
      question: 'What are the fair use guidelines for using images in my educational blog?',
      answer: 'Fair use is a legal doctrine that allows limited use of copyrighted material without requiring permission from the rights holders. For educational blogs, you can use copyrighted images if: 1) The use is transformative, 2) The amount used is reasonable, 3) The use doesn\\'t affect the market value of the original work, and 4) The purpose is educational. However, it\\'s always safer to use Creative Commons licensed images or obtain proper permissions.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'Can I use Creative Commons licensed images for my commercial website?': {
      id: 'mock-request-2',
      userId: 'mock-user-id',
      question: 'Can I use Creative Commons licensed images for my commercial website?',
      answer: 'Creative Commons licenses provide a standardized way to grant permissions for using creative works. For commercial websites, you can use CC-licensed images, but you must check the specific license terms. Some licenses like CC-BY and CC-BY-SA allow commercial use, while others like CC-NC (Non-Commercial) do not. Always verify the license terms and provide proper attribution as required by the license.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'How do I determine if a work is in the public domain?': {
      id: 'mock-request-3',
      userId: 'mock-user-id',
      question: 'How do I determine if a work is in the public domain?',
      answer: 'Public domain works are not protected by copyright and can be freely used. Works enter the public domain when: 1) The copyright has expired (typically 70 years after the author\\'s death), 2) The work was created by the U.S. government, 3) The creator explicitly dedicated the work to the public domain, or 4) The work was published before 1927. You can verify public domain status through copyright databases or consult with a legal professional.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  // Generate a more detailed fallback response based on the question
  const generateDetailedResponse = (question) => {
    // Extract keywords from the question
    const keywords = question.toLowerCase().split(' ');
    
    // Check for common topics
    if (keywords.some(word => ['copyright', 'license', 'permission', 'rights'].includes(word))) {
      return {
        id: 'mock-request-id',
        userId: 'mock-user-id',
        question: question,
        answer: 'Regarding your question about copyright and licensing: Copyright law protects original creative works, giving creators exclusive rights to reproduce, distribute, and display their work. To use copyrighted material, you typically need permission from the rights holder. However, there are exceptions like fair use, which allows limited use for purposes such as criticism, comment, news reporting, teaching, scholarship, or research. For your specific case, I recommend consulting with a legal professional to ensure compliance with copyright laws.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else if (keywords.some(word => ['image', 'photo', 'picture', 'photograph'].includes(word))) {
      return {
        id: 'mock-request-id',
        userId: 'mock-user-id',
        question: question,
        answer: 'Regarding your question about images: Images are protected by copyright law, and using them without permission can lead to legal issues. When using images, consider these options: 1) Use images you own or have created, 2) Obtain proper licenses or permissions, 3) Use images with Creative Commons licenses (check the specific terms), 4) Use images in the public domain, or 5) Rely on fair use if your use qualifies. For commercial projects, it\\'s especially important to ensure you have proper rights to use the images.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else if (keywords.some(word => ['video', 'film', 'movie', 'footage'].includes(word))) {
      return {
        id: 'mock-request-id',
        userId: 'mock-user-id',
        question: question,
        answer: 'Regarding your question about video content: Video content is protected by copyright law, and using it without permission can lead to legal issues. When using video content, consider these options: 1) Use videos you own or have created, 2) Obtain proper licenses or permissions, 3) Use videos with Creative Commons licenses (check the specific terms), 4) Use videos in the public domain, or 5) Rely on fair use if your use qualifies. For commercial projects, it\\'s especially important to ensure you have proper rights to use the video content.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else if (keywords.some(word => ['text', 'article', 'writing', 'content'].includes(word))) {
      return {
        id: 'mock-request-id',
        userId: 'mock-user-id',
        question: question,
        answer: 'Regarding your question about text content: Text content is protected by copyright law, and using it without permission can lead to legal issues. When using text content, consider these options: 1) Use text you own or have written, 2) Obtain proper licenses or permissions, 3) Use text with Creative Commons licenses (check the specific terms), 4) Use text in the public domain, or 5) Rely on fair use if your use qualifies. For commercial projects, it\\'s especially important to ensure you have proper rights to use the text content.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      return {
        id: 'mock-request-id',
        userId: 'mock-user-id',
        question: question,
        answer: 'Thank you for your question about digital rights and licensing. To provide you with the most accurate information, I need to understand your specific use case better. Could you please provide more details about: 1) The type of content you want to use (image, video, text, etc.), 2) How you plan to use it (personal, commercial, educational, etc.), 3) Where you found the content, and 4) Any licensing information you have. With this information, I can give you more specific guidance on copyright compliance and licensing requirements.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  };

  return c.json({
    request: mockResponses[question] || generateDetailedResponse(question)
  });
});

app.get('/api/requests', (c) => {
  // Mock requests list with actual questions
  return c.json({
    requests: [
      {
        id: 'mock-request-1',
        userId: 'mock-user-id',
        question: 'What are the fair use guidelines for using images in my educational blog?',
        answer: 'Fair use is a legal doctrine that allows limited use of copyrighted material without requiring permission from the rights holders. For educational blogs, you can use copyrighted images if: 1) The use is transformative, 2) The amount used is reasonable, 3) The use doesn\\'t affect the market value of the original work, and 4) The purpose is educational. However, it\\'s always safer to use Creative Commons licensed images or obtain proper permissions.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'mock-request-2',
        userId: 'mock-user-id',
        question: 'Can I use Creative Commons licensed images for my commercial website?',
        answer: 'Creative Commons licenses provide a standardized way to grant permissions for using creative works. For commercial websites, you can use CC-licensed images, but you must check the specific license terms. Some licenses like CC-BY and CC-BY-SA allow commercial use, while others like CC-NC (Non-Commercial) do not. Always verify the license terms and provide proper attribution as required by the license.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'mock-request-3',
        userId: 'mock-user-id',
        question: 'How do I determine if a work is in the public domain?',
        answer: 'Public domain works are not protected by copyright and can be freely used. Works enter the public domain when: 1) The copyright has expired (typically 70 years after the author\\'s death), 2) The work was created by the U.S. government, 3) The creator explicitly dedicated the work to the public domain, or 4) The work was published before 1927. You can verify public domain status through copyright databases or consult with a legal professional.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/requests/:id', (c) => {
  const id = c.req.param('id');
  // Mock single request with actual questions
  const mockRequests = {
    'mock-request-1': {
      id: 'mock-request-1',
      userId: 'mock-user-id',
      question: 'What are the fair use guidelines for using images in my educational blog?',
      answer: 'Fair use is a legal doctrine that allows limited use of copyrighted material without requiring permission from the rights holders. For educational blogs, you can use copyrighted images if: 1) The use is transformative, 2) The amount used is reasonable, 3) The use doesn\\'t affect the market value of the original work, and 4) The purpose is educational. However, it\\'s always safer to use Creative Commons licensed images or obtain proper permissions.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'mock-request-2': {
      id: 'mock-request-2',
      userId: 'mock-user-id',
      question: 'Can I use Creative Commons licensed images for my commercial website?',
      answer: 'Creative Commons licenses provide a standardized way to grant permissions for using creative works. For commercial websites, you can use CC-licensed images, but you must check the specific license terms. Some licenses like CC-BY and CC-BY-SA allow commercial use, while others like CC-NC (Non-Commercial) do not. Always verify the license terms and provide proper attribution as required by the license.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'mock-request-3': {
      id: 'mock-request-3',
      userId: 'mock-user-id',
      question: 'How do I determine if a work is in the public domain?',
      answer: 'Public domain works are not protected by copyright and can be freely used. Works enter the public domain when: 1) The copyright has expired (typically 70 years after the author\\'s death), 2) The work was created by the U.S. government, 3) The creator explicitly dedicated the work to the public domain, or 4) The work was published before 1927. You can verify public domain status through copyright databases or consult with a legal professional.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  // Generate a more detailed fallback response for unknown request IDs
  const generateDetailedResponse = (id) => {
    return {
      id,
      userId: 'mock-user-id',
      question: 'How can I ensure my use of digital content complies with copyright law?',
      answer: 'To ensure your use of digital content complies with copyright law, follow these guidelines: 1) Understand that most creative works are protected by copyright automatically upon creation, 2) Obtain proper permissions or licenses before using copyrighted content, 3) Consider using content with Creative Commons licenses or from the public domain, 4) Evaluate if your use qualifies as fair use (for educational, commentary, or transformative purposes), 5) Always provide proper attribution when required, 6) Keep records of your permissions and licenses, and 7) When in doubt, consult with a legal professional specializing in copyright law.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  return c.json({
    request: mockRequests[id] || generateDetailedResponse(id)
  });
});

module.exports = app;
`;

// Create a server.js file in the dist directory
const serverJsContent = `
const app = require('./index');
const { serve } = require('@hono/node-server');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

console.log(\`Starting server on port \${PORT}...\`);

serve({
  fetch: app.fetch,
  port: Number(PORT),
}, (info) => {
  console.log(\`Server is running on http://localhost:\${info.port}\`);
});
`;

// Write the index.js file to the dist directory
fs.writeFileSync(path.join(__dirname, 'dist', 'index.js'), indexJsContent);
console.log('Created index.js file in dist directory');

// Write the server.js file to the dist directory
fs.writeFileSync(path.join(__dirname, 'dist', 'server.js'), serverJsContent);
console.log('Created server.js file in dist directory');

// Run Prisma generate
console.log('Running Prisma generate...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma generate completed successfully!');
} catch (error) {
  console.error('Prisma generate failed:', error);
  process.exit(1);
}

console.log('Build completed successfully!'); 