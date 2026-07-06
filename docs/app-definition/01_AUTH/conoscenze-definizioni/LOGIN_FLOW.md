> **Stato Fase 3** (2026-07-06): `verificato-gap` · Fonte: [`FASE3_REPORT_A1`](../../META/FASE3_REPORT_A1_AUTH.md) §5.5  
> **Motivo**: Remember Me UI attiva ma non collegata al login; password 12 char OK ma dual-schema; sezioni STATO ATTUALE desincronizzate.  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# LOGIN FLOW - SPECIFICA DEFINITIVA

**Data Ultima Modifica**: 2025-10-22 14:19
**Componente**: Sistema Login Completo
**Agente**: Agente 9 - Knowledge Brain Mapper
**Versione**: 2.0.0 (Aggiornamento Completo)

---

## STATO ATTUALE

### **LoginPage.tsx** (Riga 1-226)
- ✅ Titolo presente e funzionante
- ✅ Casella email funzionante
- ✅ Casella password funzionante
- ✅ Tasto visualizza password funzionante
- ✅ Link password dimenticata funzionante
- ✅ Tasto "Accedi" colorato funzionante
- ❌ **Link "Registrati ora" (riga 188-193) - DA RIMUOVERE**
- ❌ **Bottone "Torna alla Home" (riga 200-220) - DA RIMUOVERE**
- ❌ **Divider "oppure" (riga 174-182) - DA RIMUOVERE se non più necessario**
- ⚠️ **Deve importare LoginForm component invece di gestire stato interno**

### **LoginForm.tsx** (Riga 1-357)
- ✅ CSRF protection implementato
- ✅ Rate limiting implementato con countdown
- ✅ Remember me checkbox presente (ma disabled)
- ✅ Zod validation implementato
- ⚠️ **Remember me da abilitare** (rimuovere `disabled={true}` riga 320)

### **authSchemas.ts** (Riga 1-202)
- ⚠️ **Password minLength da cambiare**: 8 → 12 caratteri
- ⚠️ **Regex da aggiornare**: Richiedere lettere + numeri

---

## MODIFICHE DEFINITIVE (23 DECISIONI)

### **PRIORITY 1 - CRITICAL SECURITY**

#### **1. Password Policy (12 char + lettere + numeri)**
```typescript
// File: src/features/auth/schemas/authSchemas.ts
export const passwordSchema = z
  .string()
  .min(12, 'Password deve essere di almeno 12 caratteri')
  .max(128, 'Password troppo lunga')
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{12,}$/,
    'Password deve contenere lettere e numeri (minimo 12 caratteri)'
  )
```

#### **2. Bcrypt Hash (sostituisce SHA-256)**
```typescript
// File: supabase/functions/shared/bcrypt-utils.ts
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}
```

**Migration Strategy**:
- Verificare password_hash format
- Se inizia con `$2b$` → già bcrypt
- Se SHA-256 → verifica con SHA-256, poi re-hash con bcrypt al primo login

#### **3. Rate Limiting Escalation**
```typescript
// File: supabase/functions/shared/rate-limiter.ts
function calculateLockoutDuration(failedAttempts: number): number {
  if (failedAttempts === 5) return 5 * 60      // 5 min
  if (failedAttempts === 10) return 15 * 60    // 15 min
  if (failedAttempts === 15) return 60 * 60    // 1 hour
  if (failedAttempts >= 20) return 24 * 60 * 60 // 24 hours
  return 0
}
```

#### **4. CSRF Token (4 ore lifetime)**
- Fetch al page load di LoginPage
- Retry 3 volte se fetch fallisce (exponential backoff)
- Auto-refresh se token expira durante sessione

#### **5. Email Enumeration Protection**
```typescript
// Password Recovery: Sempre return success
if (user) {
  await sendEmail({ recoveryLink, ... })
} else {
  await createAuditLog({ action: 'PASSWORD_RESET_REQUESTED_INVALID' })
  await sleep(randomInt(100, 300)) // Artificial delay
}

return {
  success: true,
  message: "Se l'email esiste nel sistema, riceverai un link di reset"
}
```

