# CANAL+ Facility Management — Frontend

Application **Next.js 15** de gestion multi-rôles pour le Facility Management CANAL+.
Elle consomme l'API Laravel déployée à `http://150.107.201.90:8015/api/v1`.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Animations | Framer Motion 12 |
| Icônes | Lucide React |
| HTTP | Axios 1.x |
| Export | XLSX (SheetJS) |
| Typage | TypeScript 5 |
| Lint | ESLint 9 + eslint-config-next |

---

## Démarrage rapide

```bash
npm install
npm run dev       # http://localhost:3000
npm run build
npm start
```

Variable d'environnement requise dans `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://150.107.201.90:8015/api/v1
```

---

## Architecture générale

```
front_canal/
├── app/                    # Next.js App Router
│   ├── login/              # Auth (login, OTP, reset password)
│   ├── admin/              # Zone ADMIN / SUPER-ADMIN (19 modules)
│   ├── manager/            # Zone MANAGER (13 modules)
│   ├── provider/           # Zone PROVIDER (10 modules)
│   └── components/         # ~40 composants réutilisables
├── services/               # Couche API (1 fichier par ressource)
│   ├── AuthService.ts
│   ├── admin/
│   ├── manager/
│   └── provider/
├── hooks/                  # Custom hooks React (data fetching + state)
│   ├── admin/
│   ├── manager/
│   ├── provider/
│   └── common/
├── core/
│   └── axios.ts            # Instance Axios + intercepteurs
└── contexts/
    └── ThemeContext.tsx     # Thème global (dark/light)
```

---

## Authentification & Sécurité

### Flux OTP (2FA)

```
POST /admin/login  →  OTP envoyé par mail
        ↓
POST /admin/verify-otp  →  { user, token }
        ↓
Redirection par rôle :
  SUPER-ADMIN / ADMIN  →  /admin/dashboard
  MANAGER              →  /manager/dashboard
  PROVIDER             →  /provider/dashboard
```

### Flux reset password

```
POST /admin/forgot-password  →  OTP de reset envoyé
        ↓
