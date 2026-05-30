# Analysis: UI-ENHANCE-002

## Risk Classification — UI-ENHANCE-002

**Input type**: change-request
**Risk checklist**: R-02 ✅ (Task thay đổi data model ảnh hưởng existing records), R-09 ✅ (Task không có test coverage hiện tại cho area bị ảnh hưởng)
**Lane**: high-risk
**Lý do**: Thay đổi cấu trúc cơ sở dữ liệu trên Supabase (thêm các cột `onyomi`, `kunyomi` vào bảng `vocabularies`) và sửa đổi logic hiển thị cấu trúc câu / từ vựng.

---

## Các Phương án Thiết kế & Quyết định Kỹ thuật

### 1. Tránh tràn dòng thanh lọc nhanh (Quick Action Bar)
* **Giải pháp**: 
  - Điều chỉnh CSS trong `.quick-action-bar` sử dụng `display: flex; justify-content: space-between; gap: 6px;`.
  - Thiết lập `.quick-pill-btn` có `flex: 1; justify-content: center; padding: 6px 10px; font-size: 13px; white-space: nowrap;`. 
  - Điều này đảm bảo 3 nút luôn co giãn cân đối trên cùng một dòng ngang, kể cả trên các thiết bị màn hình nhỏ (320px - 360px).

### 2. Thiết lập nút "Ngẫu nhiên" thành dạng Toggle State ổn định (Stable Shuffle)
* **Vấn đề UX**: Nếu dùng `Math.random()` trực tiếp trong `useMemo` tính toán active cards, mỗi khi người dùng tick thuộc/chưa thuộc (`studyResponses` thay đổi), danh sách sẽ bị xáo trộn lại từ đầu, khiến thẻ học bị nhảy lộn xộn.
* **Giải pháp (Stable Rank Shuffle)**:
  - Khai báo một state toggle: `const [isShuffled, setIsShuffled] = useState(false);`.
  - Sử dụng một `useRef` lưu trữ trọng số ngẫu nhiên của các thẻ: `const cardRanks = useRef({});`.
  - Khi nạp thẻ từ API (`originalCards` thay đổi), gán cho mỗi thẻ một rank ngẫu nhiên từ 0 đến 1:
    ```javascript
    useEffect(() => {
      const ranks = {};
      originalCards.forEach(c => { ranks[c.id] = Math.random(); });
      cardRanks.current = ranks;
    }, [originalCards]);
    ```
  - Trong `useMemo` tính `activeCards`, nếu `isShuffled` là true, thực hiện sắp xếp danh sách theo rank ngẫu nhiên này:
    ```javascript
    if (isShuffled) {
      result.sort((a, b) => cardRanks.current[a.id] - cardRanks.current[b.id]);
    }
    ```
  - Thiết kế này giúp thứ tự xáo trộn hoàn toàn ổn định suốt phiên học, chỉ thay đổi khi toggle "Ngẫu nhiên" tắt/bật lại.

### 3. Tái cấu trúc Slide của thẻ Mẫu câu (Sentence Card)
* **Giải pháp**: Tái thiết kế hàm `renderCardFaces` với 3 mặt sau:
  - **Mặt 1**: Cấu trúc ngữ pháp. Hiển thị thông tin cột `details` (`card.details`), sử dụng font lớn nổi bật.
  - **Mặt 2**: Câu ví dụ và ý nghĩa. Hiển thị câu tiếng Nhật gốc (`card.kanji` / `card.kana`) và nghĩa tiếng Việt (`card.definition`).
  - **Mặt 3**: Phân tích trợ từ và thành phần câu. Hiển thị danh sách các thành phần phân tách trợ từ (`card.components`).

