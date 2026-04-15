// ================= IMPORT =================
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// ================= INIT =================
const app = express();
const PORT = 3000;
const SECRET = "mysecretkey";

// ================= CONFIG UPLOAD =================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// ================= MIDDLEWARE =================
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

console.log("🔥 Server đang chạy...");

// ================= REGISTER =================
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        (err) => {
            if (err) return res.send(err);
            res.send({ message: 'Register success' });
        }
    );
});

// ================= LOGIN =================
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        async (err, results) => {
            if (err) return res.send(err);

            if (results.length === 0) {
                return res.send({ message: 'User not found' });
            }

            const user = results[0];

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.send({ message: 'Wrong password' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                SECRET,
                { expiresIn: '1h' }
            );

            res.send({ token });
        }
    );
});

// ================= AUTH =================
function authMiddleware(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) return res.send('No token');

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.send('Invalid token');

        req.user = user;
        next();
    });
}

// ================= PRODUCTS =================
app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, data) => {
        if (err) return res.send(err);
        res.send(data);
    });
});

// 👉 ADD PRODUCT (UPLOAD ẢNH)
app.post('/products', upload.single('image'), (req, res) => {
    const { name, price } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : '';

    db.query(
        'INSERT INTO products (name, price, image) VALUES (?, ?, ?)',
        [name, price, image],
        (err) => {
            if (err) return res.send(err);
            res.send({ message: 'Add product success' });
        }
    );
});

app.delete('/products/:id', authMiddleware, (req, res) => {
    db.query('DELETE FROM products WHERE id=?', [req.params.id], () => {
        res.send('OK');
    });
});

// ================= ORDERS =================
app.post('/orders', authMiddleware, (req, res) => {
    const user_id = req.user.id;
    const { cart } = req.body;

    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });

    db.query(
        'INSERT INTO orders (user_id, total) VALUES (?, ?)',
        [user_id, total],
        (err, result) => {
            if (err) return res.send(err);

            const orderId = result.insertId;

            cart.forEach(item => {
                db.query(
                    'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
                    [orderId, item.id, item.quantity]
                );
            });

            res.send({ message: 'Order success' });
        }
    );
});

// ================= START =================
app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});