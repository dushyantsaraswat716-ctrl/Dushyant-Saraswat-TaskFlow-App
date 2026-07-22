import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  fetchMe,
  updateProfile as updateProfileRequest,
  uploadAvatar as uploadAvatarRequest,
  changePassword as changePasswordRequest,
  forgotPassword as forgotPasswordRequest,
  resetPassword as resetPasswordRequest,
  googleLogin as googleLoginRequest,
} from "../../services/authService";
import { TOKEN_KEY, USER_KEY, REMEMBER_KEY } from "../../constants";

const readStorage = () => {
  const remembered = localStorage.getItem(REMEMBER_KEY) === "true";
  const store = remembered ? localStorage : sessionStorage;
  const token = store.getItem(TOKEN_KEY);
  const rawUser = store.getItem(USER_KEY);
  return { token: token || null, user: rawUser ? JSON.parse(rawUser) : null, remember: remembered };
};

const persist = (payload, remember) => {
  const store = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  other.removeItem(TOKEN_KEY);
  other.removeItem(USER_KEY);
  store.setItem(TOKEN_KEY, payload.token);
  store.setItem(USER_KEY, JSON.stringify({ _id: payload._id, name: payload.name, email: payload.email, avatar: payload.avatar || "" }));
  localStorage.setItem(REMEMBER_KEY, remember ? "true" : "false");
};
const patchStoredUser = (patch) => {
  const remembered = localStorage.getItem(REMEMBER_KEY) === "true";
  const store = remembered ? localStorage : sessionStorage;
  const rawUser = store.getItem(USER_KEY);
  if (!rawUser) return;
  const user = JSON.parse(rawUser);
  store.setItem(USER_KEY, JSON.stringify({ ...user, ...patch }));
};

const initial = readStorage();

export const login = createAsyncThunk("auth/login", async ({ email, password, remember }, { rejectWithValue }) => {
  try {
    const data = await loginUser({ email, password });
    persist(data, remember);
    return { user: { _id: data._id, name: data.name, email: data.email, avatar: data.avatar || "" }, token: data.token };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const signup = createAsyncThunk("auth/signup", async ({ name, email, password }, { rejectWithValue }) => {
  try {
    const data = await registerUser({ name, email, password });
    persist(data, true);
    return { user: { _id: data._id, name: data.name, email: data.email, avatar: data.avatar || "" }, token: data.token };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Signup failed");
  }
});

export const googleAuthLogin = createAsyncThunk("auth/googleAuthLogin", async (credential, { rejectWithValue }) => {
  try {
    const data = await googleLoginRequest(credential);
    persist(data, true);
    return { user: { _id: data._id, name: data.name, email: data.email, avatar: data.avatar || "" }, token: data.token };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Google sign-in failed");
  }
});

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async ({ email }, { rejectWithValue }) => {
  try {
    const data = await forgotPasswordRequest({ email });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Could not send reset link");
  }
});

export const resetPassword = createAsyncThunk("auth/resetPassword", async ({ token, password, confirmPassword }, { rejectWithValue }) => {
  try {
    const data = await resetPasswordRequest(token, { password, confirmPassword });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Could not reset password");
  }
});

export const loadCurrentUser = createAsyncThunk("auth/loadCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const user = await fetchMe();
    return user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Session expired");
  }
});

export const uploadAvatar = createAsyncThunk("auth/uploadAvatar", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);
    const data = await uploadAvatarRequest(formData);
    patchStoredUser({ avatar: data.avatar });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Avatar upload failed");
  }
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ name, email }, { rejectWithValue }) => {
    try {
      const data = await updateProfileRequest({ name, email });
      patchStoredUser({ name: data.name, email: data.email });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Could not update profile");
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const data = await changePasswordRequest({ currentPassword, newPassword });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Could not change password");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initial.user,
    token: initial.token,
    isAuthenticated: !!initial.token,
    status: "idle",
    avatarStatus: "idle",
    profileStatus: "idle",
    passwordStatus: "idle",
    forgotPasswordStatus: "idle",
    resetPasswordStatus: "idle",
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(googleAuthLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(googleAuthLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(googleAuthLogin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordStatus = "loading";
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordStatus = "succeeded";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordStatus = "failed";
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordStatus = "loading";
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordStatus = "succeeded";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordStatus = "failed";
        state.error = action.payload;
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        state.isAuthenticated = true;
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(uploadAvatar.pending, (state) => {
        state.avatarStatus = "loading";
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.avatarStatus = "succeeded";
        state.user = { ...state.user, avatar: action.payload.avatar };
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.avatarStatus = "failed";
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.profileStatus = "loading";
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.user = { ...state.user, name: action.payload.name, email: action.payload.email };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.passwordStatus = "loading";
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordStatus = "succeeded";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;