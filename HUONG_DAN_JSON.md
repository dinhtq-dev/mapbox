# Hướng Dẫn Thêm Custom Content Vào JSON

## Cấu Trúc JSON

Mỗi khu vực trong file `districts.json` có cấu trúc như sau:

```json
{
  "type": "Feature",
  "properties": {
    "id": 1,
    "name": "Tên khu vực",
    "type": "Loại khu vực",
    "population": 15000,
    "area": 2.5,
    "description": "Mô tả khu vực",
    "color": "#FF6B6B",
    "custom_field_1": "Giá trị tùy chỉnh",
    "custom_field_2": "Giá trị khác"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[...]]
  }
}
```

## Các Field Trong Popup

### Hiển thị riêng (layout đẹp)

| Field | Mô tả | Ví dụ |
|-------|--------|--------|
| `name` | Tiêu đề popup | `"Khu Hòa Khánh"` |
| `type` | Badge loại khu vực | `"Thương mại"` |
| `description` | Đoạn mô tả | `"Khu vực trung tâm..."` |
| `image` | URL ảnh | `"https://..."` hoặc `"/images/xxx.jpg"` |
| `population` | Dân số (số) | `85000` |
| `area` | Diện tích (số, km²) | `12.5` |

### Chỉ dùng cho style (không hiện trong popup)

| Field | Mô tả |
|-------|--------|
| `id` | ID nội bộ |
| `color` | Màu trên bản đồ (hex) |
| `gradientStart`, `gradientEnd`, `gradientDirection` | Gradient header popup & màu layer |

### Tất cả field khác → "Thông tin khác"

Mọi key không nằm trong bảng trên sẽ **tự động** hiển thị trong block **Thông tin khác** (cặp nhãn – giá trị). Bạn chỉ cần thêm vào `properties` trong `districts.json`.

## Thêm Custom Fields

Bạn có thể thêm **bất kỳ** field nào vào `properties`. Các field **không** nằm trong danh sách "Hiển thị riêng" và "Chỉ dùng cho style" sẽ tự động xuất hiện trong block **Thông tin khác** khi click vào khu vực.

### Ví dụ:

```json
{
  "properties": {
    "name": "Khu Trung Tâm",
    "type": "Thương mại",
    "gia_nha": "50 tỷ",
    "so_luong_cua_hang": 150,
    "dien_thoai": "0123456789",
    "website": "https://example.com",
    "mo_ta_chi_tiet": "Đây là khu vực rất đẹp...",
    "bat_ky_field_nao": "Giá trị bất kỳ"
  }
}
```

Tất cả các field này sẽ tự động hiển thị trong popup khi click!

## Ví Dụ Thực Tế

### Thêm thông tin bất động sản:

```json
{
  "properties": {
    "name": "Quận 1",
    "type": "Thương mại",
    "so_bat_dong_san": 500,
    "gia_trung_binh": "30 tỷ/m²",
    "ty_le_cho_thue": "95%",
    "lien_he": "0901234567"
  }
}
```

### Thêm thông tin dân cư:

```json
{
  "properties": {
    "name": "Khu Dân Cư A",
    "type": "Dân cư",
    "so_ho_gia_dinh": 5000,
    "ty_le_do_thi_hoa": "80%",
    "truong_hoc": "5 trường",
    "benh_vien": "2 bệnh viện"
  }
}
```

## Lưu Ý

1. **Tên field**: Có thể dùng tiếng Việt có dấu hoặc tiếng Anh
2. **Giá trị**: Có thể là string, number, hoặc bất kỳ kiểu nào
3. **Tự động hiển thị**: Tất cả fields (trừ các field mặc định) sẽ tự động hiển thị
4. **Màu sắc**: Field `color` dùng để tô màu trên bản đồ, không hiển thị trong popup

## Cách Sửa JSON

1. Mở file `src/data/districts.json`
2. Tìm feature bạn muốn sửa
3. Thêm/sửa các field trong `properties`
4. Lưu file
5. Refresh trình duyệt (hoặc ứng dụng sẽ tự reload)

## Ví Dụ Hoàn Chỉnh

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
        "color": "#FF6B6B",
        "so_cua_hang": 200,
        "gia_thue_tb": "50 triệu/tháng",
        "dien_thoai": "0123456789",
        "email": "info@example.com",
        "ghi_chu": "Khu vực đang phát triển mạnh"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[...]]
      }
    }
  ]
}
```

Khi click vào khu vực này, popup sẽ hiển thị:
- Tên: Khu Trung Tâm
- Loại: Thương mại
- Dân số: 15.000 người
- Diện tích: 2.5 km²
- Mô tả: Khu vực trung tâm thành phố
- **so_cua_hang**: 200
- **gia_thue_tb**: 50 triệu/tháng
- **dien_thoai**: 0123456789
- **email**: info@example.com
- **ghi_chu**: Khu vực đang phát triển mạnh