POST /admin/reset-password   →  { email, code, password, password_confirmation }
```

### Session (localStorage)

| Clé | Contenu |
|---|---|
| `auth_token` | Bearer token Sanctum |
| `user_role` | SUPER-ADMIN / ADMIN / MANAGER / PROVIDER |
| `user_email` | Email de l'utilisateur |
| `user_id` | ID numérique |
| `first_name` / `last_name` | Prénom / Nom |
| `pending_otp_email` | Email temporaire pendant le flux OTP |
| `pending_otp_flow` | `"login"` ou `"reset"` |

### Intercepteurs Axios (`core/axios.ts`)

- Request : injecte `Authorization: Bearer {token}` depuis localStorage
- Response : sur 401 → purge localStorage + redirect `/login`

### `authService` — méthodes exposées

```typescript
authService.login({ email, password })
authService.verifyOtp(email, code)
authService.forgotPassword(email)
authService.resetPassword({ email, code, password, password_confirmation })
authService.logout()
authService.isAuthenticated()
authService.hasRole(['ADMIN', 'SUPER-ADMIN'])
authService.getToken() / getRole() / getEmail() / getFirstName() / getLastName()
authService.getPendingEmail() / getPendingFlow()
getDashboardRoute(role)  // helper de routing
```

---

## Rôles & Permissions

| Rôle | Accès |
|---|---|
| SUPER-ADMIN | Tout + audit trail complet + gestion des admins |
| ADMIN | Gestion opérationnelle complète (sans gestion des admins) |
| MANAGER | Son site uniquement — tickets, patrimoine, devis, rapports |
| PROVIDER | Ses missions — tickets assignés, devis, rapports, factures |

---

## Modules par rôle

### Zone `/admin` (ADMIN + SUPER-ADMIN)

| Route | Module | Logique métier |
|---|---|---|
| `/admin/dashboard` | Tableau de bord | Stats globales + stats administration |
| `/admin/sites` | Sites | CRUD sites, import/export CSV |
| `/admin/patrimoines` | Patrimoine (assets) | CRUD assets, codification, criticité, amortissement, images, stats |
| `/admin/tickets` | Tickets | Cycle de vie complet : créer → assigner → démarrer → soumettre rapport → valider/rejeter → noter → clôturer |
| `/admin/planning` | Planning préventif | Créer, publier, stats, rappels automatiques |
| `/admin/devis` | Devis | Approuver / rejeter / demander révision |
| `/admin/factures` | Factures | Créer, marquer payée, stats |
| `/admin/rapports` | Rapports d'intervention | Valider / rejeter rapports prestataires |
| `/admin/prestataires` | Prestataires | CRUD, activer/désactiver, stats, tickets associés |
| `/admin/gestionnaires` | Gestionnaires | CRUD managers |
| `/admin/services` | Services | Référentiel des services (CRUD) |
| `/admin/roles` | Rôles | CRUD rôles, stats, utilisateurs par rôle |
| `/admin/administration` | Admins internes | CRUD comptes admin |
| `/admin/audit` | Audit trail | Journal d'activité global + stats (SUPER-ADMIN) |
| `/admin/transfert` | Transferts inter-sites | Initier, suivre, valider transferts d'assets |
| `/admin/entretien` | Entretien | Gestion maintenance préventive |
| `/admin/notifications` | Notifications | Centre de notifications push |
| `/admin/parametres` | Paramètres | Configuration application |
| `/admin/profile` | Profil | Infos perso, avatar, mot de passe |

### Zone `/manager` (MANAGER)

| Route | Module | Logique métier |
|---|---|---|
| `/manager/dashboard` | Tableau de bord | Stats filtrées sur son site |
| `/manager/site` | Son site | Lecture + modification de son site |
| `/manager/patrimoines` | Patrimoine | Assets de son site (lecture + export) |
| `/manager/tickets` | Tickets | Créer/modifier tickets, valider/rejeter rapports, noter |
| `/manager/planning` | Planning | Lecture plannings de son site |
| `/manager/devis` | Devis | Approuver / rejeter / convertir en facture |
| `/manager/factures` | Factures | Lecture seule |
| `/manager/rapports` | Rapports | Lecture + validation rapports |
| `/manager/prestataires` | Prestataires | Lecture seule (référentiel) |
| `/manager/entretien` | Entretien | Suivi maintenance |
| `/manager/notifications` | Notifications | Centre de notifications |
| `/manager/parametres` | Paramètres | Préférences |
| `/manager/profile` | Profil | Infos perso, avatar, mot de passe |

### Zone `/provider` (PROVIDER)

| Route | Module | Logique métier |
|---|---|---|
| `/provider/dashboard` | Tableau de bord | Stats de ses missions |
| `/provider/tickets` | Tickets assignés | Démarrer intervention, soumettre rapport |
| `/provider/devis` | Devis | Créer / modifier devis, import CSV |
| `/provider/factures` | Factures | Créer facture, export |
| `/provider/rapports` | Rapports | Créer / modifier rapports d'intervention |
| `/provider/planning` | Planning | Lecture plannings assignés |
| `/provider/entretien` | Entretien | Suivi maintenance préventive |
| `/provider/notifications` | Notifications | Centre de notifications |
| `/provider/parametre` | Paramètres | Préférences |
| `/provider/profile` | Profil | Infos perso, avatar, mot de passe |

---

## Logiques métier détaillées

### Cycle de vie d'un Ticket

```
OUVERT → ASSIGNÉ → EN_COURS → RAPPORT_SOUMIS → VALIDÉ / REJETÉ → CLÔTURÉ
```

Actions API :
- `POST /ticket/{id}/assign` — Admin assigne un prestataire
- `POST /ticket/{id}/start` — Prestataire démarre l'intervention
- `POST /ticket/{id}/submit-report` — Prestataire soumet le rapport
- `POST /ticket/{id}/validate-report` — Admin/Manager valide
- `POST /ticket/{id}/reject-report` — Admin/Manager rejette
- `POST /ticket/{id}/rate` — Notation de l'intervention
- `POST /ticket/{id}/close` — Clôture définitive

Types : curatif (SLA surveillé par cron) / préventif (lié au planning)

### Cycle de vie d'un Devis (Quote)

```
BROUILLON → SOUMIS → EN_RÉVISION → APPROUVÉ → CONVERTI EN FACTURE
                   ↘ REJETÉ
