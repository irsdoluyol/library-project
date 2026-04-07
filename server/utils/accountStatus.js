export function effectiveAccountStatus(user) {
  const raw = user?.accountStatus;
  if (raw === "pending" || raw === "active" || raw === "rejected") {
    return raw;
  }
  return user?.role === "admin" ? "active" : "pending";
}
