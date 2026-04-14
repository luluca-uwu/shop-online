const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// REGISTER, tạo hash password trước khi lưu vào database
const bcrypt = require('bcrypt');

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        (err) => {
            if (err) return res.send(err);
            res.send('Register success');
        }
    );
});

// LOGIN, tạo token
const jwt = require('jsonwebtoken');

const SECRET = "mysecretkey";

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

// AUTH, kiểm tra token trước khi tạo order
function authMiddleware(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) return res.send('No token');

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.send('Invalid token');

        req.user = user;
        next();
    });
}
// UI helpers
function saveToken(token) {
    localStorage.setItem("token", token);
}

function getToken() {
    return localStorage.getItem("token");
}

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.token) {
        saveToken(data.token);
        alert("Login thành công!");
    } else {
        alert("Login thất bại");
    }
}

// PRODUCTS
app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, data) => {
        res.send(data);
    });
});

app.post('/products', (req, res) => {
    const { name, price, image } = req.body;
    db.query(
        'INSERT INTO products (name, price, image) VALUES (?, ?, ?)',
        [name, price, image],
        () => res.send('OK')
    );
});

app.delete('/products/:id', (req, res) => {
    db.query('DELETE FROM products WHERE id=?', [req.params.id], () => {
        res.send('OK');
    });
});

// ORDER, tạo order mới với user_id lấy từ token
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

            res.send('Order success');
        }
    );
});

app.listen(3000, () => console.log("Server chạy 3000"));