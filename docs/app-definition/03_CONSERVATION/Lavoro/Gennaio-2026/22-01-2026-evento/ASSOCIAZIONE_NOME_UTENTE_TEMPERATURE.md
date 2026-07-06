# Associazione Nome Utente a Registrazioni Temperature

**Data:** 22 Gennaio 2026  
**Autore:** AI Assistant  
**Stato:** ✅ Completato e Testato

---

## 📋 Indice

1. [Problema Iniziale](#problema-iniziale)
2. [Piano Rivisto](#piano-rivisto)
3. [Implementazione](#implementazione)
4. [Fallback per Compatibilità](#fallback-per-compatibilità)
5. [Risultato Finale](#risultato-finale)
6. [File Modificati](#file-modificati)

---

## 🔴 Problema Iniziale

### Situazione
Le registrazioni di temperatura (`temperature_readings`) non mostravano il nome dell'utente che aveva effettuato la rilevazione. Il campo `recorded_by` conteneva solo l'UUID dell'utente auth, senza informazioni leggibili.

### Problema del Piano Originale
Il piano originale prevedeva di popolare `user_profiles` solo al momento dell'accettazione invito. Questo approccio era errato perché:

1. **Admin inserisce dati separati**: Nello Step 3 dell'onboarding, l'admin inserisce `name` e `surname` separatamente (vedi `StaffStep.tsx:41-51`)
2. **Dati combinati e persi**: Questi dati vengono poi combinati in `fullName` e salvati solo in `staff.name`
3. **Perdita informazioni**: I dati `first_name`/`last_name` andavano persi, rendendo impossibile la tracciabilità

### Requisito
- **Tracciabilità completa**: Ogni registrazione temperatura deve mostrare nome e cognome dell'utente che l'ha effettuata
- **Valido per tutti**: Deve funzionare sia per admin che per utenti invitati

---

## ✅ Piano Rivisto

### Flusso Corretto

```
┌─────────────────────────────────────────────────────────────────────┐
│ ADMIN completa onboarding Step 3                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Per OGNI membro staff (INCLUSO admin):                          │ │
│ │   1. Inserisci in `staff` (come adesso)                         │ │
│ │   2. Inserisci in `user_profiles`:                              │ │
│ │      - first_name, last_name, email, company_id, staff_id       │ │
│ │      - auth_user_id = user.id (se admin)                        │ │
│ │      - auth_user_id = NULL (se non admin, attesa invito)        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ SISTEMA invia invito email (solo per non-admin)                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ UTENTE accetta invito (solo per non-admin)                          │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 1. Crea account auth                                             │ │
│ │ 2. UPDATE user_profiles SET auth_user_id = <nuovo_uuid>         │ │
│ │    WHERE email = <email_invito> AND company_id = <company>      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ QUERY temperature readings con join a user_profiles                 │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ SELECT *,                                                         │ │
│ │   recorder:user_profiles!recorded_by(                            │ │
│ │     first_name, last_name                                         │ │
│ │   )                                                               │ │
│ │ FROM temperature_readings                                        │ │
│ │ WHERE recorded_by = auth_user_id                                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Vantaggi

- ✅ **Dati già pronti**: Quando l'utente accetta l'invito, il profilo è già completo
- ✅ **Nessuna duplicazione**: `first_name`/`last_name` salvati una sola volta alla fonte
- ✅ **Join semplice**: Query diretta `temperature_readings` → `user_profiles` via `recorded_by`
- ✅ **Scalabile**: Indice su `user_profiles(auth_user_id)` rende le query efficienti
- ✅ **Tracciabilità completa**: Anche admin ha nome registrato per tracciabilità

---

## 🔧 Implementazione

### 1. Modifica `onboardingHelpers.ts` - Salvataggio Staff

**File:** `src/utils/onboardingHelpers.ts`  
**Righe:** 1766-1808

**Modifica:** Incluso anche l'admin nella creazione di `user_profiles`

```typescript
// Crea user_profiles per TUTTI gli staff (incluso admin) - first_name/last_name dalla fonte
// ⚠️ IMPORTANTE: Admin ha già auth_user_id (è autenticato), altri lo avranno all'accettazione invito
const { data: { user: currentUser } } = await supabase.auth.getUser()
const currentUserEmail = currentUser?.email?.toLowerCase() || null

const staffByEmail = new Map<string, { id: string }>()
for (const s of insertedStaff as { id: string; email: string | null }[]) {
  if (s.email) staffByEmail.set(s.email.toLowerCase(), { id: s.id })
}

const userProfiles = formData.staff
  .map((person: { name?: string; surname?: string; email?: string; role?: string }, index: number) => {
    const staffId = person.email ? staffByEmail.get(person.email.toLowerCase())?.id : null
    const isAdmin = index === 0 || person.email?.toLowerCase() === currentUserEmail
    return { person, staffId, isAdmin }
  })
  .filter(({ person, staffId }) => !!person.email && !!staffId)
  .map(({ person, staffId, isAdmin }) => ({
    email: person.email!,
    first_name: person.name ?? null,
    last_name: person.surname ?? null,
    company_id: companyId,
    staff_id: staffId!,
    role: person.role ?? 'dipendente',
    // Admin ha già account auth → popola auth_user_id subito
    // Altri lo avranno all'accettazione invito → NULL per ora
    auth_user_id: isAdmin && currentUser?.id ? currentUser.id : null,
    updated_at: new Date().toISOString(),
  }))

if (userProfiles.length > 0) {
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert(userProfiles, { onConflict: 'email,company_id' })
  // ...
}
```

**Punti chiave:**
- ✅ Include anche admin (rimosso `filter((_person, index) => index > 0)`)
- ✅ Identifica admin con doppio controllo: `index === 0` OR `email === currentUserEmail`
- ✅ Popola `auth_user_id` immediatamente per admin
- ✅ Usa `first_name` e `last_name` dalla fonte (`person.name`, `person.surname`)

---

### 2. Modifica `inviteService.ts` - Accettazione Invito

**File:** `src/services/auth/inviteService.ts`  
**Righe:** 307-316

**Modifica:** Aggiorna `auth_user_id` in `user_profiles` quando l'utente accetta l'invito

```typescript
// Dopo: console.log('✅ Account Supabase creato:', authData.user.id)
// Aggiorna user_profiles con auth_user_id (profilo già creato in onboarding step 3)
const { error: profileUpdateError } = await supabase
  .from('user_profiles')
  .update({ auth_user_id: authData.user.id, updated_at: new Date().toISOString() })
  .eq('email', invite.email)
  .eq('company_id', invite.company_id)

if (profileUpdateError) {
  console.warn('⚠️ Errore aggiornamento user_profile (non critico):', profileUpdateError)
}
```

**Punti chiave:**
- ✅ Aggiorna `auth_user_id` dopo creazione account
- ✅ Usa `email` + `company_id` per identificare il profilo
- ✅ Gestione errori non bloccante

---

### 3. Modifica `useTemperatureReadings.ts` - Query con Join

**File:** `src/features/conservation/hooks/useTemperatureReadings.ts`  
**Righe:** 52-98

**Modifica:** Query con join a `user_profiles` per ottenere nome utente

```typescript
const rows = data || []
const recordedByIds = [...new Set(rows.map((r: { recorded_by?: string | null }) => r.recorded_by).filter(Boolean))] as string[]

let recorderMap: Record<string, { first_name?: string | null; last_name?: string | null; id?: string }> = {}
if (recordedByIds.length > 0) {
  // 1. Cerca in user_profiles tramite auth_user_id
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('auth_user_id, first_name, last_name, id, staff_id')
    .in('auth_user_id', recordedByIds)
    .eq('company_id', companyId)
  
  if (profiles?.length) {
    recorderMap = Object.fromEntries(
      profiles.map(p => [p.auth_user_id, { first_name: p.first_name, last_name: p.last_name, id: p.id }])
    )
  }
  
  // 2. FALLBACK: Se alcuni profili non sono stati trovati, cerca tramite company_members → staff
  const missingIds = recordedByIds.filter(id => !recorderMap[id])
  if (missingIds.length > 0) {
    // ... (vedi sezione Fallback)
  }
}

const readingsWithUsers = rows.map((reading: Record<string, unknown>) => {
  const recordedById = reading.recorded_by as string | null | undefined
  const recorder = recordedById ? recorderMap[recordedById] : null
  const recorded_by_name = recorder
    ? `${recorder.first_name ?? ''} ${recorder.last_name ?? ''}`.trim() || null
    : null
  
  return {
    ...reading,
    recorded_by_user: recorder ? { id: recorder.id ?? recordedById, first_name: recorder.first_name, last_name: recorder.last_name } : undefined,
    recorded_by_name,
  }
})
```

**Punti chiave:**
- ✅ Estrae `recorded_by` IDs unici dalle letture
- ✅ Query a `user_profiles` usando `auth_user_id`
- ✅ Crea mappa per lookup efficiente
- ✅ Aggiunge `recorded_by_name` e `recorded_by_user` ai risultati
- ✅ Include fallback per compatibilità (vedi sezione successiva)

---

### 4. Modifica `AddTemperatureModal.tsx` - Passaggio recorded_by

**File:** `src/features/conservation/components/AddTemperatureModal.tsx`  
**Riga:** 164

**Modifica:** Popola `recorded_by` con `user.id` dall'hook `useAuth`

```typescript
const { user } = useAuth()

onSave({
  ...formData,
  recorded_by: user?.id || undefined,
})
```

**Punti chiave:**
- ✅ Usa `useAuth()` per ottenere utente corrente
- ✅ Passa `user.id` come `recorded_by`
- ✅ Campo incluso nel payload di salvataggio

---

### 5. Modifica `TemperatureReadingCard.tsx` - Visualizzazione Nome

**File:** `src/features/conservation/components/TemperatureReadingCard.tsx`  
**Righe:** 95-116, 187-202

**Modifica:** Mostra nome utente nell'header e nella sezione dettagli

```typescript
// Header - Nome visibile accanto a data/ora
{(reading.recorded_by_name || reading.recorded_by_user) && (
  <div className="flex items-center space-x-2 text-sm text-gray-500">
    <User className="w-4 h-4" />
    <span className="font-medium">
      {reading.recorded_by_name ||
        (reading.recorded_by_user?.name) ||
        (reading.recorded_by_user?.first_name &&
          reading.recorded_by_user?.last_name
          ? `${reading.recorded_by_user.first_name} ${reading.recorded_by_user.last_name}`
          : null)}
    </span>
  </div>
)}

// Dettagli - Sezione dedicata
{reading.recorded_by && (
  <div className="flex items-center space-x-2 text-sm text-gray-600">
    <User className="w-4 h-4" />
    <span>
      Rilevato da:{' '}
      <span className="font-medium text-gray-900">
        {reading.recorded_by_name ||
          (reading.recorded_by_user?.name) ||
          (reading.recorded_by_user?.first_name &&
            reading.recorded_by_user?.last_name
            ? `${reading.recorded_by_user.first_name} ${reading.recorded_by_user.last_name}`
            : 'Utente non identificato')}
      </span>
    </span>
  </div>
)}
```

**Punti chiave:**
- ✅ Nome visibile nell'header (accanto a data/ora)
- ✅ Nome visibile nella sezione dettagli
- ✅ Supporto per `recorded_by_name` e `recorded_by_user`
- ✅ Fallback a "Utente non identificato" se nome non disponibile

---

### 6. Aggiornamento Type `conservation.ts`

**File:** `src/types/conservation.ts`  
**Righe:** 60-61

**Modifica:** Aggiunto tipo `recorded_by_name` a `TemperatureReading`

```typescript
export interface TemperatureReading {
  // ... altri campi
  recorded_by?: string
  recorded_by_user?: {
    id: string
    first_name?: string
    last_name?: string
    name?: string
  }
  /** Nome completo da user_profiles (first_name + last_name) per display */
  recorded_by_name?: string | null
}
```

---

## 🔄 Fallback per Compatibilità

### Problema
Utenti che hanno completato l'onboarding **prima** della modifica non hanno `user_profiles` creato. Il join diretto fallisce.

### Soluzione Implementata

**File:** `src/features/conservation/hooks/useTemperatureReadings.ts`  
**Righe:** 70-120

**Logica Fallback:**

1. **Prima ricerca**: Cerca in `user_profiles` tramite `auth_user_id`
2. **Se mancanti**: Per gli ID non trovati, usa fallback:
   - Cerca in `company_members` per ottenere `staff_id`
   - Cerca in `staff` per ottenere nome completo
   - Estrae `first_name` e `last_name` dal nome (es. "Matteo Test" → first_name="Matteo", last_name="Test")

```typescript
// 2. FALLBACK: Se alcuni profili non sono stati trovati, cerca tramite company_members → staff
const missingIds = recordedByIds.filter(id => !recorderMap[id])
if (missingIds.length > 0) {
  console.log('🔍 Fallback: cercando profili mancanti tramite company_members → staff...', missingIds.length)
  
  // Cerca in company_members per ottenere staff_id
  const { data: members } = await supabase
    .from('company_members')
    .select('user_id, staff_id')
    .in('user_id', missingIds)
    .eq('company_id', companyId)
  
  if (members?.length) {
    const staffIds = members.map(m => m.staff_id).filter(Boolean) as string[]
    
    if (staffIds.length > 0) {
      // Cerca in staff per ottenere nome
      const { data: staff } = await supabase
        .from('staff')
        .select('id, name, email')
        .in('id', staffIds)
        .eq('company_id', companyId)
      
      if (staff?.length) {
        // Crea mappa staff_id → nome
        const staffMap = new Map(staff.map(s => [s.id, s.name]))
        
        // Per ogni member, estrai nome da staff
        members.forEach(member => {
          if (member.staff_id && staffMap.has(member.staff_id)) {
            const staffName = staffMap.get(member.staff_id) || ''
            // Estrai first_name e last_name da name (formato "Nome Cognome")
            const nameParts = staffName.trim().split(/\s+/).filter(Boolean)
            const first_name = nameParts[0] || null
            const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null
            
            if (first_name) {
              recorderMap[member.user_id] = {
                first_name,
                last_name,
                id: member.staff_id
              }
            }
          }
        })
      }
    }
  }
}
```

**Vantaggi:**
- ✅ Compatibilità con dati esistenti
- ✅ Funziona anche per utenti che hanno completato onboarding prima della modifica
- ✅ Nessuna migrazione database richiesta
- ✅ Transparent per l'utente finale

---

## ✅ Risultato Finale

### Comportamento Atteso

1. **Onboarding Step 3**: 
   - Admin inserisce `name` e `surname` per ogni membro staff
   - Sistema crea `user_profiles` per TUTTI (incluso admin)
   - Admin ha `auth_user_id` popolato immediatamente
   - Altri hanno `auth_user_id = NULL` (verrà aggiornato all'accettazione invito)

2. **Accettazione Invito**:
   - Utente crea account auth
   - Sistema aggiorna `auth_user_id` in `user_profiles` esistente

3. **Registrazione Temperatura**:
   - Modal passa `recorded_by: user.id`
   - Hook carica letture con join a `user_profiles`
   - Nome utente visualizzato nella card

4. **Visualizzazione**:
   - Nome visibile nell'header della card (accanto a data/ora)
   - Nome visibile nella sezione dettagli
   - Fallback a "Utente non identificato" se nome non disponibile

### Test Eseguiti

✅ **Test 1**: Onboarding completo con admin  
- Admin: `0cavuz0@gmail.com` - Nome: "Matteo Test"  
- Risultato: Nome visualizzato correttamente nelle temperature readings

✅ **Test 2**: Fallback per utenti esistenti  
- Utente con onboarding precedente alla modifica  
- Risultato: Nome recuperato tramite fallback `company_members` → `staff`

✅ **Test 3**: Visualizzazione UI  
- Card mostra nome nell'header e dettagli  
- Fallback funziona correttamente

---

## 📁 File Modificati

### File Principali

1. **`src/utils/onboardingHelpers.ts`**
   - Incluso admin nella creazione `user_profiles`
   - Popolamento `auth_user_id` per admin

2. **`src/services/auth/inviteService.ts`**
   - Aggiornamento `auth_user_id` all'accettazione invito

3. **`src/features/conservation/hooks/useTemperatureReadings.ts`**
   - Query con join a `user_profiles`
   - Fallback tramite `company_members` → `staff`
   - Log di debug per troubleshooting

4. **`src/features/conservation/components/AddTemperatureModal.tsx`**
   - Passaggio `recorded_by: user.id`

5. **`src/features/conservation/components/TemperatureReadingCard.tsx`**
   - Visualizzazione nome nell'header
   - Visualizzazione nome nei dettagli
   - Supporto per `recorded_by_name` e `recorded_by_user`

6. **`src/types/conservation.ts`**
   - Aggiunto tipo `recorded_by_name?: string | null`

### File di Documentazione

- **Questo file**: `ASSOCIAZIONE_NOME_UTENTE_TEMPERATURE.md`

---

## 🔍 Debug e Troubleshooting

### Log Console

Il sistema genera log utili per il debug:

```javascript
// Caricamento temperature readings
console.log('🔧 Loading temperature readings from Supabase for company:', companyId)

// Statistiche recorded_by
console.log('📊 Recorded by stats:', {
  total: X,
  withRecordedBy: Y,
  withName: Z,
  withoutName: W
})

// Fallback attivato
console.log('🔍 Fallback: cercando profili mancanti tramite company_members → staff...', N)
console.log('✅ Fallback: trovati X profili tramite staff')

// Warning se profilo non trovato
console.warn('⚠️ recorded_by ID trovato ma profilo utente non trovato:', {
  recorded_by: 'uuid',
  availableIds: [...],
  totalProfiles: N
})
```

### Problemi Comuni

#### 1. "Utente non identificato" mostrato

**Causa**: `recorded_by` non popolato o profilo non trovato

**Soluzione**:
- Verifica che `AddTemperatureModal` passi `user?.id`
- Controlla log console per vedere se fallback è attivato
- Verifica che `user_profiles` esista per l'utente

#### 2. Nome non visualizzato per admin

**Causa**: Admin non incluso in `user_profiles` (onboarding precedente)

**Soluzione**:
- Fallback automatico tramite `staff` dovrebbe risolvere
- Se persiste, verifica che `company_members.staff_id` sia popolato

#### 3. Nome non visualizzato per utenti invitati

**Causa**: `auth_user_id` non aggiornato all'accettazione invito

**Soluzione**:
- Verifica che `inviteService.ts` aggiorni correttamente `auth_user_id`
- Controlla log durante accettazione invito

---

## 🚀 Miglioramenti Futuri (Opzionali)

### 1. Indici Database

Per migliorare le performance delle query, aggiungere indici:

```sql
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_company 
  ON user_profiles(email, company_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id 
  ON user_profiles(auth_user_id) WHERE auth_user_id IS NOT NULL;
```

### 2. Migrazione Dati Esistenti

Script per creare `user_profiles` per utenti esistenti:

```sql
-- Crea user_profiles per admin esistenti senza profilo
INSERT INTO user_profiles (email, first_name, last_name, company_id, staff_id, auth_user_id, role)
SELECT 
  s.email,
  SPLIT_PART(s.name, ' ', 1) as first_name,
  SUBSTRING(s.name FROM POSITION(' ' IN s.name) + 1) as last_name,
  s.company_id,
  s.id as staff_id,
  cm.user_id as auth_user_id,
  cm.role
FROM staff s
JOIN company_members cm ON cm.staff_id = s.id
LEFT JOIN user_profiles up ON up.email = s.email AND up.company_id = s.company_id
WHERE up.id IS NULL
  AND s.email IS NOT NULL
  AND cm.user_id IS NOT NULL;
```

### 3. Join Diretto Supabase

In futuro, quando tutti gli utenti avranno `user_profiles`, usare join diretto:

```typescript
const { data } = await supabase
  .from('temperature_readings')
  .select(`
    *,
    recorder:user_profiles!recorded_by(first_name, last_name)
  `)
```

---

## 📝 Note Finali

- ✅ **Compatibilità**: Fallback garantisce funzionamento anche per dati esistenti
- ✅ **Tracciabilità**: Ogni registrazione temperatura è ora tracciabile all'utente
- ✅ **Scalabilità**: Soluzione efficiente con indici appropriati
- ✅ **Manutenibilità**: Codice ben documentato e log di debug

---

## ✅ Checklist Completamento

- [x] Modifica `onboardingHelpers.ts` per includere admin
- [x] Modifica `inviteService.ts` per aggiornare `auth_user_id`
- [x] Modifica `useTemperatureReadings.ts` con join e fallback
- [x] Modifica `AddTemperatureModal.tsx` per passare `recorded_by`
- [x] Modifica `TemperatureReadingCard.tsx` per visualizzare nome
- [x] Aggiornamento tipo `conservation.ts`
- [x] Test con utente admin esistente
- [x] Test fallback per compatibilità
- [x] Documentazione completa

---

**Stato:** ✅ **COMPLETATO E TESTATO**  
**Data Completamento:** 22 Gennaio 2026
