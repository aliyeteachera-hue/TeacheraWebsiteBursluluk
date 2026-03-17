# Legacy Root API Mirror

Bu klasör production canonical runtime kaynağı değildir.

- Canonical endpoint kaynakları: `apps/exam-api/api`, `apps/panel-api/api`, `apps/ops-api/api`
- Canonical shared backend kaynakları: `packages/shared/backend`

Bu klasör local compatibility ve tek-host debug amaçlı mirror olarak tutulur.

Manuel düzenleme yapmayın:

```bash
npm run sync:legacy-runtime
npm run sync:shared-backend
```

Doğrulama:

```bash
npm run check:legacy-runtime-sync
npm run check:shared-backend-sync
```
