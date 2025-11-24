# Backend API Routes

This document lists all the available API routes in the backend, their request types, and expected data.

## Auth Routes (`/api/v1/auth`)

| Route | Method | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| `/register` | POST | Register a new user | `email`, `username`, `password` |
| `/login` | POST | Login a user | `email` or `username`, `password` |
| `/refresh-token` | POST | Refresh access token | None (uses cookies) |
| `/verify-email/:verificationToken` | GET | Verify user email | `verificationToken` (URL param) |
| `/forgot-password` | POST | Request password reset | `email` |
| `/reset-password/:resetToken` | POST | Reset password | `newPassword` (Body), `resetToken` (URL param) |
| `/logout` | POST | Logout user | None (Requires Auth) |
| `/avatar` | PATCH | Update user avatar | `avatar` (Multipart File) (Requires Auth) |
| `/current-user` | GET | Get current user details | None (Requires Auth) |
| `/change-password` | POST | Change current password | `oldPassword`, `newPassword` (Requires Auth) |
| `/google` | GET | Initiate Google SSO | None |
| `/github` | GET | Initiate GitHub SSO | None |
| `/google/callback` | GET | Google SSO Callback | None |
| `/github/callback` | GET | GitHub SSO Callback | None |
| `/cookie-setter` | POST | Set cookies manually | Custom (Dev use) |

## Chat Routes (`/api/v1/chat`)

*All routes require authentication.*

| Route | Method | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| `/` | GET | Get all chats | None |
| `/users` | GET | Search available users | Query params likely used |
| `/c/:receiverId` | POST | Create/Get 1-on-1 chat | `receiverId` (URL param) |
| `/group` | POST | Create group chat | `name`, `participants` (Array of IDs) |
| `/group/:chatId` | GET | Get group chat details | `chatId` (URL param) |
| `/group/:chatId` | PATCH | Rename group chat | `name` (Body), `chatId` (URL param) |
| `/group/:chatId` | DELETE | Delete group chat | `chatId` (URL param) |
| `/group/:chatId/:participantId` | POST | Add participant to group | `chatId`, `participantId` (URL params) |
| `/group/:chatId/:participantId` | DELETE | Remove participant | `chatId`, `participantId` (URL params) |
| `/leave/group/:chatId` | DELETE | Leave group chat | `chatId` (URL param) |
| `/remove/:chatId` | DELETE | Delete 1-on-1 chat | `chatId` (URL param) |

## Message Routes (`/api/v1/messages`)

*All routes require authentication.*

| Route | Method | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| `/:chatId` | GET | Get all messages in chat | `chatId` (URL param) |
| `/:chatId` | POST | Send message | `content` (Body), `attachments` (Files), `chatId` (URL param) |
| `/:chatId/:messageId` | DELETE | Delete message | `chatId`, `messageId` (URL params) |

## Profile Routes (`/api/v1/profile`)

*All routes require authentication.*

| Route | Method | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| `/` | POST | Add profile | Profile data fields |
| `/` | GET | List profiles | Query params likely used |
| `/:profileId` | GET | Get profile details | `profileId` (URL param) |
| `/:profileId` | PUT | Update profile | Profile data fields, `profileId` (URL param) |
| `/:profileId` | DELETE | Delete profile | `profileId` (URL param) |
| `/:profileId/cohort` | POST | Add cohort to profile | `cohortId` (Body), `profileId` (URL param) (Admin only) |

## Cohort Routes (`/api/v1/cohort`)

| Route | Method | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| `/` | POST | Add cohort | Cohort data fields |
| `/` | GET | List cohorts | Query params likely used |
| `/:cohortId` | GET | Get cohort details | `cohortId` (URL param) |
| `/:cohortId` | PUT | Update cohort | Cohort data fields, `cohortId` (URL param) |
| `/:cohortId` | DELETE | Delete cohort | `cohortId` (URL param) |

## Team Routes (`/api/v1/team`)

*All routes require authentication and Admin role.*

| Route | Method | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| `/` | GET | Get teams | None |
| `/` | POST | Create team | Team data fields |
| `/:teamId` | PUT | Add member to team | `userId` (Body), `teamId` (URL param) |
| `/:teamId` | DELETE | Remove member/Delete team | `userId` (Body for remove member), `teamId` (URL param) |

## Health Check (`/api/v1/health-check`)

| Route | Method | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| `/` | GET | Health check | None |
