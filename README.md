# Kidolio Frontend Documentation

Welcome to the Kidolio frontend documentation! This guide is for frontend engineers and designers working on the Kidolio platform. It covers UI/UX guidelines, component usage, and integration tips for working with the backend API.

---

## Table of Contents
- [Project Structure](#project-structure)
- [Component Usage](#component-usage)
- [API Integration](#api-integration)
- [Image Upload (Cloudinary)](#image-upload-cloudinary)
- [Registration Flows](#registration-flows)
- [Styling & Theming](#styling--theming)
- [Useful Links](#useful-links)

---

## Project Structure
- `src/components/` — All UI and feature components (auth, child, parent, official, records, etc.)
- `src/pages/` — Top-level pages (Dashboard, SignUp, etc.)
- `src/contexts/` — React context providers (Auth, Theme)
- `src/lib/` — API utilities, helpers
- `src/hooks/` — Custom React hooks

## Component Usage
- **Auth Components:**
  - `ParentSignUpForm`, `OfficialSignUpForm`, `SignInForm`, etc. — Use these for registration and login flows.
- **Child Components:**
  - `AddChildForm`, `ChildCard`, `ChildRecordsManager` — For managing child profiles and records.
- **Profile Components:**
  - `ParentProfile`, `ProfileView` — For displaying and editing user/parent/official profiles.

## API Integration
- All API endpoints and schemas are documented at [`/api/docs`](http://localhost:5000/api/docs) (Swagger UI, served by the backend).
- Use `src/lib/api.ts` (Axios instance) for all HTTP requests.
- For protected routes, JWT is automatically attached from localStorage.

## Image Upload (Cloudinary)
- Use the following endpoints for uploading images/files:
  - **Profile Image:** `POST /api/auth/upload/profile-image` (form field: `image`)
  - **Official Certificate:** `POST /api/auth/upload/official-certificate` (form field: `certificate`)
  - **Child Photo:** `POST /api/auth/upload/child-photo` (form field: `photo`)
  - **Child Birth Certificate:** `POST /api/auth/upload/child-birth-certificate` (form field: `birthCertificate`)
- After upload, use the returned URL in your registration or update API calls.

**Sample (React):**
```js
const formData = new FormData();
formData.append('image', file); // file: File object
const res = await api.post('/auth/upload/profile-image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
const imageUrl = res.data.url;
```

## Registration Flows
- **Parent:** All fields in `ParentSignUpForm` are supported by the backend.
- **Official:** All fields in `OfficialSignUpForm` are supported, including certificate upload.
- **Child:** All fields in `AddChildForm` are supported, including photo and birth certificate upload.

## Styling & Theming
- Uses Tailwind CSS for utility-first styling.
- Dark mode is supported via `ThemeContext`.

## Useful Links
- [Backend API Docs (Swagger)](http://localhost:5000/api/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation/image_upload_api_reference)

---

For more details, see code comments in each component or contact the lead frontend engineer.
#   k i d o l i o - f r o n t e n d  
 