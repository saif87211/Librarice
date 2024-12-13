import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    stuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },
    bookIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book"
    }],

}, { timeseries: true });

export const Transaction = mongoose.model("Transaction", transactionSchema);