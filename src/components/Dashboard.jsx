import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// Import Font Awesome icons for spinner
import { FaSpinner } from "react-icons/fa";

// Add a reusable spinner component
const LoadingSpinner = () => <FaSpinner className="animate-spin inline mr-2" />;

// Move this outside the component to prevent recreating on each render
const statusColors = {
  todo: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
  done: "bg-green-100 text-green-800 border-green-200",
};

const getStatusColor = (status) => {
  return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(newTaskUrl, { withCredentials: true });
        setTasks(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching tasks");
      } finally {
        // console.log(`"from useeff tasks":`, tasks);
        setLoading(false);
      }
    };
    fetchTasks();
  }, [newTaskUrl]);

  useEffect(() => {
    // console.log('Tasks updated from useEffect()',);
    // cons(tasks, "Tasks updated from useEffect()");
  }, [tasks]);

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
        // setTasks(tasks.filter((task) => task._id !== id));
        const deletedTaskIndex = tasks.findIndex((task) => task._id === id);
        console.log(`"deletedTaskIndex":`, deletedTaskIndex);
        setTasks(
          tasks
            .filter((task) => task._id !== id)
            .map((task) => {
              if (task.index > deletedTaskIndex) {
                return { ...task, index: task.index - 1 };
              }
              return task;
            })
        );
        // Send updated tasks to backend
        const updatedTasksData = tasks.map((task) => ({
          // _id: task._id,
          title: task.title,
          index: task.index,
          status: task.status,
        }));
        // issue with below console is this still prints before tasks since setTasks updates after this func ends
        // console.log(`"updatedTasksData":`, updatedTasksData);

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
    setIsLoggingOut(true);
    try {
      await axios.post(logoutUrl, {}, { withCredentials: true });
      toast.success("Logout successful!");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Error logging out");
    } finally {
      setIsLoggingOut(false);
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
    // console.log(`"result":`, result);
    // console.log(`"tasks":`, tasks);
    // console.log(`"result-source: "`, result.source);
    // console.log(`result-destiny: "`, result.destination);
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
    // MAJOR-CHANGE
    // const updatedTasks = tasks.map((task) => ({ ...task }));
    const updatedTasks = Array.from(tasks);
    const movedTask = updatedTasks.find((task) => task._id === draggableId);
    const movedTaskIndex = updatedTasks.findIndex(
      (task) => task._id === draggableId
    );
    // cons(updatedTasks, "updatedTasks at start");

    // updatedTasks.splice(source.index, 1);
    updatedTasks.splice(movedTaskIndex, 1);
    // cons(updatedTasks, "updatedTasks after filter");

    const oldIndex = source.index;
    const newIndex = destination.index;

    if (source.droppableId !== destination.droppableId) {
      // Moving to another column
      // console.log(`source != destination  MOVING TO ANOTHER STATUS=== === ===`);
      updatedTasks.map((task) => {
        // console.log(`task title: ${task.title}, task index ${task.index} `);
        // index+1 for all index > oldindex in src status
        if (task.index > oldIndex && task.status === source.droppableId) {
          task.index -= 1;
          // console.log(`task `, task.title, "index-1");
        } // Shift tasks up
        if (task.index >= newIndex && task.status === destination.droppableId) {
          task.index += 1;
          // console.log(`task `, task.title, "index+1");
        } // Shift tasks up
      });
    }

    if (source.droppableId === destination.droppableId) {
      if (newIndex > oldIndex) {
        console.log(`source == destination  moving down  ===  ===  === `);

        // Update indices for tasks between oldIndex and newIndex
        updatedTasks.map((task) => {
          // console.log(`task title: ${task.title}, task index ${task.index} `);
          if (task.index > oldIndex && task.index <= newIndex) {
            task.index -= 1;
            // console.log(`task `, task.title, "index-1");
          } // Shift tasks up
        });
      } else {
        //new < old
        // Moving up the list
        console.log(`source == destination  moving up  ===  ===  ===  `);

        // Update indices for tasks between newIndex and oldIndex
        updatedTasks.map((task) => {
          if (task.index < oldIndex && task.index >= newIndex) {
            task.index += 1; // Shift tasks down
            // console.log(`task `, task.title, "index+1");
          }
        });
      }
    }

    // Update task's status and remove it from its original position
    movedTask.status = destination.droppableId;
    movedTask.index = destination.index;
    // console.log(
    //   `"src.index":`,
    //   source.index,
    //   `"destiny.index":`,
    //   destination.index,
    //   `"movedTask.status":`,
    //   movedTask.status,
    //   `"movedTask.index":`,
    //   movedTask.index
    // );

    // Insert task at the new destination index
    updatedTasks.splice(destination.index, 0, movedTask);
    // cons(updatedTasks, "updatedTasks after splice destiny");
    movedTask.index = newIndex;

    ////////// Update indices in both the source and destination columns for consistency
    // updatedTasks.forEach((task, index) => {
    //   if (
    //     task.status === source.droppableId ||
    //     task.status === destination.droppableId
    //   ) {
    //     task.index = index;
    //   }
    // });

    // Set tasks state with updated list
    setTasks(updatedTasks);
    // cons(tasks, "after setTasks***");

    // Prepare the data to send to the backend
    const updatedTasksData = updatedTasks.map((task) => ({
      _id: task._id,
      status: task.status,
      index: task.index,
    }));

    // Send update to backend
    try {
      const response = await axios.put(
        `${updateTaskIndexUrl}/index/${draggableId}`,
        {
          ///////instead of this m directly sending updatedTasks
          // taskId: draggableId, // Sending taskId in the payload
          newStatus: movedTask.status,
          newIndex: destination.index,
          updatedTasksData: updatedTasksData, // Send updated tasks in the payload
        },
        { withCredentials: true }
      );
      // console.log(`"response.data":`, response.data);
      // cons(response.data, "response.data");
      // setTasks(response.data);

      // (Optional) Bulk update example if your backend supports it
      // await axios.put(`${updateTaskIndexUrl}/bulk-update`, updatedTasksData, { withCredentials: true });
    } catch (err) {
      setError(err.response?.data?.message || "Error updating task status");
      // Revert to original tasks in case of error
      /////////// setTasks(tasks);
    }
  };

  // Replace the existing loading check
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
        <span>Loading tasks...</span>
      </div>
    );
  }

  const columns = ["todo", "in-progress", "done"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Task Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 mr-4 rounded-lg transition-all transform hover:scale-105 shadow-sm flex items-center space-x-2"
              onClick={handleFormToggle}
            >
              <span>{isFormVisible ? "Cancel" : "Add New Task"}</span>
            </button>
            {/* <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut && <LoadingSpinner />}
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button> */}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 shadow-sm">
            {error}
          </div>
        )}

        {/* Task Form */}
        {isFormVisible && (
          <div className="flex justify-center mb-8">
            {" "}
            {/* Added container for centering */}
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg shadow-sm space-y-4 w-full max-w-2xl" // Added max-w-2xl for limiting width
            >
              <input
                type="text"
                name="title"
                placeholder="Task Title"
                value={newTask.title}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                name="description"
                placeholder="Task Description"
                value={newTask.description}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
              <select
                name="status"
                value={newTask.status}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="todo">To-Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors shadow-sm"
              >
                {editingTaskId ? "Update Task" : "Add Task"}
              </button>
            </form>
          </div>
        )}

        {/* Task Columns */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 md:space-x-1 sm:space-x-1">            
            {columns.map((column) => (
              <Droppable droppableId={column} key={column}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 rounded p-4 flex-1"
                  >
                    <h2 className="font-bold mb-2 capitalize">
                      {column.replace("-", " ")}
                    </h2>
                    {tasks
                      .filter((task) => task.status === column)
                      .sort((a, b) => a.index - b.index)
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
                              className={`bg-white p-3 rounded mb-2 ${
                                snapshot.isDragging ? "shadow-lg" : "shadow"
                              }`}
                            >
                              <h3 className="font-semibold mb-1">
                                {task.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">
                                {task.description}
                              </p>
                              <div className="flex space-x-2">
                                <button
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                                  onClick={() => handleEdit(task)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                                  onClick={() => handleDelete(task._id)}
                                >
                                  Delete
                                </button>
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
    </div>
  );
};

export default Dashboard;
