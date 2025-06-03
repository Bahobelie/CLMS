# 🧪 CLMS System – Setup & Deployment Procedure

## ✅ Step 1: Create the CLMS Database
- Open your database tool (e.g., pgAdmin, MySQL Workbench, or CLI).
- Create a new database named: `CLMS`.
- Create or choose a user and **remember** the:
    - **Username**
    - **Password**

---

## ✅ Step 2: Configure Environment Variables
In the `server` folder, update a file named `.env` with the following content:

```env
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DB_NAME=CLMS
```

> Replace `your_username` and `your_password` with the actual DB credentials.

---

## ✅ Step 3: Install Server Dependencies
Navigate to the server folder:

```bash
cd server
npm install
```

> If installation fails, use the following force command:

```bash
npm install --force
```

---
## ✅ Step 4: Install UI(FrontEnd) Dependencies
Navigate to the root folder:

```bash
cd .. (if u are alerdy on server folder)
npm install
```

> If installation fails, use the following force command:

```bash
npm install --force
```

---

## ✅ Step 5: Start the Server
Start the development server using `nodemon`:

```bash
cd server
nodemon
```

//Make sure the server runs on `http://localhost:4000`.

---

## ✅ Step 6: Run Schema Migration API
After the server is running, go to:

[Post](http://localhost:4000/api/run-schema)

This API seeds the database with constants like lab tests and settings.

### ✅ If successful, you'll see:

```json
{
  "message": "✅ Schema executed successfully"
}
```

### ❌ If failed:
- Check DB credentials in `.env`
- Ensure the DB server is up
- Verify user has proper permissions

---

## ✅ Step 7: Setup & Start the Full Application
Go back to the project root:

```bash
cd ..
npm install
npm start
```

This starts both the frontend and backend together.

---

## 🛠️ Final Notes
- If any errors occur, delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  ```
- Double-check the `.env` file and DB connection
- Watch the terminal output for helpful error messages

