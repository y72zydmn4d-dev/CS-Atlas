import type { Source } from "@/lib/types";

export const sources: Source[] = [
  {
    id: "clrs-4e",
    title: "Introduction to Algorithms, Fourth Edition",
    authors: ["Thomas H. Cormen", "Charles E. Leiserson", "Ronald L. Rivest", "Clifford Stein"],
    publisher: "The MIT Press",
    year: 2022,
    url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/",
    sourceType: "book",
  },
  {
    id: "mml-book",
    title: "Mathematics for Machine Learning",
    authors: ["Marc Peter Deisenroth", "A. Aldo Faisal", "Cheng Soon Ong"],
    publisher: "Cambridge University Press",
    year: 2020,
    url: "https://mml-book.github.io/",
    sourceType: "book",
  },
  {
    id: "isl",
    title: "An Introduction to Statistical Learning",
    authors: ["Gareth James", "Daniela Witten", "Trevor Hastie", "Robert Tibshirani", "Jonathan Taylor"],
    publisher: "Springer",
    year: 2023,
    url: "https://www.statlearning.com/",
    sourceType: "book",
  },
  {
    id: "sklearn-guide",
    title: "scikit-learn User Guide",
    publisher: "scikit-learn developers",
    url: "https://scikit-learn.org/stable/user_guide.html",
    sourceType: "documentation",
  },
];

export const sourceById = new Map(sources.map((source) => [source.id, source]));
