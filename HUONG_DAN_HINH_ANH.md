# Hướng Dẫn Hiển Thị Hình Ảnh Và Gradient Background

## Card Popup Hiện Đại

Card popup đã được thiết kế lại với:
- ✨ **Glassmorphism effect**: Hiệu ứng kính mờ hiện đại
- 🎨 **Gradient border**: Viền gradient đẹp mắt
- 🖼️ **Hình ảnh với overlay**: Hình ảnh có hiệu ứng overlay gradient
- 📊 **Stats cards**: Thẻ thống kê với hover effects
- 🎯 **Typography đẹp**: Font chữ và spacing tối ưu
- ⚡ **Animations**: Hiệu ứng fade-in mượt mà
- 🎭 **Hover effects**: Hiệu ứng khi di chuột

## Cách Thêm Hình Ảnh Và Gradient Background Vào Popup

Khi click vào một khu vực trên bản đồ, popup sẽ hiển thị card đẹp mắt với hình ảnh và gradient background (nếu có).

### Bước 1: Thêm Trường `image` Và Gradient Vào JSON

Trong file `src/data/districts.json`, thêm các trường sau vào phần `properties` của mỗi feature:

```json
{
  "type": "Feature",
  "properties": {
    "id": 1,
    "name": "Khu Trung Tâm",
    "type": "Thương mại",
    "image": "https://example.com/hinh-anh.jpg",
    "color": "#667eea",
    "gradientStart": "#667eea",
    "gradientEnd": "#764ba2",
    "gradientDirection": "135deg"
  },
  "geometry": {
    ...
  }
}
```

**Các trường gradient:**
- `gradientStart`: Màu bắt đầu của gradient (ví dụ: `#667eea`)
- `gradientEnd`: Màu kết thúc của gradient (ví dụ: `#764ba2`)
- `gradientDirection`: Hướng của gradient (ví dụ: `135deg`, `45deg`, `to right`, `to bottom`)

### Bước 2: Các Cách Thêm Hình Ảnh

#### Cách 1: Sử dụng URL từ Internet
```json
"image": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400"
```

#### Cách 2: Sử dụng hình ảnh trong thư mục `public`
1. Đặt hình ảnh vào thư mục `public/images/`
2. Sử dụng đường dẫn tương đối:
```json
"image": "/images/khu-trung-tam.jpg"
```

#### Cách 3: Sử dụng hình ảnh trong thư mục `src`
1. Đặt hình ảnh vào thư mục `src/images/`
2. Import và sử dụng (cần cập nhật code):
```javascript
import khuTrungTamImage from './images/khu-trung-tam.jpg';
```

### Ví Dụ Hoàn Chỉnh

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": 1,
        "name": "Khu Trung Tâm",
        "type": "Thương mại",
        "population": 15000,
        "area": 2.5,
        "description": "Khu vực trung tâm thành phố",
        "color": "#667eea",
        "gradientStart": "#667eea",
        "gradientEnd": "#764ba2",
        "gradientDirection": "135deg",
        "image": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[...]]
      }
    }
  ]
}
```

## Gradient Background

### Các Gradient Phổ Biến

1. **Gradient Tím-Xanh dương:**
```json
"gradientStart": "#667eea",
"gradientEnd": "#764ba2",
"gradientDirection": "135deg"
```

2. **Gradient Hồng-Đỏ:**
```json
"gradientStart": "#f093fb",
"gradientEnd": "#f5576c",
"gradientDirection": "45deg"
```

3. **Gradient Xanh lá-Xanh dương:**
```json
"gradientStart": "#4facfe",
"gradientEnd": "#00f2fe",
"gradientDirection": "90deg"
```

4. **Gradient Cam-Vàng:**
```json
"gradientStart": "#fa709a",
"gradientEnd": "#fee140",
"gradientDirection": "180deg"
```

### Hướng Gradient (gradientDirection)

- `0deg` hoặc `to top`: Từ dưới lên trên
- `90deg` hoặc `to right`: Từ trái sang phải
- `135deg`: Từ trên trái xuống dưới phải (chéo)
- `45deg`: Từ dưới trái lên trên phải (chéo)
- `180deg` hoặc `to bottom`: Từ trên xuống dưới
- `270deg` hoặc `to left`: Từ phải sang trái

## Lưu Ý

### Về Hình Ảnh:
1. **Định dạng hình ảnh**: Hỗ trợ các định dạng phổ biến: JPG, PNG, GIF, WebP
2. **Kích thước**: Hình ảnh sẽ tự động resize để vừa với popup (max-width: 320px, max-height: 180px)
3. **Lỗi tải hình ảnh**: Nếu URL không hợp lệ, hình ảnh sẽ tự động ẩn đi
4. **Hiệu suất**: Nên sử dụng hình ảnh đã được tối ưu hóa để tải nhanh hơn

### Về Gradient:
1. **Màu sắc**: Sử dụng mã hex color (ví dụ: `#667eea`) hoặc tên màu CSS (ví dụ: `blue`)
2. **Hướng**: Có thể sử dụng độ (deg) hoặc từ khóa (to right, to bottom, etc.)
3. **Mặc định**: Nếu không chỉ định gradient, sẽ sử dụng gradient tím-xanh dương mặc định
4. **Popup**: Gradient sẽ hiển thị ở viền popup và tiêu đề

## Tùy Chỉnh Popup

Nếu muốn tùy chỉnh cách hiển thị popup, bạn có thể chỉnh sửa trong file `src/components/Map.js` tại phần xử lý click:

```javascript
// Tìm phần code này và tùy chỉnh theo ý muốn
map.current.on('click', 'districts-fill', (e) => {
  // ... code hiển thị popup
});
```

## Ví Dụ Với Nhiều Hình Ảnh

Nếu muốn hiển thị nhiều hình ảnh, bạn có thể:

1. Sử dụng mảng trong JSON:
```json
"images": [
  "https://example.com/hinh1.jpg",
  "https://example.com/hinh2.jpg"
]
```

2. Sau đó cập nhật code trong `Map.js` để hiển thị nhiều hình ảnh (cần chỉnh sửa thêm)
