10.12
// ================== IMPORT MODULES ==================
const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// ================== CẤU HÌNH MULTER ==================
// ================== MULTER CONFIG + VALIDATION ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'public', 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'product-' + unique + path.extname(file.originalname));
  }
});

// Chỉ cho phép JPG/PNG
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('❌ Chỉ cho phép file JPG hoặc PNG'));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // tối đa 2MB
});


// ✅ middleware cho form không có ảnh (sửa user)
const uploadNone = multer().none();


// ================== KHAI BÁO APP EXPRESS ==================
const app = express();

// ================== MIDDLEWARE ==================
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));


// ⚠️ Chỉ parse JSON cho các request không phải upload
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ✅ Phục vụ file tĩnh cho ảnh upload và giao diện admin
// ✅ Phục vụ ảnh từ cả 2 nơi: cũ và mới
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// ================== CẤU HÌNH DATABASE ==================
const dbConfig = {
  user: 'sa', // Thay bằng username SQL Server của bạn
  password: '123456', // Thay bằng password SQL Server
  server: 'localhost', // Hoặc địa chỉ IP máy chủ SQL
  database: 'myweb',
  options: { encrypt: false, trustServerCertificate: true },
};

let pool;
async function connectDB() {
  try {
    pool = await sql.connect(dbConfig);
    console.log('✅ Connected to DB');
  } catch (err) {
    console.error('❌ DB Connection Failed:', err);
  }
}
connectDB();

// Nếu kết nối bị rớt, tự động kết nối lại
async function getPool() {
  if (!pool || !pool.connected) {
    pool = await sql.connect(dbConfig);
    console.log('🔄 Reconnected to DB');
  }
  return pool;
}

// Middleware đảm bảo có kết nối DB trước mỗi request
app.use(async (req, res, next) => {
  try {
    req.pool = await getPool();
    next();
  } catch (err) {
    console.error('DB Connection Failed:', err);
    res.status(500).json({ message: 'Lỗi kết nối cơ sở dữ liệu' });
  }
});


// Hàm kiểm tra đăng nhập chung
async function checkLogin(username, password) {
  const result = await pool.request()
    .input('username', sql.NVarChar, username)
    .query('SELECT * FROM Users WHERE username = @username');
  const user = result.recordset[0];
  if (!user) return { error: 'Tên đăng nhập không tồn tại' };

  let passwordMatch;
  if (user.password.startsWith('$2b$')) {
    passwordMatch = await bcrypt.compare(password, user.password);
  } else {
    passwordMatch = user.password === password;
  }
  if (!passwordMatch) return { error: 'Mật khẩu không đúng' };

  return { user };
}

// Endpoint đăng nhập admin
app.post('/api/auth/admin-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { user, error } = await checkLogin(username, password);
    if (error) return res.status(401).json({ message: error });

    if (user.role !== 1) {
      return res.status(403).json({ message: 'Bạn không có quyền đăng nhập admin' });
    }

    res.json({ message: 'Đăng nhập admin thành công', username: user.username });
  } catch (err) {
    console.error('Login admin error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Endpoint đăng nhập user thường
app.post('/api/auth/user-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { user, error } = await checkLogin(username, password);
    if (error) return res.status(401).json({ message: error });

    if (user.role === 1) {
      return res.status(403).json({ message: 'Bạn không có quyền đăng nhập user' });
    }

    res.json({
      message: 'Đăng nhập user thành công',
      username: user.username,
      //thêm
      token: 'your-jwt-token', // Thêm token (tùy chọn, cần cài jsonwebtoken)
      redirectUrl: '/index.html' // Thêm URL chuyển hướng

    });

  } catch (err) {
    console.error('Login user error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Endpoint đăng ký user
app.post('/api/auth/register', async (req, res) => {
  const { username, password, email, phone, name, role } = req.body;
  try {
    const pool = await sql.connect(dbConfig);
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, hashedPassword)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phone)
      .input('name', sql.NVarChar, name)
      .input('role', sql.Int, role)
      .query('INSERT INTO Users (username, password, email, phone, name, role) OUTPUT INSERTED.user_id VALUES (@username, @password, @email, @phone, @name, @role)');

    const userId = result.recordset[0].user_id;
    res.status(201).json({ message: 'Đăng ký thành công', user_id: userId });
  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    res.status(500).json({ message: 'Lỗi khi đăng ký', error: err.message });
  }
});

// USERS CRUD
app.get('/api/users', async (req, res) => {
  try {
    const result = await req.pool.request().query('SELECT user_id, username, email, role FROM Users');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error: err.message });
  }
});


