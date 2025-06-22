import mongoose from "mongoose";

const uri =
  "mongodb+srv://premgaikwad:prem@cluster0.c8y33qr.mongodb.net/chaiaurcode?retryWrites=true&w=majority";

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected via Mongoose!"))
  .catch((err) => console.error("❌ Mongoose error:", err));
