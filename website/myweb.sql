create database myweb
go

use myweb
go

-- Bảng người dùng (user tài khoản)
CREATE TABLE Users (
    user_id INT IDENTITY PRIMARY KEY,
    username NVARCHAR(50) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(100),
    role int, -- 'admin' hoặc 'customer'
    created_at DATETIME DEFAULT GETDATE()
);

-- Bảng địa chỉ (nếu cần giao hàng)
CREATE TABLE Addresses (
    address_id INT IDENTITY PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(user_id),
    address_line NVARCHAR(255),
    city NVARCHAR(50),
    district NVARCHAR(50),
    phone NVARCHAR(20)
);

-- Bảng bộ sưu tập
CREATE TABLE Collections (
    collection_id INT IDENTITY PRIMARY KEY,
    collection_name NVARCHAR(100) NOT NULL,
    year_launch NVARCHAR(255),
    image_url NVARCHAR(255)
);

-- Bảng sản phẩm
CREATE TABLE Products (
    product_id INT IDENTITY PRIMARY KEY,
    product_name NVARCHAR(100) NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    image_url NVARCHAR(255),
	price_promotion DECIMAL(18,2) NOT NULL,
	detail NVARCHAR(max),
    collection_id INT FOREIGN KEY REFERENCES Collections(collection_id),
    status int
);

-- Bảng giỏ hàng
CREATE TABLE Cart (
    cart_id INT IDENTITY PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(user_id),
    created_at DATETIME DEFAULT GETDATE()
);

-- Bảng chi tiết giỏ hàng
CREATE TABLE CartItems (
    cart_item_id INT IDENTITY PRIMARY KEY,
    cart_id INT FOREIGN KEY REFERENCES Cart(cart_id),
    product_id INT FOREIGN KEY REFERENCES Products(product_id),
    quantity INT NOT NULL
);

-- Bảng đơn hàng
CREATE TABLE Orders (
    order_id INT IDENTITY PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(user_id),
    total_amount DECIMAL(18,2),
    status int, -- 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'
    order_date DATETIME DEFAULT GETDATE()
);

-- Bảng chi tiết đơn hàng
CREATE TABLE OrderDetails (
    order_detail_id INT IDENTITY PRIMARY KEY,
    order_id INT FOREIGN KEY REFERENCES Orders(order_id),
    product_id INT FOREIGN KEY REFERENCES Products(product_id),
    quantity INT NOT NULL,
    unit_price DECIMAL(18,2),
	pay_method int
);


-- Users
INSERT INTO Users (username, password, email, role) VALUES
('user1', '123456', 'user1@mail.com', 0),
('user2', '123456', 'user2@mail.com', 0),
('user3', '123456', 'user3@mail.com', 0),
('user4', '123456', 'user4@mail.com', 0),
('user5', '123456', 'user5@mail.com', 0),
('user6', '123456', 'user6@mail.com', 0),
('user7', '123456', 'user7@mail.com', 0),
('user8', '123456', 'user8@mail.com', 0),
('admin01', '123456', 'admin01@mail.com', 1),
('admin02','123456','admin02@mail.com', 1);

-- Addresses
INSERT INTO Addresses (user_id, address_line, city, district, phone) VALUES
(1, '123 Đường A', 'Hà Nội', 'Hoàn Kiếm', '0901111111'),
(2, '456 Đường B', 'Hà Nội', 'Cầu Giấy', '0902222222'),
(3, '789 Đường C', 'HCM', 'Quận 1', '0903333333'),
(4, '111 Đường D', 'HCM', 'Quận 3', '0904444444'),
(5, '222 Đường E', 'Đà Nẵng', 'Hải Châu', '0905555555'),
(6, '333 Đường F', 'Đà Nẵng', 'Sơn Trà', '0906666666'),
(7, '444 Đường G', 'Hải Phòng', 'Ngô Quyền', '0907777777'),
(8, '555 Đường H', 'Hải Phòng', 'Lê Chân', '0908888888'),
(9, '666 Đường I', 'Cần Thơ', 'Ninh Kiều', '0909999999'),
(10,'777 Đường J', 'Huế', 'Phú Hội', '0910000000');

