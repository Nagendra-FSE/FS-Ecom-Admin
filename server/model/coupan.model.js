import mongoose from 'mongoose';

const coupanSchema = new mongoose.Schema({      
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        validate: {
            validator: function (value) {
                return /^[A-Z0-9]+$/.test(value); // Only uppercase letters and numbers
            },
            message: 'Code must contain only uppercase letters and numbers.'
        }
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
        max: 100 // Assuming discount is a percentage
    },

    expiryDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > Date.now(); // Ensure the expiry date is in the future
            },
            message: 'Expiry date must be in the future.'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Assuming each user can have only one coupon
    },      
}, {
    timestamps: true
});

const Coupan = mongoose.model('Coupan', coupanSchema);
export default Coupan;