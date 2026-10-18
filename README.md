# TaskFlow API

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-5.2.1-000000?style=flat-square&logo=express&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/license-ISC-green?style=flat-square)
![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)

> Görev ve proje yönetimi için tasarlanmış profesyonel bir REST API. Görev oluşturma, listeleme, güncelleme, silme işlemlerinin yanı sıra gelişmiş filtreleme, sayfalama, sıralama ve raporlama özellikleri sunar.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Running the App](#-running-the-app)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Running Tests](#-running-tests)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **CRUD İşlemleri** — Görev oluşturma, listeleme, detay görüntüleme, güncelleme ve silme
- **Gelişmiş Filtreleme** — Durum (`status`), öncelik (`priority`), atanan kişi (`assignee`) ve anahtar kelime (`keyword`) ile filtreleme
- **Sayfalama & Sıralama** — `page`, `limit`, `sortBy`, `sortOrder` parametreleriyle esnek listeleme
- **Validation Middleware** — Tüm POST/PUT isteklerinde otomatik girdi doğrulaması
- **Logger Middleware** — Her isteği otomatik kayıt altına alan HTTP logger
- **Standart Hata Yönetimi** — Tutarlı ve açıklayıcı hata yanıtları
- **Raporlama** — Toplam, tamamlanan ve bekleyen görev istatistikleri
- **Postman Koleksiyonu** — Hazır test koleksiyonu ve ortam dosyası dahil

---

## 🛠 Tech Stack

| Teknoloji | Versiyon | Kullanım Amacı |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ | Çalışma ortamı |
| [Express.js](https://expressjs.com/) | ^5.2.1 | Web framework |
| [nodemon](https://nodemon.io/) | ^3.1.14 | Geliştirme ortamı hot-reload |
| [supertest](https://github.com/ladjs/supertest) | ^7.2.2 | HTTP entegrasyon testleri |

---

## 📋 Requirements

- **Node.js** v18.0.0 veya üzeri
- **npm** v8.0.0 veya üzeri

Node.js versiyonunuzu kontrol etmek için:

```bash
node --version
npm --version
```

---

## 🚀 Installation

Projeyi yerel ortamınıza kurmak için aşağıdaki adımları takip edin:

1. **Repoyu klonlayın**

```bash
git clone <repository-url>
cd TNC_Backend
```

2. **Proje dizinine gidin**

```bash
cd TNC_Backend
```

3. **Bağımlılıkları yükleyin**

```bash
npm install
```

4. **Ortam değişkenlerini yapılandırın** *(isteğe bağlı)*

   İsterseniz `.env` dosyası oluşturun veya sisteminizde ortam değişkeni tanımlayın. Varsayılan değerler ile doğrudan çalışmaya başlayabilirsiniz.

5. **Uygulamayı başlatın**

```bash
npm start
```

Uygulama `http://localhost:3000` adresinde çalışmaya başlayacaktır.

---

## ▶️ Running the App

### Development (Geliştirme Modu)

Dosya değişikliklerini otomatik algılar ve sunucuyu yeniden başlatır:

```bash
npm run dev
```

### Production (Üretim Modu)

```bash
npm start
```

Başarılı başlatma çıktısı:

```
TaskFlow API running on http://localhost:3000
```

---

## 🔧 Environment Variables

Uygulama aşağıdaki ortam değişkenlerini destekler. Tümünün varsayılan değeri mevcuttur; herhangi bir `.env` dosyası oluşturmak **zorunlu değildir**.

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `PORT` | `3000` | Sunucunun dinleyeceği HTTP portu |
| `NODE_ENV` | `development` | Uygulama ortamı (`development` / `production`) |

Örnek kullanım (PowerShell):

```powershell
$env:PORT = "8080"
$env:NODE_ENV = "production"
npm start
```

Örnek kullanım (Bash/Linux/macOS):

```bash
PORT=8080 NODE_ENV=production npm start
```

---

## 📡 API Reference

Taban URL: `http://localhost:3000`

Tüm yanıtlar `Content-Type: application/json` formatındadır.

---

### Root

#### `GET /`

Uygulamanın çalışıp çalışmadığını kontrol eder.

```bash
curl http://localhost:3000/
```

**Yanıt — 200 OK**

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

### Health Check

#### `GET /health`

Servisin sağlık durumunu döndürür.

```bash
curl http://localhost:3000/health
```

**Yanıt — 200 OK**

```json
{
  "status": "healthy",
  "timestamp": "2026-10-18T18:40:00.000Z"
}
```

---

### Tasks

#### `GET /tasks` — Görevleri Listele

Tüm görevleri getirir. Filtreleme, sayfalama ve sıralama desteklenir.

**Query Parametreleri**

| Parametre | Tip | Açıklama | Örnek |
|---|---|---|---|
| `status` | string | Duruma göre filtrele | `todo`, `in_progress`, `done` |
| `priority` | string | Önceliğe göre filtrele | `low`, `medium`, `high` |
| `assignee` | string | Atanan kişiye göre filtrele | `Ali` |
| `keyword` | string | Başlık/açıklamada arama yap | `backend` |
| `page` | number | Sayfa numarası (varsayılan: 1) | `1` |
| `limit` | number | Sayfa başı kayıt (varsayılan: 10) | `10` |
| `sortBy` | string | Sıralama alanı | `createdAt`, `priority` |
| `sortOrder` | string | Sıralama yönü | `asc`, `desc` |

```bash
curl "http://localhost:3000/tasks?status=todo&priority=high&page=1&limit=10&sortBy=createdAt&sortOrder=desc"
```

**Yanıt — 200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "API geliştirmesi",
      "description": "Backend servisini tamamla",
      "priority": "high",
      "assignee": "Ali",
      "status": "todo",
      "createdAt": "2026-10-18T18:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

---

#### `POST /tasks` — Görev Oluştur

Yeni bir görev oluşturur.

**Request Body**

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `title` | string | ✅ Evet | Görev başlığı |
| `description` | string | ✅ Evet | Görev açıklaması |
| `priority` | string | ❌ Hayır | `low` / `medium` / `high` |
| `assignee` | string | ❌ Hayır | Görevi atanan kişi |
| `status` | string | ❌ Hayır | `todo` / `in_progress` / `done` |

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Yeni görev",
    "description": "Backend geliştirme için yapılacak görev",
    "priority": "high",
    "assignee": "Ali",
    "status": "todo"
  }'
```

**Yanıt — 201 Created**

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 2,
    "title": "Yeni görev",
    "description": "Backend geliştirme için yapılacak görev",
    "priority": "high",
    "assignee": "Ali",
    "status": "todo"
  }
}
```

---

#### `GET /tasks/:id` — Görev Detayı

Belirli bir görevi ID'ye göre getirir.

```bash
curl http://localhost:3000/tasks/1
```

**Yanıt — 200 OK**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "API geliştirmesi",
    "description": "Backend servisini tamamla",
    "priority": "high",
    "assignee": "Ali",
    "status": "todo"
  }
}
```

**Yanıt — 404 Not Found**

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

#### `PUT /tasks/:id` — Görev Güncelle

Mevcut bir görevi günceller. `title` ve `description` alanları zorunludur.

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Görev güncellendi",
    "description": "Açıklama güncellendi",
    "priority": "medium",
    "status": "in_progress"
  }'
```

**Yanıt — 200 OK**

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "title": "Görev güncellendi",
    "description": "Açıklama güncellendi",
    "priority": "medium",
    "status": "in_progress"
  }
}
```

---

#### `DELETE /tasks/:id` — Görev Sil

Belirli bir görevi kalıcı olarak siler.

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

**Yanıt — 200 OK**

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### Reports

#### `GET /reports/summary` — Rapor Özeti

Görev istatistiklerinin özetini döndürür.

```bash
curl http://localhost:3000/reports/summary
```

**Yanıt — 200 OK**

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

### Error Responses

Uygulama tüm hataları standart bir formatta döndürür.

| HTTP Kodu | Açıklama |
|---|---|
| `400` | Validation hatası — eksik veya geçersiz alan |
| `404` | Kaynak bulunamadı |
| `500` | Sunucu taraflı beklenmeyen hata |

**Örnek — 400 Validation Hatası**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      "title is required and must be a non-empty string",
      "description is required and must be a non-empty string"
    ]
  }
}
```