-- Collections
INSERT INTO Collections (collection_name, year_launch, image_url) VALUES
(N'Xuân 2023', '2023', 'image/Collections/xuan2023.jpg'),
(N'Hè 2023', '2023', 'image/Collections/he2023.jpg'),
(N'Thu 2023', '2023', 'image/Collections/thu2023.jpg'),
(N'Đông 2023', '2023', 'image/Collections/dong2023.jpg'),
(N'Xuân 2024', '2024', 'image/Collections/xuan2024.jpg'),
(N'Hè 2024', '2024', 'image/Collections/he2024.jpg'),
(N'Thu 2024', '2024', 'image/Collections/thu2024.jpg'),
(N'Đông 2024', '2024', 'image/Collections/dong2024.jpg'),
(N'Special Edition', '2024', 'image/Collections/special.jpg'),
(N'Basic Collection', '2022', 'image/Collections/basic.jpg');

-- Products
INSERT INTO Products (product_name, price, image_url, price_promotion, detail, collection_id, status) VALUES
(N'Váy hoa nhí', 400000, 'image/vay/vay1.jpg', 350000, N'Váy mùa hè nhẹ nhàng, vải cotton thoáng mát', 1, 1),
(N'Váy công sở', 650000, 'image/vay/vay2.jpg', 600000, N'Váy suông thanh lịch, phù hợp môi trường văn phòng', 2, 1),
(N'Váy maxi đi biển', 500000, 'image/vay/vay3.jpg', 450000, N'Váy maxi dài, họa tiết nhiệt đới', 1, 1),
(N'Váy dạ hội', 1500000, 'image/vay/vay4.jpg', 1400000, N'Váy dạ hội sang trọng, chất liệu lụa cao cấp', 2, 1),
(N'Váy bodycon', 700000, 'image/vay/vay5.jpg', 650000, N'Váy ôm body gợi cảm, co giãn tốt', 3, 1),
(N'Váy babydoll', 450000, 'image/vay/vay6.jpg', 400000, N'Váy babydoll dáng rộng, dễ thương', 4, 1),
(N'Váy denim', 550000, 'image/vay/vay7.jpg', 500000, N'Váy jean cá tính, phong cách trẻ trung', 5, 1),
(N'Váy midi xếp ly', 600000, 'image/vay/vay8.jpg', 550000, N'Váy midi xếp ly cổ điển, dễ phối đồ', 6, 1),
(N'Váy xinh ', 800000, 'image/vay/vay9.jpg', 750000, N'Váy len dáng dài, giữ ấm tốt', 7, 1),
(N'Váy hai dây', 350000, 'image/vay/vay10.jpg', 320000, N'Váy hai dây mỏng nhẹ, phù hợp mùa hè', 8, 1);

-- Cart
INSERT INTO Cart (user_id) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10);

-- CartItems
INSERT INTO CartItems (cart_id, product_id, quantity) VALUES
(1,1,2),
(2,2,1),
(3,3,3),
(4,4,1),
(5,5,2),
(6,6,1),
(7,7,2),
(8,8,1),
(9,9,1),
(10,10,2);

-- Orders
INSERT INTO Orders (user_id, total_amount, status) VALUES
(1, 500000, 0),
(2, 750000, 1),
(3, 300000, 2),
(4, 1200000, 1),
(5, 450000, 0),
(6, 2000000, 2),
(7, 650000, 1),
(8, 850000, 0),
(9, 400000, 2),
(10, 1000000, 1);

-- OrderDetails
INSERT INTO OrderDetails (order_id, product_id, quantity, unit_price, pay_method) VALUES
(1,1,2,250000,0),
(2,2,1,500000,1),
(3,3,2,150000,0),
(4,4,3,400000,1),
(5,5,1,800000,0),
(6,6,2,600000,1),
(7,7,1,900000,0),
(8,8,1,1200000,1),
(9,9,1,1500000,0),
(10,10,2,300000,1);

