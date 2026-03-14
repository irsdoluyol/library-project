
const log = (action, details) => {
  const ts = new Date().toISOString();
  const msg = `[${ts}] [${action}] ${JSON.stringify(details)}`;
  console.log(msg);
};

export const logCatalog = {
  create: (userId, book) => log("CATALOG_CREATE", { userId, bookId: book?._id, title: book?.title }),
  update: (userId, bookId) => log("CATALOG_UPDATE", { userId, bookId }),
  delete: (userId, bookId, title) => log("CATALOG_DELETE", { userId, bookId, title }),
};

export const logBorrowing = {
  borrow: (userId, bookId) => log("BORROW", { userId, bookId }),
  return: (userId, bookId) => log("RETURN", { userId, bookId }),
};

export const logRequest = {
  create: (userId, requestId) => log("REQUEST_CREATE", { userId, requestId }),
  statusChange: (adminId, requestId, status) => log("REQUEST_STATUS", { adminId, requestId, status }),
};
