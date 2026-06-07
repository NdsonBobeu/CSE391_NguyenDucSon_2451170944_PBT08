function createCart() {
    // ---- PRIVATE DATA (không ai ngoài cart này chạm được) ----
    let items = [];       // Danh sách sản phẩm trong giỏ
    let discountAmount = 0; // Số tiền được giảm (0 nếu chưa dùng mã)

    // ---- HELPER: Định dạng số tiền kiểu Việt Nam ----
    const formatMoney = (n) => n.toLocaleString("vi-VN") + "đ";

    return {
        // ------------------------------------------------------
        // Thêm sản phẩm vào giỏ
        // Nếu đã có (cùng id) → chỉ tăng quantity lên
        // Nếu chưa có → thêm mới với quantity được truyền vào
        // ------------------------------------------------------
        addItem(product, quantity = 1) {
            // Kiểm tra sản phẩm đã có trong giỏ chưa
            const existing = items.find(item => item.id === product.id);

            if (existing) {
                // Đã có → chỉ tăng số lượng (dùng spread để không sửa object gốc)
                existing.quantity += quantity;
            } else {
                // Chưa có → thêm mới vào mảng items
                items.push({ ...product, quantity });
            }
        },

        // ------------------------------------------------------
        // Xóa sản phẩm khỏi giỏ theo id
        // filter() trả về mảng mới không chứa sản phẩm cần xóa
        // ------------------------------------------------------
        removeItem(productId) {
            items = items.filter(item => item.id !== productId);
        },

        // ------------------------------------------------------
        // Cập nhật số lượng sản phẩm
        // Nếu newQuantity <= 0 → tự động xóa sản phẩm đó
        // ------------------------------------------------------
        updateQuantity(productId, newQuantity) {
            if (newQuantity <= 0) {
                // Số lượng = 0 nghĩa là xóa khỏi giỏ
                this.removeItem(productId);
            } else {
                // map() tạo mảng mới, chỉ thay đổi item đúng id
                items = items.map(item =>
                    item.id === productId
                        ? { ...item, quantity: newQuantity } // Cập nhật item này
                        : item                               // Giữ nguyên item khác
                );
            }
        },

        // ------------------------------------------------------
        // Tính tổng tiền (TRƯỚC khi giảm giá)
        // reduce() cộng dồn price * quantity của từng sản phẩm
        // ------------------------------------------------------
        getTotal() {
            const subtotal = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0 // Giá trị khởi đầu
            );
            // Trừ đi số tiền giảm, nhưng không để âm (tối thiểu = 0)
            return Math.max(0, subtotal - discountAmount);
        },

        // ------------------------------------------------------
        // Áp dụng mã giảm giá
        // "SALE10" → giảm 10% tổng tiền
        // "SALE20" → giảm 20% tổng tiền
        // "FREESHIP" → giảm cố định 30.000đ
        // ------------------------------------------------------
        applyDiscount(code) {
            // Tính tổng trước khi giảm (không tính discountAmount cũ)
            const subtotal = items.reduce(
                (sum, item) => sum + item.price * item.quantity, 0
            );

            if (code === "SALE10") {
                discountAmount = subtotal * 0.1;
                console.log(`✅ Áp dụng mã SALE10 — Giảm 10%: -${formatMoney(discountAmount)}`);
            } else if (code === "SALE20") {
                discountAmount = subtotal * 0.2;
                console.log(`✅ Áp dụng mã SALE20 — Giảm 20%: -${formatMoney(discountAmount)}`);
            } else if (code === "FREESHIP") {
                discountAmount = 30000;
                console.log(`✅ Áp dụng mã FREESHIP — Giảm phí ship: -${formatMoney(discountAmount)}`);
            } else {
                console.log(`❌ Mã "${code}" không hợp lệ!`);
            }
        },

        // ------------------------------------------------------
        // In giỏ hàng ra console dạng bảng dễ đọc
        // ------------------------------------------------------
        printCart() {
            if (items.length === 0) {
                console.log("🛒 Giỏ hàng trống!");
                return;
            }

            console.log("\n┌─────────────────────────────────────────────────────────┐");
            console.log("│  #  │ Sản phẩm         │ SL │ Đơn giá       │ Thành tiền  │");
            console.log("├─────────────────────────────────────────────────────────┤");

            items.forEach((item, index) => {
                const lineTotal = item.price * item.quantity;
                // padEnd() thêm khoảng trắng để căn cột cho đẹp
                const no       = String(index + 1).padEnd(3);
                const name     = item.name.padEnd(17);
                const qty      = String(item.quantity).padStart(2);
                const price    = item.price.toLocaleString("vi-VN").padStart(13);
                const total    = lineTotal.toLocaleString("vi-VN").padStart(11);
                console.log(`│  ${no}│ ${name}│ ${qty} │ ${price} │ ${total} │`);
            });

            console.log("├─────────────────────────────────────────────────────────┤");

            if (discountAmount > 0) {
                const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
                console.log(`│  Tổng chưa giảm:                 ${subtotal.toLocaleString("vi-VN").padStart(13)}đ │`);
                console.log(`│  Giảm giá:                       -${discountAmount.toLocaleString("vi-VN").padStart(12)}đ │`);
            }

            console.log(`│  TỔNG CỘNG:                       ${this.getTotal().toLocaleString("vi-VN").padStart(12)}đ │`);
            console.log("└─────────────────────────────────────────────────────────┘\n");
        },

        // ------------------------------------------------------
        // Đếm tổng số sản phẩm (cộng tất cả quantity lại)
        // Ví dụ: 2 iPhone + 3 AirPods = 5
        // ------------------------------------------------------
        getItemCount() {
            return items.reduce((total, item) => total + item.quantity, 0);
        },

        // ------------------------------------------------------
        // Xóa toàn bộ giỏ hàng, reset về trạng thái ban đầu
        // ------------------------------------------------------
        clearCart() {
            items = [];
            discountAmount = 0;
            console.log("🗑️  Đã xóa toàn bộ giỏ hàng.");
        }
    };
}

// ============================================================
// TEST
// ============================================================

const cart = createCart();

// Thêm sản phẩm
cart.addItem({ id: 1, name: "iPhone 16",   price: 25990000 }, 1);
cart.addItem({ id: 3, name: "AirPods Pro", price: 6990000  }, 2);
cart.addItem({ id: 1, name: "iPhone 16",   price: 25990000 }, 1); // Trùng id → tăng lên 2

console.log("=== GIỎ HÀNG BAN ĐẦU ===");
cart.printCart();
// iPhone 16: SL=2, AirPods Pro: SL=2

console.log("Số sản phẩm:", cart.getItemCount()); // → 4

// Áp dụng mã giảm giá 10%
cart.applyDiscount("SALE10");
console.log("\n=== SAU KHI GIẢM GIÁ 10% ===");
cart.printCart();

// Xóa AirPods Pro
cart.removeItem(3);
console.log("Sau khi xóa AirPods Pro:");
console.log("Số sản phẩm:", cart.getItemCount()); // → 2
cart.printCart();

// Cập nhật số lượng iPhone thành 3
cart.updateQuantity(1, 3);
console.log("Sau khi cập nhật iPhone lên 3 cái:");
cart.printCart();

// Thử mã sai
cart.applyDiscount("VOUCHER999");

// Xóa toàn bộ
cart.clearCart();
cart.printCart(); // → Giỏ hàng trống