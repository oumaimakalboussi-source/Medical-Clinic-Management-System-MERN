import Patient from '../../models/Patient.js'

export const patientRepository = {
  async find(query, sort, skip, limit) {
    return Patient.find(query).sort(sort).skip(skip).limit(limit)
  },
  async count(query) {
    return Patient.countDocuments(query)
  },
  async findById(id) {
    return Patient.findById(id).populate('userId', 'email nom prenom role status')
  },
  async findOne(filter) {
    return Patient.findOne(filter)
  },
  async create(data) {
    return Patient.create(data)
  },
  async updateById(id, update, options = { new: true, runValidators: true }) {
    return Patient.findByIdAndUpdate(id, update, options)
  },
  async deleteById(id) {
    return Patient.findByIdAndDelete(id)
  },
  async searchByQuery(q, limit = 20) {
    const searchRegex = new RegExp(q, 'i')
    return Patient.find({
      $or: [
        { nom: searchRegex },
        { prenom: searchRegex },
        { email: searchRegex },
        { telephone: searchRegex },
      ],
    }).limit(limit)
  },
}