---

### **PRIORITY 2 - FUNCTIONALITY**

#### **6. LoginPage usa LoginForm**
```typescript
// File: src/features/auth/LoginPage.tsx
import { LoginForm } from './components/LoginForm'

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen ...">
      {/* Header */}
      <div className="text-center mb-8">...</div>

      {/* Form Card */}
      <div className="bg-white shadow-2xl rounded-2xl p-8">
        <LoginForm
          onSuccess={() => navigate('/dashboard')}
          onError={(error) => console.error(error)}
        />
      </div>

      {/* Rimuovere: Tasto "Torna alla Home" */}
      {/* Rimuovere: Link "Registrati ora" */}
      {/* Rimuovere: Divider "oppure" */}
    </div>
  )
}
```

#### **7. Remember Me (30 giorni)**
```typescript
// File: src/features/auth/components/LoginForm.tsx
// Rimuovere disabled={true} da checkbox (riga 320)

<input
  id="login-remember"
  type="checkbox"
  checked={formData.rememberMe}
  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
  className="h-4 w-4 ..."
  // disabled={true} // ❌ RIMUOVERE QUESTA RIGA
/>

<label htmlFor="login-remember" className="ml-2 text-sm text-gray-600">
  Ricordami per 30 giorni
</label>
```

**Backend Logic**:
```typescript
// File: supabase/functions/auth/login/index.ts
const sessionDuration = rememberMe
  ? 30 * 24 * 60 * 60 * 1000  // 30 giorni
  : 24 * 60 * 60 * 1000        // 24 ore

const expiresAt = new Date(Date.now() + sessionDuration)

await supabase.from('sessions').insert({
  user_id: user.id,
  session_token: sessionToken,
  expires_at: expiresAt,
  remember_me: rememberMe
})
```

#### **8. Multi-Company Preferred Company**
```typescript
// File: supabase/functions/auth/login/index.ts
const { data: companies } = await supabase
  .from('company_members')
  .select('company_id, role, companies(id, name)')
  .eq('user_id', user.id)

if (companies.length === 1) {
  // Auto-select unica company
  return { active_company_id: companies[0].company_id }
}

if (companies.length > 1) {
  // Check preferred company
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('preferred_company_id')
    .eq('user_id', user.id)
    .single()

  if (prefs?.preferred_company_id) {
    return { active_company_id: prefs.preferred_company_id }
  }

  // Altrimenti: ultima usata (vedi last_activity per company)
  return { active_company_id: companies[0].company_id }
}
```

#### **9. Activity Tracking (3 minuti)**
```typescript
// File: src/hooks/useAuth.ts
// Update last_activity ogni 3 minuti (180 secondi)

useEffect(() => {
  const interval = setInterval(() => {
    if (isAuthenticated) {
      fetch('/api/auth/update-activity', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` }
      })
    }
  }, 3 * 60 * 1000) // 3 minuti

  return () => clearInterval(interval)
}, [isAuthenticated, sessionToken])
```

#### **10. Recovery Token (12 ore, single-use)**
```typescript
// File: supabase/functions/auth/password-recovery/request/index.ts
const recoveryToken = crypto.randomBytes(32).toString('hex')
const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 ore

await supabase.from('recovery_tokens').insert({
  token: recoveryToken,
  user_id: user.id,
  expires_at: expiresAt,
  used: false
})
```

#### **11. Invite Token (30 giorni, single-use)**
```typescript
// File: supabase/functions/auth/generate-invite/index.ts
const inviteToken = crypto.randomBytes(32).toString('hex')
const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 giorni

await supabase.from('invite_tokens').insert({
  token: inviteToken,
  email: email,
  company_id: companyId,
  role: role,
  expires_at: expiresAt,
  used: false
})
```

---

### **PRIORITY 3 - DATABASE SCHEMA**

#### **12. user_preferences Table (NUOVA)**
```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'it',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
CREATE POLICY "Users can view own preferences"
ON user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON user_preferences FOR UPDATE
USING (auth.uid() = user_id);
```

#### **13. users Table Updates**
```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP;

