import { type SerializedError } from "@reduxjs/toolkit";
import { type FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ErrorGuardProps {
  error: FetchBaseQueryError | SerializedError | undefined;
}

export const ErrorGuard = ({ error }: ErrorGuardProps) => {
  if (!error) return null;

  // Формируем сообщение константой — так линтер сразу видит связь
  const message =
    "status" in error
      ? (error.data as { message?: string })?.message ||
        `Ошибка сервера: ${error.status}`
      : error.message || "Произошла непредвиденная ошибка";

  return (
    <div style={{ color: "red", padding: "10px", border: "1px solid red" }}>
      <strong>⚠️ Ошибка:</strong> {message}
    </div>
  );
};
