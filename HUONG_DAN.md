# Hướng Dẫn Khắc Phục Lỗi Bản Đồ Không Hiển Thị

## Vấn đề: Bản đồ không hiển thị

### Nguyên nhân chính:
Mapbox token không hợp lệ hoặc chưa được cấu hình.

## Cách khắc phục:

### Bước 1: Lấy Mapbox Token (MIỄN PHÍ)

1. Truy cập: https://account.mapbox.com/
2. Đăng ký tài khoản (hoặc đăng nhập nếu đã có)
3. Vào: https://account.mapbox.com/access-tokens/
4. Copy token của bạn (bắt đầu bằng `pk.eyJ...`)

### Bước 2: Cấu hình Token

**Cách 1: Sử dụng file .env (Khuyến nghị)**

1. Tạo file `.env` trong thư mục gốc của dự án:
```bash
cd /home/macos/Documents/source/mapbox
touch .env
```

2. Thêm dòng sau vào file `.env`:
```
REACT_APP_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw
```
(Thay token trên bằng token của bạn)

3. Khởi động lại ứng dụng:
```bash
npm start
```

**Cách 2: Sửa trực tiếp trong code**

1. Mở file `src/components/Map.js`
2. Tìm dòng:
```javascript
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ...';
```
3. Thay thế token mặc định bằng token của bạn
4. Lưu file và khởi động lại ứng dụng

### Bước 3: Kiểm tra Console

Mở Developer Tools (F12) và kiểm tra tab Console để xem lỗi cụ thể.

## Các lỗi thường gặp:

### Lỗi: "401 Unauthorized"
- **Nguyên nhân**: Token không hợp lệ hoặc đã hết hạn
- **Giải pháp**: Tạo token mới từ Mapbox

### Lỗi: "Style is not valid"
- **Nguyên nhân**: Token không có quyền truy cập style
- **Giải pháp**: Đảm bảo token có quyền truy cập styles

### Bản đồ hiển thị nhưng không có dữ liệu
- **Nguyên nhân**: Dữ liệu GeoJSON không hợp lệ
- **Giải pháp**: Kiểm tra file `src/data/districts.json`

## Kiểm tra nhanh:

1. Mở trình duyệt và vào http://localhost:3000
2. Mở Developer Tools (F12)
3. Kiểm tra tab Console và Network
4. Nếu thấy lỗi về Mapbox token, làm theo Bước 2 ở trên

## Liên hệ hỗ trợ:

Nếu vẫn gặp vấn đề, vui lòng:
- Kiểm tra console để xem lỗi cụ thể
- Đảm bảo đã cài đặt đầy đủ dependencies: `npm install`
- Đảm bảo ứng dụng đang chạy: `npm start`
