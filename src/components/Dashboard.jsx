import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify'; // Import toast

const Dashboard = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const newTaskUrl = `${apiUrl}/user/task`;
  const editTaskUrl = `${apiUrl}/user/task`;
  const deleteTaskUrl = `${apiUrl}/user/task`;
  const logoutUrl = `${apiUrl}/api/users/logout`;

  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo",
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(newTaskUrl, { withCredentials: true });
        setTasks(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [newTaskUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const handleFormToggle = () => {
    setIsFormVisible(!isFormVisible);
    if (isFormVisible) {
      setNewTask({ title: "", description: "", status: "todo" });
      setEditingTaskId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        const response = await axios.put(
          `${editTaskUrl}/${editingTaskId}`,
          newTask,
          { withCredentials: true }
        );
        setTasks(
          tasks.map((task) =>
            task._id === editingTaskId ? response.data : task
          )
        );
        setEditingTaskId(null);
      } else {
        const response = await axios.post(newTaskUrl, newTask, {
          withCredentials: true,
        });
        setTasks([...tasks, response.data]);
      }
      setNewTask({ title: "", description: "", status: "todo" });
      setIsFormVisible(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error saving task");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${deleteTaskUrl}/${id}`, { withCredentials: true });
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting task");
    }
  };

  const handleEdit = (task) => {
    setNewTask({
      title: task.title,
      description: task.description,
      status: task.status,
    });
    setEditingTaskId(task._id);
    setIsFormVisible(true);
  };

  const handleLogout = async () => {
    try {
      await axios.post(logoutUrl, {}, { withCredentials: true });
      toast.success("Login successful!"); // Show success message

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Error logging out");
    }
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      (destination.index === source.index &&
        destination.droppableId === source.droppableId)
    ) {
      return; // Do nothing if dropped outside or in the same place
    }

    // Update task status
    const updatedTasks = Array.from(tasks);
    const movedTask = updatedTasks.find((task) => task._id === draggableId);
    movedTask.status = destination.droppableId; // Update status based on destination

    // Remove the task from its original position
    updatedTasks.splice(source.index, 1);
    // Insert it at its new position
    updatedTasks.splice(destination.index, 0, movedTask);

    setTasks(updatedTasks); // Update state

    // Update backend with new status
    axios
      .put(
        `${editTaskUrl}/${draggableId}`,
        { status: destination.droppableId },
        { withCredentials: true }
      )
      .catch((err) => {
        setError(err.response?.data?.message || "Error updating task status");
        // Revert state in case of error
        setTasks(tasks);
      });
  };

  if (loading) {
    return <div className="p-4">Loading tasks...</div>;
  }

  // Define columns for the drag-and-drop interface
  const columns = ["todo", "in-progress", "done"];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Tasks</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4 mr-4 transition-colors"
        onClick={handleFormToggle}
      >
        {isFormVisible ? "Cancel" : "Add Task"}
      </button>

      <button
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mb-4 transition-colors"
        onClick={handleLogout}
      >
        Logout
      </button>

      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 space-y-4 bg-white p-4 rounded shadow"
        >
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
            {editingTaskId ? "Update Task" : "Add Task"}
          </button>
        </form>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4">
          {" "}
          {/* Flex container for columns */}
          {/* Create a separate Droppable for each column */}
          {columns.map((column) => (
            <Droppable key={column} droppableId={column}>
              {(provided) => (
                <div
                  className="w-1/3 p-2"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h2 className="text-lg font-bold mb-2 capitalize">
                    {column}
                  </h2>
                  {tasks
                    .filter((task) => task.status === column)
                    .map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="border p-2 mb-2 bg-white rounded shadow"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <h3 className="font-semibold">{task.title}</h3>
                            <p>{task.description}</p>
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded mr-2 mt-2 hover:underline"
                              onClick={() => handleDelete(task._id)}
                            >
                              Delete
                            </button>
                            <button
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mt-2hover:underline"
                              onClick={() => handleEdit(task)}
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder} {/* Placeholder for proper spacing */}
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
