# Guide de Test - Authentification

## 🧪 Tests Manuels dans le Navigateur

### 1. Ouvrir la Console du Navigateur

```
F12 ou Ctrl+Shift+I (Windows)
Cmd+Option+I (Mac)
```

### 2. Importer le Service

```javascript
// Le service est déjà disponible globalement via les imports
// Vous pouvez l'utiliser directement dans la console
```

### 3. Tests de Base

#### Test 1 : Vérifier la Configuration

```javascript
// Vérifier l'URL de l'API
console.log(process.env.NEXT_PUBLIC_API_URL);
// Devrait afficher : http://150.107.201.90:8001/api/V1

// Vérifier l'état d'authentification
console.log("Authentifié ?", localStorage.getItem("auth_token") !== null);
console.log("Rôle :", localStorage.getItem("user_role"));
console.log("Email :", localStorage.getItem("user_email"));
```

#### Test 2 : Test de Connexion (depuis /login)

```javascript
// Ouvrir la page /login dans le navigateur
// Puis dans la console :

// Simuler une connexion
const testLogin = async () => {
  try {
    const response = await fetch('http://150.107.201.90:8001/api/V1/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@canal.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log('Réponse login:', data);
    
    if (data.data?.otp_required) {
      console.log('✅ OTP requis - Email:', data.data.email);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

testLogin();
```

#### Test 3 : Test de Vérification OTP

```javascript
// Après avoir reçu l'OTP par email
const testVerifyOtp = async (email, code) => {
  try {
    const response = await fetch('http://150.107.201.90:8001/api/V1/admin/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        code: code
      })
    });
    
    const data = await response.json();
    console.log('Réponse OTP:', data);
    
    if (data.data?.token) {
      console.log('✅ Token reçu:', data.data.token);
      console.log('✅ Rôle:', data.data.user.role);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

// Utilisation
testVerifyOtp('admin@canal.com', '123456');
```

#### Test 4 : Test Mot de Passe Oublié

```javascript
const testForgotPassword = async (email) => {
  try {
    const response = await fetch('http://150.107.201.90:8001/api/V1/admin/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    console.log('Réponse forgot-password:', data);
    
    if (data.success) {
      console.log('✅ Email de récupération envoyé');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

testForgotPassword('admin@canal.com');
```

#### Test 5 : Test Réinitialisation Mot de Passe

```javascript
const testResetPassword = async (email, code, password) => {
  try {
    const response = await fetch('http://150.107.201.90:8001/api/V1/admin/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        code,
        password,
        password_confirmation: password
      })
    });
    
    const data = await response.json();
    console.log('Réponse reset-password:', data);
    
    if (data.success) {
      console.log('✅ Mot de passe réinitialisé');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

testResetPassword('admin@canal.com', '123456', 'newpassword123');
```

### 4. Tests du LocalStorage

```javascript
// Vérifier toutes les données stockées
const checkStorage = () => {
  console.log('=== État du LocalStorage ===');
  console.log('Token:', localStorage.getItem('auth_token'));
  console.log('Rôle:', localStorage.getItem('user_role'));
  console.log('Email:', localStorage.getItem('user_email'));
  console.log('User ID:', localStorage.getItem('user_id'));
  console.log('Prénom:', localStorage.getItem('first_name'));
  console.log('Nom:', localStorage.getItem('last_name'));
  console.log('Email Pending:', localStorage.getItem('pending_otp_email'));
};

checkStorage();
```

```javascript
// Nettoyer le localStorage
const clearStorage = () => {
  localStorage.clear();
  console.log('✅ LocalStorage nettoyé');
};

clearStorage();
```

## 🔍 Debugging des Erreurs Courantes

### Erreur 1 : CORS

```
Access to fetch at 'http://150.107.201.90:8001/api/V1/admin/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution** : Vérifier la configuration CORS dans Laravel (`config/cors.php`)

```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000', 'http://localhost:3001'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### Erreur 2 : 401 Unauthorized

```json
{
  "success": false,
  "message": "Email ou mot de passe incorrect"
}
```

