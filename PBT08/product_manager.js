
const products = [
    { id: 1,  name: "iPhone 16",   price: 25990000, category: "phone",     stock: 15,  rating: 4.5 },
    { id: 2,  name: "MacBook Pro", price: 45990000, category: "laptop",    stock: 8,   rating: 4.8 },
    { id: 3,  name: "AirPods Pro", price: 6990000,  category: "accessory", stock: 50,  rating: 4.3 },
    { id: 4,  name: "iPad Air",    price: 16990000, category: "tablet",    stock: 0,   rating: 4.6 },
    { id: 5,  name: "Samsung S24", price: 22990000, category: "phone",     stock: 20,  rating: 4.4 },
    { id: 6,  name: "Dell XPS 15", price: 35990000, category: "laptop",    stock: 5,   rating: 4.7 },
    { id: 7,  name: "Galaxy Buds", price: 3490000,  category: "accessory", stock: 100, rating: 4.1 },
    { id: 8,  name: "Xiaomi Pad 6",price: 7990000,  category: "tablet",    stock: 25,  rating: 4.2 },
    { id: 9,  name: "Pixel 9",     price: 19990000, category: "phone",     stock: 12,  rating: 4.6 },
    { id: 10, name: "ThinkPad X1", price: 32990000, category: "laptop",    stock: 3,   rating: 4.5 },
];

// ----------------------------------------------------------
// Hàm 1: Lọc sản phẩm còn hàng (stock > 0)
// ----------------------------------------------------------
// filter() duyệt từng sản phẩm, giữ lại những cái có stock > 0
function getInStock(products) {
    return products.filter(p => p.stock > 0);
}

// ----------------------------------------------------------
// Hàm 2: Lọc theo category VÀ khoảng giá
// ----------------------------------------------------------
// filter() kiểm tra 3 điều kiện cùng lúc bằng &&
function filterProducts(products, category, minPrice, maxPrice) {
    return products.filter(p =>
        p.category === category &&
        p.price >= minPrice &&
        p.price <= maxPrice
    );
}

// ----------------------------------------------------------
// Hàm 3: Sắp xếp theo giá (tăng/giảm)
// ----------------------------------------------------------
// sort() nhận 1 hàm so sánh: trả về số âm/dương/0
// [...products] = tạo bản copy trước khi sort (không làm hỏng mảng gốc!)
function sortByPrice(products, order = "asc") {
    return [...products].sort((a, b) =>
        order === "asc" ? a.price - b.price : b.price - a.price
    );
}

// ----------------------------------------------------------
// Hàm 4: Tìm sản phẩm rẻ nhất mỗi category
// ----------------------------------------------------------
// reduce() xây dựng 1 object, mỗi key là 1 category
// Với mỗi sản phẩm, nếu category chưa có hoặc giá rẻ hơn → ghi đè
function cheapestByCategory(products) {
    return products.reduce((result, p) => {
        // Nếu category chưa có trong result, HOẶC sản phẩm hiện tại rẻ hơn
        if (!result[p.category] || p.price < result[p.category].price) {
            result[p.category] = p;
        }
        return result;
    }, {});
}

// ----------------------------------------------------------
// Hàm 5: Tính tổng giá trị kho (price × stock mỗi sản phẩm)
// ----------------------------------------------------------
// reduce() cộng dồn: bắt đầu từ 0, mỗi vòng cộng thêm price*stock
function totalInventoryValue(products) {
    return products.reduce((total, p) => total + p.price * p.stock, 0);
}

// ----------------------------------------------------------
// Hàm 6: Tạo mảng { name, formattedPrice }
// ----------------------------------------------------------
// map() biến đổi từng sản phẩm thành 1 object mới chỉ có 2 field
// toLocaleString("vi-VN") định dạng số kiểu Việt Nam: 25.990.000
function formatProductList(products) {
    return products.map(p => ({
        name: p.name,
        formattedPrice: p.price.toLocaleString("vi-VN") + "đ"
    }));
}

// ----------------------------------------------------------
// Hàm 7: Tính rating trung bình toàn bộ
// ----------------------------------------------------------
// reduce() cộng tất cả rating → chia cho số lượng
function averageRating(products) {
    const totalRating = products.reduce((sum, p) => sum + p.rating, 0);
    return (totalRating / products.length).toFixed(2); // Làm tròn 2 chữ số
}

// ----------------------------------------------------------
// Hàm 8: Tìm sản phẩm theo keyword (trong name, không phân biệt hoa/thường)
// ----------------------------------------------------------
// toLowerCase() để so sánh không phân biệt chữ hoa/thường
// includes() kiểm tra chuỗi con có nằm trong chuỗi lớn không
function searchProducts(products, keyword) {
    return products.filter(p =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
    );
}

// ============================================================
// TEST — Chạy và xem kết quả
// ============================================================

console.log("=== 1. SẢN PHẨM CÒN HÀNG ===");
console.log(getInStock(products));
// Kỳ vọng: tất cả trừ iPad Air (stock = 0)

console.log("\n=== 2. ĐIỆN THOẠI 15-25 TRIỆU ===");
console.log(filterProducts(products, "phone", 15000000, 25000000));
// Kỳ vọng: iPhone 16 (25.99tr), Samsung S24 (22.99tr), Pixel 9 (19.99tr)

console.log("\n=== 3. SẮP XẾP THEO GIÁ TĂNG DẦN ===");
console.log(sortByPrice(products, "asc").map(p => `${p.name}: ${p.price.toLocaleString()}đ`));

console.log("\n=== 4. RẺ NHẤT MỖI CATEGORY ===");
console.log(cheapestByCategory(products));
// Kỳ vọng: { phone: Pixel 9, laptop: ThinkPad X1, tablet: Xiaomi Pad 6, accessory: Galaxy Buds }

console.log("\n=== 5. TỔNG GIÁ TRỊ KHO ===");
console.log(totalInventoryValue(products).toLocaleString("vi-VN") + "đ");

console.log("\n=== 6. DANH SÁCH ĐỊNH DẠNG ===");
console.log(formatProductList(products));

console.log("\n=== 7. RATING TRUNG BÌNH ===");
console.log(averageRating(products));

console.log("\n=== 8. TÌM KIẾM 'pro' ===");
console.log(searchProducts(products, "pro"));
// Kỳ vọng: MacBook Pro, AirPods Pro
