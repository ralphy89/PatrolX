export class SafeStorage {
    static get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key)
        return item !== null ? JSON.parse(item) : defaultValue
      } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error)
        return defaultValue
      }
    }
  
    static set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch (error) {
        console.error(`Error writing ${key} to localStorage:`, error)
        return false
      }
    }
  
    static remove(key) {
      try {
        localStorage.removeItem(key)
        return true
      } catch (error) {
        console.error(`Error removing ${key} from localStorage:`, error)
        return false
      }
    }
  }