**Vérifications** :
1. Email existe dans la base de données ?
2. Mot de passe correct ?
3. Compte actif ?

### Erreur 3 : 429 Too Many Requests

```json
{
  "success": false,
  "message": "Trop de tentatives. Compte temporairement bloqué."
}
```

**Solution** : Attendre quelques minutes ou vérifier le rate limiting Laravel

### Erreur 4 : Token Expiré

```json
{
  "message": "Unauthenticated."
}
```

**Solution** : Se reconnecter pour obtenir un nouveau token

## 📊 Scénarios de Test Complets

### Scénario 1 : Connexion Complète (ADMIN)

```javascript
// Étape 1 : Login
const email = 'admin@canal.com';
const password = 'password123';

// Étape 2 : Attendre l'OTP par email (ex: 123456)
const code = '123456';

// Étape 3 : Vérifier dans la console
console.log('1. Tentative de connexion...');
// Utiliser le formulaire de login

console.log('2. Vérification OTP...');
// Utiliser le formulaire OTP

console.log('3. Vérifier la redirection');
// Devrait rediriger vers /admin/dashboard

console.log('4. Vérifier le localStorage');
checkStorage();
// Devrait afficher le token et role: "ADMIN"
```

### Scénario 2 : Connexion Complète (MANAGER)

```javascript
const email = 'manager@canal.com';
const password = 'password123';

// Après OTP, devrait rediriger vers /manager/dashboard
```

### Scénario 3 : Connexion Complète (PROVIDER)

```javascript
const email = 'provider@canal.com';
const password = 'password123';

// Après OTP, devrait rediriger vers /provider/dashboard
```

### Scénario 4 : Mot de Passe Oublié Complet

```javascript
// Étape 1 : Demander la réinitialisation
const email = 'admin@canal.com';
// Utiliser le formulaire /login/password

// Étape 2 : Recevoir l'OTP par email
const code = '123456';

// Étape 3 : Définir nouveau mot de passe
const newPassword = 'newpassword123';

// Étape 4 : Se reconnecter avec le nouveau mot de passe
```

## 🎯 Checklist de Test

### Tests Fonctionnels

- [ ] Login avec SUPER-ADMIN → Redirige vers /admin/dashboard
- [ ] Login avec ADMIN → Redirige vers /admin/dashboard
- [ ] Login avec MANAGER → Redirige vers /manager/dashboard
- [ ] Login avec PROVIDER → Redirige vers /provider/dashboard
- [ ] OTP invalide → Affiche erreur
- [ ] OTP expiré → Affiche erreur
- [ ] Trop de tentatives → Affiche erreur 429
- [ ] Mot de passe oublié → Envoie OTP
- [ ] Réinitialisation mot de passe → Succès
- [ ] Logout → Nettoie le localStorage et redirige vers /login

### Tests de Sécurité

- [ ] Token stocké dans localStorage
- [ ] Token envoyé dans header Authorization
- [ ] Redirection si non authentifié
- [ ] Redirection si rôle non autorisé
- [ ] Nettoyage du localStorage au logout

### Tests d'Interface

- [ ] Formulaire de login responsive
- [ ] Formulaire OTP responsive
- [ ] Messages d'erreur clairs
- [ ] Loading states visibles
- [ ] Transitions fluides

## 🛠️ Outils de Debug

### 1. Network Tab (Onglet Réseau)

```
F12 → Network → Filter: Fetch/XHR
```

Vérifier :
- Status codes (200, 401, 429, etc.)
- Request payload
- Response data
- Headers (Authorization)

### 2. Application Tab (Onglet Application)

```
F12 → Application → Local Storage
```

Vérifier :
- auth_token
- user_role
- user_email
- pending_otp_email

### 3. Console Tab (Onglet Console)

```
F12 → Console
```

Vérifier :
- Erreurs JavaScript
- Logs de l'application
- Erreurs réseau

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifier les logs du backend Laravel
2. Vérifier la console du navigateur
3. Vérifier le Network tab
4. Vérifier le localStorage
5. Tester les endpoints avec curl/Postman
6. Vérifier la configuration CORS
7. Vérifier les variables d'environnement (.env.local)
