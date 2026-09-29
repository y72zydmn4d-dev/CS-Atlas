import type { ContentBlock, GlossaryTerm, LearningObjective, TranslationStatus } from "@/lib/types";
import { deepTopicTranslationsVi } from "@/content/translations/deep-vi";

export interface DomainTranslation {
  name: string;
  shortName: string;
  description: string;
}

export interface TopicTranslation {
  title: string;
  summary: string;
  status: TranslationStatus;
  objectives?: LearningObjective[];
  glossary?: GlossaryTerm[];
  content?: ContentBlock[];
}

export const domainTranslationsVi: Record<string, DomainTranslation> = {
  programming: { name: "Lập trình", shortName: "Lập trình", description: "Xây dựng chương trình đáng tin cậy bằng cách làm chủ luồng điều khiển, phân rã, công cụ và các thói quen giúp phần mềm dễ hiểu." },
  "data-structures-algorithms": { name: "Cấu trúc dữ liệu & Thuật toán", shortName: "DSA", description: "Chủ động lựa chọn cách biểu diễn và quy trình, chứng minh tính đúng đắn và hiểu chi phí tăng theo quy mô như thế nào." },
  "mathematics-ai": { name: "Toán học cho AI", shortName: "Toán cho AI", description: "Phát triển ngôn ngữ toán học cần thiết để suy luận về biểu diễn, bất định, học và tối ưu hóa." },
  "data-science": { name: "Khoa học dữ liệu", shortName: "Khoa học dữ liệu", description: "Biến dữ liệu thô thành bằng chứng đáng tin cậy qua biến đổi, khám phá và truyền đạt có khả năng tái lập." },
  "machine-learning": { name: "Học máy", shortName: "Machine Learning", description: "Hiểu mô hình như một hệ thống gồm giả định, hàm mục tiêu, tối ưu và bằng chứng—không chỉ là danh mục thuật toán." },
  "deep-learning": { name: "Học sâu", shortName: "Deep Learning", description: "Hiểu học biểu diễn qua đồ thị tính toán, dòng gradient, kiến trúc và thực nghiệm có kỷ luật." },
  "computer-vision": { name: "Thị giác máy tính", shortName: "Computer Vision", description: "Xây dựng hệ thống trích xuất cấu trúc ngữ nghĩa và hình học từ tín hiệu hình ảnh." },
  nlp: { name: "Xử lý ngôn ngữ tự nhiên", shortName: "NLP", description: "Biểu diễn và mô hình hóa ngôn ngữ trong khi tôn trọng thứ tự, ngữ cảnh, tính mơ hồ và thiết kế đánh giá." },
  "llm-engineering": { name: "Kỹ thuật LLM", shortName: "LLM Engineering", description: "Xây dựng hệ thống mô hình ngôn ngữ đáng tin cậy quanh truy xuất, công cụ, đánh giá, ngữ cảnh và ràng buộc vận hành." },
  "ai-engineering": { name: "Kỹ thuật AI", shortName: "AI Engineering", description: "Đưa mô hình thành sản phẩm đáng tin cậy với giao diện có kiểu, hệ thống phục vụ, đánh giá và khả năng quan sát." },
};

const partial = (title: string, summary: string): TopicTranslation => ({ title, summary, status: "partial" });

