import ACL from '../jsons/ACL.json';

class PermissionService {
  constructor(user) {
    this.user = user;
    this.permissions = this.parsePermissions(user.permissions);
  }

  // Parse base64 encoded permissions
  parsePermissions(base64Permissions) {
    if (!base64Permissions) return [];
    try {
      const decoded = atob(base64Permissions);
      return decoded.split(',').map(Number);
    } catch (error) {
      console.error('Error parsing permissions:', error);
      return [];
    }
  }

  // Check if route is public
  isPublicRoute(route) {
    const publicRoutes = ['/', '/login', '/register', '/reset-password'];
    return publicRoutes.includes(route);
  }
}

export default PermissionService;
