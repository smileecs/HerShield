# HerShield Security Specification & Threat Model

This specification documents the data invariants, strict security boundaries, and attack vectors for the HerShield real-time emergency safety platform.

## 1. Data Invariants & Security Boundaries

### Users (`/users/{userId}`)
* **Access Control**: A user's profile can only be read or written by the authenticated user themselves (`request.auth.uid == userId`).
* **Identity Integrity**: The user cannot change their own `id` or modify immutable fields like `createdAt`.
* **PII Isolation**: Email address and verification status must be protected from unauthorized third-party lookups.

### Trusted Contacts (`/contacts/{contactId}`)
* **Access Control**: A trusted contact can only be managed (created, updated, or deleted) by its creator (`request.auth.uid == resource.data.userId` or `incoming().userId == request.auth.uid`).
* **Relational Safety**: The `userId` property on a trusted contact must strictly match the creator's authenticated UID.

### Journeys (`/journeys/{journeyId}`)
* **Access Control**: Only the journey's creator can initiate or update a journey.
* **Shared Views**: A journey is publicly readable *only* if the viewer is authenticated as the owner, or if the client retrieves the journey utilizing the secure, unguessable `shareToken`.
* **State Progression**: A journey cannot bypass state boundaries (e.g., moving directly from `cancelled` to `completed` or updating a finished journey).

---

## 2. The "Dirty Dozen" Threat Payloads

The following 12 payloads represent malicious attempts to bypass identity, integrity, and state transition controls:

1. **Self-Elevating Account Creation**: Attempting to register a user with pre-verified status or administrative claims bypasses the verification system.
2. **Profile Hijacking**: Attempting to update a different user's profile by changing the `userId` field to a target user's ID.
3. **Ghost Contact Injection**: Creating a trusted contact with a `userId` belonging to another user.
4. **Contact Owner Modification**: Attempting to update a contact's `userId` after creation to orphan or hijack the record.
5. **Unauthorized Contact Reading**: Attempting to fetch or list trusted contacts belonging to other users.
6. **Journey Hijacking**: Creating a journey with another user's authenticated ID.
7. **Telemetry Spoofing**: Attempting to write location updates to another user's active journey.
8. **State Transition Shortcutting**: Directly updating a journey's status from `active` to `completed` without changing progression, or retroactively editing an ended journey.
9. **Junk String ID Poisoning**: Injecting a 1MB junk string or invalid characters into the user or contact ID path.
10. **Denial of Wallet (DoW) Array Bloating**: Flooding a user document's `usedVerificationTokens` array with 100,000 entries to inflate storage/read costs.
11. **PII Query Scraping**: Attempting a blanket query or list operation on the `users` collection without filtering by the requester's UID.
12. **Timestamp Impersonation**: Forging the `createdAt` or `updatedAt` values using an arbitrary client timestamp instead of the server's time.

---

## 3. Threat Mitigation and Rule Defenses

Our `firestore.rules` implements:
* Highly rigorous type-safe check functions (`isValidId`, `isSignedIn`, `isOwner`).
* String format and length constraints.
* Mathematical validation of document keys to prevent extra "Ghost fields".
* Action-specific validation blocks using `affectedKeys().hasOnly()`.
