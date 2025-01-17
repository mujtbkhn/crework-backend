const express = require('express');
const { createTodo, getTodoById, updateTodo, deleteTodo, getTodos, getTaskCounts, moveTask, viewTodoById } = require('../controllers/todo');
const decodeJWT = require('../middlewares/decodeJWT');
const router = express.Router();

router.post('/create', decodeJWT, createTodo);
router.get('/getAll', decodeJWT, getTodos)
router.get('/get/:id', decodeJWT, getTodoById);
router.get('/view/:id', viewTodoById);
router.put('/edit/:id', decodeJWT, updateTodo);
router.delete('/delete/:id', decodeJWT, deleteTodo);
router.get('/analytics', decodeJWT, getTaskCounts);
router.patch('/move/:id', decodeJWT, moveTask)

module.exports = router;