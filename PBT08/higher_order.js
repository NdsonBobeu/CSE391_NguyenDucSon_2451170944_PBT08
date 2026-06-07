function pipe(...fns) {
    // pipe() trả về 1 HÀM MỚI (đây là HOF pattern)
    return function(x) {
        // reduce chạy x qua từng hàm một, kết quả truyền tiếp sang hàm sau
        return fns.reduce((result, fn) => fn(result), x);
    };
}

// Demo pipe():
const process = pipe(
    x => x * 2,             // Bước 1: 5 × 2 = 10
    x => x + 10,            // Bước 2: 10 + 10 = 20
    x => x.toString(),      // Bước 3: 20 → "20"
    x => "Kết quả: " + x    // Bước 4: "Kết quả: 20"
);

console.log("=== pipe() ===");
console.log(process(5));  // → "Kết quả: 20"

// Ví dụ thực tế hơn: xử lý văn bản
const cleanText = pipe(
    s => s.trim(),           // Xóa khoảng trắng đầu/cuối
    s => s.toLowerCase(),    // Chuyển thường
    s => s.replace(/\s+/g, "-") // Thay dấu cách bằng dấu -
);
console.log(cleanText("  Hello World  ")); // → "hello-world"


// ----------------------------------------------------------
// 2. memoize() — Cache kết quả để không tính lại
// ----------------------------------------------------------
//
// Ý tưởng: lần đầu gọi f(x) → tính và lưu kết quả vào cache
//          lần sau gọi f(x) cùng tham số → lấy từ cache, không tính lại
//
// Hữu ích khi: hàm nặng, tính toán lâu, kết quả không đổi với cùng input
//
function memoize(fn) {
    const cache = {}; // Kho lưu kết quả — object rỗng ban đầu

    // Trả về hàm mới (HOF) — hàm này có closure trỏ vào cache ở trên
    return function(...args) {
        // Tạo key từ tham số (ví dụ: args = [1000000] → key = "[1000000]")
        const key = JSON.stringify(args);

        if (key in cache) {
            // Đã có trong cache → trả về ngay, không tính lại
            console.log(`(Lấy từ cache cho key: ${key})`);
            return cache[key];
        }

        // Chưa có → tính toán, lưu vào cache, trả về kết quả
        const result = fn(...args);
        cache[key] = result;
        return result;
    };
}

// Demo memoize():
const expensiveCalc = memoize((n) => {
    console.log(`Đang tính tổng từ 0 đến ${n}...`);
    let result = 0;
    for (let i = 0; i < n; i++) result += i;
    return result;
});

console.log("\n=== memoize() ===");
console.log(expensiveCalc(1000000)); // → In "Đang tính..." → 499999500000
console.log(expensiveCalc(1000000)); // → In "(Lấy từ cache)" → 499999500000 (nhanh hơn!)
console.log(expensiveCalc(500));     // → In "Đang tính..." (lần đầu với 500)
console.log(expensiveCalc(500));     // → "(Lấy từ cache)"


// ----------------------------------------------------------
// 3. debounce() — Chờ người dùng ngừng gõ mới thực hiện
// ----------------------------------------------------------
//
// Ý tưởng: mỗi lần gọi → reset bộ đếm thời gian
//          chỉ thực hiện hàm thật khi "im lặng" đủ delay ms
//
// Dùng thực tế: ô tìm kiếm — gõ "i", "ip", "iph"... chỉ tìm sau khi ngừng gõ
//
function debounce(fn, delay) {
    let timeoutId = null; // Lưu id của setTimeout hiện tại

    return function(...args) {
        // Xóa bộ đếm cũ (nếu đang đếm dở)
        clearTimeout(timeoutId);

        // Bắt đầu đếm lại từ đầu
        timeoutId = setTimeout(() => {
            fn(...args); // Chỉ chạy hàm thật sau khi hết delay
        }, delay);
    };
}

// Demo debounce():
console.log("\n=== debounce() ===");

const search = debounce((query) => {
    console.log("Đang tìm kiếm:", query);
}, 500);

// Gọi liên tiếp nhanh → chỉ lần cuối cùng thực sự chạy sau 500ms
search("i");
search("ip");
search("iph");
search("ipho");
search("iphon");
search("iphone"); // ← chỉ cái này được thực thi (sau 500ms không gõ thêm)

console.log("(Các lần gọi trước bị hủy, chỉ 'iphone' được tìm sau 500ms)");


// ----------------------------------------------------------
// 4. retry() — Thử lại tự động nếu gặp lỗi
// ----------------------------------------------------------
//
// Ý tưởng: gọi hàm async → nếu lỗi → thử lại → tối đa maxAttempts lần
//          Nếu tất cả lần đều lỗi → throw error ra ngoài
//
// Dùng thực tế: gọi API không ổn định, đọc file bị lỗi mạng...
//
async function retry(fn, maxAttempts = 3) {
    let lastError; // Lưu lỗi cuối cùng để throw nếu hết lượt

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`  Lần thử #${attempt}...`);
            const result = await fn(); // Thử gọi hàm
            console.log(`  ✅ Thành công ở lần thử #${attempt}`);
            return result; // Thành công → trả kết quả, dừng vòng lặp
        } catch (error) {
            lastError = error;
            console.log(`  ❌ Lần thử #${attempt} thất bại: ${error.message}`);

            if (attempt < maxAttempts) {
                console.log(`  Thử lại sau 200ms...`);
                // Chờ 200ms trước khi thử tiếp (tránh spam server)
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
    }

    // Hết tất cả lượt thử → báo lỗi
    throw new Error(`Thất bại sau ${maxAttempts} lần thử. Lỗi cuối: ${lastError.message}`);
}

// Demo retry():
console.log("\n=== retry() ===");

// Hàm giả lập: thất bại 2 lần đầu, thành công lần 3
let callCount = 0;
const unstableApi = () => {
    return new Promise((resolve, reject) => {
        callCount++;
        if (callCount < 3) {
            reject(new Error("Lỗi kết nối mạng"));  // Giả lập lỗi
        } else {
            resolve({ data: "Dữ liệu từ API" });     // Lần 3 thành công
        }
    });
};

retry(unstableApi, 3)
    .then(result => console.log("Kết quả cuối cùng:", result))
    .catch(err => console.log("Lỗi:", err.message));

// Demo retry thất bại hoàn toàn:
console.log("\n--- Thử với hàm luôn lỗi ---");
const alwaysFail = () => Promise.reject(new Error("Máy chủ không phản hồi"));

retry(alwaysFail, 3)
    .then(result => console.log(result))
    .catch(err => console.log("Kết quả:", err.message));