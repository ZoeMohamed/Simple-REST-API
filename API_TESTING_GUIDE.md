# API Testing Guide

Panduan lengkap untuk testing REST API dengan berbagai tools.

## Testing dengan Postman

### Setup
1. Import Postman Collection: `postman_collection.json`
2. Pastikan aplikasi berjalan di `http://localhost:3000/api`
3. Collection variables akan otomatis tersimpan (token, userId, postId)

### Seeded Credentials (Dev)
Migration terbaru menambahkan 1 user contoh untuk login cepat:
- Email: `seed.user@example.com`
- Password: `Password123!`

### Seeded Posts (Dev)
Migration juga menambahkan 10 post contoh (topik berita) untuk user seed.
Setiap post berisi sumber di bagian content. Gunakan `GET /posts` untuk melihat daftar lengkap.

### Test Flow
1. **Register User** → Simpan userId
2. **Login** → Simpan JWT token
3. **Get All Users** → Test dengan token
4. **Create Post** → Simpan postId
5. **Update/Delete Post** → Test authorization

## E2E Testing dengan Jest

### Menjalankan E2E Test
```bash
npm run test:e2e
```

### Test Coverage
- User registration
- User login dengan JWT
- JWT token validation
- Protected routes (dengan/tanpa token)
- CRUD operations
- Authorization (ownership check)
- Invalid token handling

### Test Results
E2E test mencakup:
- 15 test cases
- Auth flow (3 tests)
- JWT protected routes (8 tests)
- JWT token validation (3 tests)

## Manual Testing dengan cURL

### 1. Register User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Simpan `access_token` dari response untuk request berikutnya.

### 3. Get All Users (Protected)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Create Post (Protected)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is my first post content",
    "published": true
  }'
```

### 5. Get All Posts (Public)
```bash
curl -X GET http://localhost:3000/api/posts
```

### 6. Update Post (Protected, Owner Only)
```bash
curl -X PATCH http://localhost:3000/api/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title"
  }'
```

### 7. Delete Post (Protected, Owner Only)
```bash
curl -X DELETE http://localhost:3000/api/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## JWT Token Testing

### Valid Token Test
```bash
# Should return 200 OK
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer VALID_TOKEN"
```

### Invalid Token Test
```bash
# Should return 401 Unauthorized
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer invalid_token"
```

### Missing Token Test
```bash
# Should return 401 Unauthorized
curl -X GET http://localhost:3000/api/users
```

### Expired Token Test
```bash
# Should return 401 Unauthorized (after token expires)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer EXPIRED_TOKEN"
```

## Expected HTTP Status Codes

| Endpoint | Method | Auth | Success | Error |
|----------|--------|------|---------|-------|
| /users | POST | No | 201 | 409 (Email exists) |
| /auth/login | POST | No | 200 | 401 (Invalid credentials) |
| /users | GET | Yes | 200 | 401 (No token) |
| /users/:id | GET | Yes | 200 | 404 (Not found) |
| /users/:id | PATCH | Yes | 200 | 404 (Not found) |
| /users/:id | DELETE | Yes | 200 | 404 (Not found) |
| /posts | POST | Yes | 201 | 401 (No token) |
| /posts | GET | No | 200 | - |
| /posts/:id | GET | No | 200 | 404 (Not found) |
| /posts/:id | PATCH | Yes | 200 | 403 (Not owner) |
| /posts/:id | DELETE | Yes | 200 | 403 (Not owner) |

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution**: 
- Pastikan JWT token valid
- Cek format header: `Authorization: Bearer TOKEN`
- Login ulang untuk mendapat token baru

### Issue: 403 Forbidden
**Solution**:
- Pastikan Anda adalah pemilik resource (post)
- Cek userId di token matches dengan post.userId

### Issue: 404 Not Found
**Solution**:
- Cek ID yang digunakan (valid UUID)
- Pastikan resource exists di database

### Issue: 409 Conflict
**Solution**:
- Email sudah terdaftar
- Gunakan email yang berbeda

## Test Scenarios

### Scenario 1: Full User Journey
1. Register → Login → Create Post → Update Post → Delete Post

### Scenario 2: Authorization Test
1. User A creates post
2. User B tries to update User A's post → Should fail (403)

### Scenario 3: Token Expiration
1. Login → Wait for token expiration → Try to access protected route → Should fail (401)

### Scenario 4: Invalid Input
1. Register with invalid email → Should fail (400)
2. Register with short password → Should fail (400)
3. Create post without required fields → Should fail (400)

## Performance Testing

### Apache Bench Example
```bash
# Test login endpoint
ab -n 100 -c 10 -p login.json -T application/json \
  http://localhost:3000/api/auth/login

# Test get posts endpoint
ab -n 1000 -c 50 http://localhost:3000/api/posts
```

### Load Testing with Artillery
```bash
npm install -g artillery

# Run load test
artillery quick --count 10 --num 50 http://localhost:3000/api/posts
```

## Additional Resources

- [Postman Documentation](https://learning.postman.com/docs/getting-started/introduction/)
- [Jest E2E Testing](https://docs.nestjs.com/fundamentals/testing#end-to-end-testing)
- [JWT Best Practices](https://jwt.io/introduction)
- [REST API Testing Guide](https://www.postman.com/api-platform/api-testing/)
