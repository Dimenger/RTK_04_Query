import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../../constants";
import type { UserFormData, UserType } from "../../../shared/types";
type UpdateUserRequest = { id: string; userData: UserFormData };

export const userApi = createApi({
  reducerPath: "userApi", // Имя ключа в сторе
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }), // Базовый URL для всех запросов

  // "Метки" для автоматического обновления данных (кэша)
  tagTypes: ["User"],

  endpoints: (builder) => ({
    // 1. Получение всех пользователей
    getUsers: builder.query<UserType[], void>({
      query: () => "/users",
      providesTags: ["User"], // Говорим: "этот запрос зависит от метки User"
    }),

    // 2. Создание пользователя
    /* builder.mutation<ResultType, RequestArg> 
        ResultType что придет в ответе от сервера (Response Body)  
        RequestArg это тип аргумента, который ты передаешь в хук (Request Body / Query Params)*/
    addUser: builder.mutation<UserType, UserType>({
      query: (newUser) => ({
        url: "/users",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["User"], // Очищает кэш User, заставляя getUsers перезапроситься
    }),

    // Delete
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // Update
    updateUser: builder.mutation<UserType, UpdateUserRequest>({
      query: ({ id, userData }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: userData, // Передаем объект напрямую, без JSON.stringify
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;

/*
const {
  data,          // Данные из последнего успешного ответа
  error,         // Объект ошибки
  isLoading,     // true, если загружается ПЕРВЫЙ раз
  isFetching,    // true, если идет ПОВТОРНАЯ загрузка (обновление)
  isSuccess,     // true, если запрос прошел успешно
  isError,       // true, если была ошибка
  refetch,       // Функция для принудительного обновления данных
} = useGetUsersQuery();
*/