-- Chuẩn hóa image_url của Products
UPDATE Products
SET image_url = CASE
  WHEN LEFT(image_url, 4) IN ('http','HTTP') THEN image_url
  -- img/... -> image/...
  WHEN LOWER(LEFT(image_url, 4)) = 'img/' THEN 'http://localhost:3000/' + REPLACE(image_url, 'img/', 'image/')
  ELSE 'http://localhost:3000/' + REPLACE(LTRIM(image_url), '\','/')
END
WHERE image_url IS NOT NULL AND image_url <> '';

-- Nếu Collections cũng có ảnh:
UPDATE Collections
SET image_url = CASE
  WHEN LEFT(image_url, 4) IN ('http','HTTP') THEN image_url
  WHEN LOWER(LEFT(image_url, 4)) = 'img/' THEN 'http://localhost:3000/' + REPLACE(image_url, 'img/', 'image/')
  ELSE 'http://localhost:3000/' + REPLACE(LTRIM(image_url), '\','/')
END
WHERE image_url IS NOT NULL AND image_url <> '';


UPDATE Products
SET image_url = CASE
  WHEN LEFT(image_url, 4) IN ('http','HTTP') THEN image_url
  WHEN LOWER(LEFT(image_url, 4)) = 'img/' THEN 'http://localhost:3000/' + REPLACE(image_url, 'img/', 'image/')
  ELSE 'http://localhost:3000/' + REPLACE(LTRIM(image_url), '\','/')
END
WHERE image_url IS NOT NULL AND image_url <> '';

-- Váy dài
UPDATE Products SET product_name = N'Váy Dài Nàng Thơ'
WHERE product_name LIKE N'Váy Dài Nàng Th%';

UPDATE Products SET product_name = N'Váy Dài Thanh Lịch'
WHERE product_name LIKE N'Váy Dài Thanh L%';

UPDATE Products SET product_name = N'Váy Dài Gió Hạ'
WHERE product_name LIKE N'Váy Dài Gió H%';

-- Nếu còn dòng tương tự ở Áo, thêm UPDATE tương ứng (chỉ cần sửa đúng chữ có dấu)
/* ===== Váy dài ===== */


UPDATE Products SET product_name = N'Váy Dài Hoàng Hôn'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Vay Dai Hoang Hon%';


/* ===== Váy ngắn ===== */
UPDATE Products SET product_name = N'Váy Ngắn Ánh Trăng'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Vay Ng%n Anh Trang';

UPDATE Products SET product_name = N'Váy Ngắn Tinh Khôi'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Vay Ng%n Tinh Khoi';

UPDATE Products SET product_name = N'Váy Ngắn Hàn Phong'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Vay Ng%n Han Phong%';

UPDATE Products SET product_name = N'Váy Ngắn Dáng Xòe Năng Động'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Vay Ng%n Dang Xoe Nang D%ng';


/* ===== Chân váy ===== */
UPDATE Products SET product_name = N'Chân Váy Nắng Mai'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Chan Vay Nang Mai%';

UPDATE Products SET product_name = N'Chân Váy Dịu Dàng'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Chan Vay Diu Dang%';

UPDATE Products SET product_name = N'Chân Váy Cá Tính'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Chan Vay Ca Tinh%';

-- Trường hợp bị hiển thị "N? Tính" → 'Nữ Tính'
UPDATE Products SET product_name = N'Chân Váy Vintage Nữ Tính'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Chan Vay Vintage%Tinh%' OR product_name LIKE N'%Vintage N? Tính%';

UPDATE Products SET product_name = N'Chân Váy Denim Cá Tính'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Chan Vay Denim Ca Tinh%';

UPDATE Products SET product_name = N'Chân Váy Layer Dịu Dàng'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Chan Vay Layer Diu Dang%';


/* ===== Áo ===== */
UPDATE Products SET product_name = N'Áo Basic Năng Động'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Ao Basic Nang D%ng';

UPDATE Products SET product_name = N'Áo Sơ Mi Thanh Xuân'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Ao So Mi Thanh Xuan%';

UPDATE Products SET product_name = N'Áo Kiểu Phá Cách'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Ao Ki%u Pha Cach';

-- Các tên hay bị "?" mất dấu
UPDATE Products SET product_name = N'Áo Kiểu Tay Phồng Tiểu Thư'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Ao Kieu Tay Phong Tieu Thu%' 
   OR product_name LIKE N'Áo Ki?u Tay Ph?ng Ti?u Th%';

UPDATE Products SET product_name = N'Áo Kiểu Cổ Vuông Trẻ Trung'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Ao Kieu Co Vuong Tre Trung%'
   OR product_name LIKE N'Áo Ki?u C? Vuông Tr? Trung%';


/* ===== Set bộ ===== */
UPDATE Products SET product_name = N'Set Bộ Dạo Phố'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Set B% D%o Ph%';

UPDATE Products SET product_name = N'Set Bộ Công Sở'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Set B% Cong S%';

UPDATE Products SET product_name = N'Set Bộ Sang Trọng'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Set B% Sang Tr%ng';

UPDATE Products SET product_name = N'Set Bộ Thanh Lịch Công Sở'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Set B% Thanh L%ch Cong So%';


/* ===== Một số tên chung khác (nếu bạn có) ===== */
UPDATE Products SET product_name = N'Váy dạ hội'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Vay da hoi%';

UPDATE Products SET product_name = N'Váy công sở'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Vay cong so%';

UPDATE Products SET product_name = N'Váy maxi đi biển'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Vay maxi di bien%';

UPDATE Products SET product_name = N'Váy bodycon'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Vay bodycon%';

UPDATE Products SET product_name = N'Váy babydoll'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Vay babydoll%';

UPDATE Products SET product_name = N'Váy denim'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Vay denim%';

UPDATE Products SET product_name = N'Váy hoa nhí'
WHERE product_name COLLATE Vietnamese_CI_AI LIKE 'Vay hoa nhi%';



-- Váy dài
INSERT INTO Products (product_name, price, image_url, price_promotion, detail, collection_id, status)
VALUES 
(N'Váy Dài Nàng Thơ', 350000, 'image/VayDai/vay1.png', 320000, N'Thiết kế dài thướt tha, phù hợp dự tiệc và dạo phố', 4, 1),
(N'Váy Dài Hoàng Hôn', 420000, 'image/VayDai/vay2.png', 390000, N'Gam màu ấm áp, tạo điểm nhấn sang trọng', 4, 1),
(N'Váy Dài Thanh Lịch', 390000, 'image/VayDai/vay3.jpg', 360000, N'Phong cách công sở nhẹ nhàng và tinh tế', 3, 1),
(N'Váy Dài Gió Hạ', 450000, 'image/VayDai/vay4.jpg', 420000, N'Chất liệu thoáng mát, trẻ trung, dễ phối đồ', 1, 1);

-- Chân váy
INSERT INTO Products (product_name, price, image_url, price_promotion, detail, collection_id, status)
VALUES 
(N'Chân Váy Nắng Mai', 250000, 'image/ChanVay/cv1.jpg', 230000, N'Kiểu dáng công sở thanh lịch', 2, 1),
(N'Chân Váy Dịu Dàng', 270000, 'image/ChanVay/cv2.jpg', 250000, N'Form xòe mềm mại, tôn dáng', 2, 1),
(N'Chân Váy Cá Tính', 220000, 'image/ChanVay/cv3.jpg', 200000, N'Thiết kế ngắn hiện đại, phù hợp dạo phố', 2, 1),
(N'Chân váy Vintage Nữ Tính', 350000, 'image/ChanVay/cv4.jpg', 299000, N'Chân váy phong cách cổ điển, dễ phối cùng áo sơ mi', 2, 1),
(N'Chân váy Denim Cá Tính', 310000, 'image/ChanVay/cv5.jpg', 299000, N'Chân váy jean trẻ trung, năng động', 2, 1),
(N'Chân váy Layer Dịu Dàng', 330000, 'image/ChanVay/cv6.jpg', 309000, N'Chân váy xếp tầng bồng bềnh, tạo nét nữ tính', 3, 1);

-- Váy ngắn
INSERT INTO Products (product_name, price, image_url, price_promotion, detail, collection_id, status)
VALUES 
(N'Váy Ngắn Ánh Trăng', 300000, 'image/VayNgan/vn1.jpg', 280000, N'Phù hợp tiệc nhẹ, phong cách trẻ trung', 3, 1),
(N'Váy Ngắn Tinh Khôi', 280000, 'image/VayNgan/vn2.jpg', 260000, N'Form dáng công sở thanh lịch', 3, 1),
(N'Váy Ngắn Hàn Phong', 310000, 'image/VayNgan/vn3.jpg', 290000, N'Thiết kế trẻ trung phong cách Hàn Quốc', 3, 1),
(N'Váy Ngắn Dáng Xòe Năng Động', 350000, 'image/VayNgan/vn4.jpg', 329000, N'Váy ngắn xòe trẻ trung, phù hợp dạo phố hoặc đi chơi', 3, 1);

-- Set bộ
INSERT INTO Products (product_name, price, image_url, price_promotion, detail, collection_id, status)
VALUES 
(N'Set Bộ Dạo Phố', 500000, 'image/SetBo/bo1.jpg', 470000, N'Phong cách trẻ trung, tiện lợi đi chơi', 3, 1),
(N'Set Bộ Công Sở', 520000, 'image/SetBo/bo2.jpg', 490000, N'Thanh lịch và chuyên nghiệp cho môi trường làm việc', 4, 1),
(N'Set Bộ Sang Trọng', 550000, 'image/SetBo/bo3.jpg', 520000, N'Thiết kế cao cấp cho các buổi tiệc', 2, 1),
(N'Set Bộ Thanh Lịch Công Sở', 520000, 'image/SetBo/bo4.jpg', 500000, N'Set áo và quần/váy phối hợp sẵn, phù hợp môi trường công sở', 4, 1);

-- Áo
INSERT INTO Products (product_name, price, image_url, price_promotion, detail, collection_id, status)
VALUES 
(N'Áo Basic Năng Động', 180000, 'image/Ao/ao1.jpg', 160000, N'Áo thun trơn thoải mái, dễ phối', 2, 1),
(N'Áo Sơ Mi Thanh Xuân', 220000, 'image/Ao/ao2.jpg', 200000, N'Kiểu dáng công sở hiện đại', 3, 1),
(N'Áo Kiểu Phá Cách', 250000, 'image/Ao/ao3.jpg', 230000, N'Phong cách trẻ trung, thời thượng', 1, 1),
(N'Áo Kiểu Tay Phồng Tiểu Thư', 280000, 'image/AoKieu/ao4.jpg', 239000, N'Áo kiểu tay phồng bồng bềnh, tạo vẻ nữ tính dịu dàng', 2, 1),
(N'Áo Kiểu Cổ Vuông Trẻ Trung', 300000, 'image/AoKieu/ao5.jpg', 299000, N'Áo kiểu cổ vuông, dễ phối cùng chân váy hoặc quần jean', 3, 1);


-- Xóa dữ liệu cũ
DELETE FROM OrderDetails;
DELETE FROM Orders;
DBCC CHECKIDENT ('Orders', RESEED, 0);

-- Thêm 10 đơn hàng mẫu
INSERT INTO Orders (user_id, total_amount, status, order_date)
VALUES 
(1, 0, 1, '2025-05-05'),
(2, 0, 2, '2025-05-12'),
(3, 0, 1, '2025-05-13'),
(4, 0, 3, '2025-05-18'),
(5, 0, 2, '2025-05-30'),
(6, 0, 1, '2025-06-22'),
(7, 0, 1, '2025-06-29'),
(8, 0, 3, '2025-08-22'),
(9, 0, 2, '2025-08-23'),
(10, 0, 1, '2025-08-23');

-- Chèn sản phẩm random cho mỗi đơn
DECLARE @i INT = 1;
WHILE @i <= 10
BEGIN
    -- mỗi đơn có 3-5 sản phẩm ngẫu nhiên
    INSERT INTO OrderDetails (order_id, product_id, quantity, unit_price, pay_method)
    SELECT TOP (3 + ABS(CHECKSUM(NEWID())) % 3)  -- random 3 đến 5 sản phẩm
        @i, 
        p.product_id, 
        1 + ABS(CHECKSUM(NEWID())) % 3,          -- random số lượng 1-3
        p.price, 
        ABS(CHECKSUM(NEWID())) % 2
    FROM Products p
    ORDER BY NEWID(); -- random product

    SET @i = @i + 1;
END;

-- Cập nhật total_amount cho Orders (tổng tiền theo OrderDetails)
UPDATE o
SET o.total_amount = (
    SELECT SUM(od.quantity * od.unit_price)
    FROM OrderDetails od
    WHERE od.order_id = o.order_id
)
FROM Orders o;
