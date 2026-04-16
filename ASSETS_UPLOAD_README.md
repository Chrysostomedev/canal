# Bug 404 — Pièces jointes inaccessibles

## Problème

Les URLs des pièces jointes retournées par l'API renvoient **404** côté frontend.

Exemple d'URL reçue dans la réponse API :
```
https://hack.facility-management-service.com/storage/report_attachments/abc123.jpg
```

→ Cette URL retourne **404**.

## Cause

Le lien symbolique `public/storage → storage/app/public` n'est pas créé sur le serveur.  
Sans lui, le dossier `public/storage/` n'existe pas et toutes les URLs `/storage/...` sont introuvables.

## Fix backend (1 commande)

```bash
php artisan storage:link
```

---

## Ce que le front reçoit actuellement (et ce qu'il devrait recevoir)

### Rapport d'intervention — `attachments[]`

**Actuellement reçu :**
```json
{
  "id": 1,
  "file_path": "report_attachments/abc123.jpg",
  "file_type": "photo",
  "url": "https://hack.facility-management-service.com/storage/report_attachments/abc123.jpg"
}
```

**Comportement attendu après fix :**  
Le champ `url` est déjà correct — il suffit que le symlink existe pour que l'URL soit accessible.  
Le front utilise directement `att.url` sans rien reconstruire.

---

### Ticket — `attachments[]`

```json
{
  "id": 1,
  "path": "tickets_attachments/xyz.pdf",
  "file_type": "document",
  "url": "https://hack.facility-management-service.com/storage/tickets_attachments/xyz.pdf"
}
```

⚠️ Champ stocké : **`path`** (pas `file_path` comme pour les rapports).

---

### Facture — `url` (PDF principal)

```json
{
  "id": 1,
  "pdf_path": "invoices/INV-001.pdf",
  "url": "https://hack.facility-management-service.com/storage/invoices/INV-001.pdf"
}
```

Le champ `url` est un accessor Laravel (`$appends = ['url']`) — toujours présent dans la réponse.

---

### Patrimoine — `images[]`

```json
{
  "id": 1,
  "path": "company_assets_images/img001.jpg",
  "url": "https://hack.facility-management-service.com/storage/company_assets_images/img001.jpg"
}
```

---

### Profil utilisateur — `url`

```json
{
  "id": 1,
  "profile_picture_path": "profile_pictures/admin_001.jpg",
  "url": "https://hack.facility-management-service.com/storage/profile_pictures/admin_001.jpg"
}
```

---

## Résumé

| Modèle | Champ path | Champ URL | Accessible ? |
|--------|-----------|-----------|--------------|
| ReportAttachment | `file_path` | `url` ✅ | ❌ 404 (symlink manquant) |
| TicketAttachment | `path` | `url` ✅ | ❌ 404 (symlink manquant) |
| InvoiceAttachment | `file_path` | `url` ✅ | ❌ 404 (symlink manquant) |
| CompanyAssetImage | `path` | `url` ✅ | ❌ 404 (symlink manquant) |
| Invoice (PDF) | `pdf_path` | `url` ✅ | ❌ 404 (symlink manquant) |
| Profil | `profile_picture_path` | `url` ✅ | ❌ 404 (symlink manquant) |

**Tous les champs `url` sont déjà bien formés côté back.  
Le seul problème est l'absence du symlink. Une seule commande règle tout.**
