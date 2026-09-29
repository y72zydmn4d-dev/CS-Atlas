export interface BilingualGlossaryTerm {
  id: string;
  en: string;
  vi: string;
  aliases?: string[];
  definitionEn: string;
  definitionVi: string;
  domainIds: string[];
  topicIds: string[];
}

const term = (id: string, en: string, vi: string, definitionEn: string, definitionVi: string, domainIds: string[], topicIds: string[] = [], aliases?: string[]): BilingualGlossaryTerm => ({ id, en, vi, definitionEn, definitionVi, domainIds, topicIds, aliases });

export const bilingualGlossary: BilingualGlossaryTerm[] = [
  term("algorithm", "algorithm", "thuật toán", "A finite procedure for solving a class of problems.", "Một quy trình hữu hạn để giải một lớp bài toán.", ["data-structures-algorithms"]),
  term("data-structure", "data structure", "cấu trúc dữ liệu", "A representation that organizes data for specific operations.", "Cách biểu diễn tổ chức dữ liệu cho những phép toán cụ thể.", ["data-structures-algorithms"]),
  term("time-complexity", "time complexity", "độ phức tạp thời gian", "How operation count grows with input size.", "Cách số phép toán tăng theo kích thước đầu vào.", ["data-structures-algorithms"], ["complexity-analysis"]),
  term("space-complexity", "space complexity", "độ phức tạp bộ nhớ", "How memory use grows with input size.", "Cách lượng bộ nhớ sử dụng tăng theo kích thước đầu vào.", ["data-structures-algorithms"], ["complexity-analysis"]),
  term("recursion", "recursion", "đệ quy", "Solving a problem through smaller instances of itself.", "Giải bài toán thông qua các phiên bản nhỏ hơn của chính nó.", ["data-structures-algorithms"], ["recursion"]),
  term("hash-table", "hash table", "bảng băm", "A key-value structure backed by a hash function and buckets.", "Cấu trúc khóa–giá trị dựa trên hàm băm và các bucket.", ["data-structures-algorithms"], ["hash-tables"]),
  term("tree", "tree", "cây", "A hierarchical graph with parent-child relationships.", "Đồ thị phân cấp với quan hệ cha–con.", ["data-structures-algorithms"], ["trees"]),
  term("graph", "graph", "đồ thị", "A set of vertices connected by edges.", "Tập hợp các đỉnh được nối bởi các cạnh.", ["data-structures-algorithms"], ["graphs"]),
  term("bfs", "breadth-first search", "tìm kiếm theo chiều rộng", "A traversal that explores nodes layer by layer.", "Phép duyệt khám phá các đỉnh theo từng lớp.", ["data-structures-algorithms"], ["graph-traversal"], ["BFS"]),
  term("dfs", "depth-first search", "tìm kiếm theo chiều sâu", "A traversal that follows a branch before backtracking.", "Phép duyệt đi sâu theo một nhánh trước khi quay lui.", ["data-structures-algorithms"], ["graph-traversal"], ["DFS"]),
  term("dynamic-programming", "dynamic programming", "quy hoạch động", "A method that reuses overlapping subproblem results.", "Phương pháp tái sử dụng kết quả của các bài toán con chồng lấp.", ["data-structures-algorithms"], ["dynamic-programming"]),
  term("linear-algebra", "linear algebra", "đại số tuyến tính", "The mathematics of vectors, matrices, and linear maps.", "Ngành toán học về vector, ma trận và ánh xạ tuyến tính.", ["mathematics-ai"], ["linear-algebra"]),
  term("probability", "probability", "xác suất", "A mathematical language for uncertainty.", "Ngôn ngữ toán học dùng để mô hình hóa sự bất định.", ["mathematics-ai"], ["probability"]),
  term("optimization", "optimization", "tối ưu hóa", "Choosing parameters that minimize or maximize an objective.", "Chọn tham số để cực tiểu hoặc cực đại một hàm mục tiêu.", ["mathematics-ai"], ["optimization"]),
  term("gradient-descent", "gradient descent", "hạ dốc theo gradient", "Iterative optimization in the negative-gradient direction.", "Tối ưu lặp bằng cách di chuyển theo hướng ngược gradient.", ["mathematics-ai", "machine-learning"], ["gradient-descent"]),
  term("loss-function", "loss function", "hàm mất mát", "A function measuring prediction error.", "Hàm đo sai số của dự đoán.", ["machine-learning"], ["regression-losses"]),
  term("linear-regression", "linear regression", "hồi quy tuyến tính", "A model of a linear conditional mean.", "Mô hình hóa kỳ vọng có điều kiện bằng quan hệ tuyến tính.", ["machine-learning"], ["linear-regression"]),
  term("classification", "classification", "phân loại", "Predicting one of a discrete set of labels.", "Dự đoán một nhãn trong tập nhãn rời rạc.", ["machine-learning"]),
  term("clustering", "clustering", "phân cụm", "Grouping unlabeled observations by similarity.", "Nhóm các quan sát chưa gán nhãn theo độ tương đồng.", ["machine-learning"], ["clustering"]),
  term("overfitting", "overfitting", "quá khớp", "Fitting training data while failing to generalize.", "Khớp dữ liệu huấn luyện nhưng tổng quát hóa kém.", ["machine-learning"]),
  term("regularization", "regularization", "điều chuẩn", "Constraining a model to improve generalization.", "Đặt ràng buộc lên mô hình để cải thiện khả năng tổng quát hóa.", ["machine-learning"]),
  term("cross-validation", "cross validation", "kiểm định chéo", "Repeated train-validation splits for model assessment.", "Đánh giá mô hình qua nhiều cách chia tập huấn luyện–kiểm định.", ["machine-learning"], ["model-evaluation"], ["cross-validation"]),
  term("neural-network", "neural network", "mạng nơ-ron", "A composition of learned parameterized transformations.", "Phép hợp thành các biến đổi có tham số được học.", ["deep-learning"], ["neural-networks"]),
  term("backpropagation", "backpropagation", "lan truyền ngược", "Efficient chain-rule differentiation through a computation graph.", "Tính đạo hàm hiệu quả qua đồ thị tính toán bằng quy tắc dây chuyền.", ["deep-learning"], ["backpropagation"]),
  term("transformer", "transformer", "Transformer", "An attention-based sequence architecture.", "Kiến trúc chuỗi dựa trên cơ chế attention.", ["deep-learning", "nlp", "llm-engineering"], ["transformers"]),
  term("embedding", "embedding", "vector biểu diễn", "A dense vector representation learned for an item.", "Biểu diễn vector đặc được học cho một đối tượng.", ["nlp", "llm-engineering"], ["word-embeddings", "semantic-embeddings"]),
  term("vector-search", "vector search", "tìm kiếm vector", "Retrieval by proximity in an embedding space.", "Truy xuất theo khoảng cách trong không gian embedding.", ["llm-engineering"], ["vector-search"]),
  term("rag", "retrieval-augmented generation", "sinh tăng cường truy xuất", "Generation grounded in retrieved evidence.", "Quá trình sinh được neo vào bằng chứng truy xuất.", ["llm-engineering"], ["rag"], ["RAG"]),
  term("fine-tuning", "fine-tuning", "tinh chỉnh", "Adapting model parameters with curated examples.", "Điều chỉnh tham số mô hình bằng các ví dụ được tuyển chọn.", ["llm-engineering"], ["llm-fine-tuning"]),
  term("inference", "inference", "suy luận", "Producing predictions from trained parameters.", "Tạo dự đoán từ các tham số đã huấn luyện.", ["ai-engineering"], ["model-inference"]),
  term("model-serving", "model serving", "phục vụ mô hình", "Exposing models through reliable request pipelines.", "Cung cấp mô hình qua luồng xử lý yêu cầu đáng tin cậy.", ["ai-engineering"], ["model-serving"]),
  term("observability", "observability", "khả năng quan sát", "Tracing quality, latency, cost, and failures across a system.", "Theo dõi chất lượng, độ trễ, chi phí và lỗi trên toàn hệ thống.", ["ai-engineering"], ["ai-observability"]),
];

export function findGlossaryTerm(text: string) {
  const normalized = text.trim().toLocaleLowerCase("en").replace(/\s+/g, " ");
  return bilingualGlossary.find((item) => [item.en, ...(item.aliases ?? [])].some((candidate) => candidate.toLocaleLowerCase("en") === normalized));
}
