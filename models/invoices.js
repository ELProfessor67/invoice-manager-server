import mongoose from 'mongoose';

const cashSchema = new mongoose.Schema({
    quantity: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
}, { _id: false });

const onlineSchema = new mongoose.Schema({
    utr: String,
    amount: { type: Number, default: 0 }
}, { _id: false });

const dataSchema = new mongoose.Schema({
    orname: String,
    id: String,
    name: String,
    sid: String,
    mobile: String,
    SI: String,
    total: { type: Number, default: 0 },
    totalCash: { type: Number, default: 0 },
    totalOnline: { type: Number, default: 0 },
    cash: {
        "2000": cashSchema,
        "1000": cashSchema,
        "500": cashSchema,
        "200": cashSchema,
        "100": cashSchema,
        "50": cashSchema,
        "20": cashSchema,
        "10": cashSchema,
        "5": cashSchema,
        "2": cashSchema,
        "1": cashSchema
    },
    online: [onlineSchema],
    date: { type: Date, default: Date.now, required: true }, // Date field
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to User model
});

const DataModel = mongoose.model('invoice', dataSchema);

export default DataModel;
