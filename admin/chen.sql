DBCC CHECKIDENT ('Products', RESEED, 0);
INSERT INTO Products (product_name, price, image_url, price_promotion, detail, collection_id, status) VALUES
(N'Váy Dài Nàng Thơ', 350000, 'image/VayDai/vay1.png', 320000, N'Thiết kế dài thướt tha, phù hợp dự tiệc và dạo phố', 4, 0),
(N'Váy Dài Hoàng Hôn', 420000, 'image/VayDai/vay2.png', 390000, N'Gam màu ấm áp, tạo điểm nhấn sang trọng', 4, 1),
(N'Váy Dài Thanh Lịch', 390000, 'image/VayDai/vay3.jpg', 360000, N'Phong cách công sở nhẹ nhàng, thanh lịch', 3, 1),
(N'Váy Dài Gió Hạ', 450000, 'image/VayDai/vay4.jpg', 420000, N'Chất liệu thoáng mát, trẻ trung, dễ phối đồ', 2, 1),
(N'Chân Váy Nắng Mai', 250000, 'image/ChanVay/cv1.jpg', 230000, N'Kiểu dáng công sở thanh lịch', 2, 1),
(N'Chân Váy Dịu Dàng', 270000, 'image/ChanVay/cv2.jpg', 250000, N'Form xòe mềm mại, tôn dáng', 2, 1),
(N'Chân Váy Cá Tính', 220000, 'image/ChanVay/cv3.jpg', 200000, N'Thiết kế ngắn hiện đại, phù hợp dạo phố', 2, 1),
(N'Chân Váy Vintage Nữ Tính', 350000, 'image/ChanVay/cv4.jpg', 299000, N'Chân váy phong cách cổ điển, dễ phối cùng áo sơ mi', 2, 1),
(N'Chân Váy Denim Cá Tính', 310000, 'image/ChanVay/cv5.jpg', 299000, N'Chân váy jean trẻ trung, năng động', 2, 1),
(N'Chân Váy Layer Dịu Dàng', 330000, 'image/ChanVay/cv6.jpg', 309000, N'Chân váy xếp tầng bồng bềnh, tạo nét nữ tính', 3, 1),
(N'Váy Ngắn Ánh Trăng', 300000, 'image/VayNgan/vn1.jpg', 280000, N'Phù hợp tiệc nhỏ, phong cách trẻ trung', 3, 1),
(N'Váy Ngắn Tinh Khôi', 320000, 'image/VayNgan/vn2.jpg', 290000, N'Form dáng công sở thanh lịch', 3, 1),
(N'Váy Ngắn Hàn Phong', 310000, 'image/VayNgan/vn3.jpg', 290000, N'Thiết kế trẻ trung phong cách Hàn Quốc', 3, 1),
(N'Váy Ngắn Dáng Xòe Năng Động', 350000, 'image/VayNgan/vn4.jpg', 329000, N'Váy ngắn xòe trẻ trung, phù hợp đi học, đi chơi', 3, 1),
(N'Set Bộ Dạo Phố', 500000, 'image/SetBo/bo1.jpg', 470000, N'Phong cách trẻ trung, tiện lợi đi chơi', 3, 1),
(N'Set Bộ Nàng Thơ', 520000, 'image/SetBo/bo2.jpg', 490000, N'Thuớt tha, duyên dáng, phù hợp tiệc nhỏ', 3, 1),
(N'Set Bộ Sang Trọng', 550000, 'image/SetBo/bo3.jpg', 520000, N'Thiết kế cao cấp cho các buổi tiệc', 2, 1),
(N'Set Bộ Thanh Lịch Công Sở', 520000, 'image/SetBo/bo4.jpg', 500000, N'Set áo và quần phối hợp, phù hợp môi trường công sở', 4, 1),
(N'Áo 2 Dây Thoáng Mát', 180000, 'image/Ao/ao1.jpg', 160000, N'Áo 2 dây nhẹ nhàng, dễ phối đồ', 2, 1),
(N'Áo Kiểu Bồng Bềnh', 250000, 'image/Ao/ao2.jpg', 200000, N'Kiểu dáng bồng bềnh, nhẹ nhàng', 2, 1),
(N'Áo Kiểu Phá Cách', 230000, 'image/Ao/ao3.jpg', 200000, N'Phong cách trẻ trung, thời thượng', 1, 1),
(N'Áo Kiểu Tay Phồng Tiểu Thư', 280000, 'image/Ao/ao4.jpg', 239000, N'Áo kiểu tay phồng bồng bềnh, tạo vẻ nữ tính dịu dàng', 2, 1),
(N'Áo Kiểu Cổ Vuông Trẻ Trung', 300000, 'image/Ao/ao5.jpg', 299000, N'Áo kiểu cổ vuông, dễ phối cùng chân váy hoặc quần jean', 3, 1),
(N'Váy Dài Test', 400000, 'https://cdn.pixabay.com/photo/2022/07/21/12/37/fashion-7336161_1280.jpg', 400000, N'Váy dài bó sát', 2, 1);
-- Reset lại IDENTITY nếu có
-- Xóa dữ liệu cũ
DELETE FROM OrderDetails;
DELETE FROM Orders;
DBCC CHECKIDENT ('Orders', RESEED, 0);
DBCC CHECKIDENT ('OrderDetails', RESEED, 0);

-- Thêm 15 đơn hàng mẫu
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
(2, 0, 2, '2025-08-23'),
(1, 0, 1, '2025-08-23');

INSERT INTO Orders (user_id, total_amount, status) VALUES
(3, 0, 0), -- đơn 11
(7, 0, 1), -- đơn 12
(5, 0, 2), -- đơn 13
(8, 0, 0), -- đơn 14
(6, 0, 1); -- đơn 15

-- Chèn sản phẩm random cho mỗi đơn
DECLARE @i INT = 1;
WHILE @i <= 15
BEGIN
    -- random 1 phương thức thanh toán cho cả đơn
    DECLARE @pay_method INT = ABS(CHECKSUM(NEWID())) % 2;

    -- mỗi đơn có 3-5 sản phẩm ngẫu nhiên
    INSERT INTO OrderDetails (order_id, product_id, quantity, unit_price, pay_method)
    SELECT TOP (3 + ABS(CHECKSUM(NEWID())) % 3)  -- random 3 đến 5 sản phẩm
        @i, 
        p.product_id, 
        1 + ABS(CHECKSUM(NEWID())) % 3,          -- random số lượng 1-3
        p.price, 
        @pay_method
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

DBCC CHECKIDENT ('Users', RESEED, 10);
DBCC CHECKIDENT ('Addresses', RESEED, 10);