// ================= GET 1 USER BY ID =================
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID không hợp lệ!' });
    }

    const result = await pool.request()   // ✔ dùng pool, không dùng req.pool
      .input('id', sql.Int, userId)
      .query('SELECT user_id, username, email, role FROM Users WHERE user_id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy user!' });
    }

    return res.json(result.recordset[0]);

  } catch (err) {
    console.error("❌ Lỗi lấy user:", err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});


app.post('/api/users', async (req, res) => {
  const { username, password, email, role } = req.body;
  
  // 1️⃣ Kiểm tra thiếu dữ liệu
  if (!username || !password || !email) {
    return res.status(400).json({
      message: 'Thiếu thông tin bắt buộc'
    });
  }

  // 2️⃣ Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: 'Email không đúng định dạng'
    });
  }

  try {
    // Kiểm tra username hoặc email đã tồn tại
    const checkResult = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .query('SELECT 1 FROM Users WHERE username = @username OR email = @email');

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc email đã tồn tại' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm user mới
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, hashedPassword)
      .input('email', sql.NVarChar, email)
      .input('role', sql.Int, role ?? 0)
      .query(`
        INSERT INTO Users (username, password, email, role)
        OUTPUT INSERTED.user_id
        VALUES (@username, @password, @email, @role)
      `);

    const userId = result.recordset[0].user_id;

    return res.status(201).json({
      message: 'Thêm người dùng thành công!',
      id: userId
    });

  } catch (err) {
    console.error('❌ Insert user error:', err);
    return res.status(500).json({
      message: 'Lỗi khi tạo người dùng',
      error: err.message
    });
  }
});



app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID không hợp lệ!" });
    }

    // ====== KIỂM TRA USER CÓ TỒN TẠI KHÔNG ======
    const check = await pool.request()
      .input('id', sql.Int, userId)
      .query('SELECT 1 FROM Users WHERE user_id = @id');

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: "User không tồn tại!" });
    }

    const { username, email, role } = req.body;

    await pool.request()
      .input('id', sql.Int, userId)
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('role', sql.Int, role)
      .query(`
        UPDATE Users
        SET username = @username, email = @email, role = @role
        WHERE user_id = @id
      `);

    res.json({ message: "Cập nhật user thành công!" });

  } catch (err) {
    console.error(" UPDATE USER ERROR:", err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});



app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID không hợp lệ!" });
    }

    // ====== KIỂM TRA USER CÓ TỒN TẠI KHÔNG ======
    const check = await pool.request()
      .input('id', sql.Int, userId)
      .query('SELECT 1 FROM Users WHERE user_id = @id');

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: "User không tồn tại!" });
    }

    await pool.request()
      .input('id', sql.Int, userId)
      .query('DELETE FROM Users WHERE user_id = @id');

    res.json({ message: "Xóa tài khoản thành công!" });

  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ message: "Lỗi khi xóa người dùng", error: err.message });
  }
});



// USER ADDRESSES CRUD
app.post('/api/addresses', async (req, res) => {
  const { user_id, city, district, address_line, phone } = req.body; // Sử dụng city, address_line thay vì province, address
  try {
    if (!user_id || !city || !district || !address_line || !phone) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (user_id, city, district, address_line, phone)' });
    }
    await req.pool.request()
      .input('user_id', sql.Int, user_id)
      .input('city', sql.NVarChar, city)
      .input('district', sql.NVarChar, district)
      .input('address_line', sql.NVarChar, address_line)
      .input('phone', sql.NVarChar, phone)
      .query('INSERT INTO Addresses (user_id, city, district, address_line, phone) VALUES (@user_id, @city, @district, @address_line, @phone)');
    res.sendStatus(201);
  } catch (err) {
    console.error('Lỗi khi lưu địa chỉ:', err);
    res.status(500).json({ message: 'Lỗi khi lưu địa chỉ', error: err.message });
  }
});

