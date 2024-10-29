import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Dashboard = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const newTaskUrl = `${apiUrl}/user/task`;
  const editTaskUrl = `${apiUrl}/user/task`;
  const deleteTaskUrl = `${apiUrl}/user/task`;
  const updateTaskIndexUrl = `${apiUrl}/user/task`;
  const logoutUrl = `${apiUrl}/api/users/logout`;

  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo",
    index: 0, // Add index property
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
      setNewTask({ title: "", description: "", status: "todo", index: 0 });
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
        // Find the last index in the selected status category
        const lastIndex =
          tasks
            .filter((task) => task.status === newTask.status)
            .reduce((maxIndex, task) => Math.max(maxIndex, task.index), -1) + 1;

        const response = await axios.post(
          newTaskUrl,
          { ...newTask, index: lastIndex },
          {
            withCredentials: true,
          }
        );
        setTasks([...tasks, response.data]);
      }
      setNewTask({ title: "", description: "", status: "todo", index: 0 });
      setIsFormVisible(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error saving task");
    }
  };

  const handleDelete = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this task?")) {
        await axios.delete(`${deleteTaskUrl}/${id}`, { withCredentials: true });
        setTasks(tasks.filter((task) => task._id !== id));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting task");
    }
  };

  const handleEdit = (task) => {
    setNewTask({
      title: task.title,
      description: task.description,
      status: task.status,
      index: task.index,
    });
    setEditingTaskId(task._id);
    setIsFormVisible(true);
  };

  const handleLogout = async () => {
    try {
      await axios.post(logoutUrl, {}, { withCredentials: true });
      toast.success("Logout successful!");

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Error logging out");
    }
  };

  const cons = (array, message) => {
    console.log(
      `"${message}":`,
      array.map((task) => ({
        title: task.title,
        index: task.index,
        status: task.status,
      }))
    );
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Exit if dropped outside or in the same place
    if (
      !destination ||
      (destination.index === source.index &&
        destination.droppableId === source.droppableId)
    ) {
      return;
    }

    // Deep copy of tasks to avoid mutating state directly
    const updatedTasks = tasks.map((task) => ({ ...task }));
    const movedTask = updatedTasks.find((task) => task._id === draggableId);
    const movedTaskIndex = updatedTasks.findIndex(
      (task) => task._id === draggableId
    );    

    // updatedTasks.splice(source.index, 1);
    updatedTasks.splice(movedTaskIndex, 1);    

    const oldIndex = source.index;
    const newIndex = destination.index;

    if (source.droppableId !== destination.droppableId) {
      // Moving to another column      
      updatedTasks.map((task) => {        
        // index+1 for all index > oldindex in src status
        if (task.index > oldIndex && task.status === source.droppableId) {
          task.index -= 1;          
        } // Shift tasks up
        if (task.index >= newIndex && task.status === destination.droppableId) {
          task.index += 1;          
        } // Shift tasks up
      });
    }

    if (source.droppableId === destination.droppableId) {
      if (newIndex > oldIndex) {      
        // Update indices for tasks between oldIndex and newIndex
        updatedTasks.map((task) => {          
          if (task.index > oldIndex && task.index <= newIndex) {
            task.index -= 1;            
          } // Shift tasks up
        });
      } else {        
        // Moving up the list        

        // Update indices for tasks between newIndex and oldIndex
        updatedTasks.map((task) => {
          if (task.index < oldIndex && task.index >= newIndex) {
            task.index += 1; // Shift tasks down            
          }
        });
      }
    }

    // Update task's status and remove it from its original position
    movedTask.status = destination.droppableId;
    movedTask.index = destination.index;

    // Insert task at the new destination index
    updatedTasks.splice(destination.index, 0, movedTask);    
    movedTask.index = newIndex;

    // Set tasks state with updated list
    setTasks(updatedTasks);
    cons(tasks, "after setTasks***");

    // // Prepare the data to send to the backend
    // const updatedTasksData = updatedTasks.map((task) => ({
    //   id: task._id,
    //   status: task.status,
    //   index: task.index,
    // }));

    // Send update to backend
    try {
      const response = await axios.put(
        `${updateTaskIndexUrl}/index/${draggableId}`,
        {
          taskId: draggableId, // Sending taskId in the payload
          newStatus: movedTask.status,
          newIndex: destination.index,
        },
        { withCredentials: true }
      );

      // (Optional) Bulk update example if your backend supports it
      // await axios.put(`${updateTaskIndexUrl}/bulk-update`, updatedTasksData, { withCredentials: true });
    } catch (err) {
      setError(err.response?.data?.message || "Error updating task status");
      // Revert to original tasks in case of error
      setTasks(tasks);
    }
  };

  if (loading) {
    return <div className="p-4">Loading tasks...</div>;
  }

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
          {columns.map((column) => (
            <Droppable droppableId={column} key={column}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 rounded p-4 flex-1"
                >
                  <h2 className="font-bold mb-2 capitalize">{column}</h2>
                  {tasks
                    .filter((task) => task.status === column)
                    .sort((a, b) => a.index - b.index) // Sort by index
                    .map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-2 rounded mb-2 shadow"
                          >
                            <h3 className="font-semibold">{task.title}</h3>
                            <p className="mb-2">{task.description}</p>
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded-md mr-2"
                              onClick={() => handleDelete(task._id)}
                            >
                              Delete
                            </button>
                            <button
                              className="bg-blue-500 text-white px-2 py-1 rounded-md"
                              onClick={() => handleEdit(task)}
                            >
                              Edit
                            </button>
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
