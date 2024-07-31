const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    priority: {
        type: String,
        required: [true, 'Priority is required'],
        enum: ['Urgent', 'Medium', 'Low']
    },
    dueDate: {
        type: Date,
        required: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    section: {
        type: String,
        enum: ['To do', 'In Progress', 'Under Review', 'Finished'],
        required: [true, 'Section is required']
    }
}, { timestamps: true });

const Todo = mongoose.model('Todo', TodoSchema);
module.exports = { Todo };