app.get('/api/addresses/:user_id', async (req, res) => {
  try {
    const result = await req.pool.request()
      .input('user_id', sql.Int, req.params.user_id)
      .query('SELECT address_id, user_id, city, district, address_line, phone FROM Addresses WHERE user_id = @user_id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ cho người dùng này' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy địa chỉ', error: err.message });
  }
});



// ================= PRODUCTS CRUD =================
app.get('/api/products', async (req, res) => {
  try {
    let { collection } = req.query;

    let query = "SELECT * FROM Products";
    const request = req.pool.request();

    // Kiểm tra collection_id hợp lệ (không rỗng, là số)
    if (collection !== undefined && collection !== null && collection !== "" && !isNaN(collection)) {
      query += " WHERE collection_id = @collection";
      request.input('collection', sql.Int, parseInt(collection));
    }

    query += " ORDER BY product_id DESC";

    const result = await request.query(query);
    res.json(result.recordset);

  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm", error: err.message });
  }
});
    // ================= GET 1 PRODUCT ==================
    app.get('/api/products/:id', async (req, res) => {
      try {
        const productId = req.params.id;

        if (!productId || isNaN(productId)) {
          return res.status(400).json({ message: "ID không hợp lệ!" });
        }

        const result = await req.pool.request()
          .input('id', sql.Int, productId)
          .query('SELECT * FROM Products WHERE product_id = @id');

        if (result.recordset.length === 0) {
          return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
        }

        res.json(result.recordset[0]);

      } catch (err) {
        console.error("❌ Lỗi GET 1 sản phẩm:", err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
      }
    });



// ➕ ADD PRODUCT (upload ảnh)

// ================== API THÊM SẢN PHẨM ==================
app.post('/api/products', (req, res) => {
  upload.single('image')(req, res, async (err) => {

    // ---- Lỗi do Multer ----
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        message: 'Lỗi upload ảnh!',
        error: err.message
      });
    }

    // ---- Lỗi do sai định dạng ảnh ----
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    // ---- Không có ảnh ----
    if (!req.file) {
      return res.status(400).json({
        message: 'Vui lòng chọn ảnh sản phẩm!'
      });
    }

    // ---- Lấy body ----
    const { product_name, price, price_promotion, detail, collection_id, status } = req.body;

    // ---- Validate dữ liệu ----
    if (!product_name || product_name.trim() === '') {
      return res.status(400).json({ message: 'Tên sản phẩm không được để trống!' });
    }

    if (price && isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ message: 'Giá sản phẩm không hợp lệ!' });
    }

    if (price === undefined || price === null || price === '') {
      return res.status(400).json({ message: 'Giá sản phẩm không được để trống!' });
    }

    if (price_promotion && (isNaN(price_promotion) || Number(price_promotion) <= 0)) {
      return res.status(400).json({ message: 'Giá khuyến mãi không hợp lệ!' });
    }
    if (price_promotion === undefined || price_promotion === null || price_promotion === '') {
      return res.status(400).json({ message: 'Giá khuyến mãi không được để trống!' });
    }

    if (!detail || detail.trim() === '') {
      return res.status(400).json({ message: 'Chi tiết sản phẩm không được để trống!' });
    }

    if (!collection_id || isNaN(collection_id)) {
      return res.status(400).json({ message: 'Bộ sưu tập không hợp lệ!' });
    }


    if (!status || isNaN(status)) {
      return res.status(400).json({ message: 'Trạng thái sản phẩm không hợp lệ' });
    }

    // ---- Lưu vào DB ----
    try {
      const pool = await getPool();
      const relativePath = `/uploads/${req.file.filename}`.replace(/\\/g, '/');


      await pool.request()
        .input('product_name', sql.NVarChar, product_name)
        .input('price', sql.Decimal(18, 2), price)
        .input('image_url', sql.NVarChar, relativePath)
        .input('price_promotion', sql.Decimal(18, 2), price_promotion || 0)
        .input('detail', sql.NVarChar(sql.MAX), detail)
        .input('collection_id', sql.Int, collection_id)
        .input('status', sql.Int, status || 1)
        .query(`
          INSERT INTO Products (product_name, price, image_url, price_promotion, detail, collection_id, status)
          VALUES (@product_name, @price, @image_url, @price_promotion, @detail, @collection_id, @status)
        `);

      return res.status(201).json({ message: 'Thêm sản phẩm thành công!' });

    } catch (error) {
      return res.status(500).json({
        message: 'Lỗi server khi thêm sản phẩm',
        error: error.message
      });
    }
  });
});



