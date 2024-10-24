import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo' });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null); // Track the task being edited

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/user/task', { withCredentials: true });
                setTasks(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching tasks');
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
            // Reset when toggling off the form
            setNewTask({ title: '', description: '', status: 'todo' });
            setEditingTaskId(null); // Reset editing task
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTaskId) {
                // Update existing task
                const response = await axios.put(`http://localhost:5000/user/task/${editingTaskId}`, newTask, { withCredentials: true });
                setTasks(tasks.map(task => (task._id === editingTaskId ? response.data : task))); // Update the task in state
                setEditingTaskId(null); // Reset editing task
            } else {
                // Add new task
                const response = await axios.post('http://localhost:5000/user/task', newTask, { withCredentials: true });
                setTasks([...tasks, response.data]);
            }
            setNewTask({ title: '', description: '', status: 'todo' }); // Resetting form
            setIsFormVisible(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving task');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/user/task/${id}`, { withCredentials: true });
            setTasks(tasks.filter(task => task._id !== id)); // Update the state to remove the deleted task
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting task');
        }
    };

    const handleEdit = (task) => {
        setNewTask({ title: task.title, description: task.description, status: task.status }); // Set form to current task's data
        setEditingTaskId(task._id); // Set task ID for editing
        setIsFormVisible(true); // Show the form
    };

    const handleDragEnd = async (result) => {
        const { destination, source } = result;

        // Check if the item was dropped outside the list
        if (!destination) {
            return;
        }

        // Check if the item was dropped in the same place
        if (destination.index === source.index && destination.droppableId === source.droppableId) {
            return;
        }

        const updatedTasks = Array.from(tasks);
        const [movedTask] = updatedTasks.splice(source.index, 1);
        movedTask.status = destination.droppableId; // Update the status based on where it's dropped
        updatedTasks.splice(destination.index, 0, movedTask);

        // Update the tasks in the state
        setTasks(updatedTasks);

        // Send the updated task status to the backend
        try {
            await axios.put(`http://localhost:5000/user/task/${movedTask._id}`, { status: movedTask.status }, { withCredentials: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating task status');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Your Tasks</h1>
            {error && <div className="text-red-500">{error}</div>}
            <button 
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4" 
                onClick={handleFormToggle}
            >
                {isFormVisible ? 'Cancel' : 'Add Task'}
            </button>
            {isFormVisible && (
                <form onSubmit={handleSubmit} className="mb-4">
                    <input
                        type="text"
                        name="title"
                        placeholder="Task Title"
                        value={newTask.title}
                        onChange={handleInputChange}
                        required
                        className="border p-2 mb-2 w-full"
                    />
                    <textarea
                        name="description"
                        placeholder="Task Description"
                        value={newTask.description}
                        onChange={handleInputChange}
                        required
                        className="border p-2 mb-2 w-full"
                    />
                    <select
                        name="status"
                        value={newTask.status}
                        onChange={handleInputChange}
                        className="border p-2 mb-2 w-full"
                    >
                        <option value="todo">To-Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                        {editingTaskId ? 'Update Task' : 'Add Task'}
                    </button>
                </form>
            )}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-3 gap-4">
                    {['todo', 'in-progress', 'done'].map(status => (
                        <Droppable key={status} droppableId={status}>
                            {(provided) => (
                                <div 
                                    ref={provided.innerRef} 
                                    {...provided.droppableProps} 
                                    className="border p-2"
                                >
                                    <h2 className="font-semibold capitalize">{status.replace('-', ' ')}</h2>
                                    <ul>
                                        {tasks.filter(task => task.status === status).map((task, index) => (
                                            <Draggable key={task._id} draggableId={task._id} index={index}>
                                                {(provided) => (
                                                    <li 
                                                        ref={provided.innerRef} 
                                                        {...provided.draggableProps} 
                                                        {...provided.dragHandleProps} 
                                                        className="border p-2 mb-2 flex justify-between items-center"
                                                    >
                                                        <div>
                                                            <h3 className="font-semibold">{task.title}</h3>
                                                            <p>{task.description}</p>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button 
                                                                className="bg-yellow-500 text-white px-2 py-1 rounded"
                                                                onClick={() => handleEdit(task)} // Call edit function
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                className="bg-red-500 text-white px-2 py-1 rounded"
                                                                onClick={() => handleDelete(task._id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))}
                                    </ul>
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
