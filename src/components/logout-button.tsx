import { logoutAction } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="logout-button">
        Выйти
      </button>
    </form>
  );
}
