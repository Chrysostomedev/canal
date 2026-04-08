# 🌍 Internationalisation Next.js — Guide complet next-intl

> **Pour Kiro** : Ce document décrit exactement tous les fichiers à générer, leur emplacement, leur contenu complet et les commandes à exécuter pour mettre en place l'i18n dans un projet Next.js App Router avec 4 langues : **Français (défaut)**, **Anglais**, **Espagnol**, **Japonais**.

---

## 📋 Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Commandes à exécuter](#2-commandes-à-exécuter)
3. [Structure complète des fichiers à créer](#3-structure-complète-des-fichiers-à-créer)
4. [Fichiers de configuration](#4-fichiers-de-configuration)
5. [Dossier messages/ — fichiers JSON](#5-dossier-messages--fichiers-json)
6. [Dossier i18n/](#6-dossier-i18n)
7. [Middleware](#7-middleware)
8. [App Router — app/\[locale\]/](#8-app-router--applocale)
9. [Composants utilitaires](#9-composants-utilitaires)
10. [Règles et conventions](#10-règles-et-conventions)
11. [Résumé des URLs générées](#11-résumé-des-urls-générées)

---

## 1. Vue d'ensemble

### Stack technique
- **Framework** : Next.js 14+ avec App Router
- **Librairie i18n** : `next-intl` (version 3.x)
- **Langues** : `fr` (défaut), `en`, `es`, `ja`
- **Stratégie de routing** : préfixe dans l'URL (`/fr/...`, `/en/...`, `/es/...`, `/ja/...`)
- **Détection automatique** : via l'en-tête HTTP `Accept-Language` du navigateur

### Fonctionnement global

```
Utilisateur → /                     → middleware détecte la langue → redirige vers /fr (défaut)
Utilisateur → /en/about             → page About en anglais
Utilisateur → /ja/contact           → page Contact en japonais
Navigateur francophone → /          → redirige vers /fr/
Navigateur anglophone  → /          → redirige vers /en/
```

---

## 2. Commandes à exécuter

### Étape 1 — Installer la dépendance

```bash
npm install next-intl
```

> ⚠️ Ne pas installer `i18next`, `react-i18next` ou `next-i18next` — ce sont des librairies différentes. Utiliser uniquement `next-intl`.

### Vérification de la version installée

```bash
npm list next-intl
```

La version doit être `^3.0.0` ou supérieure.

---

## 3. Structure complète des fichiers à créer

Voici la liste exhaustive de **tous les fichiers** à créer ou modifier :

```
your-project/
│
├── messages/                          ← CRÉER ce dossier
│   ├── fr.json                        ← CRÉER (langue par défaut)
│   ├── en.json                        ← CRÉER
│   ├── es.json                        ← CRÉER
│   └── ja.json                        ← CRÉER
│
├── i18n/                              ← CRÉER ce dossier
│   ├── routing.ts                     ← CRÉER
│   └── request.ts                     ← CRÉER
│
├── app/
│   └── [locale]/                      ← CRÉER ce dossier (renommer app/ existant)
│       ├── layout.tsx                 ← MODIFIER (déplacer depuis app/layout.tsx)
│       ├── page.tsx                   ← MODIFIER (déplacer depuis app/page.tsx)
│       └── not-found.tsx              ← CRÉER (optionnel mais recommandé)
│
├── components/
│   └── LocaleSwitcher.tsx             ← CRÉER (sélecteur de langue)
│
├── middleware.ts                      ← CRÉER à la racine du projet
└── next.config.ts                     ← MODIFIER (fichier existant)
```

---

## 4. Fichiers de configuration

### 4.1 `next.config.ts` — MODIFIER

**Emplacement** : `./next.config.ts` (racine du projet)

**Action** : Envelopper la config existante avec `createNextIntlPlugin`.

```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  // Chemin vers le fichier de configuration des requêtes (optionnel, c'est la valeur par défaut)
  './i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Garder ici toute la configuration Next.js existante du projet
};

export default withNextIntl(nextConfig);
```

> ℹ️ Si le projet utilise `next.config.js` (sans TypeScript), remplacer les imports ES modules par des `require()` et `module.exports`.

---

## 5. Dossier `messages/` — fichiers JSON

**Emplacement** : `./messages/` (à la racine du projet, au même niveau que `app/`)

Chaque fichier JSON représente les traductions d'une langue. La structure doit être **identique** dans tous les fichiers — seules les valeurs changent.

### Convention de nommage des clés
- Les clés sont en **camelCase**
- Elles sont regroupées par **namespace** (ex: `nav`, `home`, `common`, `errors`)
- Ne jamais utiliser de points dans les clés (utiliser l'imbrication JSON à la place)

---

### 5.1 `messages/fr.json` — CRÉER

```json
{
  "common": {
    "loading": "Chargement...",
    "error": "Une erreur est survenue",
    "retry": "Réessayer",
    "close": "Fermer",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "confirm": "Confirmer",
    "back": "Retour",
    "next": "Suivant",
    "previous": "Précédent"
  },
  "nav": {
    "home": "Accueil",
    "about": "À propos",
    "contact": "Contact",
    "blog": "Blog",
    "services": "Services"
  },
  "home": {
    "title": "Bienvenue sur notre site",
    "subtitle": "Découvrez nos services",
    "description": "Nous proposons des solutions adaptées à vos besoins.",
    "ctaPrimary": "Commencer",
    "ctaSecondary": "En savoir plus"
  },
  "about": {
    "title": "À propos de nous",
    "description": "Notre histoire et notre mission.",
    "mission": "Notre mission est de fournir la meilleure expérience possible."
  },
  "contact": {
    "title": "Contactez-nous",
    "name": "Nom",
    "email": "Adresse email",
    "message": "Message",
    "send": "Envoyer le message",
    "successMessage": "Votre message a bien été envoyé. Nous vous répondrons sous 48h.",
    "errorMessage": "Impossible d'envoyer le message. Veuillez réessayer."
  },
  "errors": {
    "notFound": "Page introuvable",
    "notFoundDescription": "La page que vous recherchez n'existe pas.",
    "serverError": "Erreur serveur",
    "serverErrorDescription": "Une erreur inattendue s'est produite."
  },
  "meta": {
    "siteName": "Mon Site",
    "defaultTitle": "Mon Site — Solutions professionnelles",
    "defaultDescription": "Découvrez nos solutions adaptées à vos besoins."
  }
}
```

---

### 5.2 `messages/en.json` — CRÉER

```json
{
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Retry",
    "close": "Close",
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "back": "Back",
    "next": "Next",
    "previous": "Previous"
  },
  "nav": {
    "home": "Home",
    "about": "About",
    "contact": "Contact",
    "blog": "Blog",
    "services": "Services"
  },
  "home": {
    "title": "Welcome to our website",
    "subtitle": "Discover our services",
    "description": "We offer solutions tailored to your needs.",
    "ctaPrimary": "Get started",
    "ctaSecondary": "Learn more"
  },
  "about": {
    "title": "About us",
    "description": "Our story and our mission.",
    "mission": "Our mission is to provide the best possible experience."
  },
  "contact": {
    "title": "Contact us",
    "name": "Name",
    "email": "Email address",
    "message": "Message",
    "send": "Send message",
    "successMessage": "Your message has been sent. We will get back to you within 48 hours.",
    "errorMessage": "Unable to send the message. Please try again."
  },
  "errors": {
    "notFound": "Page not found",
    "notFoundDescription": "The page you are looking for does not exist.",
    "serverError": "Server error",
    "serverErrorDescription": "An unexpected error occurred."
  },
  "meta": {
    "siteName": "My Site",
    "defaultTitle": "My Site — Professional Solutions",
    "defaultDescription": "Discover our solutions tailored to your needs."
  }
}
```

---

### 5.3 `messages/es.json` — CRÉER

```json
{
  "common": {
    "loading": "Cargando...",
    "error": "Se produjo un error",
    "retry": "Reintentar",
    "close": "Cerrar",
    "save": "Guardar",
    "cancel": "Cancelar",
    "confirm": "Confirmar",
    "back": "Volver",
    "next": "Siguiente",
    "previous": "Anterior"
  },
  "nav": {
    "home": "Inicio",
    "about": "Acerca de",
    "contact": "Contacto",
    "blog": "Blog",
    "services": "Servicios"
  },
  "home": {
    "title": "Bienvenido a nuestro sitio",
    "subtitle": "Descubre nuestros servicios",
    "description": "Ofrecemos soluciones adaptadas a tus necesidades.",
    "ctaPrimary": "Empezar",
    "ctaSecondary": "Saber más"
  },
  "about": {
    "title": "Sobre nosotros",
    "description": "Nuestra historia y misión.",
    "mission": "Nuestra misión es ofrecer la mejor experiencia posible."
  },
  "contact": {
    "title": "Contáctanos",
    "name": "Nombre",
    "email": "Correo electrónico",
    "message": "Mensaje",
    "send": "Enviar mensaje",
    "successMessage": "Tu mensaje ha sido enviado. Te responderemos en 48 horas.",
    "errorMessage": "No se pudo enviar el mensaje. Por favor, inténtalo de nuevo."
  },
  "errors": {
    "notFound": "Página no encontrada",
    "notFoundDescription": "La página que buscas no existe.",
    "serverError": "Error del servidor",
    "serverErrorDescription": "Se produjo un error inesperado."
  },
  "meta": {
    "siteName": "Mi Sitio",
    "defaultTitle": "Mi Sitio — Soluciones profesionales",
    "defaultDescription": "Descubre nuestras soluciones adaptadas a tus necesidades."
  }
}
```

---

### 5.4 `messages/ja.json` — CRÉER

```json
{
  "common": {
    "loading": "読み込み中...",
    "error": "エラーが発生しました",
    "retry": "再試行",
    "close": "閉じる",
    "save": "保存",
    "cancel": "キャンセル",
    "confirm": "確認",
    "back": "戻る",
    "next": "次へ",
    "previous": "前へ"
  },
  "nav": {
    "home": "ホーム",
    "about": "について",
    "contact": "お問い合わせ",
    "blog": "ブログ",
    "services": "サービス"
  },
  "home": {
    "title": "ようこそ",
    "subtitle": "私たちのサービスをご覧ください",
    "description": "お客様のニーズに合わせたソリューションを提供しています。",
    "ctaPrimary": "始める",
    "ctaSecondary": "詳細はこちら"
  },
  "about": {
    "title": "私たちについて",
    "description": "私たちのストーリーとミッション。",
    "mission": "最高の体験を提供することが私たちのミッションです。"
  },
  "contact": {
    "title": "お問い合わせ",
    "name": "お名前",
    "email": "メールアドレス",
    "message": "メッセージ",
    "send": "送信する",
    "successMessage": "メッセージが送信されました。48時間以内にご返信いたします。",
    "errorMessage": "メッセージを送信できませんでした。もう一度お試しください。"
  },
  "errors": {
    "notFound": "ページが見つかりません",
    "notFoundDescription": "お探しのページは存在しません。",
    "serverError": "サーバーエラー",
    "serverErrorDescription": "予期しないエラーが発生しました。"
  },
  "meta": {
    "siteName": "マイサイト",
    "defaultTitle": "マイサイト — プロフェッショナルソリューション",
    "defaultDescription": "お客様のニーズに合わせたソリューションをご覧ください。"
  }
}
```

---

## 6. Dossier `i18n/`

### 6.1 `i18n/routing.ts` — CRÉER

**Emplacement** : `./i18n/routing.ts`

Ce fichier est **le centre de configuration** de l'i18n. Il définit les langues disponibles et la langue par défaut.

```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Liste de toutes les langues supportées
  // L'ordre n'est pas important pour le fonctionnement,
  // mais 'fr' doit être la defaultLocale
  locales: ['fr', 'en', 'es', 'ja'],

  // Langue utilisée par défaut si aucune préférence détectée
  // ou si la langue du navigateur n'est pas dans la liste
  defaultLocale: 'fr',

  // Optionnel : désactiver le préfixe pour la langue par défaut
  // Si true, /fr/... devient /... pour le français uniquement
  // Recommandé de laisser à false pour la cohérence des URLs
  // localePrefix: 'as-needed'
});
```

> ⚠️ Ce fichier est importé à la fois par `middleware.ts` et par `app/[locale]/layout.tsx`. Ne pas le supprimer ni le déplacer.

---

### 6.2 `i18n/request.ts` — CRÉER

**Emplacement** : `./i18n/request.ts`

Ce fichier configure comment les messages sont chargés côté serveur à chaque requête.

```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Récupérer la locale depuis la requête
  let locale = await requestLocale;

  // Vérifier que la locale est valide
  // Si elle n'est pas dans notre liste, utiliser la locale par défaut
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // Charger dynamiquement le fichier JSON correspondant à la locale
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
```

---

## 7. Middleware

### 7.1 `middleware.ts` — CRÉER

**Emplacement** : `./middleware.ts` (strictement à la racine du projet, pas dans `app/` ni `src/`)

```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Le matcher définit les routes interceptées par le middleware
  // Cette regexp exclut :
  //   - /api/...       → routes API Next.js
  //   - /_next/...     → fichiers internes Next.js
  //   - /_vercel/...   → fichiers internes Vercel
  //   - /.*\..*        → fichiers statiques (images, fonts, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

**Ce que fait le middleware automatiquement :**
1. Lit l'en-tête `Accept-Language` du navigateur
2. Redirige `/` vers `/fr` si le navigateur est en français
3. Redirige `/` vers `/en` si le navigateur est en anglais
4. Redirige `/` vers `/es` si le navigateur est en espagnol
5. Redirige `/` vers `/ja` si le navigateur est en japonais
6. Redirige vers `/fr` par défaut si la langue n'est pas reconnue

---

## 8. App Router — `app/[locale]/`

### 8.1 `app/[locale]/layout.tsx` — CRÉER / MODIFIER

**Emplacement** : `./app/[locale]/layout.tsx`

> ⚠️ Si un fichier `app/layout.tsx` existe déjà, son contenu doit être **déplacé** ici (pas copié). L'ancien `app/layout.tsx` doit être **supprimé**.

```tsx
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

// Typage des props reçus par le layout
interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// Génération des métadonnées dynamiques selon la langue
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('defaultTitle'),
    description: t('defaultDescription'),
  };
}

// Pré-génération des routes statiques pour chaque locale
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Vérifier que la locale dans l'URL est valide
  // Si elle ne l'est pas, afficher la page 404 de Next.js
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Charger tous les messages côté serveur
  // pour les transmettre au client via NextIntlClientProvider
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

---

### 8.2 `app/[locale]/page.tsx` — CRÉER / MODIFIER

**Emplacement** : `./app/[locale]/page.tsx`

> ⚠️ Si un fichier `app/page.tsx` existe, déplacer son contenu ici et supprimer l'original.

```tsx
import { useTranslations } from 'next-intl';

// Composant Server Component (par défaut dans App Router)
// useTranslations fonctionne aussi bien côté serveur que client
export default function HomePage() {
  const t = useTranslations('home');
  const tNav = useTranslations('nav');

  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <p>{t('description')}</p>

      <div>
        <a href="#">{t('ctaPrimary')}</a>
        <a href="#">{t('ctaSecondary')}</a>
      </div>
    </main>
  );
}
```

---

### 8.3 `app/[locale]/not-found.tsx` — CRÉER (recommandé)

**Emplacement** : `./app/[locale]/not-found.tsx`

```tsx
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('errors');

  return (
    <div>
      <h1>{t('notFound')}</h1>
      <p>{t('notFoundDescription')}</p>
      <a href="/">{}</a>
    </div>
  );
}
```

---

## 9. Composants utilitaires

### 9.1 `components/LocaleSwitcher.tsx` — CRÉER

**Emplacement** : `./components/LocaleSwitcher.tsx`

Ce composant permet à l'utilisateur de changer de langue. Il conserve la page courante lors du changement.

```tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { routing } from '@/i18n/routing';

// Noms affichés pour chaque langue dans le sélecteur
const localeNames: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  ja: '日本語',
};

// Drapeaux emoji optionnels
const localeFlags: Record<string, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  ja: '🇯🇵',
};

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;

    // Remplacer le préfixe de locale dans le pathname courant
    // ex: /fr/about → /en/about
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    const nextPath = segments.join('/');

    router.push(nextPath);
  }

  return (
    <select
      value={locale}
      onChange={handleChange}
      aria-label="Choisir la langue"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeFlags[loc]} {localeNames[loc]}
        </option>
      ))}
    </select>
  );
}
```

---

### 9.2 Utilisation de `useTranslations` dans un Client Component

Pour les composants avec `'use client'` :

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function ContactForm() {
  const t = useTranslations('contact');

  return (
    <form>
      <label>{t('name')}</label>
      <input type="text" placeholder={t('name')} />

      <label>{t('email')}</label>
      <input type="email" placeholder={t('email')} />

      <label>{t('message')}</label>
      <textarea placeholder={t('message')} />

      <button type="submit">{t('send')}</button>
    </form>
  );
}
```

---

### 9.3 Utilisation de `getTranslations` dans un Server Component

Pour les Server Components (sans `'use client'`) :

```tsx
import { getTranslations } from 'next-intl/server';

// Doit être async car getTranslations est une promesse
export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <section>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <p>{t('mission')}</p>
    </section>
  );
}
```

---

## 10. Règles et conventions

### Règle 1 — Toutes les clés doivent exister dans les 4 fichiers JSON

Chaque clé présente dans `fr.json` doit exister dans `en.json`, `es.json` et `ja.json`. Une clé manquante provoque une erreur en développement.

### Règle 2 — Ne jamais hardcoder du texte visible dans les composants

```tsx
// ❌ MAUVAIS
<h1>Bienvenue</h1>

// ✅ BON
<h1>{t('home.title')}</h1>
```

### Règle 3 — Utiliser les namespaces pour organiser les traductions

```tsx
// ✅ Spécifier le namespace dans useTranslations
const t = useTranslations('nav');
t('home') // → "Accueil" / "Home" / "Inicio" / "ホーム"

// ✅ Ou accéder à des clés imbriquées
const t = useTranslations();
t('nav.home')   // équivalent
t('home.title') // → "Bienvenue..." / "Welcome..." etc.
```

### Règle 4 — Les liens internes doivent préserver la locale

```tsx
'use client';
import { Link } from 'next-intl/navigation'; // ← utiliser next-intl, PAS next/link

// ✅ BON — ajoute automatiquement le préfixe /fr, /en, etc.
<Link href="/about">À propos</Link>

// ❌ MAUVAIS — lien sans préfixe de locale
import Link from 'next/link';
<Link href="/about">...</Link>
```

Pour `useRouter` et `usePathname` avec i18n :

```tsx
import { useRouter, usePathname } from 'next-intl/navigation'; // ← next-intl, PAS next/navigation
```

### Règle 5 — Structure du dossier `app/`

```
app/
├── [locale]/         ← TOUT le contenu de l'app est ici
│   ├── layout.tsx
│   ├── page.tsx
│   ├── about/
│   │   └── page.tsx
│   └── contact/
│       └── page.tsx
└── (pas d'autre fichier ici sauf globals.css / favicon)
```

---

## 11. Résumé des URLs générées

| Locale | Langue | URL accueil | URL À propos |
|--------|--------|-------------|--------------|
| `fr` (défaut) | Français 🇫🇷 | `/fr` ou `/` | `/fr/about` |
| `en` | Anglais 🇬🇧 | `/en` | `/en/about` |
| `es` | Espagnol 🇪🇸 | `/es` | `/es/about` |
| `ja` | Japonais 🇯🇵 | `/ja` | `/ja/about` |

### Comportement de la redirection automatique

| Navigateur configuré en | Accès à `/` | Résultat |
|------------------------|-------------|----------|
| Français | `/` | → redirige vers `/fr` |
| Anglais | `/` | → redirige vers `/en` |
| Espagnol | `/` | → redirige vers `/es` |
| Japonais | `/` | → redirige vers `/ja` |
| Autre (ex: portugais) | `/` | → redirige vers `/fr` (défaut) |

---

## ✅ Checklist finale pour Kiro

- [ ] `npm install next-intl` exécuté
- [ ] `messages/fr.json` créé
- [ ] `messages/en.json` créé
- [ ] `messages/es.json` créé
- [ ] `messages/ja.json` créé
- [ ] `i18n/routing.ts` créé
- [ ] `i18n/request.ts` créé
- [ ] `middleware.ts` créé à la racine
- [ ] `next.config.ts` modifié avec `withNextIntl`
- [ ] Dossier `app/[locale]/` créé
- [ ] `app/[locale]/layout.tsx` créé (contenu de l'ancien `app/layout.tsx`)
- [ ] `app/[locale]/page.tsx` créé (contenu de l'ancien `app/page.tsx`)
- [ ] `app/layout.tsx` et `app/page.tsx` originaux supprimés
- [ ] `components/LocaleSwitcher.tsx` créé

---

*Généré pour le projet Next.js i18n — next-intl v3 — App Router*