### 4. Tách biệt âm On/Kun và làm dài câu chuyện Mnemonics chữ Hán
* **Giải pháp**:
  - Thêm cột `onyomi` (TEXT) và `kunyomi` (TEXT) vào bảng `vocabularies`.
  - Trên mặt trước thẻ chữ Hán, hiển thị tách biệt:
    * **Âm On**: `{card.onyomi}`
    * **Âm Kun**: `{card.kunyomi}`
    * (Có fallback hiển thị `On/Kun: {card.kana}` nếu dữ liệu mới chưa được điền).
  - Soạn thảo lại câu chuyện mnemonics giải thích bộ thủ chi tiết cho các thẻ mẫu:
    * **勉 (Miễn)**: Giải nghĩa bộ Lực (力 - sức mạnh: biểu thị sức lực cơ bắp, sự nỗ lực thể chất và tinh thần) cạnh chữ Miễn (免 - tránh né: đại diện cho việc thoát khỏi hoặc tránh né điều xấu). Giải thích logic: Để tránh né (免) khỏi nghèo đói và thất bại, con người bắt buộc phải dùng hết sức lực (力) để cố gắng, nỗ lực (勉).
    * **行 (Hành)**: Giải nghĩa bộ Xích (彳 - bước chân trái: bước đi ngắn bên trái) và bộ Súc (亍 - bước chân phải: bước đi ngắn bên phải). Giải thích logic: Sự kết hợp giữa bước chân trái (彳) và bước chân phải (亍) tạo thành một ngã tư đường hoàn chỉnh, biểu thị hành động di chuyển, đi lại hoặc tiến hành (行).

---

## Files sẽ thay đổi

| File | Loại thay đổi | Ghi chú |
|------|--------------|---------|
| [docs/tasks/UI-ENHANCE-002/schema.sql](file:///c:/project-ai/flash-card-japanese-AI/docs/tasks/UI-ENHANCE-002/schema.sql) | [NEW] | Bản ghi SQL migration thêm các cột `onyomi`, `kunyomi` và seed dữ liệu chi tiết cho Kanji. |
| [src/services/db.js](file:///c:/project-ai/flash-card-japanese-AI/src/services/db.js) | [MODIFY] | Bổ sung ánh xạ `onyomi` và `kunyomi` từ record sang card object. |
| [src/components/FlashcardStudy.jsx](file:///c:/project-ai/flash-card-japanese-AI/src/components/FlashcardStudy.jsx) | [MODIFY] | Tái thiết kế Slide của Mẫu câu và Kanji, chuyển nút Ngẫu nhiên thành Toggle State ổn định. |
| [src/App.css](file:///c:/project-ai/flash-card-japanese-AI/src/App.css) | [MODIFY] | Cập nhật CSS co giãn cho thanh lọc nhanh (Quick Action Bar). |
| [src/services/db.test.js](file:///c:/project-ai/flash-card-japanese-AI/src/services/db.test.js) | [MODIFY] | Cập nhật bộ unit test khẳng định tính đúng đắn của mapping `onyomi` và `kunyomi`. |

---

## Kế hoạch Kiểm thử (Verification Plan)

### Kiểm thử tự động (Automated Tests)
- Chạy `npm run test` kiểm thử db mappings.

### Kiểm thử thủ công (Manual Verification)
1. **Kiểm tra Layout nút lọc**: Co giãn màn hình về kích thước nhỏ nhất (320px), 3 nút lọc nhanh vẫn phải giữ thẳng hàng trên 1 dòng.
2. **Kiểm tra nút Ngẫu nhiên**: Click bật/tắt nút Ngẫu nhiên. Khi bật, thứ tự thẻ học thay đổi. Đi qua các thẻ và đánh giá thuộc/chưa thuộc, thứ tự các thẻ còn lại không được phép tự động nhảy lộn xộn.
3. **Kiểm tra thẻ Mẫu câu**:
   - Mặt 1: Hiện "Cấu trúc: ..."
   - Mặt 2: Hiện "Câu ví dụ tiếng Nhật" + "Ý nghĩa"
   - Mặt 3: Hiện "Phân tích trợ từ"
4. **Kiểm tra thẻ chữ Hán**: Mặt trước hiển thị rõ ràng "Âm On: ..." và "Âm Kun: ...". Mặt sau cấu tạo bộ thủ hiển thị câu chuyện mnemonics giải thích đầy đủ và logic kết hợp chữ.
