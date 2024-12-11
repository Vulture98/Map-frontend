import React, { Suspense, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BiSearch } from 'react-icons/bi';
import { Spinner, ButtonSpinner } from '../../utils/Spinner';
import { useNavigate } from 'react-router-dom';

const AdminDashboardMe = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const adminUrl = `${apiUrl}/api/admin`;
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    doneTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({ userId: null, type: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${adminUrl}/tasks`, { withCredentials: true });
      const tasks = response.data;
      console.log(`response.data:`, response.data);
      setTaskStats({
        totalTasks: tasks.length,
        todoTasks: tasks.filter(task => task.status === 'todo').length,
        inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
        doneTasks: tasks.filter(task => task.status === 'done').length,
      });
    } catch (error) {
      toast.error('Error fetching tasks');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${adminUrl}/users`, {
        withCredentials: true
      });
      setUsers(response.data);
    } catch (error) {
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handletoggleSuspendUser = async (id, flag) => {
    setActionLoading({ userId: id, type: 'suspend' });
    try {
      const response = await axios.put(
        `${adminUrl}/users/toggleSuspension/${id}`,
        { status: flag },
        { withCredentials: true }
      );
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === id ? { ...user, isSuspended: flag } : user
        )
      );
      toast.success(`User ${flag ? 'suspended' : 'unsuspended'} successfully`);
    } catch (error) {
      console.error(error);
      toast.error('Error updating user status');
    } finally {
      setActionLoading({ userId: null, type: null });
    }
  };

  const handleToggleSuspendAll = async (flag) => {
    setActionLoading({ userId: 'all', type: 'suspend' });
    try {
      const response = await axios.put(
        `${adminUrl}/users/toggleSuspendAll`,
        { status: flag },
        { withCredentials: true }
      );
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.isAdmin ? user : { ...user, isSuspended: flag }
        )
      );
      toast.success(`All users ${flag ? 'suspended' : 'unsuspended'} successfully`);
    } catch (error) {
      toast.error('Error updating users');
    } finally {
      setActionLoading({ userId: null, type: null });
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/logout`, {}, {
        withCredentials: true
      });
      navigate('/admin/loginMe');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${adminUrl}/users/${id}`, { withCredentials: true });
      setUsers(prevUsers => prevUsers.filter(user => user._id !== id));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Error deleting user');
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="text-4xl" />
        </div>
      ) : (
        <>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-700 font-semibold">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-700 font-semibold">Suspended Users</h3>
              <p className="text-3xl font-bold text-gray-900 mb-4">
                {users.filter(u => u.isSuspended).length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleSuspendAll(true)}
                  disabled={actionLoading.userId === 'all'}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {actionLoading.userId === 'all' ? <ButtonSpinner /> : 'Suspend All'}
                </button>
                <button
                  onClick={() => handleToggleSuspendAll(false)}
                  disabled={actionLoading.userId === 'all'}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {actionLoading.userId === 'all' ? <ButtonSpinner /> : 'Unsuspend All'}
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-700 font-semibold">Total Tasks</h3>
              <p className="text-3xl font-bold text-gray-900">{taskStats.totalTasks}</p>
            </div>
          </div>

          {/* Task Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-700 font-semibold">To-Do Tasks</h3>
              <p className="text-3xl font-bold text-gray-900">{taskStats.todoTasks}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-700 font-semibold">In-Progress Tasks</h3>
              <p className="text-3xl font-bold text-gray-900">{taskStats.inProgressTasks}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-700 font-semibold">Done Tasks</h3>
              <p className="text-3xl font-bold text-gray-900">{taskStats.doneTasks}</p>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <div className="relative">
                <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              {currentUsers.map((user, index) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors relative group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 w-8">{indexOfFirstUser + index + 1}.</span>
                    <span className="font-medium">
                      {user.email}
                      {user.isAdmin && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          admin
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {user.isSuspended ? (
                      <button
                        onClick={() => handletoggleSuspendUser(user._id, false)}
                        className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-colors"
                      >
                        Unsuspend
                      </button>
                    ) : (
                      !user.isAdmin && (
                        <button
                          onClick={() => handletoggleSuspendUser(user._id, true)}
                          className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          Suspend
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>

      )}
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminDashboardMe;