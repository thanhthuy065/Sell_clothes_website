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
