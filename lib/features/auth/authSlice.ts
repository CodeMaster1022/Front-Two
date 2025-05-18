import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { authApi } from "@/lib/services/authAPi"
import { setAuthToken, removeAuthToken, getAuthToken } from "@/lib/utils/auth-utils"

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Async thunks
export const login = createAsyncThunk("auth/login", async (credentials: { email: string; password: string }) => {
  const response = await authApi.login(credentials)
  setAuthToken(response.token)
  return response.user
})

export const register = createAsyncThunk(
  "auth/register",
  async (userData: { name: string; email: string; password: string }) => {
    const response = await authApi.register(userData)
    return response
  },
)

export const logout = createAsyncThunk("auth/logout", async () => {
  await authApi.logout()
  removeAuthToken()
})

export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
  const token = getAuthToken()
  if (!token) {
    throw new Error("No token found")
  }
  const user = await authApi.getCurrentUser()
  return user
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.error.message || "Login failed"
      })

      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Registration failed"
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false
        // Even if logout fails on the server, we remove the token and user data
        state.isAuthenticated = false
        state.user = null
      })

      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.error.message || "Authentication failed"
        removeAuthToken() // Remove token if it's invalid
      })
  },
})

export default authSlice.reducer
