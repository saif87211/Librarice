import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    stuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        index: true,
    },
    bookIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        index: true
    }],
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
    }
}, { timestamps: true });

export const Transaction = mongoose.model("Transaction", transactionSchema);