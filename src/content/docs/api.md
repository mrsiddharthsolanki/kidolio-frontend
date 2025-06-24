---
title: API Reference
order: 2
---

# API Reference

This section provides detailed information about the Kidolio API endpoints and usage.

## Authentication

All API requests require authentication using a valid token.

### Example

```http
GET /api/user/profile
Authorization: Bearer &lt;token&gt;
```

## Endpoints

### Get User Profile
- **Endpoint:** `/api/user/profile`
- **Method:** `GET`
- **Description:** Returns the profile information of the authenticated user.

### Update User Profile
- **Endpoint:** `/api/user/profile`
- **Method:** `PUT`
- **Description:** Updates the profile information of the authenticated user.

### List Courses
- **Endpoint:** `/api/courses`
- **Method:** `GET`
- **Description:** Returns a list of available courses.

## Error Codes

- `401 Unauthorized`: Invalid or missing token.
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Something went wrong on the server.

## See Also
- [Quick Start](./quick-start.md)
- [Advanced Guides](./advanced.md)
