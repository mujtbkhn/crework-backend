const AllowedEmail = require('../models/Allowed');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { getDateRange } = require('../utils/dateFilters');
const moment = require('moment');


const createTodo = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { title, description, priority, dueDate, section } = req.body;

        if (!title || !description || !priority || !section) {
            return res.status(400).json({
                message: 'Title, description, priority, and section are required'
            });
        }

        let parsedDueDate;
        if (dueDate) {
            parsedDueDate = moment(dueDate, 'DD-MM-YYYY');
            if (!parsedDueDate.isValid()) {
                return res.status(400).json({
                    message: 'Invalid due date format. Please use DD-MM-YY.'
                });
            }
            parsedDueDate = parsedDueDate.toDate();
        }

        const newTodo = new Todo({
            title,
            description,
            priority,
            dueDate: parsedDueDate,
            section,
            userId
        });

        await newTodo.save();
        res.json({
            message: 'Todo created successfully',
            todo: newTodo
        });
    } catch (error) {
        next(error);
        // throw new error(error)
    }
};

const getTodoById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const todo = await Todo.findById(id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }


        res.json({
            todo,
        });
    } catch (error) {
        next(error);
    }
};

const viewTodoById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const todo = await Todo.findById(id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json(todo);
    } catch (error) {
        next(error);
    }
};

const getTodos = async (req, res, next) => {
    try {
        const filter = req.query.filter || 'week';
        const { startDate, endDate } = getDateRange(filter);
        const userId = req.user.userId;


        const todos = await Todo.find({
            $or: [
                { userId: userId },
            ],
            createdAt: { $gte: startDate, $lte: endDate }
        });

        res.json(todos);
    } catch (error) {
        next(error);
    }
};

const updateTodo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, priority, dueDate, section } = req.body;
        const todo = await Todo.findById(id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        if (title) todo.title = title;
        if (description) todo.description = description;
        if (priority) todo.priority = priority;
        if (dueDate) {
            const parsedDueDate = moment(dueDate, 'DD-MM-YYYY').toDate();
            if (!parsedDueDate) {
                return res.status(400).json({ message: 'Invalid due date format. Please use DD-MM-YY.' });
            }
            todo.dueDate = parsedDueDate;
        }
        if (section) todo.section = section;

        await todo.save();
        res.json({ message: 'Todo updated successfully', todo });
    } catch (error) {
        next(error);
    }
};


const deleteTodo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedTodo = await Todo.findByIdAndDelete(id);
        if (!deletedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const getTaskCounts = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const todoCount = await Todo.countDocuments({ userId: userId, section: 'To do' });
        const lowPriorityCount = await Todo.countDocuments({ userId: userId, priority: 'Low' });
        const inProgressCount = await Todo.countDocuments({ userId: userId, section: 'In Progress' });
        const mediumPriorityCount = await Todo.countDocuments({ userId: userId, priority: 'Medium' });
        const underReviewCount = await Todo.countDocuments({ userId: userId, section: 'Under Review' });
        const urgentPriorityCount = await Todo.countDocuments({ userId: userId, priority: 'Urgent' });
        const finishedCount = await Todo.countDocuments({ userId: userId, section: 'Finished' });
        const dueDateCount = await Todo.countDocuments({ userId: userId, dueDate: { $exists: true } });

        const counts = {
            todoTasks: todoCount,
            lowPriorityTasks: lowPriorityCount,
            inProgressTasks: inProgressCount,
            mediumPriorityCount: mediumPriorityCount,
            underReviewCount: underReviewCount,
            urgentPriorityCount: urgentPriorityCount,
            finishedCount: finishedCount,
            dueDateTasks: dueDateCount
        };

        res.json(counts);
    } catch (error) {
        next(error);
    }
};

const moveTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { section } = req.body;

        const updatedTodo = await Todo.findByIdAndUpdate(
            id,
            { section },
            { new: true, runValidators: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        res.json({
            message: 'Todo moved successfully',
            todo: updatedTodo
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createTodo, getTodoById, getTodos, updateTodo, deleteTodo, moveTask, viewTodoById, getTaskCounts };
