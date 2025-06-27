"use client";

import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Save, X, Search, Users, Key } from "lucide-react";

export default function RoleManager() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRole, setNewRole] = useState({ role_key: "", role_value: "" });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roles");
      const json = await res.json();
      setRoles(json.data);
      setError("");
    } catch (err) {
      setError("Failed to load roles");
      setRoles([]);
    }
    setLoading(false);
  };

  const showMessage = (message, type = "success") => {
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleAdd = async () => {
    if (!newRole.role_key.trim() || !newRole.role_value.trim()) {
      showMessage("Please fill in both role key and value", "error");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRole),
      });

      if (res.ok) {
        setNewRole({ role_key: "", role_value: "" });
        loadRoles();
        showMessage("Role added successfully!");
      } else {
        throw new Error("Failed to add role");
      }
    } catch (err) {
      showMessage("Failed to add role", "error");
    }
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this role? This action cannot be undone."
      )
    )
      return;

    try {
      const res = await fetch("/api/roles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        loadRoles();
        showMessage("Role deleted successfully!");
      } else {
        throw new Error("Failed to delete role");
      }
    } catch (err) {
      showMessage("Failed to delete role", "error");
    }
  };

  const handleEdit = (role) => {
    setEditingId(role.id);
    setEditData({ ...role });
  };

  const handleUpdate = async () => {
    if (!editData.role_key.trim() || !editData.role_value.trim()) {
      showMessage("Please fill in both role key and value", "error");
      return;
    }

    try {
      const res = await fetch("/api/roles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        setEditingId(null);
        loadRoles();
        showMessage("Role updated successfully!");
      } else {
        throw new Error("Failed to update role");
      }
    } catch (err) {
      showMessage("Failed to update role", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.role_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.role_value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Messages */}
        {(success || error) && (
          <div
            className={`mb-6 p-4 rounded-xl border-l-4 animate-in slide-in-from-top duration-300 ${
              success
                ? "bg-green-50 border-green-400 text-green-800"
                : "bg-red-50 border-red-400 text-red-800"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-3 ${
                  success ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              {success || error}
            </div>
          </div>
        )}

        {/* Add New Role Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Add New Role
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Key className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Role Key (e.g., admin, user)"
                value={newRole.role_key}
                onChange={(e) =>
                  setNewRole({ ...newRole, role_key: e.target.value })
                }
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                disabled={isAdding}
              />
            </div>

            <div className="relative">
              <Users className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Role Value (e.g., Administrator)"
                value={newRole.role_value}
                onChange={(e) =>
                  setNewRole({ ...newRole, role_value: e.target.value })
                }
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                disabled={isAdding}
                onKeyPress={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={
                isAdding ||
                !newRole.role_key.trim() ||
                !newRole.role_value.trim()
              }
              className="flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isAdding ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              {isAdding ? "Adding..." : "Add Role"}
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="bg-blue-50 px-3 py-2 rounded-lg">
                <span className="font-medium text-blue-700">
                  Total: {roles.length}
                </span>
              </div>
              {searchTerm && (
                <div className="bg-green-50 px-3 py-2 rounded-lg">
                  <span className="font-medium text-green-700">
                    Found: {filteredRoles.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Roles Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role Key
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role Value
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                        <span className="text-gray-600 text-lg">
                          Loading roles...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="h-12 w-12 text-gray-300 mb-4" />
                        <span className="text-gray-500 text-lg">
                          {searchTerm
                            ? "No roles match your search"
                            : "No roles found"}
                        </span>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="text-blue-600 hover:text-blue-700 mt-2 text-sm"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role, index) => (
                    <tr
                      key={role.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                            {role.id}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === role.id ? (
                          <input
                            type="text"
                            value={editData.role_key}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                role_key: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {role.role_key}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {editingId === role.id ? (
                          <input
                            type="text"
                            value={editData.role_value}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                role_value: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-900 font-medium text-sm">
                            {role.role_value}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          {editingId === role.id ? (
                            <>
                              <button
                                onClick={handleUpdate}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(role)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200"
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(role.id)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Manage your application roles and permissions with ease</p>
        </div>
      </div>
    </div>
  );
}
