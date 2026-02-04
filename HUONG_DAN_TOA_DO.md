# Hướng Dẫn Lấy Tọa Độ GPS Cho Bản Đồ

## Tọa độ là gì?

Tọa độ GPS gồm 2 số:
- **Longitude (Kinh độ)**: -180 đến 180 (âm = Tây, dương = Đông)
- **Latitude (Vĩ độ)**: -90 đến 90 (âm = Nam, dương = Bắc)

Ví dụ: Hà Nội = [105.85, 21.05] (longitude, latitude)

## Các Cách Lấy Tọa Độ

### Cách 1: Sử dụng GeoJSON.io (Dễ nhất - Khuyến nghị) ⭐

1. Truy cập: https://geojson.io/
2. Tìm địa điểm bạn muốn trên bản đồ
3. Click vào biểu tượng **"Draw a polygon"** (hình đa giác) ở menu bên trái
4. Vẽ hình đa giác bao quanh khu vực bạn muốn
5. Bên phải sẽ hiển thị mã GeoJSON với tọa độ
6. Copy phần `coordinates` và paste vào file `districts.json`

**Ưu điểm**: 
- Dễ sử dụng, trực quan
- Tự động tạo GeoJSON format
- Có thể vẽ nhiều khu vực

### Cách 2: Sử dụng Google Maps

1. Mở Google Maps: https://www.google.com/maps
2. Tìm địa điểm bạn muốn
3. **Click chuột phải** vào điểm trên bản đồ
4. Chọn tọa độ hiển thị (sẽ được copy tự động)
5. Format: `21.05, 105.85` (latitude, longitude)
6. **Lưu ý**: Google Maps hiển thị theo thứ tự **lat, lng** nhưng GeoJSON cần **lng, lat**

**Ví dụ**:
- Google Maps: `21.05, 105.85` 
- GeoJSON: `[105.85, 21.05]` (đảo ngược thứ tự!)

### Cách 3: Sử dụng Mapbox Studio

1. Truy cập: https://studio.mapbox.com/
2. Tạo project mới hoặc mở project có sẵn
3. Click vào biểu tượng **"Draw"** (bút chì)
4. Vẽ polygon trên bản đồ
5. Export dữ liệu dưới dạng GeoJSON

### Cách 4: Sử dụng OpenStreetMap với Overpass Turbo

1. Truy cập: https://overpass-turbo.eu/
2. Tìm khu vực bạn muốn
3. Sử dụng query để lấy dữ liệu boundary
4. Export dưới dạng GeoJSON

### Cách 5: Lấy từ API (Cho dữ liệu thực tế)

#### Lấy ranh giới quận/huyện từ OpenStreetMap:

```javascript
// Ví dụ: Lấy ranh giới quận Hoàn Kiếm, Hà Nội
// Sử dụng Overpass API hoặc Nominatim API
```

## Cấu Trúc GeoJSON Polygon

```json
{
  "type": "Feature",
  "properties": {
    "name": "Tên khu vực",
    "color": "#FF6B6B"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [105.8, 21.0],   // Điểm góc 1
      [105.85, 21.0],  // Điểm góc 2
      [105.85, 21.05], // Điểm góc 3
      [105.8, 21.05],  // Điểm góc 4
      [105.8, 21.0]    // Điểm đầu (để đóng polygon)
    ]]
  }
}
```

**Lưu ý quan trọng**:
- Điểm đầu và điểm cuối phải giống nhau (đóng polygon)
- Thứ tự: `[longitude, latitude]` (không phải lat, lng!)
- Polygon phải có ít nhất 4 điểm

## Ví Dụ Thực Tế: Lấy Tọa Độ Quận 1, TP.HCM

### Bước 1: Mở GeoJSON.io
https://geojson.io/

### Bước 2: Tìm Quận 1 trên bản đồ

### Bước 3: Vẽ polygon bao quanh Quận 1

### Bước 4: Copy coordinates từ bên phải

Kết quả sẽ giống như:
```json
{
  "type": "Polygon",
  "coordinates": [[
    [106.6900, 10.7700],
    [106.7000, 10.7700],
    [106.7000, 10.7800],
    [106.6900, 10.7800],
    [106.6900, 10.7700]
  ]]
}
```

## Công Cụ Hỗ Trợ Trong Ứng Dụng

Tôi sẽ tạo một công cụ trong ứng dụng để bạn click trên bản đồ và lấy tọa độ!

## Tọa Độ Một Số Thành Phố Việt Nam

- **Hà Nội**: [105.85, 21.05]
- **TP.HCM**: [106.69, 10.78]
- **Đà Nẵng**: [108.22, 16.07]
- **Hải Phòng**: [106.68, 20.86]
- **Cần Thơ**: [105.79, 10.04]

## Tips

1. **Độ chính xác**: Càng nhiều điểm, polygon càng chính xác
2. **Hiệu năng**: Không nên có quá nhiều điểm (>1000) để tránh lag
3. **Validation**: Luôn kiểm tra polygon có đóng đúng không
4. **Test**: Vẽ xong nên test trên bản đồ để xem có đúng vị trí không