// ✅ UPDATE PRODUCT (có thể thay hoặc giữ ảnh cũ)
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const productId = req.params.id;
    const { product_name, price, price_promotion, detail, collection_id, status, image_url } = req.body;

    // ================= VALIDATE =================
    if (!product_name || product_name.trim() === "") {
      return res.status(400).json({ message: "Tên sản phẩm không được để trống!" });
    }

    if (!price || isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ message: "Giá sản phẩm không hợp lệ!" });
    }

    if (price_promotion === undefined || price_promotion === null || price_promotion === "") {
      return res.status(400).json({ message: "Giá khuyến mãi không được để trống!" });
    }

    if (isNaN(price_promotion) || Number(price_promotion) < 0) {
      return res.status(400).json({ message: "Giá khuyến mãi không hợp lệ!" });
    }

    if (!detail || detail.trim() === "") {
      return res.status(400).json({ message: "Chi tiết sản phẩm không được để trống!" });
    }

    if (!collection_id || isNaN(collection_id)) {
      return res.status(400).json({ message: "Bộ sưu tập không hợp lệ!" });
    }

    if (!status || isNaN(status)) {
      return res.status(400).json({ message: "Trạng thái sản phẩm không hợp lệ!" });
    }

    // ================= LẤY ẢNH CŨ =================
    const oldData = await req.pool.request()
      .input('id', sql.Int, productId)
      .query('SELECT image_url FROM Products WHERE product_id = @id');

    if (oldData.recordset.length === 0) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }

    const oldImage = oldData.recordset[0].image_url;

    // ================= ẢNH MỚI HOẶC CŨ =================
    const newImageUrl = req.file
      ? `/uploads/${req.file.filename}`.replace(/\\/g, '/')
      : oldImage.replace(/\\/g, '/');


    // ================= UPDATE DB =================
    await req.pool.request()
      .input('id', sql.Int, productId)
      .input('product_name', sql.NVarChar, product_name)
      .input('price', sql.Decimal(18, 2), price)
      .input('image_url', sql.NVarChar, newImageUrl)
      .input('price_promotion', sql.Decimal(18, 2), price_promotion)
      .input('detail', sql.NVarChar(sql.MAX), detail)
      .input('collection_id', sql.Int, collection_id)
      .input('status', sql.Int, status)
      .query(`
          UPDATE Products
          SET product_name = @product_name,
              price = @price,
              image_url = @image_url,
              price_promotion = @price_promotion,
              detail = @detail,
              collection_id = @collection_id,
              status = @status
          WHERE product_id = @id
        `);

    res.status(200).json({ message: "✅ Cập nhật sản phẩm thành công!", image_url: newImageUrl });

  } catch (err) {
    console.error("Lỗi cập nhật sản phẩm:", err);
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm", error: err.message });
  }
});



// ================= DELETE PRODUCT (có kiểm tra tồn tại) =================
const fs = require('fs');

app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    if (!productId || isNaN(productId)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ!" });
    }

    // 1️⃣ Kiểm tra sản phẩm có tồn tại không
    const check = await req.pool.request()
      .input('id', sql.Int, productId)
      .query('SELECT image_url FROM Products WHERE product_id = @id');

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }

    const imagePath = check.recordset[0].image_url;

    // 2️⃣ Xóa các OrderDetails liên quan
    await req.pool.request()
      .input('product_id', sql.Int, productId)
      .query('DELETE FROM OrderDetails WHERE product_id = @product_id');

    // 3️⃣ Xóa sản phẩm
    await req.pool.request()
      .input('id', sql.Int, productId)
      .query('DELETE FROM Products WHERE product_id = @id');

    // 4️⃣ Xóa file ảnh (nếu có)
    if (imagePath) {
      const fullPath = path.join(__dirname, 'public', imagePath.replace(/^\/+/, ''));

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    return res.status(200).json({ message: "✅ Sản phẩm đã được xóa thành công!" });

  } catch (err) {
    console.error("Lỗi khi xóa sản phẩm:", err);
    return res.status(500).json({
      message: "Lỗi server khi xóa sản phẩm",
      error: err.message
    });
  }
});


