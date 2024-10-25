import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo' });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/user/task', { withCredentials: true });
                setTasks(response.data || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching tasks');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask({ ...newTask, [name]: value });
    };

    const handleFormToggle = () => {
        setIsFormVisible(!isFormVisible);
        if (isFormVisible) {
            setNewTask({ title: '', description: '', status: 'todo' });
            setEditingTaskId(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTaskId) {
                const response = await axios.put(`http://localhost:5000/user/task/${editingTaskId}`, newTask, { withCredentials: true });
                setTasks(tasks.map(task => (task._id === editingTaskId ? response.data : task)));
                setEditingTaskId(null);
            } else {
                const response = await axios.post('http://localhost:5000/user/task', newTask, { withCredentials: true });
                setTasks([...tasks, response.data]);
            }
            setNewTask({ title: '', description: '', status: 'todo' });
            setIsFormVisible(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving task');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/user/task/${id}`, { withCredentials: true });
            setTasks(tasks.filter(task => task._id !== id));
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting task');
        }
    };

    const handleEdit = (task) => {
        setNewTask({ title: task.title, description: task.description, status: task.status });
        setEditingTaskId(task._id);
        setIsFormVisible(true);
    };

    const handleDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination || !tasks.length) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const updatedTasks = Array.from(tasks);
        const movedTask = updatedTasks.find(task => task._id === draggableId);
        
        if (!movedTask) return;

        // Remove the task from its current position
        const newTasks = updatedTasks.filter(task => task._id !== draggableId);

        // Update the task's status
        movedTask.status = destination.droppableId;

        // Insert the task at its new position
        const tasksInDestination = newTasks.filter(t => t.status === destination.droppableId);
        const insertIndex = Math.min(destination.index, tasksInDestination.length);
        
        newTasks.splice(
            newTasks.findIndex(t => t.status === destination.droppableId) + insertIndex,
            0,
            movedTask
        );

        setTasks(newTasks);

        // Update in backend
        axios.put(
            `http://localhost:5000/user/task/${draggableId}`,
            { status: destination.droppableId },
            { withCredentials: true }
        ).catch(err => {
            setError(err.response?.data?.message || 'Error updating task status');
            setTasks(updatedTasks); // Revert on error
        });
    };

    if (loading) {
        return <div className="p-4">Loading tasks...</div>;
    }

    const columns = ['todo', 'in-progress', 'done'];

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Your Tasks</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            
            <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4 transition-colors" 
                onClick={handleFormToggle}
            >
                {isFormVisible ? 'Cancel' : 'Add Task'}
            </button>

            {isFormVisible && (
                <form onSubmit={handleSubmit} className="mb-4 space-y-4 bg-white p-4 rounded shadow">
                    <input
                        type="text"
                        name="title"
                        placeholder="Task Title"
                        value={newTask.title}
                        onChange={handleInputChange}
                        required
                        className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                        name="description"
                        placeholder="Task Description"
                        value={newTask.description}
                        onChange={handleInputChange}
                        required
                        className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        name="status"
                        value={newTask.status}
                        onChange={handleInputChange}
                        className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="todo">To-Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        {editingTaskId ? 'Update Task' : 'Add Task'}
                    </button>
                </form>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {columns.map(status => (
                        <Droppable key={status} droppableId={status}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`bg-white p-4 rounded-lg shadow min-h-[200px] ${
                                        snapshot.isDraggingOver ? 'bg-gray-50' : ''
                                    }`}
                                >
                                    <h2 className="font-semibold capitalize mb-4">
                                        {status.replace('-', ' ')}
                                    </h2>
                                    {tasks
                                        .filter(task => task.status === status)
                                        .map((task, index) => (
                                            <Draggable
                                                key={task._id}
                                                draggableId={task._id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`border p-3 rounded mb-2 ${
                                                            snapshot.isDragging ? 'bg-gray-50 shadow-lg' : 'bg-white'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-semibold">{task.title}</h3>
                                                                <p className="text-gray-600 text-sm mt-1">
                                                                    {task.description}
                                                                </p>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm transition-colors"
                                                                    onClick={() => handleEdit(task)}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors"
                                                                    onClick={() => handleDelete(task._id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default Dashboard;