---

## 🧪 Running Tests

Entegrasyon testlerini çalıştırmak için:

```bash
node --test tests/tasks.test.js
```

Testler aşağıdaki senaryoları kapsar:

- `GET /health` endpoint'i sağlıklı yanıt veriyor mu?
- `POST /tasks` ile görev başarıyla oluşturuluyor mu?
- Filtreleme ve sayfalama parametreleri doğru çalışıyor mu?
- `GET /reports/summary` doğru istatistik döndürüyor mu?
- Validation hataları beklenen formatta mı?
- `404` durumları doğru ele alınıyor mu?

> **Not:** Testler [supertest](https://github.com/ladjs/supertest) kütüphanesi kullanılarak yazılmıştır ve gerçek bir HTTP sunucusu başlatmadan çalışır.

---

## 🗂 Project Structure

```text
TNC_Backend/
├── src/
│   ├── config/
│   │   └── index.js              # PORT, APP_NAME, ENV konfigürasyonu
│   ├── controllers/
│   │   └── taskController.js     # CRUD + raporlama iş mantığı
│   ├── data/
│   │   └── tasks.js              # In-memory görev veri deposu
│   ├── middleware/
│   │   ├── errorHandler.js       # Global hata yakalama middleware
│   │   ├── logger.js             # HTTP istek loglama middleware
│   │   ├── notFound.js           # 404 yakalama middleware
│   │   └── validateTask.js       # Görev girdi doğrulama middleware
│   ├── routes/
│   │   └── taskRoutes.js         # Tüm API route tanımları
│   └── utils/
│       └── AppError.js           # Özel hata sınıfı
├── tests/
│   └── tasks.test.js             # Entegrasyon test dosyası
├── server.js                     # Uygulama giriş noktası
├── package.json
├── .gitignore
├── TaskFlow.postman_collection.json   # Postman koleksiyonu
└── TaskFlow.postman_environment.json  # Postman ortam değişkenleri
```

---

## 🤝 Contributing

Katkıda bulunmak için aşağıdaki adımları izleyin:

1. Bu repoyu fork edin
2. Yeni bir özellik dalı oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: yeni özellik ekle'`)
4. Dalınıza push edin (`git push origin feature/yeni-ozellik`)
5. Bir Pull Request açın

### Kod Stili

- Commit mesajları için [Conventional Commits](https://www.conventionalcommits.org/) standardını benimseyin
- Her yeni özellik veya düzeltme için test yazın
- Mevcut middleware yapısına uygun katmanlı mimariyi koruyun

---

## 📄 License

Bu proje **ISC** lisansı ile lisanslanmıştır.

---

<div align="center">
  <sub>TaskFlow API — Node.js + Express.js ile geliştirilmiştir.</sub>
</div>
