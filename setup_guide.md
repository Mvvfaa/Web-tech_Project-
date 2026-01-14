# Setup Guide — The Candle Co (Web-tech_Project-)

---

## 1. Prerequisites
- Node.js (v16+)
- npm
- MongoDB (Atlas or local)
- install the required dependencies from package.json

---

## 2. Clone & install
```bash
git clone <https://github.com/Mvvfaa/Web-tech_Project-.git>
cd Web-tech_Project-
npm install
```

---

## 3. Create `.env` (project root)
The `.env` file is already pushed in the git repo but here it is to double check:

```

MONGODB_URI=mongodb+srv://mustafa_127_db:aspWRvhT6fonYHZQ@cluster0.n4kip8g.mongodb.net/?appName=Cluster0
PORT=3000
JWT_SECRET=4BmUlCCcaF6LtH5M5XUAYoR23eZ9O6lL9KYUjiHOhueWlgFXTzUM2ynRPI5rgJKBEPZZ4PGasNRsDtNkCx4qmVtAUNmdcLQXvICp
JWT_EXPIRES=8h

```

ADMIN_EMAIL=fa23-bse-127@cuilahore.edu.pk
ADMIN_PASS=batman12

```


---

## 4. Start the server
```bash
npm start

or

start: node server.js
dev: nodemon server.js

Server default: http://localhost:3000
```


---

## 5. Open frontend & test
- Open http://localhost:3000 (or open files in `Frontend (Candelco.)/` if server does not serve static files).
- Register or log in using the site UI.
- Add items to cart → Checkout → Place order.
  - The frontend stores the auth token in `localStorage` under `token` and sends it to protected endpoints.

---
