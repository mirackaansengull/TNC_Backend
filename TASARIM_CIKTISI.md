# TaskFlow API — Tasarım Çıktısı (Design Output)

**Doküman Versiyonu:** 1.0.0  
**Tarih:** 18 Ekim 2026  
**Durum:** Yayımlandı  

---

## İçindekiler

1. [Proje Özeti](#1-proje-özeti)
2. [Sistem Mimarisi](#2-sistem-mimarisi)
3. [Veri Modeli](#3-veri-modeli)
4. [API Tasarımı](#4-api-tasarımı)
5. [Middleware Katmanı](#5-middleware-katmanı)
6. [Hata Yönetimi](#6-hata-yönetimi)
7. [Klasör Yapısı ve Sorumlulukları](#7-klasör-yapısı-ve-sorumlulukları)
8. [Geliştirme ve Çalıştırma Talimatları](#8-geliştirme-ve-çalıştırma-talimatları)

---

## 1. Proje Özeti

| Alan | Detay |
|---|---|
| **Proje Adı** | TaskFlow API |
| **Paket Adı** | `tnc_backend` |
| **Versiyon** | 1.0.0 |
| **Amaç** | Görev (task) yönetimi için RESTful HTTP API |
| **Ortam** | Node.js + Express.js v5 |
| **Veri Deposu** | In-memory (sunucu yeniden başlatılınca sıfırlanır) |
| **Varsayılan Port** | 3000 |
| **Lisans** | ISC |

### Amaç ve Kapsam

TaskFlow API, görev oluşturma, listeleme, güncelleme ve silme işlemlerini yönetmek için tasarlanmış hafif bir REST API'dir. Kimlik doğrulama gerektirmez; öncelikli hedef, hızlı prototipleme ve demo amaçlı kullanımdır. Filtreleme, sıralama, sayfalama ve özet raporlama gibi temel operasyonel özellikler yerleşik olarak sunulmaktadır.

---

## 2. Sistem Mimarisi

### Katmanlı Mimari

```
┌─────────────────────────────────────────────────────────┐
│                     HTTP İSTEKLERİ                      │
│              (Client / Postman / Tarayıcı)              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               ENTRY POINT  —  server.js                 │
│  • Express uygulamasını başlatır                        │
│  • Global middleware'leri bağlar                        │
│  • Route'ları kayıt eder                                │
│  • HTTP sunucusunu PORT'ta dinlemeye açar               │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│            GLOBAL MIDDLEWARE PIPELINE                   │
│                                                         │
│   express.json()  →  logger                             │
│   (İstek gövdesini parse eder) (Her isteği loglar)      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  ROUTER KATMANI                         │
│              src/routes/taskRoutes.js                   │
│                                                         │
│   GET  /health          →  inline handler               │
│   GET  /tasks           →  listTasks                    │
│   POST /tasks           →  validateTask → createTask    │
│   GET  /tasks/:id       →  getTask                      │
│   PUT  /tasks/:id       →  validateTask → updateTask    │
│   DELETE /tasks/:id     →  deleteTask                   │
│   GET  /reports/summary →  getReports                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              CONTROLLER KATMANI                         │
│           src/controllers/taskController.js             │
│                                                         │
│  • İş mantığını yönetir                                 │
│  • Data katmanından veri okur / yazar                   │
│  • HTTP yanıtını oluşturur                              │
│  • Hataları next(error) ile iletir                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               DATA ACCESS KATMANI                       │
│                src/data/tasks.js                        │
│                                                         │
│  • In-memory dizi üzerinde CRUD operasyonları           │
│  • getTasks / addTask / getTaskById                     │
│  • updateTaskById / deleteTaskById / setTasks           │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│            ERROR HANDLING MIDDLEWARE                    │
│         (notFound  →  errorHandler)                     │
│                                                         │
│  • Bilinmeyen route'lar için 404 üretir                 │
│  • Tüm AppError ve beklenmedik hataları yakalar         │
│  • Standart JSON hata yanıtı döner                      │
└─────────────────────────────────────────────────────────┘
```

### Bileşen İlişkileri

```
server.js
   ├── src/config/index.js          (PORT, APP_NAME, ENV)
   ├── src/middleware/logger.js
   ├── src/middleware/errorHandler.js
   ├── src/middleware/notFound.js
   └── src/routes/taskRoutes.js
           ├── src/middleware/validateTask.js
           └── src/controllers/taskController.js
                   ├── src/data/tasks.js
                   └── src/utils/AppError.js
```

---

## 3. Veri Modeli

### Task Varlığı

| Alan | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `id` | `number` | Oto | Otomatik artan | Benzersiz görev kimliği |
| `title` | `string` | **Evet** | — | Görev başlığı (boş olamaz) |
| `description` | `string` | **Evet** | — | Görev açıklaması (boş olamaz) |
| `status` | `string` | Hayır | `"todo"` | Görev durumu; izin verilen değerler aşağıda |
| `priority` | `string` | Hayır | `"medium"` | Görev önceliği; izin verilen değerler aşağıda |
| `assignee` | `string` | Hayır | `undefined` | Göreve atanan kişinin adı |
| `createdAt` | `string (ISO 8601)` | Oto | `new Date().toISOString()` | Oluşturulma zamanı |
| `updatedAt` | `string (ISO 8601)` | Oto | `new Date().toISOString()` | Son güncelleme zamanı |

### İzin Verilen Enum Değerleri

**`status`**

| Değer | Anlam |
|---|---|
| `todo` | Henüz başlanmamış |
| `in_progress` | Üzerinde çalışılıyor |
| `completed` | Tamamlanmış |

**`priority`**

| Değer | Anlam |
|---|---|
| `low` | Düşük öncelik |
| `medium` | Orta öncelik |
| `high` | Yüksek öncelik |

### Örnek Task Nesnesi

```json
{
  "id": 1,
  "title": "Initial task",
  "description": "Example task created for demo purposes",
  "status": "todo",
  "priority": "medium",
  "assignee": "Admin",
  "createdAt": "2026-10-18T18:37:00.000Z",
  "updatedAt": "2026-10-18T18:37:00.000Z"
}
```

### Veri Deposu Notu

Mevcut implementasyon in-memory depo kullanmaktadır. Sunucu yeniden başlatıldığında tüm veriler sıfırlanır. Başlangıçta bir adet örnek kayıt (`id: 1`) otomatik olarak eklenmektedir. Kalıcı depolama gerektiğinde `src/data/tasks.js` dosyasının bir veritabanı adaptörüyle değiştirilmesi yeterlidir; controller ve route katmanları değişmez.

---

## 4. API Tasarımı

### Base URL

```
http://localhost:3000
```

### Endpoint Listesi

| # | Method | Path | Açıklama | Middleware |
|---|---|---|---|---|
| 1 | `GET` | `/` | API durum bilgisi | — |
| 2 | `GET` | `/health` | Sağlık kontrolü | — |
| 3 | `GET` | `/tasks` | Görev listesi (filtre + sayfalama) | — |
| 4 | `POST` | `/tasks` | Yeni görev oluştur | `validateTask` |
| 5 | `GET` | `/tasks/:id` | Tek görev getir | — |
| 6 | `PUT` | `/tasks/:id` | Görevi güncelle | `validateTask` |
| 7 | `DELETE` | `/tasks/:id` | Görevi sil | — |
| 8 | `GET` | `/reports/summary` | Özet rapor | — |

---

### GET `/`

API'nin çalışıp çalışmadığını ve genel bilgileri döner.

**İstek:** Gövde yok.

**Başarılı Yanıt — `200 OK`**

```json
{
  "success": true,
  "message": "TaskFlow API is running",
  "app": "TaskFlow API",
  "environment": "development",
  "version": "1.0.0"
}
```

---

### GET `/health`

Uygulamanın sağlık durumunu ve sunucu zamanını döner.

**İstek:** Gövde yok.

**Başarılı Yanıt — `200 OK`**

```json
{
  "status": "healthy",
  "timestamp": "2026-10-18T18:37:00.000Z"
}
```

---

### GET `/tasks`

Tüm görevleri listeler. Filtreleme, sıralama ve sayfalama desteklenir.

**Query Parametreleri**

| Parametre | Tip | Varsayılan | Açıklama |
|---|---|---|---|
| `status` | `string` | — | Duruma göre filtrele (`todo`, `in_progress`, `completed`) |
| `priority` | `string` | — | Önceliğe göre filtrele (`low`, `medium`, `high`) |
| `assignee` | `string` | — | Atanan kişiye göre filtrele (büyük/küçük harf duyarsız) |
| `keyword` | `string` | — | Başlık veya açıklamada anahtar kelime arar |
| `page` | `number` | `1` | Sayfa numarası |
| `limit` | `number` | `10` | Sayfa başına kayıt sayısı |
| `sortBy` | `string` | `createdAt` | Sıralama alanı |
| `sortOrder` | `string` | `desc` | Sıralama yönü (`asc` / `desc`) |

**İstek:** Gövde yok.

**Başarılı Yanıt — `200 OK`**

```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Initial task",
      "description": "Example task created for demo purposes",
      "status": "todo",
      "priority": "medium",
      "assignee": "Admin",
      "createdAt": "2026-10-18T18:37:00.000Z",
      "updatedAt": "2026-10-18T18:37:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

---

### POST `/tasks`

Yeni bir görev oluşturur.

**İstek Gövdesi — `application/json`**

```json
{
  "title": "Yeni görev",
  "description": "Görev açıklaması",
  "priority": "high",
  "status": "todo",
  "assignee": "Mirac"
}
```

| Alan | Zorunluluk | Kısıtlama |
|---|---|---|
| `title` | **Zorunlu** | Boş olamaz |
| `description` | **Zorunlu** | Boş olamaz |
| `priority` | İsteğe bağlı | `low`, `medium`, `high` |
| `status` | İsteğe bağlı | `todo`, `in_progress`, `completed` |
| `assignee` | İsteğe bağlı | String, boş olamaz |

**Başarılı Yanıt — `201 Created`**

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 2,
    "title": "Yeni görev",
    "description": "Görev açıklaması",
    "priority": "high",
    "status": "todo",
    "assignee": "Mirac",
    "createdAt": "2026-10-18T18:40:00.000Z",
    "updatedAt": "2026-10-18T18:40:00.000Z"
  }
}
```

**Hata Yanıtı — `400 Bad Request`** (doğrulama hatası)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      "title is required and must be a non-empty string"
    ]
  }
}
```

---

### GET `/tasks/:id`

Belirtilen `id`'ye sahip görevi döner.

**Path Parametresi:** `id` — Görev kimliği (sayı)

**Başarılı Yanıt — `200 OK`**

```json
{
  "success": true,
  "message": "Task details retrieved successfully",
  "data": {
    "id": 1,
    "title": "Initial task",
    "description": "Example task created for demo purposes",
    "status": "todo",
    "priority": "medium",
    "assignee": "Admin",
    "createdAt": "2026-10-18T18:37:00.000Z",
    "updatedAt": "2026-10-18T18:37:00.000Z"
  }
}
```

**Hata Yanıtı — `404 Not Found`**

```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found"
  }
}
```

---

### PUT `/tasks/:id`

Belirtilen `id`'ye sahip görevi günceller.

**Path Parametresi:** `id` — Görev kimliği (sayı)

**İstek Gövdesi — `application/json`**

```json
{
  "title": "Güncellenmiş başlık",
  "description": "Güncellenmiş açıklama",
  "status": "in_progress",
  "priority": "low",
  "assignee": "Mirac"
}
```

**Başarılı Yanıt — `200 OK`**

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "title": "Güncellenmiş başlık",
    "description": "Güncellenmiş açıklama",
    "status": "in_progress",
    "priority": "low",
    "assignee": "Mirac",
    "createdAt": "2026-10-18T18:37:00.000Z",
    "updatedAt": "2026-10-18T18:50:00.000Z"
  }
}
```

**Hata Yanıtları:**
- `400 Bad Request` — Doğrulama hatası (`VALIDATION_ERROR`)
- `404 Not Found` — Görev bulunamadı (`TASK_NOT_FOUND`)

---

### DELETE `/tasks/:id`

Belirtilen `id`'ye sahip görevi kalıcı olarak siler.

**Path Parametresi:** `id` — Görev kimliği (sayı)

**Başarılı Yanıt — `200 OK`**

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Hata Yanıtı — `404 Not Found`**

```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found"
  }
}
```

---

### GET `/reports/summary`

Görevlerin tamamlanma durumuna göre özet istatistik döner.

**İstek:** Gövde yok.

**Başarılı Yanıt — `200 OK`**

```json
{
  "success": true,
  "message": "Reports fetched successfully",
  "data": {
    "totalTasks": 5,
    "completedTasks": 2,
    "pendingTasks": 3,
    "summary": "2 completed / 3 pending"
  }
}
```

---

## 5. Middleware Katmanı

### Middleware Yürütme Sırası

```
İstek gelir
    │
    ▼
express.json()        — İstek gövdesini JSON olarak parse eder
    │
    ▼
logger                — Her isteği konsola loglar
    │
    ▼
[Route eşleşirse]
    ├── validateTask  — Yalnızca POST /tasks ve PUT /tasks/:id için çalışır
    └── Controller    — İş mantığını yürütür
    │
    ▼
notFound              — Hiçbir route eşleşmezse çalışır (404 üretir)
    │
    ▼
errorHandler          — Tüm hatalar burada yakalanır ve yanıta dönüştürülür
```

### Middleware Detayları

#### `express.json()` — Gövde Ayrıştırıcı
- **Kaynak:** Express.js yerleşik middleware
- **Görev:** `Content-Type: application/json` başlığına sahip isteklerin gövdesini `req.body` nesnesine parse eder.
- **Konum:** `server.js`, global düzeyde

---

#### `logger` — İstek Kaydedici
- **Kaynak:** `src/middleware/logger.js`
- **Görev:** Her gelen HTTP isteğini ISO 8601 zaman damgası, HTTP method ve URL bilgisiyle birlikte `console.log` ile standart çıktıya yazar.
- **Format:** `[2026-10-18T18:37:00.000Z] GET /tasks`
- **Konum:** `server.js`, global düzeyde

---

#### `validateTask` — Görev Doğrulayıcı
- **Kaynak:** `src/middleware/validateTask.js`
- **Görev:** `POST /tasks` ve `PUT /tasks/:id` endpoint'lerinde istek gövdesini doğrular. Hata varsa `AppError(400, 'Validation failed', 'VALIDATION_ERROR', details)` fırlatır ve controller'a geçmez.
- **Doğrulama Kuralları:**
  - `title`: Zorunlu, boş olamaz, string olmalı
  - `description`: Zorunlu, boş olamaz, string olmalı
  - `priority`: Opsiyonel; girilmişse `low | medium | high` olmalı
  - `status`: Opsiyonel; girilmişse `todo | in_progress | completed` olmalı
  - `assignee`: Opsiyonel; girilmişse boş olmayan string olmalı
- **Konum:** Route tanımında, ilgili controller'dan önce

---

#### `notFound` — Bulunamadı İşleyicisi
- **Kaynak:** `src/middleware/notFound.js`
- **Görev:** Hiçbir route ile eşleşmeyen isteklerde `AppError(404, 'Route not found: METHOD PATH', 'ROUTE_NOT_FOUND')` üretir ve `errorHandler`'a iletir.
- **Konum:** `server.js`, tüm route'lardan sonra

---

#### `errorHandler` — Merkezi Hata İşleyicisi
- **Kaynak:** `src/middleware/errorHandler.js`
- **Görev:** Express'in 4 parametreli hata middleware'i olarak `(err, req, res, next)` imzasıyla tanımlanmıştır. `AppError` veya beklenmedik hatalardan `statusCode`, `code`, `message` bilgilerini okur ve standart JSON yanıtı oluşturur. `development` ortamında `stack` bilgisi de yanıta eklenir.
- **Konum:** `server.js`, tüm middleware ve route'lardan sonra, en sonda

---

## 6. Hata Yönetimi

### AppError Sınıfı

`src/utils/AppError.js` dosyasında tanımlanan `AppError`, Node.js'in yerleşik `Error` sınıfından türetilmiştir.

```
AppError(statusCode, message, code, details)
   ├── statusCode : HTTP durum kodu (400, 404, 500...)
   ├── message    : Kullanıcıya gösterilen hata mesajı
   ├── code       : Makine tarafından okunabilir hata kodu
   └── details    : İsteğe bağlı ek bilgi (doğrulama hataları listesi)
```

### Standart Hata Yanıt Formatı

```json
{
  "success": false,
  "error": {
    "code": "HATA_KODU",
    "message": "Hata mesajı",
    "details": ["..."],
    "stack": "..."
  }
}
```

> `details` yalnızca doğrulama hatalarında bulunur.  
> `stack` yalnızca `NODE_ENV !== 'production'` ortamında bulunur.

### Hata Kodu Referans Tablosu

| HTTP Kodu | Hata Kodu | Tetiklendiği Yer | Açıklama |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | `validateTask` middleware | Gerekli alanlar eksik veya geçersiz değer |
| `404` | `TASK_NOT_FOUND` | `getTask`, `updateTask`, `deleteTask` | Belirtilen ID'li görev bulunamadı |
| `404` | `ROUTE_NOT_FOUND` | `notFound` middleware | Bilinmeyen route'a istek geldi |
| `500` | `INTERNAL_SERVER_ERROR` | `errorHandler` (genel) | Beklenmedik sunucu hatası |

### Hata Akışı

```
Controller içinde hata oluşur
         │
         ▼
  next(new AppError(...))
         │
         ▼
  errorHandler(err, req, res, next)
         │
    ┌────┴────────────────────────┐
    │  err.statusCode mevcut?     │
    │  Evet → kullan              │
    │  Hayır → 500 kullan         │
    └────┬────────────────────────┘
         │
         ▼
  JSON yanıt döner (success: false)
```

---

## 7. Klasör Yapısı ve Sorumlulukları

```
TNC_Backend/
│
├── server.js                        # Uygulama giriş noktası
├── package.json                     # Bağımlılıklar ve npm scriptleri
├── .gitignore                       # Git dışında tutulan dosyalar
├── README.md                        # Proje açıklaması
├── TaskFlow.postman_collection.json # Postman koleksiyonu
├── TaskFlow.postman_environment.json# Postman ortam değişkenleri
│
├── src/
│   ├── config/
│   │   └── index.js                 # PORT, APP_NAME, ENV yapılandırması
│   │
│   ├── controllers/
│   │   └── taskController.js        # İş mantığı: CRUD + raporlama
│   │
│   ├── data/
│   │   └── tasks.js                 # In-memory veri deposu ve CRUD yardımcıları
│   │
│   ├── middleware/
│   │   ├── errorHandler.js          # Merkezi hata işleyicisi
│   │   ├── logger.js                # HTTP istek loglayıcı
│   │   ├── notFound.js              # Bilinmeyen route işleyicisi
│   │   └── validateTask.js          # Görev gövde doğrulayıcı
│   │
│   ├── routes/
│   │   └── taskRoutes.js            # Tüm API route tanımları
│   │
│   └── utils/
│       └── AppError.js              # Özel hata sınıfı
│
└── tests/                           # Test dosyaları (supertest tabanlı)
```

### Katman Sorumlulukları

| Katman | Dosya / Klasör | Sorumluluk |
|---|---|---|
| **Giriş Noktası** | `server.js` | Express başlatma, middleware kayıt, sunucu dinleme |
| **Yapılandırma** | `src/config/` | Ortam değişkenleri ve uygulama sabitleri |
| **Yönlendirme** | `src/routes/` | URL path → controller eşlemesi, middleware zinciri |
| **İş Mantığı** | `src/controllers/` | HTTP isteğini işleme, veri katmanını çağırma, yanıt üretme |
| **Veri Erişimi** | `src/data/` | In-memory depo, CRUD operasyonları |
| **Middleware** | `src/middleware/` | Çapraz kesme kaygıları: log, doğrulama, hata yönetimi |
| **Yardımcılar** | `src/utils/` | Yeniden kullanılabilir sınıflar (AppError) |
| **Testler** | `tests/` | Uç-to-uç ve entegrasyon testleri (supertest) |

---

## 8. Geliştirme ve Çalıştırma Talimatları

### Ön Koşullar

| Araç | Minimum Versiyon |
|---|---|
| Node.js | 18.x veya üzeri |
| npm | 9.x veya üzeri |

### Kurulum

```bash
# Depoyu klonla
git clone <repo-url>
cd TNC_Backend

# Bağımlılıkları yükle
npm install
```

### Çalıştırma

```bash
# Üretim modu (node ile)
npm start

# Geliştirme modu (nodemon ile — dosya değişikliklerini izler)
npm run dev
```

Sunucu varsayılan olarak `http://localhost:3000` adresinde başlar.

### Ortam Değişkenleri

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `PORT` | `3000` | Sunucunun dinleyeceği port |
| `NODE_ENV` | `development` | Ortam adı (`development` / `production`) |

Değişkenleri `.env` dosyası veya sistem ortamı aracılığıyla ayarlayabilirsiniz:

```bash
# Windows PowerShell
$env:PORT = "4000"
$env:NODE_ENV = "production"
npm start
```

### Testleri Çalıştırma

```bash
npm test
```

> Mevcut durumda test komutu yer tutucu (placeholder) olarak tanımlıdır. Gerçek testler `supertest` kütüphanesiyle `tests/` klasörüne eklenebilir.

### API'yi Postman ile Test Etme

Projede hazır Postman koleksiyonu ve ortam dosyası bulunmaktadır:

1. Postman'i açın.
2. `TaskFlow.postman_collection.json` dosyasını **Import** edin.
3. `TaskFlow.postman_environment.json` dosyasını ortam olarak **Import** edin ve aktif yapın.
4. Sunucuyu başlatın, ardından koleksiyondaki istekleri çalıştırın.

### Hızlı Doğrulama (curl)

```bash
# API durumunu kontrol et
curl http://localhost:3000/

# Sağlık kontrolü
curl http://localhost:3000/health

# Tüm görevleri listele
curl http://localhost:3000/tasks

# Yeni görev oluştur
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test görevi","description":"Açıklama","priority":"high"}'

# Görev güncelle (id=1)
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Güncellendi","description":"Yeni açıklama","status":"completed"}'

# Görev sil (id=1)
curl -X DELETE http://localhost:3000/tasks/1

# Özet rapor al
curl http://localhost:3000/reports/summary
```

---

*Bu doküman, TaskFlow API'nin v1.0.0 implementasyonunu yansıtmaktadır. Kodda yapılacak değişikliklerde dokümanın güncellenmesi önerilir.*
