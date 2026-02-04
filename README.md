# Mapbox District Map - Bản Đồ Phân Khu

Ứng dụng React với Mapbox GL JS để hiển thị và phân loại các khu vực trên bản đồ.

## Tính năng

- ✅ Hiển thị bản đồ với Mapbox GL JS (miễn phí)
- ✅ Phân khu và tô màu các khu vực khác nhau
- ✅ Click vào khu vực để xem thông tin chi tiết
- ✅ Hiển thị UI thông tin khi click vào khu vực
- ✅ Dữ liệu từ file JSON
- ✅ Responsive design

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Lấy Mapbox Access Token:
   - Đăng ký tài khoản miễn phí tại: https://account.mapbox.com/
   - Tạo access token tại: https://account.mapbox.com/access-tokens/
   - Copy token và thay thế vào file `src/components/Map.js`:
   ```javascript
   const MAPBOX_TOKEN = 'YOUR_TOKEN_HERE';
   ```

3. Chạy ứng dụng:
```bash
npm start
```

Ứng dụng sẽ chạy tại http://localhost:3000

## Cấu trúc dự án

```
mapbox/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Map.js          # Component bản đồ chính
│   │   ├── Map.css
│   │   ├── DistrictInfo.js # Component hiển thị thông tin khu vực
│   │   └── DistrictInfo.css
│   ├── data/
│   │   └── districts.json  # Dữ liệu các khu vực (GeoJSON)
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Cách sử dụng

### Chế độ xem bản đồ chính:
1. Mở ứng dụng trong trình duyệt
2. Xem bản đồ với các khu vực được tô màu khác nhau
3. Click vào bất kỳ khu vực nào để xem thông tin chi tiết
4. Xem chú thích ở góc dưới bên trái để biết màu sắc của từng khu vực

### Chế độ công cụ lấy tọa độ:
1. Sửa file `src/index.js` để import `AppHelper` thay vì `App`:
   ```javascript
   import AppHelper from './AppHelper';
   ```
2. Chạy ứng dụng và sử dụng công cụ để vẽ polygon và lấy tọa độ GeoJSON
3. Copy kết quả và paste vào file `districts.json`

## Tùy chỉnh dữ liệu

Chỉnh sửa file `src/data/districts.json` để thêm hoặc sửa các khu vực:

- `properties.name`: Tên khu vực
- `properties.type`: Loại khu vực
- `properties.color`: Màu sắc (hex code)
- `geometry.coordinates`: Tọa độ địa lý (longitude, latitude)

## Lưu ý

- Mapbox cung cấp 50,000 lượt load bản đồ miễn phí mỗi tháng
- Để sử dụng với dữ liệu thực tế, bạn cần tọa độ GPS chính xác của các khu vực
- Có thể sử dụng công cụ như GeoJSON.io để tạo dữ liệu GeoJSON từ bản đồ

## License

MIT
