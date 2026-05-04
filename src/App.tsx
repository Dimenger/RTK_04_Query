import { useState } from "react";
import "./App.css";
import { UserCard } from "./entities/user";
import {
  useAddUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "./entities/user/api";
import { AddUserForm } from "./features/add-user";
import { DeleteUserModal } from "./features/delete-user";
import type { UserFormData, UserType } from "./shared/types";
import { INITIAL_USER_FORM } from "./shared/types";
import { ErrorGuard } from "./shared/ui/error-guard/error-guard";

function App() {
  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [createUserApi] = useAddUserMutation();
  const [updateUserApi] = useUpdateUserMutation();
  const [deleteUserApi, { error: deleteError }] = useDeleteUserMutation();

  // 2. Локальный стейт оставляем только для UI (формы, модалки)
  const [userForm, setUserForm] = useState<UserFormData>(INITIAL_USER_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const finalValue =
      type === "number"
        ? Number(value)
        : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value;
    setUserForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Редактирование через ReduxTK
        await updateUserApi({ id: editingId, userData: userForm }).unwrap();
        setEditingId(null);
      } else {
        // Создание через ReduxTK
        const newUser: UserType = { ...userForm, id: crypto.randomUUID() };
        await createUserApi(newUser).unwrap();
      }
      setUserForm(INITIAL_USER_FORM);
      setIsAddFormVisible(false);
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    }
  };

  const onToggleActive = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      updateUserApi({
        id,
        userData: { ...user, isActive: !user.isActive },
      }).unwrap();
    }
  };

  const editUser = (id: string) => {
    const selectedUser = users.find((user) => user.id === id);
    if (!selectedUser) return;
    setUserForm({ ...selectedUser });
    setEditingId(id);
    setIsAddFormVisible(false);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return; // Проверяем, что есть кого удалять

    try {
      // Используем id из объекта в стейте
      await deleteUserApi(userToDelete.id).unwrap();

      // Если всё ок, закрываем модалку
      setUserToDelete(null);
    } catch (error) {
      // Ошибка попадёт в deleteError (из хука) и в консоль
      console.error("Ошибка удаления:", error);
    }
  };

  // UI логика модалок и форм
  const cancelEdit = () => {
    setEditingId(null);
    setUserForm(INITIAL_USER_FORM);
  };
  const showAddForm = () => {
    setIsAddFormVisible(true);
    setEditingId(null);
    setUserForm(INITIAL_USER_FORM);
  };
  const hideAddForm = () => {
    setIsAddFormVisible(false);
    setUserForm(INITIAL_USER_FORM);
  };
  const openDeleteModal = (user: UserType) => setUserToDelete(user);
  const closeDeleteModal = () => {
    if (!isLoading) setUserToDelete(null);
  };

  // Показываем лоадер только при первой загрузке (если массив пустой)
  if (isLoading && users.length === 0)
    return <div style={{ color: "green" }}>...Loading</div>;

  return (
    <div>
      <h2>User Management (Redux Toolkit)</h2>

      <ErrorGuard error={error} />
      <ErrorGuard error={deleteError} />

      <button onClick={showAddForm} className="addUserBtn">
        ➕ Добавить пользователя
      </button>

      <AddUserForm
        userForm={userForm}
        isVisible={isAddFormVisible}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        onCancel={hideAddForm}
        isSubmitting={isLoading} // Используем общий isLoading из Redux
      />

      <div>
        {users.map((user) => (
          <UserCard
            key={user.id}
            userInfo={user.id === editingId ? { ...user, ...userForm } : user}
            isEditing={user.id === editingId}
            handleChange={handleChange}
            removeUser={() => openDeleteModal(user)}
            editUser={() => editUser(user.id)}
            saveUser={handleSubmit}
            cancelEdit={cancelEdit}
            onToggleActive={() => onToggleActive(user.id)}
          />
        ))}
      </div>

      <DeleteUserModal
        isOpen={Boolean(userToDelete)}
        userName={userToDelete?.name ?? ""}
        isDeleting={isLoading}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default App;