// COLLECTIONS CRUD
app.get('/api/collections', async (req, res) => {
  const result = await pool.request().query('SELECT * FROM Collections');
  res.json(result.recordset);
});

app.get('/api/collections/:id', async (req, res) => {
  try {
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Collections WHERE collection_id = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bộ sưu tập' });
    }
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin bộ sưu tập:', error);
    res.status(500).send('Lỗi khi lấy thông tin bộ sưu tập');
  }
});

app.post('/api/collections', upload.single('image'), async (req, res) => {
  try {
    const { collection_name, year_launch } = req.body;

    if (!collection_name || !year_launch) {
      return res.status(400).json({ message: 'Thiếu thông tin bộ sưu tập' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn ảnh bộ sưu tập!' });
    }

    const imagePath = `/uploads/${req.file.filename}`.replace(/\\/g, '/');

    await pool.request()
      .input('collection_name', sql.NVarChar, collection_name)
      .input('year_launch', sql.NVarChar, year_launch)
      .input('image_url', sql.NVarChar, imagePath)
      .query(`
        INSERT INTO Collections (collection_name, year_launch, image_url)
        VALUES (@collection_name, @year_launch, @image_url)
      `);

    res.json({ message: '🎉 Thêm bộ sưu tập thành công!' });

  } catch (err) {
    console.error('Lỗi thêm collection:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});


app.put('/api/collections/:id', upload.single('image'), async (req, res) => {
  try {
    const id = req.params.id;
    const { collection_name, year_launch } = req.body;

    const old = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT image_url FROM Collections WHERE collection_id = @id');

    if (old.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bộ sưu tập' });
    }

    const oldImage = old.recordset[0].image_url;

    const newImage = req.file
      ? `/uploads/${req.file.filename}`
      : oldImage;

    await pool.request()
      .input('id', sql.Int, id)
      .input('collection_name', sql.NVarChar, collection_name)
      .input('year_launch', sql.NVarChar, year_launch)
      .input('image_url', sql.NVarChar, newImage)
      .query(`
        UPDATE Collections
        SET collection_name = @collection_name,
            year_launch = @year_launch,
            image_url = @image_url
        WHERE collection_id = @id
      `);

    res.json({ message: '✔ Cập nhật bộ sưu tập thành công!', image_url: newImage });

  } catch (err) {
    console.error('Lỗi update collection:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});


app.delete('/api/collections/:id', async (req, res) => {
  await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM Collections WHERE collection_id = @id');
  res.sendStatus(200);
});

// ORDERS CRUD
app.get('/api/orders', async (req, res) => {
  const result = await pool.request().query('SELECT * FROM Orders');
  res.json(result.recordset);
});

// Trong server.js, thêm sau các endpoint hiện có
app.post('/api/orders', async (req, res) => {
  const orderData = req.body;
  try {
    // Thêm đơn hàng vào bảng Orders
    const result = await pool.request()
      .input('user_id', sql.Int, 1) // Giả sử user_id mặc định, cần điều chỉnh nếu có login
      .input('total_amount', sql.Decimal(18, 2), orderData.total)
      .input('status', sql.Int, orderData.status)
      .input('order_date', sql.DateTime, orderData.order_date)
      .query('INSERT INTO Orders (user_id, total_amount, status, order_date) OUTPUT INSERTED.order_id VALUES (@user_id, @total_amount, @status, @order_date)');

    const orderId = result.recordset[0].order_id;

    // Thêm chi tiết đơn hàng vào bảng OrderDetails
    const orderDetailsPromises = orderData.items.map(item =>
      pool.request()
        .input('order_id', sql.Int, orderId)
        .input('product_id', sql.Int, item.product_id || 1) // Giả sử product_id, cần lấy từ item nếu có
        .input('quantity', sql.Int, item.quantity)
        .input('unit_price', sql.Decimal(18, 2), item.price_promotion)
        .input('pay_method', sql.Int, 0) // Mặc định COD, cần lấy từ form nếu có
        .query('INSERT INTO OrderDetails (order_id, product_id, quantity, unit_price, pay_method) VALUES (@order_id, @product_id, @quantity, @unit_price, @pay_method)')
    );

    await Promise.all(orderDetailsPromises);

    res.status(201).json({ message: "Đơn hàng đã được lưu thành công", order_id: orderId });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({ message: 'Lỗi khi lưu đơn hàng', error: err.message });
  }
});

// ✅ Cập nhật đơn hàng
// ✅ Cập nhật đơn hàng (hỗ trợ FormData)
app.put('/api/orders/:id', upload.none(), async (req, res) => {
  try {
    console.log("📦 Nhận form cập nhật đơn hàng:", req.body);

    const { user_id, total_amount, status } = req.body;

    if (!user_id || !total_amount || !status) {
      return res.status(400).json({ message: 'Thiếu thông tin đơn hàng!' });
    }

    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('user_id', sql.Int, user_id)
      .input('total_amount', sql.Decimal(18, 2), total_amount)
      .input('status', sql.Int, status)
      .input('order_date', sql.DateTime, new Date())
      .query(`
        UPDATE Orders
        SET user_id = @user_id,
            total_amount = @total_amount,
            status = @status,
            order_date = @order_date
        WHERE order_id = @id
      `);

    res.status(200).json({ message: '✅ Cập nhật đơn hàng thành công' });
  } catch (err) {
    console.error('Lỗi khi cập nhật đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi khi cập nhật đơn hàng', error: err.message });
  }
});


app.delete('/api/orders/:id', async (req, res) => {
  try {
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Orders WHERE order_id = @id');
    res.status(200).json({ message: '✅ Xóa đơn hàng thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi khi xóa đơn hàng', error: err.message });
  }
});


// ORDER DETAILS CRUD
app.get('/api/orderdetails/:order_id', async (req, res) => {
  const result = await pool.request()
    .input('order_id', sql.Int, req.params.order_id)
    .query('SELECT * FROM OrderDetails WHERE order_id = @order_id');
  res.json(result.recordset);
});

app.post('/api/orderdetails', async (req, res) => {
  const { order_id, product_id, quantity, unit_price, pay_method } = req.body;
  await pool.request()
    .input('order_id', sql.Int, order_id)
    .input('product_id', sql.Int, product_id)
    .input('quantity', sql.Int, quantity)
    .input('unit_price', sql.Decimal(18, 2), unit_price)
    .input('pay_method', sql.Int, pay_method)
    .query('INSERT INTO OrderDetails (order_id, product_id, quantity, unit_price, pay_method) VALUES (@order_id, @product_id, @quantity, @unit_price, @pay_method)');
  res.sendStatus(201);
});

app.put('/api/orderdetails/:id', async (req, res) => {
  const { order_id, product_id, quantity, unit_price, pay_method } = req.body;
  await pool.request()
    .input('id', sql.Int, req.params.id)
    .input('order_id', sql.Int, order_id)
    .input('product_id', sql.Int, product_id)
    .input('quantity', sql.Int, quantity)
    .input('unit_price', sql.Decimal(18, 2), unit_price)
    .input('pay_method', sql.Int, pay_method)
    .query('UPDATE OrderDetails SET order_id = @order_id, product_id = @product_id, quantity = @quantity, unit_price = @unit_price, pay_method = @pay_method WHERE order_detail_id = @id');
  res.sendStatus(200);
});

app.delete('/api/orderdetails/:id', async (req, res) => {
  await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM OrderDetails WHERE order_detail_id = @id');
  res.sendStatus(200);
});

// STATS
app.get('/api/stats/revenue/day', async (req, res) => {
  const { pay_method } = req.query;
  let query = `
    SELECT CONVERT(VARCHAR(10), o.order_date, 120) AS date, SUM(od.quantity * od.unit_price) AS revenue
    FROM Orders o
    JOIN OrderDetails od ON o.order_id = od.order_id
  `;
  if (pay_method) {
    query += ` WHERE od.pay_method = @pay_method`;
  }
  query += ` GROUP BY CONVERT(VARCHAR(10), o.order_date, 120)`;
  try {
    const result = await pool.request()
      .input('pay_method', sql.Int, pay_method ? parseInt(pay_method) : null)
      .query(query);
    const data = result.recordset.reduce((acc, row) => ({ ...acc, [row.date]: row.revenue || 0 }), {});
    res.json(data);
  } catch (err) {
    console.error('Revenue day error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

app.get('/api/stats/revenue/month', async (req, res) => {
  const { pay_method } = req.query;
  let query = `
    SELECT CONVERT(VARCHAR(7), o.order_date, 120) AS month, SUM(od.quantity * od.unit_price) AS revenue
    FROM Orders o
    JOIN OrderDetails od ON o.order_id = od.order_id
  `;
  if (pay_method) {
    query += ` WHERE od.pay_method = @pay_method`;
  }
  query += ` GROUP BY CONVERT(VARCHAR(7), o.order_date, 120)`;
  try {
    const result = await pool.request()
      .input('pay_method', sql.Int, pay_method ? parseInt(pay_method) : null)
      .query(query);
    const data = result.recordset.reduce((acc, row) => ({ ...acc, [row.month]: row.revenue || 0 }), {});
    res.json(data);
  } catch (err) {
    console.error('Revenue month error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

app.get('/api/stats/total', async (req, res) => {
  const { pay_method } = req.query;
  try {
    let ordersQuery = 'SELECT COUNT(*) AS total_orders FROM Orders';
    let revenueQuery = 'SELECT SUM(od.quantity * od.unit_price) AS total_revenue FROM Orders o JOIN OrderDetails od ON o.order_id = od.order_id';
    if (pay_method) {
      ordersQuery += ` WHERE EXISTS (SELECT 1 FROM OrderDetails od WHERE od.order_id = Orders.order_id AND od.pay_method = @pay_method)`;
      revenueQuery += ` WHERE od.pay_method = @pay_method`;
    }
    const orders = await pool.request()
      .input('pay_method', sql.Int, pay_method ? parseInt(pay_method) : null)
      .query(ordersQuery);
    const revenue = await pool.request()
      .input('pay_method', sql.Int, pay_method ? parseInt(pay_method) : null)
      .query(revenueQuery);
    res.json({
      total_orders: orders.recordset[0].total_orders,
      total_revenue: revenue.recordset[0].total_revenue || 0
    });
  } catch (err) {
    console.error('Stats total error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

app.get('/api/stats/ordercount/day', async (req, res) => {
  const { pay_method } = req.query;
  let query = `
    SELECT CONVERT(VARCHAR(10), o.order_date, 120) AS date, COUNT(DISTINCT o.order_id) AS order_count
    FROM Orders o
    JOIN OrderDetails od ON o.order_id = od.order_id
  `;
  if (pay_method) {
    query += ` WHERE od.pay_method = @pay_method`;
  }
  query += ` GROUP BY CONVERT(VARCHAR(10), o.order_date, 120)`;
  try {
    const result = await pool.request()
      .input('pay_method', sql.Int, pay_method ? parseInt(pay_method) : null)
      .query(query);
    const data = result.recordset.reduce((acc, row) => ({ ...acc, [row.date]: row.order_count || 0 }), {});
    res.json(data);
  } catch (err) {
    console.error('Order count day error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

app.get('/api/stats/ordercount/month', async (req, res) => {
  const { pay_method } = req.query;
  let query = `
    SELECT CONVERT(VARCHAR(7), o.order_date, 120) AS month, COUNT(DISTINCT o.order_id) AS order_count
    FROM Orders o
    JOIN OrderDetails od ON o.order_id = od.order_id
  `;
  if (pay_method) {
    query += ` WHERE od.pay_method = @pay_method`;
  }
  query += ` GROUP BY CONVERT(VARCHAR(7), o.order_date, 120)`;
  try {
    const result = await pool.request()
      .input('pay_method', sql.Int, pay_method ? parseInt(pay_method) : null)
      .query(query);
    const data = result.recordset.reduce((acc, row) => ({ ...acc, [row.month]: row.order_count || 0 }), {});
    res.json(data);
  } catch (err) {
    console.error('Order count month error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));