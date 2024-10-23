function hasRole(allowedRoles, ownerRole) {
    let authorized = this.roles.some(role => allowedRoles.includes(role));
    if (!authorized && allowedRoles.includes('owner')) {
      authorized = this.roles.includes(ownerRole);
    }
    return authorized;
 };

export default { hasRole };
