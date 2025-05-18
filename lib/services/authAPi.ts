// Mock authentication API service
const MOCK_USERS = [
    {
      id: "1",
      name: "Joshua",
      email: "chatess@gmail.com",
      password: "password",
    },
  ]
  
  // Mock token generation
  const generateToken = (userId: string): string => {
    return `mock-jwt-token-${userId}-${Date.now()}`
  }
  
  // Mock user storage
  const users = [...MOCK_USERS]
  
  export const authApi = {
    login: async ({ email, password }: { email: string; password: string }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
  
      const user = users.find((u) => u.email === email)
      if (!user || user.password !== password) {
        throw new Error("Invalid email or password")
      }
  
      const { password: _, ...userWithoutPassword } = user
      const token = generateToken(user.id)
  
      return {
        user: userWithoutPassword,
        token,
      }
    },
  
    register: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
  
      // Check if user already exists
      if (users.some((u) => u.email === email)) {
        throw new Error("Email already in use")
      }
  
      // Create new user
      const newUser = {
        id: `${users.length + 1}`,
        name,
        email,
        password,
      }
  
      users.push(newUser)
  
      return { success: true, message: "User registered successfully" }
    },
  
    logout: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { success: true }
    },
  
    getCurrentUser: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))
  
      // In a real app, this would validate the token and return the user
      // For this mock, we'll just return the first user
      const user = users[0]
      if (!user) {
        throw new Error("User not found")
      }
  
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    },
  }
  