-- Index per rate limiting queries
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until);
```

#### **14. sessions Table Updates**
```sql
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS remember_me BOOLEAN DEFAULT FALSE;
```

#### **15. invite_tokens Table (NUOVA)**
```sql
CREATE TABLE IF NOT EXISTS invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  used_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  invalidated_at TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_email ON invite_tokens(email);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_company ON invite_tokens(company_id);
```

---

## SISTEMA REGISTRAZIONE

### **Solo Tramite Invito**
1. **Admin genera invito**: Email + ruolo + company
2. **Sistema invia email**: Link con token univoco
3. **User clicca link**: Form pre-compilato con email/company
4. **User completa registrazione**: Nome + cognome + password
5. **Auto-assegnazione**: User collegato automaticamente ad azienda con ruolo

### **Link "Registrati ora" RIMOSSO**
- Nessuna registrazione self-service
- Solo inviti da Admin o Responsabile

---

## VALIDAZIONE PASSWORD

### **Vincoli Definitivi**
- **Minimo**: 12 caratteri
- **Requisiti**: Lettere (maiuscole/minuscole) + Numeri
- **Massimo**: 128 caratteri
- **NO indicatore visivo**: Solo validazione frontend/backend, nessuna progress bar

### **Messaggi Errore**
```typescript
{
  "password.min": "Password deve essere di almeno 12 caratteri",
  "password.regex": "Password deve contenere lettere e numeri",
  "password.max": "Password troppo lunga (max 128 caratteri)"
}
```

---

## GESTIONE TOKEN

### **CSRF Token**
- **Generazione**: Backend (`/api/auth/generate-csrf-token`)
- **Lifetime**: 4 ore
- **Storage**: React state (NO localStorage per sicurezza)
- **Validazione**: Ogni richiesta autenticata
- **Retry**: 3 tentativi con exponential backoff

### **Recovery Token**
- **Generazione**: POST `/api/auth/password-recovery/request`
- **Lifetime**: 12 ore
- **Single-use**: Marcato `used=true` dopo utilizzo
- **Email Enumeration Protection**: Sempre return success

### **Invite Token**
- **Generazione**: POST `/api/auth/generate-invite` (solo Admin/Responsabile)
- **Lifetime**: 30 giorni
- **Single-use**: Marcato `used=true` dopo registrazione
- **Invalidazione**: Inviti precedenti invalidati quando nuovo invito generato

---

## ACCEPTANCE CRITERIA

### **Frontend (Agente 5)**
- [ ] LoginPage.tsx: Link "Registrati ora" rimosso
- [ ] LoginPage.tsx: Bottone "Torna alla Home" rimosso
- [ ] LoginPage.tsx: Importa e usa LoginForm component
- [ ] LoginForm.tsx: Remember me checkbox abilitato
- [ ] authSchemas.ts: Password 12 char + lettere + numeri
- [ ] SignUpPage.tsx: Nuovo componente con validazione token invito

### **Backend (Agente 4)**
- [ ] auth/login: Bcrypt implementato (sostituisce SHA-256)
- [ ] auth/login: Rate limiting con escalation (5/10/15/20+)
- [ ] auth/login: Session 24h vs 30 giorni (rememberMe)
- [ ] auth/login: Multi-company setup (preferred company)
- [ ] auth/password-recovery: Email enumeration protection
- [ ] auth/generate-invite: Token generation + email sending
- [ ] auth/sign-up: Registrazione via invite token
- [ ] generate-csrf-token: Token crittograficamente sicuro (4h lifetime)
- [ ] activity-tracker: Update last_activity ogni 3 minuti

### **Database (Agente 2)**
- [ ] users: Aggiunti campi failed_login_attempts, locked_until, last_activity
- [ ] sessions: Aggiunto campo remember_me
- [ ] user_preferences: Tabella creata con RLS policies
- [ ] invite_tokens: Tabella creata con indexes
- [ ] recovery_tokens: Verificato schema (12h lifetime)
- [ ] audit_log: Eventi LOGIN_SUCCESS/FAILED, PASSWORD_RESET, INVITE_CREATED

### **Testing (Agente 6)**
- [ ] Unit tests: authSchemas, LoginForm, hooks (≥ 80% coverage)
- [ ] Integration tests: Login flow, recovery, invite registration
- [ ] E2E tests: Happy paths, error scenarios, rate limiting
- [ ] Security tests: Brute force, CSRF, email enumeration, token reuse
- [ ] Performance tests: Bcrypt < 150ms, Login endpoint < 500ms
- [ ] Accessibility tests: WCAG 2.1 AA (0 violazioni)

### **Security (Agente 7)**
- [ ] Audit password policy (12 char, bcrypt cost=10)
- [ ] Audit CSRF protection (token validation)
- [ ] Audit rate limiting (escalation progressiva)
- [ ] Audit email enumeration (sempre success)
- [ ] Audit token single-use (recovery + invite)

---

## INTERAZIONI

### **Con Database**
- `users` - Autenticazione, failed_attempts, locked_until, last_activity
- `sessions` - Token sessione, expires_at, remember_me
- `company_members` - Associazione user↔company con ruoli
- `user_preferences` - Preferred company, theme, language
- `invite_tokens` - Token inviti con expiration + single-use
- `recovery_tokens` - Token recovery password con expiration + single-use
- `audit_log` - Eventi critici (LOGIN, PASSWORD_CHANGE, INVITE)

### **Con Servizi**
- `authClient.ts` - HTTP client con CSRF + rate limiting
- `bcrypt-utils.ts` - Hash/verify password
- `csrf-manager.ts` - Generate/validate CSRF token
- `rate-limiter.ts` - Calculate lockout duration
- `email-service` - Invio email (inviti, recovery, notifiche)

### **Con Componenti**
- `LoginPage.tsx` ← `LoginForm.tsx` (import)
- `SignUpPage.tsx` - Registrazione via invite token
- `PasswordInput.tsx` - Input con toggle visibilità
- `EmailInput.tsx` - Input con validazione email

---

## NOTE SVILUPPO

### **Performance Targets**
- **bcrypt hash**: < 150ms (P95) con cost=10
- **Login endpoint**: < 500ms (P95)
- **CSRF token fetch**: < 200ms (P95)
- **Page load LoginPage**: < 2 secondi

### **Security Considerations**
- **NO password in logs**: Mai loggare password (né plaintext né hash)
- **CSRF token in memory**: React state, NO localStorage
- **Token single-use**: Enforced database-side (used=true)
- **Email enumeration**: Artificial delay 100-300ms per user non esistenti
- **Audit logging**: Tutti eventi critici con IP + user_agent

### **Rollback Plan**
- Frontend: Vercel/Netlify instant rollback
- Backend: Edge Functions versioning
- Database: Migrations additive (compatibili backward)

---

## ARTEFATTI COMPLETI

Tutti gli artefatti dettagliati per implementazione sono disponibili in:
```
Production/Sessione_di_lavoro/Agente_9/2025-10-22_1419_login_mapping/
├── FUNCTION_INVENTORY.md         # 23 domande con decisioni utente
├── DECISIONI_FINALI.md            # Implementazione dettagliata
├── FEATURE_SPEC_LOGIN.md          # Specifica completa feature
├── PAT-LOGIN-001.md               # Pattern login flow
├── PAT-RECOVERY-001.md            # Pattern password recovery
├── PAT-INVITE-001.md              # Pattern invite registration
├── DoD_LOGIN.md                   # Definition of Done checklist
└── TEST_STRATEGY.md               # Strategia testing completa
```

---

**FINE SPECIFICA LOGIN FLOW v2.0.0**
