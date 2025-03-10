import mongoose from "mongoose";
import slugify from "slugify";

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  featuredImage: { type: String, required: true },
  author: { type: String, required: true },
  publishedDate: { type: Date, default: Date.now },
  content: [
    {
      type: { type: String, enum: ["paragraph", "heading", "list", "image"], required: true },
      level: { type: Number, min: 2, max: 6 }, // Only for headings (h2 to h6)
      data: { type: mongoose.Schema.Types.Mixed, required: true }, // Text for paragraphs, array for lists, URL for images
    },
  ],
});

// Middleware to auto-generate slug from title
BlogSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Blog = mongoose.model("Blog", BlogSchema);
export default Blog;
