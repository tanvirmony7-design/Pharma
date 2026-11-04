# Tanvir Pharma — Cloud-ready Android project (v1.1.0)

A Kotlin + Jetpack Compose Android starter for a bilingual pharmaceutical management system, extended with Firebase Authentication/Firestore dependencies, a cloud repository foundation, Firestore security rules, and a server-side sale transaction function.

## What is included
- Existing bilingual demo UI: dashboard, medicine list, stock, sales, customers and summary reports.
- Medicine fields: name, generic name (cloud model), strength, batch, barcode, quantity, unit price, expiry and branch.
- Firebase Auth sign-in method and Firestore staff-profile / live medicine-list repository (`cloud/CloudRepository.kt`).
- Role and branch-based Firestore rules in `firestore.rules`.
- Callable Cloud Function `createSale` that validates staff role and branch, then decrements stock + writes sale + audit log in one server transaction.
- Firestore composite indexes and Firebase deployment config.

## Important: this is not yet a live cloud deployment or production APK
The current Compose screens still use in-memory sample data. The cloud repository is a ready integration foundation, but the existing demo screens are not yet wired to it. No Firebase project has been created for you, no real staff accounts exist, and no APK has been built or signed. Do not enter real patient/customer or commercial data until the app has been fully integrated, security-tested and deployed.

## Setup required to activate cloud features
1. Create a Firebase project in the Firebase Console and register Android app package `com.tanvirpharma.app`.
2. Download the real `google-services.json` and place it in `app/google-services.json`. Do not share this file publicly.
3. Enable **Authentication > Email/Password** and create the initial administrator account.
4. Enable **Cloud Firestore** in a suitable region close to your operations. Deploy rules and indexes with Firebase CLI: `firebase deploy --only firestore:rules,firestore:indexes`.
5. Install Node.js 20 and Firebase CLI, then run `cd functions && npm install && npm run build`; deploy functions with `firebase deploy --only functions`. Cloud Functions deployment may require the Firebase/Google Cloud billing plan and App Check setup.
6. Provision staff profiles securely in `users/{uid}` using Firebase Admin SDK or a trusted admin-only backend. Never let the Android client assign its own role.

## Staff profile schema
`users/{uid}` example (created by trusted admin tooling only):

```json
{
  "name": "Staff Name",
  "email": "staff@example.com",
  "role": "sales",
  "active": true,
  "branchIds": ["dhaka-main"],
  "createdAt": "server timestamp"
}
```

Supported roles: `super_admin`, `admin`, `manager`, `sales`, `warehouse`, `accountant`, `viewer`. The included rules currently grant narrowly scoped permissions to the roles used by the sample workflows; extend accountant/viewer permissions deliberately before launch.

## Build a debug APK
1. Install current stable Android Studio with Android SDK Platform 35.
2. Add the real `app/google-services.json` as above (Google Services plugin is enabled).
3. Open this folder in Android Studio and sync Gradle.
4. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. Android Studio reports the APK path, usually `app/build/outputs/apk/debug/app-debug.apk`.

Minimum Android: 7.0 (API 24). Application ID: `com.tanvirpharma.app`.

## Before real business use
Complete and test: cloud-backed screen integration, user/branch administration UI, purchase & supplier modules, batch-level stock ledger, expiry notification scheduler, invoice/PDF printing, barcode camera scanning, daily/monthly report queries, offline conflict strategy, backup/restore, App Check, audit review, data retention, privacy controls and disaster recovery. Enforce all critical sales/stock changes on trusted server functions. Conduct security-rule emulator tests and load tests for the expected concurrency. Confirm Bangladesh tax, drug licensing and applicable data-protection requirements with qualified professionals.


## Firebase project configuration
The supplied `google-services.json` has been added at `app/google-services.json` and matches Android package `com.tanvirpharma.app` / Firebase project `tanvirpharma-493eb`.

Before a real deployment:
1. In Firebase Console, enable Authentication > Email/Password.
2. Create the Cloud Firestore database in an appropriate region.
3. Review and deploy `firestore.rules` and `firestore.indexes.json`.
4. Deploy Cloud Functions from `functions/` after installing Node.js dependencies and configuring Firebase CLI.
5. Enable App Check and configure its Android provider before deploying callable functions that enforce App Check.
6. Create staff accounts and provision user profiles through a trusted Admin SDK process. Never let public clients assign themselves admin roles.

The current Android UI is still a starter/demo: CloudRepository provides Firebase Auth/Firestore access foundations but the existing screens are not yet fully connected to cloud data. Do not use it for live company operations until integration, security-rule tests, backup/restore tests, and multi-user load tests are complete.
