// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo' });
    const [isFormVisible, setIsFormVisible] = useState(false);

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
        // Debugging: Log the input change to see what is being set
        console.log(`Updating ${name} to ${value}`);
        setNewTask({ ...newTask, [name]: value });
    };

    const handleFormToggle = () => {
        setIsFormVisible(!isFormVisible);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Debugging: Log the newTask state before submission
        console.log("Submitting task:", newTask);
        try {
            const response = await axios.post('http://localhost:5000/user/task', newTask, { withCredentials: true });
            setTasks([...tasks, response.data]);
            setNewTask({ title: '', description: '', status: 'todo' });
            setIsFormVisible(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating task');
        }
    };

    const handleDelete = async (taskId) => {
        try {
            await axios.delete(`http://localhost:5000/user/task/${taskId}`, { withCredentials: true });
            setTasks(tasks.filter(task => task._id !== taskId));
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting task');
        }
    };

    const categorizeTasks = (status) => tasks.filter(task => task.status === status);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Your Tasks</h1>
            {error && <div className="text-red-500 mb-2">{error}</div>}
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
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                        Add Task
                    </button>
                </form>
            )}

            <div className="grid grid-cols-3 gap-4">
                <div className="border p-4">
                    <h2 className="text-xl font-semibold">To Do</h2>
                    <ul>
                        {categorizeTasks('todo').map(task => (
                            <li key={task._id} className="border p-2 mb-2 flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{task.title}</h3>
                                    <p>{task.description}</p>
                                </div>
                                <button 
                                    onClick={() => handleDelete(task._id)} 
                                    className="bg-red-500 text-white px-4 py-1 ml-4 rounded"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="border p-4">
                    <h2 className="text-xl font-semibold">In Progress</h2>
                    <ul>
                        {categorizeTasks('in-progress').map(task => (
                            <li key={task._id} className="border p-2 mb-2 flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{task.title}</h3>
                                    <p>{task.description}</p>
                                </div>
                                <button 
                                    onClick={() => handleDelete(task._id)} 
                                    className="bg-red-500 text-white px-4 py-1 ml-4 rounded"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="border p-4">
                    <h2 className="text-xl font-semibold">Done</h2>
                    <ul>
                        {categorizeTasks('done').map(task => (
                            <li key={task._id} className="border p-2 mb-2 flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{task.title}</h3>
                                    <p>{task.description}</p>
                                </div>
                                <button 
                                    onClick={() => handleDelete(task._id)} 
                                    className="bg-red-500 text-white px-4 py-1 ml-4 rounded"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
