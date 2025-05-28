import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    //   clerk userId
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    // user name from clerk - not editable
    name: {
        type: String,
        required: true,
    },
    
    // google profile pic url - not editable
    userAvatar: {
        type: String,
        required: true,
    },
    // user name - can be edited from profile page
    userName: {
        type: String,
        required: true,
    },
    // cloudinary profile pic url - can be edited from profile page
    profilePicture: {
        url: {
            type: String,
        },
        publicId: {
            type: String,
        }
    },
    userEmail: {
        type: String,
        unique: true,
    },

});

const User = mongoose.model('User', userSchema);

export default User; 