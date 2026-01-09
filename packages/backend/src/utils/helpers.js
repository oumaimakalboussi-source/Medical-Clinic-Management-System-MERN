/**
 * Utility Functions
 * Common helper functions used across controllers
 */

/**
 * Build pagination query parameters
 */
export const getPaginationParams = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  return { skip, limit: limitNum, page: pageNum };
};

/**
 * Build sort options from query
 */
export const getSortOptions = (sortBy, order) => {
  const validFields = ['email', 'nom', 'prenom', 'dateTime', 'status', 'createdAt'];
  const field = validFields.includes(sortBy) ? sortBy : 'createdAt';
  const direction = order === 'desc' ? -1 : 1;

  return { [field]: direction };
};

/**
 * Build search query for text search
 */
export const buildSearchQuery = (searchFields, query) => {
  if (!query) return {};

  const searchRegex = new RegExp(query, 'i');
  return {
    $or: searchFields.map((field) => ({
      [field]: searchRegex,
    })),
  };
};

/**
 * Safe response formatter
 */
export const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    statusCode,
    data,
  };
};

/**
 * Async handler to catch errors in async route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
