import { patientRepository } from '../../infrastructure/repositories/patientRepository.js'
import { getPaginationParams, getSortOptions, buildSearchQuery } from '../../utils/helpers.js'

export const patientService = {
  async list(params) {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'asc', search } = params
    const { skip, limit: limitNum } = getPaginationParams(page, limit)
    const sort = getSortOptions(sortBy, order)
    const searchQuery = buildSearchQuery(['nom', 'prenom', 'email', 'telephone'], search)

    const [patients, total] = await Promise.all([
      patientRepository.find(searchQuery, sort, skip, limitNum),
      patientRepository.count(searchQuery),
    ])

    return {
      patients,
      pagination: {
        total,
        page,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    }
  },

  async getById(id) {
    return patientRepository.findById(id)
  },

  async create(data) {
    const required = ['email', 'nom', 'prenom']
    for (const key of required) {
      if (!data[key]) {
        const error = new Error('Email, nom, and prenom are required')
        error.statusCode = 400
        throw error
      }
    }
    const existing = await patientRepository.findOne({ email: data.email })
    if (existing) {
      const error = new Error('Patient with this email already exists')
      error.statusCode = 409
      throw error
    }
    return patientRepository.create(data)
  },

  async update(id, partial) {
    const updateData = { ...partial }
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key])
    return patientRepository.updateById(id, updateData)
  },

  async remove(id) {
    return patientRepository.deleteById(id)
  },

  async search(q) {
    if (!q || q.length < 2) {
      const error = new Error('Search query must be at least 2 characters')
      error.statusCode = 400
      throw error
    }
    return patientRepository.searchByQuery(q)
  },
}
