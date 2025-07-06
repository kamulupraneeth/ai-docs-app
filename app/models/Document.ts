import { Schema, model, models } from "mongoose";

const DocumentSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String },
  },
  { timestamps: true }
);

const Document = models.Document || model("Document", DocumentSchema);

export default Document;