```

Actions API :
- `POST /quote/{id}/approve` — Approbation
- `POST /quote/{id}/reject` — Rejet
- `POST /quote/{id}/revision` — Demande de révision
- `POST /quote/{id}/validate` — Validation manager
- `POST /quote/{id}/convert-to-invoice` — Conversion en facture

### Cycle de vie d'un Rapport d'Intervention

```
BROUILLON → SOUMIS → VALIDÉ / REJETÉ
```

Actions API :
- `POST /intervention-report/{id}/validate`
- Rejet géré via update avec statut

### Planning Préventif

- Création par l'admin avec fréquence, assets concernés, prestataire assigné
- `POST /planning/{id}/publish` — Publication et envoi de rappels
- Crons backend : `CheckPlanningStatus`, `CheckPlanningOverdue`, `CheckPlanningReminders`

### Patrimoine (Assets)

- Codification automatique (`SyncCodification` cron)
- Amortissement / dépréciation (`AlertAssetAmortization`, `SendDepreciationAlerts`)
- Criticité (critique / normal)
- Images multiples (`CompanyAssetImage`)
- Transferts inter-sites avec historique (`HistoryTransferSiteAssets`)
- Types → Sous-types (hiérarchie à 2 niveaux)

### Factures

- Créées manuellement ou via conversion d'un devis approuvé
- `POST /invoice/{id}/mark-paid` — Marquage comme payée
- Stats : montants, taux de paiement

### Notifications Push

- Toutes les actions métier déclenchent des notifications
- `GET /notifications/unread` — Badge temps réel
- `POST /notifications/{id}/read` / `POST /notifications/read-all`

### Audit Trail (SUPER-ADMIN)

- `GET /activity-log` — Journal complet de toutes les actions
- `GET /activity-log/stats` — Statistiques d'activité
- `GET /activity-log/mine` — Mes propres actions (tous rôles)

---

## Couche services & hooks

### Pattern d'architecture

```
Page (app/*/page.tsx)
  └── Hook (hooks/*/useXxx.ts)         ← state, loading, error, pagination
        └── Service (services/*/xxx.service.ts)  ← appels Axios typés
              └── core/axios.ts        ← instance + intercepteurs
```

### Services admin disponibles

| Fichier | Ressource |
|---|---|
| `asset.service.ts` | Patrimoine (CRUD, stats, import/export) |
| `site.service.ts` | Sites |
| `ticket.service.ts` | Tickets + workflow |
| `planning.service.ts` | Planning préventif |
| `quote.service.ts` | Devis + workflow |
| `invoice.service.ts` | Factures |
| `report.service.ts` | Rapports d'intervention |
| `provider.service.ts` | Prestataires |
| `manager.service.ts` | Gestionnaires |
| `roles.service.ts` | Rôles |
| `service.service.ts` | Référentiel services |
| `type-asset.service.ts` | Types d'assets |
| `sub-type-asset.service.ts` | Sous-types d'assets |
| `transfertService.ts` | Transferts inter-sites |
| `dashboard.service.ts` | Stats dashboard |

### Hooks admin disponibles

`useAssets`, `useAssetStats`, `useDashboard`, `useInvoices`, `useManagers`,
`useNotifications`, `usePlanning`, `useProviders`, `useQuotes`, `useReports`,
`useRoles`, `useServices`, `useSiteDetails`, `useSites`, `useSubTypeAssets`,
`useTickets`, `useTransferts`, `useTypes`

---

## Composants réutilisables (`app/components/`)

| Composant | Usage |
|---|---|
| `DataTable` | Tableau paginé avec tri, recherche, actions |
| `SideDetailsPanel` | Panneau latéral de détails (slide-in) |
| `ReusableForm` | Formulaire générique avec validation |
| `CalendarGrid` + `DayCell` | Grille calendrier pour le planning |
| `MiniCalendar` | Calendrier compact |
| `StatsCard` | Carte KPI |
| `BarChartCard` / `LineChartCard` / `DonutChartCard` | Graphiques dashboard |
| `Sidebar` + `Navbar` | Navigation principale |
| `NotificationPanel` + `ListNotifs` | Centre de notifications |
| `PageHeader` + `ActionHeader` | En-têtes de page standardisés |
| `SearchInput` + `Paginate` | Recherche et pagination |
| `PreviewImportModal` | Prévisualisation avant import CSV |
| `ProfileModal` + `managerProfilPanel` | Gestion profil |
| `AssetCard` / `SiteCard` / `PrestCard` / `ReportCard` / `GestCard` | Cartes métier |
| `ThemePicker` | Sélecteur de thème |
| `ForgetEmail` / `ForgetPassword` | Composants reset password |

---

## API Backend — Référence rapide

Base URL : `http://150.107.201.90:8015/api/v1`

### Auth (public)

```
POST /admin/login
POST /admin/verify-otp
POST /admin/forgot-password
POST /admin/reset-password
```

### Admin (auth:admin + role:ADMIN|SUPER-ADMIN)

```
GET|POST|PUT|DELETE  /admin/asset
GET                  /admin/asset/stats | /admin/asset/export
POST                 /admin/asset/import
POST                 /admin/asset/{id}/transfer

GET|POST|PUT|DELETE  /admin/type-asset
GET|POST|PUT|DELETE  /admin/sub-type-asset

GET|POST|PUT|DELETE  /admin/site
GET                  /admin/site/export
POST                 /admin/site/import

GET|POST|PUT|DELETE  /admin/ticket
POST                 /admin/ticket/{id}/assign
POST                 /admin/ticket/{id}/start
POST                 /admin/ticket/{id}/submit-report
POST                 /admin/ticket/{id}/validate-report
POST                 /admin/ticket/{id}/reject-report
POST                 /admin/ticket/{id}/rate
POST                 /admin/ticket/{id}/close

GET|POST|PUT|DELETE  /admin/planning
POST                 /admin/planning/{id}/publish
GET                  /admin/planning/stats

GET|POST|PUT         /admin/quote
POST                 /admin/quote/{id}/approve
POST                 /admin/quote/{id}/reject
POST                 /admin/quote/{id}/revision

GET|POST             /admin/invoice
POST                 /admin/invoice/{id}/mark-paid
GET                  /admin/invoice/stats

GET|POST|PUT|DELETE  /admin/intervention-report
POST                 /admin/intervention-report/{id}/validate

GET|POST|PUT|DELETE  /admin/providers
PUT                  /admin/providers/activate/{id}
PUT                  /admin/providers/desactivate/{id}
GET                  /admin/providers/stats

GET|POST|PUT|DELETE  /admin/admins
GET|POST|PUT|DELETE  /admin/roles
GET                  /admin/roles/stats
GET                  /admin/roles/{slug}/users

GET|POST|PUT|DELETE  /admin/service
GET|POST|PUT|DELETE  /admin/country

GET                  /admin/asset-transfers
POST                 /admin/asset-transfers/import
GET                  /admin/asset-transfers/export
PUT                  /admin/asset-transfers/{id}/status

GET                  /admin/dashboard/global
GET                  /admin/dashboard/administration

GET                  /admin/notifications
GET                  /admin/notifications/unread
POST                 /admin/notifications/{id}/read
POST                 /admin/notifications/read-all

GET                  /admin/activity-log
GET                  /admin/activity-log/stats
GET                  /admin/activity-log/mine

GET|PUT              /admin/profile
POST                 /admin/profile/avatar
PUT                  /admin/profile/password
```

### Manager (auth:admin + role:MANAGER)

```
GET                  /manager/dashboard/stats
GET|POST|PUT|DELETE  /manager/site
GET|POST|PUT|DELETE  /manager/asset
GET|POST|PUT|DELETE  /manager/ticket
POST                 /manager/ticket/{id}/validate-report
POST                 /manager/ticket/{id}/reject-report
POST                 /manager/ticket/{id}/rate
GET                  /manager/planning
GET|POST|PUT|DELETE  /manager/quote
POST                 /manager/quote/{id}/approve
POST                 /manager/quote/{id}/reject
POST                 /manager/quote/{id}/convert-to-invoice
GET                  /manager/invoice
GET|POST|PUT|DELETE  /manager/intervention-report
POST                 /manager/intervention-report/{id}/validate
GET                  /manager/notifications
GET|PUT              /manager/profile
GET                  /manager/activity-log/mine
```

### Provider (auth:sanctum + role:PROVIDER)

```
GET                  /provider/dashboard
GET                  /provider/ticket
POST                 /provider/ticket/{id}/start
POST                 /provider/ticket/{id}/submit-report
GET                  /provider/planning
GET|POST|PUT         /provider/quote
GET|POST             /provider/invoice
GET|POST|PUT         /provider/intervention-report
GET                  /provider/notifications
GET|PUT              /provider/profile
GET                  /provider/activity-log/mine
```

---

## Imports / Exports CSV

Toutes les ressources majeures supportent l'import/export CSV via SheetJS (XLSX) :

| Ressource | Import | Export |
|---|---|---|
| Assets | `POST /asset/import` | `GET /asset/export` |
| Sites | `POST /site/import` | `GET /site/export` |
| Tickets | `POST /ticket/import` | `GET /ticket/export` |
| Types | `POST /type-asset/import` | `GET /type-asset/export` |
| Sous-types | `POST /sub-type-asset/import` | `GET /sub-type-asset/export` |
| Devis | `POST /quote/import` | `GET /quote/export` |
| Transferts | `POST /asset-transfers/import` | `GET /asset-transfers/export` |
| Rapports | — | `GET /intervention-report/export` |

Des fichiers exemples sont disponibles dans `canal/examples/`.

---

## Thème

`contexts/ThemeContext.tsx` expose un contexte React pour le thème dark/light.
Le composant `ThemePicker` permet à l'utilisateur de changer le thème.
Les variables CSS sont définies dans `app/globals.css`.
