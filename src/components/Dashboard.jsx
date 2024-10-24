// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const [newTask, setNewTask] = useState({ title: '', description: '' });
    const [isFormVisible, setIsFormVisible] = useState(false);

    // Fetch tasks when the component mounts
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

    // Handle input changes for the task form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask({ ...newTask, [name]: value });
    };

    // Toggle the visibility of the task form
    const handleFormToggle = () => {
        setIsFormVisible(!isFormVisible);
    };

    // Handle form submission to add a new task
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/user/task', newTask, { withCredentials: true });
            setTasks([...tasks, response.data]);
            setNewTask({ title: '', description: '' }); // Reset the form
            setIsFormVisible(false); // Hide the form after submission
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating task');
        }
    };

    // Function to delete a task
    const handleDelete = async (taskId) => {
        try {
            await axios.delete(`http://localhost:5000/user/task/${taskId}`, { withCredentials: true });
            setTasks(tasks.filter(task => task._id !== taskId)); // Remove the deleted task from state
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting task');
        }
    };

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
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                        Add Task
                    </button>
                </form>
            )}
            <ul>
                {tasks.map(task => (
                    <li key={task._id} className="border p-2 mb-2 flex justify-between items-center">
                        <div>
                            <h2 className="font-semibold">{task.title}</h2>
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
    );
};

export default Dashboard;
