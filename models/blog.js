import mongoose from "mongoose";
import slugify from "slugify";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true }, // Implicit index created by `unique: true`
    featuredImage: {
      type: String,
      required: true,
      validate: {
        validator: (value) => /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(value),
        message: "Featured image must be a valid URL.",
      },
    },
    author: { type: String, required: true },
    publishedDate: { type: Date, default: Date.now },
    category: {
      type: String,
      required: true,
      enum: ["Technology", "Lifestyle", "Education"],
    },
    content: [
      {
        type: {
          type: String,
          enum: ["paragraph", "heading", "list", "image"],
          required: true,
        },
        headingLevel: {
          type: Number,
          enum: [1, 2],
          default: 1,
          required: function () {
            return this.type === "heading";
          },
        },
        data: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
          validate: {
            validator: function (value) {
              if (this.type === "list") {
                return Array.isArray(value) && value.every((item) => typeof item === "string");
              }
              return typeof value === "string";
            },
            message: "For type 'list', data must be an array of strings.",
          },
        },
      },
    ],
  },
  { timestamps: true }
);

// Generate unique slug
async function generateUniqueSlug(title, model) {
  let slug = slugify(title, { lower: true, strict: true });

  if (slug.length > 50) {
    slug = slug.substring(0, 50).replace(/-$/, "");
  }

  const regex = new RegExp(`^${slug}(-\\d+)?$`, "i");
  const existingCount = await model.countDocuments({ slug: regex });

  return existingCount === 0 ? slug : `${slug}-${existingCount + 1}`;
}

// Middleware to auto-generate slug before saving
BlogSchema.pre("save", async function (next) {
  if (!this.slug) {
    try {
      this.slug = await generateUniqueSlug(this.title, mongoose.model("Blog"));
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Ensure unique slug if multiple documents are saved at the same time
BlogSchema.post("save", async function (doc, next) {
  const existingCount = await mongoose.model("Blog").countDocuments({ slug: doc.slug });

  if (existingCount > 1 && !doc.slug.endsWith(`-${existingCount}`)) {
    doc.slug = `${doc.slug}-${existingCount}`;
    await doc.save();
  }
  next();
});

// Indexes (only define indexes that are not implicitly created)
BlogSchema.index({ title: 1 });
BlogSchema.index({ publishedDate: -1 });

// Virtuals
BlogSchema.virtual("shortDescription").get(function () {
  const paragraph = this.content.find((c) => c.type === "paragraph");
  return paragraph && typeof paragraph.data === "string"
    ? paragraph.data.substring(0, 100)
    : "";
});

BlogSchema.virtual("formattedDate").get(function () {
  return this.publishedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Prevent recompilation of the schema
if (!mongoose.models.Blog) {
  mongoose.model("Blog", BlogSchema);
}

const Blog = mongoose.model("Blog");
export default Blog;