export const topicTranslationsVi: Record<string, TopicTranslation> = {
  python: partial("Python", "Sử dụng Python như một công cụ chính xác và biểu đạt tốt cho chương trình, script, dữ liệu và nguyên mẫu thuật toán."),
  "programming-fundamentals": partial("Nền tảng lập trình", "Biến, luồng điều khiển, hàm, kiểu dữ liệu và phân rã tạo nên vốn từ làm việc của lập trình."),
  "object-oriented-programming": partial("Lập trình hướng đối tượng", "Mô hình hóa trạng thái và hành vi bằng đối tượng, composition, interface và các abstraction được lựa chọn cẩn thận."),
  modules: partial("Module & Package", "Tổ chức mã thành các ranh giới gắn kết, tái sử dụng được với giao diện công khai rõ ràng."),
  debugging: partial("Gỡ lỗi", "Giảm bất định một cách có hệ thống bằng tái hiện, quan sát, giả thuyết và kiểm thử tập trung."),
  "git-basics": partial("Git căn bản", "Theo dõi thay đổi có ý nghĩa, làm việc an toàn với branch và hiểu đồ thị commit."),
  "complexity-analysis": partial("Phân tích độ phức tạp", "Mô tả cách thời gian và bộ nhớ tăng theo kích thước đầu vào bằng các cận tiệm cận."),
  arrays: partial("Mảng", "Lưu các phần tử có chỉ số liên tiếp để truy cập thời gian hằng số và duyệt thân thiện với cache."),
  strings: partial("Chuỗi", "Xem văn bản như một dãy có ràng buộc về mã hóa, tính bất biến và xử lý mẫu."),
  "linked-lists": partial("Danh sách liên kết", "Biểu diễn dữ liệu có thứ tự bằng các node nối qua tham chiếu, đánh đổi tốc độ truy cập lấy cập nhật cục bộ."),
  "stacks-queues": partial("Stack & Queue", "Dùng nguyên tắc truy cập LIFO và FIFO để mô hình hóa duyệt, phân tích cú pháp, lập lịch và lịch sử."),
  "hash-tables": partial("Bảng băm", "Ánh xạ khóa vào bucket để tra cứu kỳ vọng thời gian hằng số trong khi quản lý va chạm và dung lượng."),
  trees: partial("Cây", "Mô hình hóa quan hệ phân cấp bằng cấu trúc node đệ quy và các thứ tự duyệt rõ ràng."),
  heaps: partial("Heap", "Duy trì khả năng truy cập nhanh phần tử cực trị bằng cây nhị phân hoàn chỉnh có thứ tự một phần."),
  graphs: partial("Đồ thị", "Biểu diễn thực thể và quan hệ bằng đỉnh, cạnh và cấu trúc kề."),
  recursion: partial("Đệ quy", "Giải bài toán qua các phiên bản nhỏ hơn với điều kiện dừng rõ ràng và trạng thái thu nhỏ."),
  sorting: partial("Sắp xếp", "Sắp lại dữ liệu theo bộ so sánh đồng thời xét tính ổn định, bộ nhớ và cận dưới."),
  searching: partial("Tìm kiếm", "Định vị thông tin bằng cách khai thác cấu trúc, thứ tự hoặc không gian trạng thái có thể duyệt."),
  "graph-traversal": partial("Duyệt đồ thị", "Thăm có hệ thống các trạng thái đồ thị bằng tìm kiếm theo chiều rộng hoặc chiều sâu."),
  "shortest-paths": partial("Đường đi ngắn nhất", "Tìm tuyến có chi phí nhỏ nhất bằng cách chọn đúng thuật toán theo giả định về trọng số cạnh."),
  "greedy-algorithms": partial("Thuật toán tham lam", "Xây dựng lời giải bằng các lựa chọn tối ưu cục bộ được hỗ trợ bởi chứng minh đúng đắn toàn cục."),
  "dynamic-programming": partial("Quy hoạch động", "Tái sử dụng kết quả bài toán con chồng lấp sau khi xác định trạng thái, chuyển tiếp và điều kiện cơ sở."),
  "linear-algebra": partial("Đại số tuyến tính", "Dùng vector, ma trận và phép biến đổi tuyến tính để biểu diễn dữ liệu và mô hình."),
  "vectors-matrices": partial("Vector & Ma trận", "Làm việc với kích thước, tích, chuẩn, phép chiếu và phép biến đổi."),
  eigenvalues: partial("Trị riêng & Vector riêng", "Xác định các hướng được bảo toàn bởi phép biến đổi tuyến tính và hệ số co giãn của chúng."),
  calculus: partial("Giải tích", "Mô tả sự thay đổi, tích lũy và hành vi tuyến tính cục bộ bằng đạo hàm và tích phân."),
  "multivariable-calculus": partial("Giải tích nhiều biến", "Dùng đạo hàm riêng, gradient và Jacobian cho các hàm nhiều biến."),
  probability: partial("Xác suất", "Mô hình hóa bất định bằng biến ngẫu nhiên, phân phối, điều kiện và kỳ vọng."),
  statistics: partial("Thống kê", "Ước lượng, kiểm định và định lượng bất định từ các mẫu hữu hạn."),
  optimization: partial("Tối ưu hóa", "Chọn tham số để cực tiểu hoặc cực đại một hàm mục tiêu dưới các ràng buộc."),
  "gradient-descent": partial("Hạ dốc theo gradient", "Lặp lại việc di chuyển tham số theo hướng ngược gradient của hàm mục tiêu để giảm mất mát."),
  numpy: partial("NumPy", "Tính toán hiệu quả với mảng nhiều chiều có kiểu, broadcasting và phép toán vector hóa."),
  pandas: partial("Pandas", "Biến đổi dữ liệu bảng có nhãn với indexing, join, group và ngữ nghĩa giá trị thiếu rõ ràng."),
  "data-cleaning": partial("Làm sạch dữ liệu", "Phát hiện và xử lý quan sát bị thiếu, trùng lặp, không nhất quán hoặc không hợp lệ."),
  "data-visualization": partial("Trực quan hóa dữ liệu", "Mã hóa dữ liệu thành hình ảnh để bộc lộ cấu trúc mà không làm sai lệch so sánh."),
  "exploratory-data-analysis": partial("Phân tích dữ liệu khám phá", "Khảo sát tập dữ liệu qua phân phối, quan hệ, bất thường và giả thuyết."),
  "feature-processing": partial("Xử lý đặc trưng", "Chuyển quan sát thô thành biểu diễn số sẵn sàng cho mô hình và an toàn trước rò rỉ dữ liệu."),
  "ml-fundamentals": partial("Nền tảng học máy", "Xem việc học là lựa chọn một mô hình từ dữ liệu dưới một hàm mục tiêu và quy trình đánh giá."),
  "supervised-learning": partial("Học có giám sát", "Học ánh xạ từ các ví dụ có nhãn cho bài toán hồi quy hoặc phân loại."),
  "linear-regression": partial("Hồi quy tuyến tính", "Khớp kỳ vọng có điều kiện tuyến tính bằng cách cực tiểu hóa bình phương phần dư."),
  "logistic-regression": partial("Hồi quy logistic", "Mô hình hóa xác suất lớp bằng điểm tuyến tính đi qua hàm logistic."),
  "decision-trees": partial("Cây quyết định", "Chia không gian đặc trưng bằng các luật dễ diễn giải được chọn để giảm độ hỗn tạp."),
  "support-vector-machines": partial("Máy vector hỗ trợ", "Tìm biên quyết định có margin lớn nhất, có thể trong một không gian đặc trưng ngầm."),
  clustering: partial("Phân cụm", "Nhóm các quan sát chưa gán nhãn theo một khái niệm được chọn về độ tương đồng và cấu trúc cụm."),
  "principal-component-analysis": partial("Phân tích thành phần chính", "Chiếu dữ liệu đã chuẩn tâm lên các hướng trực giao có phương sai lớn nhất."),
  "model-evaluation": partial("Đánh giá mô hình", "Ước lượng khả năng tổng quát hóa bằng cách chia dữ liệu an toàn, metric phù hợp và biểu diễn bất định."),
  "ensemble-learning": partial("Học tổ hợp", "Kết hợp các bộ dự đoán đa dạng để giảm phương sai, độ chệch hoặc cả hai."),
  "regression-losses": partial("Hàm mất mát hồi quy", "Chọn hàm mục tiêu có hình học và độ bền phù hợp với loại sai số cần quan tâm."),
  "neural-networks": partial("Mạng nơ-ron", "Kết hợp các phép biến đổi có tham số và học biểu diễn end-to-end."),
  backpropagation: partial("Lan truyền ngược", "Áp dụng hiệu quả quy tắc dây chuyền qua đồ thị tính toán."),
  "activation-functions": partial("Hàm kích hoạt", "Đưa vào các phép biến đổi phi tuyến định hình tín hiệu và dòng gradient."),
  "deep-optimization": partial("Tối ưu học sâu", "Huấn luyện mô hình sâu bằng cập nhật thích nghi, lịch học, normalization và regularization."),
  "convolutional-networks": partial("Mạng tích chập", "Học đặc trưng không gian cục bộ, có tính tịnh tiến bằng các filter dùng chung."),
  "recurrent-networks": partial("Mạng hồi quy", "Xử lý chuỗi qua một trạng thái được cập nhật theo thời gian."),
  transformers: partial("Transformer", "Mô hình hóa phụ thuộc bằng attention, residual stream và biểu diễn có nhận biết vị trí."),
  "image-representation": partial("Biểu diễn hình ảnh", "Biểu diễn ảnh như tín hiệu màu lấy mẫu và suy luận về hình học, kênh màu cùng độ phân giải."),
  "opencv-basics": partial("OpenCV căn bản", "Đọc, biến đổi, lọc và đo ảnh bằng các phép toán thị giác cổ điển."),
  "image-classification": partial("Phân loại ảnh", "Gán nhãn ngữ nghĩa cho ảnh bằng biểu diễn thị giác được học."),
  "object-detection": partial("Phát hiện vật thể", "Định vị và phân loại nhiều vật thể bằng hồi quy bounding box và điểm tin cậy."),
  "image-segmentation": partial("Phân đoạn ảnh", "Dự đoán nhãn ngữ nghĩa hoặc instance ở độ phân giải pixel."),
  "text-preprocessing": partial("Tiền xử lý văn bản", "Chuyển ngôn ngữ thô thành các đơn vị chuẩn hóa trong khi giữ thông tin liên quan đến tác vụ."),
  "word-embeddings": partial("Word embedding", "Biểu diễn đơn vị ngôn ngữ bằng vector đặc được học từ ngữ cảnh."),
  "sequence-models": partial("Mô hình chuỗi", "Mô hình hóa ngôn ngữ có thứ tự bằng trạng thái hồi quy hoặc tích chập."),
  attention: partial("Attention", "Xây dựng biểu diễn phụ thuộc ngữ cảnh bằng cách gán trọng số cho tương tác giữa các token."),
  "nlp-transformers": partial("Transformer cho ngôn ngữ", "Áp dụng kiến trúc self-attention cho học biểu diễn và sinh ngôn ngữ."),
  "llm-transformers": partial("Kiến trúc Transformer của LLM", "Hiểu tokenization, attention, residual stream và giải mã tự hồi quy."),
  "semantic-embeddings": partial("Semantic embedding", "Mã hóa ý nghĩa thành vector phục vụ truy xuất, phân cụm và so sánh ngữ nghĩa."),
  "vector-search": partial("Tìm kiếm vector", "Truy xuất embedding lân cận hiệu quả bằng chỉ mục láng giềng gần đúng."),
  rag: partial("Sinh tăng cường truy xuất (RAG)", "Neo quá trình sinh vào bằng chứng truy xuất qua các bước lập chỉ mục, truy xuất và tổng hợp rõ ràng."),
  prompting: partial("Kỹ thuật prompt", "Thiết kế chỉ dẫn, ngữ cảnh, ví dụ và ràng buộc đầu ra như một giao diện có thể kiểm thử."),
  "ai-agents": partial("AI Agent", "Xây dựng vòng điều khiển có giới hạn để chọn công cụ, quan sát kết quả và quản lý trạng thái."),
  "llm-evaluation": partial("Đánh giá LLM", "Đo chất lượng tác vụ, grounding, an toàn và hiệu năng vận hành bằng các ca tái lập."),
  "llm-fine-tuning": partial("Tinh chỉnh LLM", "Điều chỉnh hành vi mô hình bằng ví dụ được tuyển chọn và cập nhật tham số hiệu quả."),
  "ai-apis": partial("API AI", "Tích hợp năng lực mô hình sau các ranh giới ứng dụng có kiểu và khả năng phục hồi."),
  "model-inference": partial("Suy luận mô hình", "Biến tham số đã huấn luyện thành dự đoán có cân nhắc độ trễ và chi phí."),
  "model-serving": partial("Phục vụ mô hình", "Cung cấp mô hình qua các pipeline xử lý yêu cầu có khả năng mở rộng và quan sát."),
  "vector-databases": partial("Cơ sở dữ liệu vector", "Lưu, lọc và tìm kiếm embedding dưới các ràng buộc truy xuất production."),
  "ai-observability": partial("Khả năng quan sát AI", "Theo dõi chất lượng, độ trễ, chi phí và chế độ lỗi xuyên suốt workflow AI."),
  "ai-deployment": partial("Triển khai AI", "Phát hành mô hình và workflow AI với chiến lược rollout, giám sát và rollback an toàn."),
};

for (const [topicId, translation] of Object.entries(deepTopicTranslationsVi)) {
  const metadata = topicTranslationsVi[topicId];
  if (metadata) {
    topicTranslationsVi[topicId] = { ...metadata, ...translation, status: "complete" };
  }
}
