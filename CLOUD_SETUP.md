# Cloud deployment checklist for 100+ staff

## Recommended architecture
- Android client: Kotlin + Jetpack Compose.
- Identity: Firebase Authentication (individual accounts; no shared staff login).
- Data: Cloud Firestore, scoped by branch and role.
- Trusted business operations: Cloud Functions (sales, stock adjustment, user provisioning, audit events).
- Security: Firestore rules, App Check, least-privilege roles, admin-created accounts.
- Operations: monitoring, scheduled backups/export, alerting, staged releases and tested restore procedure.

## Role matrix (initial proposal)
| Role | Medicine / stock | Sales | Customers | Reports | Staff & settings |
|---|---|---|---|---|---|
| super_admin | all branches | all | all | all | all |
| admin | assigned branches | assigned branches | assigned branches | assigned branches | staff in assigned scope |
| manager | assigned branches | view/manage | view/manage | branch reports | no role escalation |
| sales | read catalogue | create sales | create/read | own/branch as approved | none |
| warehouse | receive/adjust stock | read | none | stock reports | none |
| accountant | read | read | limited | financial reports | none |
| viewer | read-only approved data | read-only | read-only | approved | none |

The sample Firestore rules are deliberately conservative and do not yet implement every row above. Add and test each permission explicitly before rollout.

## Scale and safety notes
100+ registered users is a normal cloud-app use case, but capacity depends on concurrent usage, query patterns, data size, region, security rules, indexes, and billing limits. Use pagination, branch filters, bounded listeners, server-side aggregation and load tests. Do not stream an entire company-wide collection to every phone.

## First admin bootstrap
Create the first user in Firebase Authentication, then use a trusted Admin SDK script or secured server-side admin tool to create `users/{uid}`. Do not make public client-side role assignment possible. Keep service-account credentials off Android devices and out of source control.
