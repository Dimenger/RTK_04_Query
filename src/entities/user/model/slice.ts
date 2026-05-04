import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: { selectedUserId: null },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUserId = action.payload;
    },
  },
});

export const { setSelectedUser } = userSlice.actions;
export default userSlice.reducer;
